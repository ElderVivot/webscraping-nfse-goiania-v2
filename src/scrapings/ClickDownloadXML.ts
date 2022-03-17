import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import checkIfLoadedThePage from '../../utils/CheckIfLoadedThePage'
import TreatsMessageLog from './TreatsMessageLog'

const ClickDownloadXML = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitFor("tr td font a[href*='snfse00200f3']")
            await frame.click("tr td font a[href*='snfse00200f3']")
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao clicar no botão "Download de XML de Notas Fiscais por período".')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'ClickDownloadXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão "Download de XML de Notas Fiscais por período".'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default ClickDownloadXML