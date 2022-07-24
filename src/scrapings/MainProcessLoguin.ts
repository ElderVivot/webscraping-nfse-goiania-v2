import puppeteer, { Page } from 'puppeteer'
import 'dotenv/config'

import { logger } from '@common/log'
import { saveLogDynamo } from '@services/dynamodb'
import { cleanDataObject } from '@utils/clean-data-object'

import { ISettingsGoiania } from './_interfaces'
import { AlertSimplesNacional } from './AlertSimplesNacional'
import { ChangeCompanie } from './ChangeCompanie'
import { CheckAndCloseIfExistPopupWarning } from './CheckAndCloseIfExistPopupWarning'
import { CheckIfAvisoFrameMnuAfterEntrar } from './CheckIfAvisoFrameMnuAfterEntrar'
import { CheckIfCompanieIsValid } from './CheckIfCompanieIsValid'
import { CheckIfEmpresaEstaBaixada } from './CheckIfEmpresaEstaBaixada'
import { CheckIfExistNoteInPeriod } from './CheckIfExistNoteInPeriod'
import { CheckIfPeriodAlreadyProcessed } from './CheckIfPeriodAlreadyProcessed'
import { CheckIfSelectLoaded } from './CheckIfSelectLoaded'
import { ClickDownloadXML } from './ClickDownloadXML'
import { ClickListarXML } from './ClickListarXML'
import { ClickNFeEletronica } from './ClickNFeEletronica'
import { ClickPortalContribuinte } from './ClickPortalContribuinte'
import { ClickToOpenContentXML } from './ClickToOpenContentXML'
import { CloseOnePage } from './CloseOnePage'
import { GetCNPJPrestador } from './GetCNPJPrestador'
import { GetContentXML } from './GetContentXML'
import { GetOptionsEmpresas } from './GetOptionsEmpresas'
import { GotoLinkNFeEletrotinaEntrar } from './GotoLinkNFeEletrotinaEntrar'
import { Loguin } from './Loguin'
import { OpenCompanieInNewPage } from './OpenCompanieInNewPage'
import { OpenSiteGoiania } from './OpenSiteGoiania'
import { SelectPeriodToDownload } from './SelectPeriodToDownload'
import { SendXMLToQueues } from './SendXMLToQueues'
import { SerializeXML } from './SerializeXML'

const HEADLESS = process.env.HEADLESS || 'YES'

export const MainProcessLoguin = async (settings: ISettingsGoiania): Promise<void> => {
    settings.loguin = settings.loguin.replace(/[^0-9]/g, '')
    settings.month = new Date(settings.dateStartDown).getMonth() + 1
    settings.year = new Date(settings.dateStartDown).getFullYear()

    const { cityRegistration, federalRegistration } = settings

    try {
        settings.nameStep = `0 - Abrindo loguin ${settings.loguin}`
        const browser = await puppeteer.launch({ headless: HEADLESS === 'YES', slowMo: 50, args: ['--start-maximized'] })
        const page = await browser.newPage()
        await page.setViewport({ width: 0, height: 0 })

        settings.nameStep = '1 - Abrindo site da prefeitura'
        await OpenSiteGoiania(page, browser, settings)

        settings.nameStep = '2 - Realizando o loguin'
        await Loguin(page, browser, settings)

        settings.nameStep = '3 - Clicando no botão "Portal Contruinte"'
        await ClickPortalContribuinte(page, browser, settings)

        settings.nameStep = '4 - Pegando a relação de empresas que este contribuinte possui.'
        const optionsEmpresas = await GetOptionsEmpresas(page, browser, settings)

        // Pega a URL atual pra não ter que abrir do zero o processo
        const urlActual = page.url()

        // Percorre o array de empresas
        for (const option of optionsEmpresas) {
            if (cityRegistration) if (option.inscricaoMunicipal !== settings.cityRegistration) continue

            settings.nameStep = `5 - Iniciando processamento da empresa ${option.label} - ${option.inscricaoMunicipal}`

            if (!federalRegistration) {
                settings = cleanDataObject(settings, [], ['idLogNfsPrefGyn', 'idAccessPortals', 'loguin', 'password', 'typeProcessing', 'dateStartDown', 'dateEndDown', 'month', 'year', 'nameStep'])
            }

            // set new values
            settings.valueLabelSite = option.value
            settings.nameCompanie = option.label
            settings.cityRegistration = option.inscricaoMunicipal

            try {
                settings = await CheckIfCompanieIsValid(page, settings)

                if (!settings.idLogNfsPrefGyn) await CheckIfPeriodAlreadyProcessed(page, settings)

                const pageEmpresa = await browser.newPage()
                await pageEmpresa.setViewport({ width: 0, height: 0 })
                await OpenCompanieInNewPage(pageEmpresa, settings, urlActual)

                settings.nameStep = '6 - Realizando a troca pra empresa atual'
                await ChangeCompanie(pageEmpresa, settings)

                settings.nameStep = '7 - Checando se a troca foi realizada com sucesso'
                await CheckIfSelectLoaded(pageEmpresa, settings)

                settings.nameStep = '8 - Verificando se o "Contribuinte está com a situação Baixada/Suspensa"'
                await CheckIfEmpresaEstaBaixada(pageEmpresa, settings)

                settings.nameStep = '9 - Verificando se tem aviso pro contribuinte, caso sim, fechando-o'
                await CheckAndCloseIfExistPopupWarning(pageEmpresa)

                settings.nameStep = '10 - Clicando no botão "NF-e Eletrônica"'
                await ClickNFeEletronica(pageEmpresa, settings)

                settings.nameStep = '12 - Clicando no botão "Entrar"'
                await GotoLinkNFeEletrotinaEntrar(pageEmpresa, settings)

                // Aviso depois do botão "Entrar" --> caso tenha aviso para o processamento desta
                // empresa, pois geralmente quando tem é empresa sem atividade de serviço ou usuário inválido
                await CheckIfAvisoFrameMnuAfterEntrar(pageEmpresa, settings)

                settings.nameStep = '13 - Passando pelo alerta do simples nacional.'
                await AlertSimplesNacional(pageEmpresa, settings)

                settings.nameStep = '14 - Clicando no botão "Download de XML de Notas Fiscais por período"'
                await ClickDownloadXML(pageEmpresa, settings)

                settings.nameStep = '15 - Pegando o CNPJ/CPF do Prestador'
                settings.federalRegistration = await GetCNPJPrestador(pageEmpresa, settings)

                settings = await CheckIfCompanieIsValid(pageEmpresa, settings)

                settings.nameStep = '16 - Seleciona o período desejado pra baixar os XMLs'
                await SelectPeriodToDownload(pageEmpresa, settings)

                settings.nameStep = '17 - Clicando no botão "Listar"'
                const newPagePromise: Promise<Page> = new Promise(resolve => (
                    browser.once('targetcreated', target => resolve(target.page()))
                ))
                await ClickListarXML(pageEmpresa, settings, newPagePromise)

                // Verifica se tem notas no período solicitado, caso não, para o processamento
                await CheckIfExistNoteInPeriod(pageEmpresa, settings)

                settings.nameStep = '18 - Abrindo os dados das notas'
                await ClickToOpenContentXML(pageEmpresa, settings)

                settings.nameStep = '19 - Obtendo conteúdo das notas'
                const contentXML = await GetContentXML(pageEmpresa, settings)

                settings.nameStep = '20 - Retirando caracteres inválidos dos XMLs'
                const contentXMLSerializable = await SerializeXML(pageEmpresa, settings, contentXML)

                settings.nameStep = '21 - Enviando XMLs das notas para as filas'
                await SendXMLToQueues(settings, contentXMLSerializable)

                // Fecha a aba do mês afim de que possa abrir outra
                await CloseOnePage(pageEmpresa, 'Empresa')
            } catch (error) {
                if (error.toString().indexOf('TreatsMessageLog') < 0) {
                    logger.error(error)
                    await saveLogDynamo({
                        messageError: error,
                        messageLog: 'MainProcessLoguin',
                        pathFile: __filename,
                        typeLog: 'error'
                    })
                }
            }
        }

        logger.info('[Final-Loguin] - Todos os dados deste loguin processados, fechando navegador.')
        if (browser) await browser.close()
    } catch (error) {
        logger.error(error)
        await saveLogDynamo({
            messageError: error,
            messageLog: 'MainProcessLoguin',
            pathFile: __filename,
            typeLog: 'error'
        })
    }
}