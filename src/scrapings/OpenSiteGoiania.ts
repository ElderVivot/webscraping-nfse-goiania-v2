import { Browser, Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const OpenSiteGoiania = async (page: Page, browser: Browser, settings: ISettingsGoiania): Promise<void> => {
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
            console.log('[Final-Loguin] - Página de Goiânia não Encontrada')
        } else {
            console.log('[Final-Loguin] - Erro ao abrir site de Goiânia')
        }
        settings.typeLog = 'error'
        settings.messageLog = 'OpenSiteGoiania'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir o site de Goiânia'

        const treatsMessageLog = new TreatsMessageLog(page, settings, browser)
        await treatsMessageLog.saveLog()
    }
}

export default OpenSiteGoiania