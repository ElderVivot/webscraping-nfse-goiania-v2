import 'dotenv/config'
import { SaveXMLsGoianiaJobs } from './jobs/SaveXMLsGoiania'
import { ScrapingNotesJob } from './jobs/ScrapingNotes'
import { saveXMLsGoianiaLib } from './lib/SaveXMLsGoiania'
import { scrapingNotesLib } from './lib/ScrapingNotes'

saveXMLsGoianiaLib.process(SaveXMLsGoianiaJobs.handle)
scrapingNotesLib.process(ScrapingNotesJob.handle)