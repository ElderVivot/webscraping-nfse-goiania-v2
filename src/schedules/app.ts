import express from 'express'

import { jobNfsGoiania } from './jobs/NFSeGoiania'
import { jobNfsGoianiaError, jobNfsGoianiaWarn } from './jobs/NFSeGoianiaReprocessErrors'

const app = express()

async function process () {
    jobNfsGoiania.start()
    jobNfsGoianiaError.start()
    jobNfsGoianiaWarn.start()
}

process().then(_ => console.log())

export default app