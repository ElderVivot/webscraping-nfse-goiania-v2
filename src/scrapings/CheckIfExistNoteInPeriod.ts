import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfExistNoteInPeriod = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForSelector('body')
        let aviso = await page.evaluate(() => {
            return document.querySelector('body')?.textContent
        }) || ''
        aviso = aviso.normalize('NFD').replace(/[^a-zA-Z/ -]/g, '').toUpperCase()
        if (aviso.indexOf('NENHUMA NFS-E ENCONTRADA') >= 0) {
            throw 'NOT_EXIST_NFSE'
        }
    } catch (error) {
        settings.typeLog = 'error'
        if (error === 'NOT_EXIST_NFSE') {
            settings.typeLog = 'success'
            settings.messageLogToShowUser = 'Não há nenhuma nota neste período processado.'
        } else {
            settings.messageLogToShowUser = 'Erro ao checar se existe nota neste período.'
        }
        settings.messageLog = 'CheckIfExistNoteInPeriod'
        settings.messageError = error
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}