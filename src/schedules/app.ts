import express from 'express'

import NFSeGoiania from './jobs/NFSeGoiania'
import NFSeGoianiaReprocessErrors from './jobs/NFSeGoianiaReprocessErrors'

const app = express()

async function process () {
    NFSeGoiania.start()
    NFSeGoianiaReprocessErrors.start()
}

process().then(_ => console.log())

export default app