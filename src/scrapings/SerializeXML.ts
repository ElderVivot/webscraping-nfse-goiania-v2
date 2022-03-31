import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const SerializeXML = async (page: Page, settings: ISettingsGoiania, contentXML: string): Promise<string> => {
    try {
        return contentXML.normalize('NFD').replace(/[^a-zA-Z0-9.'"!+:><=)?$(*,-_ \\\n\r]/g, '')
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'SerializeXML'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao retirar caracteres inválidos XML.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}