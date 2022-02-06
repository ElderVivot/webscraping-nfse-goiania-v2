import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const OpenCompanieInNewPage = async (page: Page, settings: ISettingsGoiania, url: string): Promise<void> => {
    try {
        await page.goto(url)
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao abrir empresa numa nova página.')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'OpenCompanieInNewPage'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir empresa numa nova página.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default OpenCompanieInNewPage