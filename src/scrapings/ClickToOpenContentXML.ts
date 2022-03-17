import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const ClickToOpenContentXML = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitFor('a[href]')
        await Promise.all([
            page.click('a[href]'),
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 12000000 }) // aguarda até 120 minutos carregar a página pra fazer o download
        ])
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao abrir o conteúdo do XML')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'ClickToOpenContentXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao abrir o conteúdo do XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default ClickToOpenContentXML