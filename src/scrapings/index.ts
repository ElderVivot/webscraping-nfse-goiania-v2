import 'dotenv/config'

import { makeDateImplementation } from '@common/adapters/date/date-factory'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { logger } from '@common/log'
import { scrapingNotesLib } from '@queues/lib/ScrapingNotes'
import { saveLogDynamo } from '@services/dynamodb'
import { returnMonthsOfYear } from '@utils/functions'

import { IAccessPortals } from './_interfaces'
import { urlBaseApi } from './_urlBaseApi'
import { PeriodToDownNotesGoiania } from './PeriodToDownNotesGoiania'

async function addScrapingToQueue (idAccessPortals: string, loguin: string, password: string, dateStart: Date, dateEnd: Date): Promise<void> {
    const dateFactory = makeDateImplementation()

    const jobId = `${idAccessPortals}_${dateFactory.formatDate(dateStart, 'yyyyMMdd')}_${dateFactory.formatDate(dateEnd, 'yyyyMMdd')}`
    const job = await scrapingNotesLib.getJob(jobId)
    if (job?.finishedOn) await job.remove() // remove job if already fineshed to process again, if dont fineshed yet, so dont process

    await scrapingNotesLib.add({
        settings: {
            idAccessPortals,
            loguin,
            password,
            typeProcessing: 'MainAddQueueLoguin',
            dateStartDown: dateStart,
            dateEndDown: dateEnd
        }
    }, {
        jobId
    })

    logger.info(`- Adicionado na fila JOB ID ${jobId} do loguin ${loguin}`)
}

export class Applicattion {
    constructor () { }

    async process (): Promise<void> {
        const fetchFactory = makeFetchImplementation()

        const urlBase = `${urlBaseApi}/access_portals`
        const urlFilter = '?status=ACTIVE'
        const response = await fetchFactory.get<IAccessPortals[]>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
        if (response.status >= 400) throw response
        const allAccess = response.data

        for (const access of allAccess) {
            try {
                const urlBase = `${urlBaseApi}/access_portals`
                const urlFilter = `/${access.idAccessPortals}/show_with_decrypt_password`
                const response = await fetchFactory.get<IAccessPortals>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
                if (response.status >= 400) throw response

                const { login, passwordDecrypt, idAccessPortals } = response.data

                const periodToDown = await PeriodToDownNotesGoiania()

                let year = periodToDown.dateStart.getFullYear()
                const yearInicial = year
                const monthInicial = periodToDown.dateStart.getMonth() + 1

                const yearFinal = periodToDown.dateEnd.getFullYear()
                const monthFinal = periodToDown.dateEnd.getMonth() + 1
                const dayFinal = periodToDown.dateEnd.getDate()

                while (year <= yearFinal) {
                    const months = returnMonthsOfYear(year, monthInicial, yearInicial, monthFinal, yearFinal)
                    for (const month of months) {
                        const monthSubOne = month - 1
                        if (month === monthFinal && year === yearFinal) {
                            // day 1 at 7
                            if (dayFinal >= 7) await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 1), new Date(year, monthSubOne, 7))
                            // day 8 at 14
                            if (dayFinal >= 14) await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 8), new Date(year, monthSubOne, 14))
                            // // day 15 at 21
                            if (dayFinal >= 21) await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 15), new Date(year, monthSubOne, 21))
                            // // day 22 at last_day
                            if (dayFinal >= 28) await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 22), new Date(year, monthSubOne + 1, 0))
                        } else {
                            // day 1 at 7
                            await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 1), new Date(year, monthSubOne, 7))
                            // day 8 at 14
                            await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 8), new Date(year, monthSubOne, 14))
                            // day 15 at 21
                            await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 15), new Date(year, monthSubOne, 21))
                            // day 22 at last_day
                            await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 22), new Date(year, monthSubOne + 1, 0))
                        }
                    }

                    year++
                }
            } catch (error) {
                logger.error(error)
                await saveLogDynamo({
                    messageError: error,
                    messageLog: 'Scraping/index',
                    pathFile: __filename,
                    typeLog: 'error'
                })
            }
        }
    }
}

// const applicattion = new Applicattion()
// applicattion.process().then(_ => console.log(_))