import { Page } from 'puppeteer'

import ISettingsGoiania from '../../models/ISettingsGoiania'
import TreatsMessageLog from './TreatsMessageLog'

const CheckIfSelectLoaded = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForFunction(
            `document.querySelector('#GoianiaTheme_wtTelaPrincipal_block_wtTitle_wtDadosCAE').textContent.includes(${settings.inscricaoMunicipal})`
        )
        await page.waitFor(2500) // espera mais 2,5 segundos pra terminar de carregar os dados do novo select
    } catch (error) {
        console.log('\t[Final-Empresa] - Erro ao checar se a troca de empresa foi finalizada')
        console.log('\t-------------------------------------------------')
        settings.typeLog = 'error'
        settings.messageLog = 'CheckIfSelectLoaded'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao checar se a troca de empresa foi realizada.'

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}

export default CheckIfSelectLoaded