import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import checkIfLoadedThePage from '../../utils/CheckIfLoadedThePage'
import TreatsMessageLog from './TreatsMessageLog'

const GetCNPJPrestador = async (page: Page, settings: ISettingsGoiania): Promise<string> => {
    try {
        let cpfCnpj = ''
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitFor('#nr_cnpj')
            cpfCnpj = await frame.evaluate(() => {
                return document.querySelector('#nr_cnpj')?.textContent
            }) || ''
        }
        return cpfCnpj.replace(/[^\d]+/g, '')
    } catch (error) {
        console.log('\t\t[Final-Empresa-Mes] - Erro ao checar o CNPJ/CPF')
        console.log('\t\t-------------------------------------------------')

        settings.typeLog = 'error'
        settings.messageLogToShowUser = 'Erro ao pegar o CNPJ/CPF da empresa.'
        settings.messageLog = 'GetCNPJPrestador'
        settings.messageError = error

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()

        return ''
    }
}

export default GetCNPJPrestador