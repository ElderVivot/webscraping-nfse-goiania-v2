import { CronJob } from 'cron'

import { IDateAdapter } from '@common/adapters/date/date-adapter'
import { makeDateImplementation } from '@common/adapters/date/date-factory'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { handlesFetchError } from '@common/error/fetchError'
import { logger } from '@common/log'
import { scrapingNotesLib } from '@queues/lib/ScrapingNotes'
import { IAccessPortals, ILogNotaFiscalApi, TTypeLog } from '@scrapings/_interfaces'
import { urlBaseApi } from '@scrapings/_urlBaseApi'
import { SaveLogPrefGoiania } from '@services/SaveLogPrefGoiania'

function getDateStartAndEnd (dateFactory: IDateAdapter) {
    const dateStart = dateFactory.subMonths(new Date(), Number(process.env.RETROACTIVE_MONTHS_TO_DOWNLOAD) || 0)
    dateStart.setDate(1)

    const dateEnd = new Date()

    return {
        dateStartString: dateFactory.formatDate(dateStart, 'yyyy-MM-dd'),
        dateEndString: dateFactory.formatDate(dateEnd, 'yyyy-MM-dd')
    }
}

async function processNotes (typeLog: TTypeLog) {
    try {
        const fetchFactory = makeFetchImplementation()
        const dateFactory = makeDateImplementation()

        const { dateStartString, dateEndString } = getDateStartAndEnd(dateFactory)

        const urlBase = `${urlBaseApi}/log_nfs_pref_gyn`
        const urlFilter = `?typeLog=${typeLog}&dateStartDownBetween=${dateStartString}&dateEndDownBetween=${dateEndString}&getPaswordIncorrect=no`
        const response = await fetchFactory.get<ILogNotaFiscalApi[]>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
        if (response.status >= 400) throw response
        const data = response.data

        if (data.length > 0) {
            for (const logNotaFiscal of data) {
                try {
                    const urlBase = `${urlBaseApi}/access_portals`
                    const urlFilter = `/${logNotaFiscal.idAccessPortals}/show_with_decrypt_password`
                    const response = await fetchFactory.get<IAccessPortals>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
                    if (response.status >= 400) throw response

                    const { passwordDecrypt, status } = response.data

                    if (status === 'INACTIVE') {
                        const saveLogPrefGoiania = new SaveLogPrefGoiania({
                            ...logNotaFiscal,
                            typeLog: 'warning',
                            messageLog: 'USER_INACTIVE',
                            messageLogToShowUser: 'Cadastro do usuário foi inativado, não será reprocessado'
                        })
                        await saveLogPrefGoiania.save()
                    } else {
                        const jobId = `${logNotaFiscal.idLogNfsPrefGyn}_${dateFactory.formatDate(new Date(logNotaFiscal.dateStartDown), 'yyyyMMdd')}_${dateFactory.formatDate(new Date(logNotaFiscal.dateEndDown), 'yyyyMMdd')}`
                        const job = await scrapingNotesLib.getJob(jobId)
                        const failed = await job?.isFailed()
                        if (job?.finishedOn || failed) await job.remove() // remove job if already fineshed to process again, if dont fineshed yet, so dont process

                        await scrapingNotesLib.add({
                            settings: {
                                ...logNotaFiscal,
                                password: passwordDecrypt,
                                idCompanie: logNotaFiscal.idCompanie,
                                loguin: logNotaFiscal.login
                            }
                        }, {
                            jobId
                        })

                        logger.info(`- Adicionado na fila JOB ID ${jobId} do loguin ${logNotaFiscal.login}, IE ${logNotaFiscal.cityRegistration}, periodo ${logNotaFiscal.dateStartDown} a ${logNotaFiscal.dateEndDown}`)
                    }
                } catch (error) {
                    if (error.toString().indexOf('TreatsMessageLog') < 0) {
                        logger.error(error, __filename)
                    }
                }
            }
        }
    } catch (error) {
        const responseFetch = handlesFetchError(error)
        if (responseFetch) logger.error(responseFetch, __filename)
        else logger.error(error, __filename)
    }
}

export const jobNfsGoianiaError = new CronJob(
    '30 * * * *',
    async function () {
        await processNotes('error')
    },
    null,
    true
)

// export const jobNfsGoianiaWarn = new CronJob(
//     '10 12 * * *',
//     async function () {
//         await processNotes('warning')
//     },
//     null,
//     true
// )