import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ClickToOpenContentXML = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForSelector('a[href]')
        await Promise.all([
            page.click('a[href]'),
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 12000000 }) // aguarda até 120 minutos carregar a página pra fazer o download
        ])
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ClickToOpenContentXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir o conteúdo do XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}