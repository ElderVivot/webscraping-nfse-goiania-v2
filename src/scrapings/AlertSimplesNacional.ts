import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { checkIfLoadedThePage } from './CheckIfLoadedThePage'
import { TreatsMessageLog } from './TreatsMessageLog'

export const AlertSimplesNacional = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForTimeout(1500)
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            let textSimplesNacional: string = await frame.$eval('center b', element => element.textContent)
            textSimplesNacional = textSimplesNacional ? textSimplesNacional.normalize('NFD').replace(/[^a-zA-Z/ ]/g, '').toUpperCase() : ''
            if (textSimplesNacional.indexOf('SIMPLES NACIONAL') >= 0) {
                await frame.waitForSelector('center a')
                await frame.click('center a')
            } else {
                throw 'NOT_FOUND_ALERT_SIMPLES_NACIONAL_DONT_WINDOW_CORRECT_YET'
            }
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'AlertSimplesNacional'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao passar pelo alerta do simples nacional.'
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}