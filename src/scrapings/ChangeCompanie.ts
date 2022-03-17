import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const ChangeCompanie = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitFor('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"]')
        await page.select('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"]', settings.valueLabelSite || '')
    } catch (error) {
        console.log('\t[Final-Empresa] - Erro ao trocar de empresa')
        console.log('\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'ChangeCompanie'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao realizar a troca de empresa.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default ChangeCompanie