import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const CheckIfExistNoteInPeriod = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitFor('body')
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
            console.log('\t\t[16] - Não há nenhuma nota no filtro passado')
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Não há nenhuma nota neste período processado.'
        } else {
            console.log('\t\t[Final-Empresa-Mes] - Erro ao checar se existe nota no período')
            settings.messageLogToShowUser = 'Erro ao checar se existe nota neste período.'
        }
        console.log('\t\t-------------------------------------------------')
        settings.messageLog = 'CheckIfExistNoteInPeriod'
        settings.messageError = error

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default CheckIfExistNoteInPeriod