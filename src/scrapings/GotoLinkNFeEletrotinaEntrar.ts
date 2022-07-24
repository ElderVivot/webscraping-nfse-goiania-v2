import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const GotoLinkNFeEletrotinaEntrar = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        const selectorCheckIfButtonEnterIsVisible = 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="wtContent_wt"]' && '.Balloon_content > div'
        await page.waitForSelector(selectorCheckIfButtonEnterIsVisible)
        const styleCheckIfButtonEnterIsVisible = await page.$eval(selectorCheckIfButtonEnterIsVisible, element => element.getAttribute('style'))
        if (styleCheckIfButtonEnterIsVisible && styleCheckIfButtonEnterIsVisible.indexOf('display:none') >= 0) throw 'ButtonNFEletronicaEntrarIsDisabled'

        const selector = 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"] > div > div > div > a[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"] > div > div > div > a[id*="_block_wtContent_wt"]'
        const urlButtonEntrar = await page.$eval(selector, element => element.getAttribute('href'))
        if (urlButtonEntrar) {
            page.on('dialog', async dialog => {
                await dialog.accept()
            })
            await page.goto(urlButtonEntrar, { timeout: 200000 })
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.pathFile = __filename
        settings.messageLog = 'GotoLinkNFeEletrotinaEntrar'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir o link de "NF-e Eletrônica" e passar pelo Alert.'

        if (error === 'ButtonNFEletronicaEntrarIsDisabled') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'O botão de "Entrar" nas NF-e Eletrônica está desabilitado ou invisível'
        }
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}