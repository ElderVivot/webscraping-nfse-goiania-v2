import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import checkIfLoadedThePage from '../../utils/CheckIfLoadedThePage'
import TreatsMessageLog from './TreatsMessageLog'

const SelectPeriodToDownload = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitFor('[name=txt_dia_inicial]')
            await frame.select('[name=txt_dia_inicial]', `${settings.dayInitialMonth}`)
            await frame.select('[name=txt_dia_final]', `${settings.dayFinalMonth}`)
            await frame.select('[name=sel_mes]', `${settings.month}`)

            // const inputYear = await frame.$('[name=txt_ano]')
            // await inputYear.click({ clickCount: 3 })
            // await inputYear.type(`${settings.year}`)

            await frame.evaluate(`document.querySelector('[name=txt_ano]').value="${settings.year}";`)
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao selecionar o período')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'SelectPeriodToDownload'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao selecionar o período".'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default SelectPeriodToDownload