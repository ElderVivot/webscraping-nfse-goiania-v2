import { Page } from 'puppeteer'

import { zeroLeft } from '@utils/functions'

import { ISettingsGoiania } from './_interfaces'
import { checkIfLoadedThePage } from './CheckIfLoadedThePage'
import { TreatsMessageLog } from './TreatsMessageLog'

export const SelectPeriodToDownload = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')

        const dayInitialMonth = zeroLeft(new Date(settings.dateStartDown).getDate().toString(), 2)
        const dayFinalMonth = zeroLeft(new Date(settings.dateEndDown).getDate().toString(), 2)
        const month = zeroLeft(settings.month.toString(), 2)

        if (frame) {
            await frame.waitForSelector('[name=txt_dia_inicial]')
            await frame.select('[name=txt_dia_inicial]', `${dayInitialMonth}`)
            await frame.select('[name=txt_dia_final]', `${dayFinalMonth}`)
            await frame.select('[name=sel_mes]', `${month}`)

            await frame.evaluate(`document.querySelector('[name=txt_ano]').value="${settings.year.toString()}";`)
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'SelectPeriodToDownload'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao selecionar o período".'

        const treatsMessageLog = new TreatsMessageLog(page, settings, null, true)
        await treatsMessageLog.saveLog()
    }
}