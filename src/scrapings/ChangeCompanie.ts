import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ChangeCompanie = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForSelector('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"]')
        await page.select('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"]', settings.valueLabelSite || '')
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ChangeCompanie'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao realizar a troca de empresa.'
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}