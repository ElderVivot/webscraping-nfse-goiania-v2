import { CronJob } from 'cron'

import { Applicattion } from '@scrapings/index'

async function processNotes () {
    const applicattion = new Applicattion()
    await applicattion.process()
}

processNotes().then(_ => console.log(_))

export const jobNfsGoiania = new CronJob(
    '03 00 * * *',
    async function () {
        await processNotes()
    },
    null,
    true
)