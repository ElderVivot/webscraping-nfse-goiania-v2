import { format, zonedTimeToUtc } from 'date-fns-tz'
import puppeteer, { Page } from 'puppeteer'
import 'dotenv/config'

import SaveCompaniesGoiania from '../../controllers/SaveCompaniesGoiania'
import ISettingsGoiania from '../../models/ISettingsGoiania'
import GetCompanie from '../../services/GetCompanie'
import PeriodToDownNotesGoiania from '../../services/PeriodToDownNotesGoiania'
import SetDateInicialAndFinalOfMonth from '../../services/SetDateInicialAndFinalOfMonth'
import * as functions from '../../utils/functions'
import AlertSimplesNacional from './AlertSimplesNacional'
import ChangeCompanie from './ChangeCompanie'
import CheckAndCloseIfExistPopupWarning from './CheckAndCloseIfExistPopupWarning'
import CheckIfAvisoFrameMnuAfterEntrar from './CheckIfAvisoFrameMnuAfterEntrar'
import CheckIfEmpresaEstaBaixada from './CheckIfEmpresaEstaBaixada'
import CheckIfExistNoteInPeriod from './CheckIfExistNoteInPeriod'
import CheckIfSelectLoaded from './CheckIfSelectLoaded'
import ClickDownloadXML from './ClickDownloadXML'
import ClickListarXML from './ClickListarXML'
import ClickNFeEletronica from './ClickNFeEletronica'
import ClickPortalContribuinte from './ClickPortalContribuinte'
import ClickToOpenContentXML from './ClickToOpenContentXML'
import CloseOnePage from './CloseOnePage'
import GetCNPJPrestador from './GetCNPJPrestador'
import GetContentXML from './GetContentXML'
import GetOptionsEmpresas from './GetOptionsEmpresas'
import GotoLinkNFeEletrotinaEntrar from './GotoLinkNFeEletrotinaEntrar'
import Loguin from './Loguin'
import OpenCompanieInNewPage from './OpenCompanieInNewPage'
import OpenSiteGoiania from './OpenSiteGoiania'
import SelectPeriodToDownload from './SelectPeriodToDownload'
import SendXMLToQueues from './SendXMLToQueues'
import SerializeXML from './SerializeXML'
import TreatsMessageLog from './TreatsMessageLog'

const MainNfseGoiania = async (settings: ISettingsGoiania): Promise<void> => {
    // pega os dados de inscricao municipal e data afim de não serem alterados no processamento
    settings.loguin = settings.loguin.replace(/[^0-9]/g, '')
    const { loguin, inscricaoMunicipal, dateStartDown, dateEndDown } = settings
    // se tiver o id, quer dizer que esta reprocessando um erro, então aumenta qtdTimesReprocessed
    if (settings.id) {
        settings.qtdTimesReprocessed = settings.qtdTimesReprocessed ? settings.qtdTimesReprocessed + 1 : 1
    } else {
        settings.qtdTimesReprocessed = 0
    }

    try {
        let companiesOnlyActive = false
        if (process.env.COMPANIES_ONLY_ACTIVE === 'true') {
            companiesOnlyActive = true
        }

        console.log(`[0] - Abrindo loguin ${loguin}`)

        const browser = await puppeteer.launch({ headless: true, slowMo: 50, args: ['--start-maximized'] })
        const page = await browser.newPage()
        await page.setViewport({ width: 1366, height: 768 })

        console.log('[1] - Abrindo site da prefeitura')
        await OpenSiteGoiania(page, browser, settings)

        console.log('[2] - Realizando o loguin')
        await Loguin(page, browser, settings)

        console.log('[3] - Clicando no botão "Portal Contruinte"')
        await ClickPortalContribuinte(page, browser, settings)

        console.log('[4] - Pegando a relação de empresas que este contribuinte possui.')
        const optionsEmpresas = await GetOptionsEmpresas(page, browser, settings)

        // Pega a URL atual pra não ter que abrir do zero o processo
        const urlActual = page.url()

        // Percorre o array de empresas
        for (const option of optionsEmpresas) {
            // processa apenas a empresa com a inscricao municipal passada no settings caso seja um update
            if (inscricaoMunicipal) { if (option.inscricaoMunicipal !== inscricaoMunicipal) continue }

            console.log(`\t[5] - Iniciando processamento da empresa ${option.label} - ${option.inscricaoMunicipal}`)

            // set the default values at each iteration
            settings.typeNF = 'NFS-e'
            settings.entradasOrSaidas = 'Saidas'
            settings.cgceCompanie = undefined
            settings.codeCompanie = undefined
            settings.companie = undefined
            settings.dateEndDown = undefined
            settings.dateStartDown = undefined
            settings.error = undefined
            settings.inscricaoMunicipal = undefined
            settings.messageError = undefined
            settings.messageLog = undefined
            settings.messageLogToShowUser = undefined
            settings.month = undefined
            settings.typeLog = 'error'
            settings.valueLabelSite = undefined
            settings.year = undefined

            // set new values
            settings.valueLabelSite = option.value
            settings.companie = option.label
            settings.inscricaoMunicipal = option.inscricaoMunicipal

            // Pega o período necessário pra processamento
            let periodToDown = null
            if (!dateStartDown && !dateEndDown) {
                periodToDown = await PeriodToDownNotesGoiania(settings)
            } else {
                periodToDown = {
                    dateStart: new Date(zonedTimeToUtc(dateStartDown, 'America/Sao_Paulo')),
                    dateEnd: new Date(zonedTimeToUtc(dateEndDown, 'America/Sao_Paulo'))
                }
            }

            let year = periodToDown.dateStart.getFullYear()
            const yearInicial = year
            const yearFinal = periodToDown.dateEnd.getFullYear()
            const monthInicial = periodToDown.dateStart.getMonth() + 1
            const monthFinal = periodToDown.dateEnd.getMonth() + 1

            const getCompanie = new GetCompanie(`?inscricaoMunicipal=${option.inscricaoMunicipal}`, companiesOnlyActive, monthInicial, yearInicial)
            const companie = await getCompanie.getCompanie()
            settings.codeCompanie = companie ? companie.code : ''
            settings.companie = companie ? companie.name : settings.companie
            settings.cgceCompanie = companie ? companie.cgce : settings.cgceCompanie

            const saveCompaniesGoiania = new SaveCompaniesGoiania()
            await saveCompaniesGoiania.save({
                inscricaoMunicipal: settings.inscricaoMunicipal,
                name: settings.companie,
                cgce: settings.cgceCompanie,
                code: settings.codeCompanie
            })

            try {
                // Abre uma nova aba no navegador e navega pra página atual
                const pageEmpresa = await browser.newPage()
                await pageEmpresa.setViewport({ width: 0, height: 0 })
                await OpenCompanieInNewPage(pageEmpresa, settings, urlActual)

                console.log('\t[6] - Realizando a troca pra empresa atual')
                await ChangeCompanie(pageEmpresa, settings)

                // Aguardando troca
                console.log('\t[7] - Checando se a troca foi realizada com sucesso')
                await CheckIfSelectLoaded(pageEmpresa, settings)

                console.log('\t[8] - Verificando se o "Contribuinte está com a situação Baixada/Suspensa"')
                await CheckIfEmpresaEstaBaixada(pageEmpresa, settings)

                const urlActualEmpresa = pageEmpresa.url()

                let breaker = false
                while (year <= yearFinal && breaker === false) {
                    const months = functions.returnMonthsOfYear(year, monthInicial, yearInicial, monthFinal, yearFinal)

                    for (const month of months) {
                        settings = SetDateInicialAndFinalOfMonth(settings, periodToDown, month, year)

                        console.log(`\t\t[9] - Iniciando processamento do mês ${settings.month}/${settings.year}`)

                        // Abre uma nova aba no navegador e navega pra ela
                        const pageMonth = await browser.newPage()
                        await pageMonth.setViewport({ width: 0, height: 0 })
                        await pageMonth.goto(urlActualEmpresa)

                        console.log('\t\t[10] - Verificando se tem aviso pro contribuinte, caso sim, fechando-o')
                        await CheckAndCloseIfExistPopupWarning(pageMonth)

                        settings.dateStartDown = format(new Date(zonedTimeToUtc(settings.dateStartDown, 'America/Sao_Paulo')), 'yyyy-MM-dd hh:mm:ss a', { timeZone: 'America/Sao_Paulo' })
                        settings.dateEndDown = format(new Date(zonedTimeToUtc(settings.dateEndDown, 'America/Sao_Paulo')), 'yyyy-MM-dd hh:mm:ss a', { timeZone: 'America/Sao_Paulo' })

                        try {
                            console.log('\t\t[11] - Clicando no botão "NF-e Eletrônica"')
                            await ClickNFeEletronica(pageMonth, settings)

                            console.log('\t\t[12] - Clicando no botão "Entrar"')
                            await GotoLinkNFeEletrotinaEntrar(pageMonth, settings)

                            // Aviso depois do botão "Entrar" --> caso tenha aviso para o processamento desta
                            // empresa, pois geralmente quando tem é empresa sem atividade de serviço ou usuário inválido
                            await CheckIfAvisoFrameMnuAfterEntrar(pageMonth, settings)

                            console.log('\t\t[13] - Passando pelo alerta do simples nacional.')
                            await AlertSimplesNacional(pageMonth, settings)

                            console.log('\t\t[14] - Clicando no botão "Download de XML de Notas Fiscais por período"')
                            await ClickDownloadXML(pageMonth, settings)

                            console.log('\t\t[15] - Pegando o CNPJ/CPF do Prestador')
                            settings.cgceCompanie = await GetCNPJPrestador(pageMonth, settings)

                            if (!settings.codeCompanie) {
                                const getCompanie2 = new GetCompanie(`?cgce=${settings.cgceCompanie}`, companiesOnlyActive, month, year)
                                const companie2 = await getCompanie2.getCompanie()
                                settings.codeCompanie = companie2 ? companie2.code : ''
                                settings.companie = companie2 ? companie2.name : settings.companie

                                await saveCompaniesGoiania.save({
                                    inscricaoMunicipal: settings.inscricaoMunicipal,
                                    name: settings.companie,
                                    cgce: settings.cgceCompanie,
                                    code: settings.codeCompanie
                                })
                            }

                            console.log('\t\t[16] - Checando se esta empresa é cliente neste período')
                            if (companiesOnlyActive && !settings.codeCompanie) {
                                try {
                                    throw 'COMPANIE_NOT_CLIENT_THIS_ACCOUNTING_OFFICE'
                                } catch (error) {
                                    console.log('\t\t[Final-Empresa-Mes] - Empresa não é cliente (está ativa) neste período.')
                                    console.log('\t\t-------------------------------------------------')

                                    settings.typeLog = 'warning'
                                    settings.messageLogToShowUser = 'Empresa não é cliente (está ativa) neste período.'
                                    settings.messageLog = 'CompanieNotClient'
                                    settings.messageError = error

                                    const treatsMessageLog = new TreatsMessageLog(pageMonth, settings)
                                    await treatsMessageLog.saveLog()
                                }
                            }

                            console.log('\t\t[17] - Seleciona o período desejado pra baixar os XMLs')
                            await SelectPeriodToDownload(pageMonth, settings)

                            console.log('\t\t[18] - Clicando no botão "Listar"')
                            const newPagePromise: Promise<Page> = new Promise(resolve => (
                                browser.once('targetcreated', target => resolve(target.page()))
                            ))
                            await ClickListarXML(pageMonth, settings, newPagePromise)

                            // Verifica se tem notas no período solicitado, caso não, para o processamento
                            await CheckIfExistNoteInPeriod(pageMonth, settings)

                            console.log('\t\t[19] - Abrindo os dados das notas')
                            await ClickToOpenContentXML(pageMonth, settings)

                            console.log('\t\t[20] - Obtendo conteúdo das notas')
                            const contentXML = await GetContentXML(pageMonth, settings)

                            console.log('\t\t[21] - Retirando caracteres inválidos dos XMLs')
                            const contentXMLSerializable = await SerializeXML(pageMonth, settings, contentXML)

                            console.log('\t\t[22] - Enviando XMLs das notas para as filas')
                            await SendXMLToQueues(settings, contentXMLSerializable)

                            // Fecha a aba do mês afim de que possa abrir outra
                            await CloseOnePage(pageMonth, 'Empresa-Mes')
                        } catch (error) {
                            if (error.indexOf('NAO_HABILITADA_EMITIR_NFSE') >= 0) {
                                breaker = true
                                break
                            }
                        }
                    }

                    year++
                }

                // Fecha a aba da empresa afim de que possa abrir outra
                await CloseOnePage(pageEmpresa)
            } catch (error) {
                // console.log(error)
            }
        }

        console.log('[Final-Loguin] - Todos os dados deste loguin processados, fechando navegador.')
        if (browser.isConnected()) await browser.close()
    } catch (error) {
        console.log(error)
    }
}

export default MainNfseGoiania