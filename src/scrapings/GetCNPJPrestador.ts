import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { checkIfLoadedThePage } from './CheckIfLoadedThePage'
import { TreatsMessageLog } from './TreatsMessageLog'

export const GetCNPJPrestador = async (page: Page, settings: ISettingsGoiania): Promise<string> => {
    try {
        let cpfCnpj = ''
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitForSelector('#nr_cnpj')
            cpfCnpj = await frame.evaluate(() => {
                return document.querySelector('#nr_cnpj')?.textContent
            }) || ''
        }
        return cpfCnpj.replace(/[^\d]+/g, '')
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLogToShowUser = 'Erro ao pegar o CNPJ/CPF da empresa.'
        settings.messageLog = 'GetCNPJPrestador'
        settings.messageError = error
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}