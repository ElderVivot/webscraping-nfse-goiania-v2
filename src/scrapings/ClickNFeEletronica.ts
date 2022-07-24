import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ClickNFeEletronica = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        const selector = 'span[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'span[id*="_block_wtText_wtNFEletronica"]'
        await page.waitForSelector(selector)
        await page.click(selector)
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ClickNFeEletronica'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão "NF-e Eletrônica".'
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}