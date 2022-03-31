import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { checkIfLoadedThePage } from './CheckIfLoadedThePage'
import { TreatsMessageLog } from './TreatsMessageLog'

export const AlertSimplesNacional = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitForSelector('center a')
            await frame.click('center a')
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'AlertSimplesNacional'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao passar pelo alerta do simples nacional.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}