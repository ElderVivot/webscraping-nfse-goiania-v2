import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const ClickNFeEletronica = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        const selector = 'span[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'span[id*="_block_wtText_wtNFEletronica"]'
        await page.waitFor(selector)
        await page.click(selector)
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao clicar no botão "NF-e Eletrônica"')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'ClickNFeEletronica'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão "NF-e Eletrônica".'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default ClickNFeEletronica