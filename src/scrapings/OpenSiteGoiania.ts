import { Browser, Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const OpenSiteGoiania = async (page: Page, browser: Browser, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.goto('https://www10.goiania.go.gov.br/Internet/Login.aspx', { timeout: 30000 })
        const textButtonEntrar = await page.evaluate(() => {
            return document.querySelector('input[value="ENTRAR"]')?.getAttribute('value')
        })
        if (!textButtonEntrar) {
            throw 'NOT_PAGE_CORRECT'
        }
    } catch (error) {
        if (error === 'NOT_PAGE_CORRECT') {
            settings.messageLogToShowUser = '[Final-Loguin] - Página de Goiânia não Encontrada'
        } else {
            settings.messageLogToShowUser = '[Final-Loguin] - Erro ao abrir site de Goiânia'
        }
        settings.typeLog = 'error'
        settings.messageLog = 'OpenSiteGoiania'
        settings.messageError = error

        const treatsMessageLog = new TreatsMessageLog(page, settings, browser)
        await treatsMessageLog.saveLog()
    }
}