import { Page } from 'puppeteer'

import { checkIfLoadedThePage } from '@scrapings/CheckIfLoadedThePage'
import { treateTextField } from '@utils/functions'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfAvisoFrameMnuAfterEntrar = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    let aviso: string
    try {
        await checkIfLoadedThePage(page, 'mnu', true)
        const frame = page.frames().find(frame => frame.name() === 'mnu')
        await frame?.waitForSelector('tr[bgcolor=beige] > td > table > tbody > tr > td[align=center] > span')
        aviso = await frame?.evaluate(() => {
            return document.querySelector('tr[bgcolor=beige] > td > table > tbody > tr > td[align=center] > span')?.textContent
        })
        aviso = aviso ? treateTextField(aviso) : ''
        if (aviso.indexOf('ATIVIDADE NAO EMISSORA') >= 0) {
            throw 'NAO_HABILITADA_EMITIR_NFSE'
        }
    } catch (error) {
        settings.typeLog = 'error'
        if (error === 'NAO_HABILITADA_EMITIR_NFSE') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Empresa não habilitada pra emitir NFS-e.'
        } else {
            settings.messageLogToShowUser = 'Erro ao verificar se a empresa está habilitada pra emitir NFS-e Serviço'
        }
        settings.messageLog = 'CheckIfAvisoFrameMnuAfterEntrar'
        settings.messageError = error

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}