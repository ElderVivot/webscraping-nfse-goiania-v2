import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const GotoLinkNFeEletrotinaEntrar = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        const selector = 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"] > div > div > div > a[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"] > div > div > div > a[id*="_block_wtContent_wt"]'
        await page.waitForSelector(selector)

        const urlButtonEntrar = await page.$eval(selector, element => element.getAttribute('href'))
        if (urlButtonEntrar) {
            page.on('dialog', async dialog => {
                await dialog.accept()
            })
            await page.goto(urlButtonEntrar, { timeout: 200000 })
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'GotoLinkNFeEletrotinaEntrar'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir o link de "NF-e Eletrônica" e passar pelo Alert.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}