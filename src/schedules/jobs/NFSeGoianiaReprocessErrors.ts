import { CronJob } from 'cron'
import { format } from 'date-fns-tz'

import GetLogPrefGoianiaErrors from '../../controllers/GetLogPrefGoianiaErrors'
import MainNfseGoiania from '../../scrapings/nfsegoiania/MainNfseGoiania'

async function processNotes () {
    const getLogPrefGoianiaErrors = new GetLogPrefGoianiaErrors()
    const logPrefGoianiaErrors = await getLogPrefGoianiaErrors.get()
    if (logPrefGoianiaErrors) {
        for (const log of logPrefGoianiaErrors) {
            const hourLogToCreateFolder = format(new Date(), 'yyyy-MM-dd_hh-mm-ss_a', { timeZone: 'America/Sao_Paulo' })
            const hourLog = format(new Date(), 'yyyy-MM-dd hh:mm:ss a', { timeZone: 'America/Sao_Paulo' })
            await MainNfseGoiania({
                id: log.id,
                dateHourProcessing: hourLogToCreateFolder,
                hourLog: hourLog,
                loguin: log.user,
                password: log.password,
                idUser: log.iduser,
                inscricaoMunicipal: log.inscricaoMunicipal,
                qtdTimesReprocessed: log.qtdTimesReprocessed,
                dateStartDown: log.dateStartDown,
                dateEndDown: log.dateEndDown
            })
        }
    }
}

const job = new CronJob(
    '0 */3 * * *',
    async function () {
        await processNotes()
    },
    null,
    true
)

export default job