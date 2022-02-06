import { CronJob } from 'cron'

import NFSeGoiania from '../../scrapings/nfsegoiania/index'

async function processNotes () {
    const applicattion = new NFSeGoiania()
    await applicattion.process()
}

const job = new CronJob(
    '00 19 * * *',
    async function () {
        await processNotes()
    },
    null,
    true
)

export default job