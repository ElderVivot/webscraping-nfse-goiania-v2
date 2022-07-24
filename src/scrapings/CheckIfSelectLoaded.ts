import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfSelectLoaded = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForTimeout(2000)

        const existMessageError = await page.$('.Feedback_Message_Error')
        if (existMessageError) throw 'EXIST_WARNING_WITH_ERRORS'

        await page.waitForFunction(
            `document.querySelector('#GoianiaTheme_wtTelaPrincipal_block_wtTitle_wtDadosCAE').textContent.includes(${settings.cityRegistration})`
        )
        await page.waitForTimeout(500) // wait 2,5 seconds to finish load of data of new select
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'CheckIfSelectLoaded'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao checar se a troca de empresa foi realizada.'
        settings.pathFile = __filename
        if (error === 'EXIST_WARNING_WITH_ERRORS') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Empresa possui advertências/erros'
        }

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}