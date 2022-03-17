import { CronJob } from 'cron'

import GetLogPrefGoianiaErrors from '../../controllers/GetLogPrefGoianiaErrors'
import MainNfseGoiania from '../../scrapings/nfsegoiania/MainNfseGoiania'

async function processNotes () {
    const getLogPrefGoianiaErrors = new GetLogPrefGoianiaErrors()
    const logPrefGoianiaErrors = await getLogPrefGoianiaErrors.get()
    if (logPrefGoianiaErrors) {
        for (const log of logPrefGoianiaErrors) {
            await MainNfseGoiania({
                id: log.id,
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