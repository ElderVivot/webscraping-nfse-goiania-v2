import { CronJob } from 'cron'

import { Applicattion } from '@scrapings/index'

async function processNotes () {
    const applicattion = new Applicattion()
    await applicattion.process()
}

export const jobNfsGoiania = new CronJob(
    '28 20 * * *',
    async function () {
        await processNotes()
    },
    null,
    true
)