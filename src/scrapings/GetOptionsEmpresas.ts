import { Browser, Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

interface IOptionsInAccessPrefGoiania {
    value: string,
    label: string,
    inscricaoMunicipal: string
}

export const GetOptionsEmpresas = async (page: Page, browser: Browser, settings: ISettingsGoiania): Promise<IOptionsInAccessPrefGoiania[]> => {
    try {
        await page.waitForSelector('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"] > option')
        return await page.evaluate(() => {
            const options: IOptionsInAccessPrefGoiania[] = []
            const optionsAll = document.querySelectorAll('select[id*="GoianiaTheme_wtTelaPrincipal_block_wtActions_SISEGIntegration"] > option')
            optionsAll.forEach(value => {
                if (value.textContent !== 'Informe a Empresa') {
                    const labelSplit = value.textContent?.split('-') || []
                    let label = ''
                    let inscricaoMunicipal = '' // this code is inscricaoMunicipal
                    if (labelSplit.length > 1) {
                        const nameEmpresaSplit = labelSplit.slice(1, labelSplit.length)
                        label = nameEmpresaSplit.join('').trim().normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z ])/g, '').toUpperCase().substring(0, 70)
                    } else label = labelSplit[0]
                    const inscricaoMunicipalWithCAE = labelSplit[0].trim()
                    const inscricaoMunicipalWithCAESplit = inscricaoMunicipalWithCAE.split(':')
                    if (inscricaoMunicipalWithCAESplit.length > 1) inscricaoMunicipal = inscricaoMunicipalWithCAESplit[1].trim()
                    else inscricaoMunicipal = labelSplit[0].replace(/[^\d]+/g, '')
                    options.push({
                        value: value.getAttribute('value') || '',
                        label,
                        inscricaoMunicipal
                    })
                }
            })
            return options
        })
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'GetOptionsEmpresas'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao obter lista de empresas que o usuário tem acesso.'

        const treatsMessageLog = new TreatsMessageLog(page, settings, browser)
        await treatsMessageLog.saveLog()

        return []
    }
}