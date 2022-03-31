import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfEmpresaEstaBaixada = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        // eslint-disable-next-line quotes
        const selector = 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="_block_wtContent1_wtLinks"] > div:nth-child(1)'
        await page.waitForSelector(selector)
        let aviso: string = await page.$eval(selector, element => element.textContent)
        aviso = aviso ? aviso.normalize('NFD').replace(/[^a-zA-Z/ ]/g, '').toUpperCase() : ''
        if (aviso.indexOf('SITUACAO BAIXA') >= 0 || aviso.indexOf('SITUACAO SUSPENSAO') >= 0) {
            throw 'BAIXADA_SUSPENSA'
        }
    } catch (error) {
        settings.typeLog = 'error'
        if (error === 'BAIXADA_SUSPENSA') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Empresa com a situação "Baixada/Suspensa" na prefeitura.'
        } else {
            settings.messageLogToShowUser = 'Erro ao checar o status da empresa na prefeitura.'
        }
        settings.messageLog = 'CheckIfEmpresaEstaBaixada'
        settings.messageError = error

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}