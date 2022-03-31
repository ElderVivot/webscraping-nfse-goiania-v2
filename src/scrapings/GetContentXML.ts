import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const GetContentXML = async (page: Page, settings: ISettingsGoiania): Promise<string> => {
    try {
        await page.waitForSelector('body pre')
        return await page.evaluate(() => document.querySelector('body pre')?.textContent) || ''
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'GetContentXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao obter o conteúdo do XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}