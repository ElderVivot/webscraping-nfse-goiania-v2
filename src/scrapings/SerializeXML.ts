import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const SerializeXML = async (page: Page, settings: ISettingsGoiania, contentXML: string): Promise<string> => {
    try {
        return contentXML.normalize('NFD').replace(/[^a-zA-Z0-9.'"!+:><=)?$(*,-_ \\\n\r]/g, '')
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao retirar caracteres inválidos XML')
        console.log('\t\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'SerializeXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao retirar caracteres inválidos XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}

export default SerializeXML