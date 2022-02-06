import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const GetContentXML = async (page: Page, settings: ISettingsGoiania): Promise<string> => {
    try {
        await page.waitFor('body pre')
        return await page.evaluate(() => document.querySelector('body pre')?.textContent) || ''
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao obter o conteúdo do XML')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'GetContentXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao obter o conteúdo do XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}

export default GetContentXML