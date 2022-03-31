import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfSelectLoaded = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForFunction(
            `document.querySelector('#GoianiaTheme_wtTelaPrincipal_block_wtTitle_wtDadosCAE').textContent.includes(${settings.cityRegistration})`
        )
        await page.waitForTimeout(2500) // wait 2,5 seconds to finish load of data of new select
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'CheckIfSelectLoaded'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao checar se a troca de empresa foi realizada.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}