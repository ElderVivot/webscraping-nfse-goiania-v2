import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const OpenCompanieInNewPage = async (page: Page, settings: ISettingsGoiania, url: string): Promise<void> => {
    try {
        await page.goto(url)
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'OpenCompanieInNewPage'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir empresa numa nova página.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}