import { Page } from 'puppeteer'

import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'

import { ICompanies, ISettingsGoiania } from './_interfaces'
import { urlBaseApi } from './_urlBaseApi'
import { TreatsMessageLog } from './TreatsMessageLog'

async function getCompanieActive (companies: Array<ICompanies>, onlyActive: boolean, year: number, month: number): Promise<ICompanies> {
    if (onlyActive) {
        for (const companie of companies) {
            const { dateInicialAsClient, dateFinalAsClient, federalRegistration } = companie
            const dateInicialAsClientToDate = dateInicialAsClient ? new Date(dateInicialAsClient) : null
            const dateFinalAsClientToDate = dateFinalAsClient ? new Date(dateFinalAsClient) : null
            const cgceSanatized = federalRegistration ? federalRegistration.trim : ''
            if (cgceSanatized) {
                if (!dateInicialAsClientToDate || (dateInicialAsClientToDate.getMonth() + 1 >= month && dateInicialAsClientToDate.getFullYear() >= year)) {
                    if (!dateFinalAsClientToDate || (dateFinalAsClientToDate.getMonth() + 1 <= month && dateFinalAsClientToDate.getFullYear() <= year)) {
                        return companie
                    }
                }
            }
        }
        return companies[0]
    } else return companies[0]
}

export async function CheckIfCompanieIsValid (page: Page, settings: ISettingsGoiania): Promise<ISettingsGoiania> {
    try {
        const fetchFactory = makeFetchImplementation()

        const companiesOnlyActive = process.env.COMPANIES_ONLY_ACTIVE === 'true'

        const urlBase = `${urlBaseApi}/companie`
        const urlFilter = settings.federalRegistration ? `?federalRegistration=${settings.federalRegistration}` : `?cityRegistration=${settings.cityRegistration}`
        const response = await fetchFactory.get<ICompanies[]>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
        const data = response.data
        const companie = await getCompanieActive(data, companiesOnlyActive, settings.year, settings.month)

        settings.codeCompanieAccountSystem = companie ? companie.codeCompanieAccountSystem : settings.codeCompanieAccountSystem
        settings.nameCompanie = companie ? companie.name : settings.nameCompanie
        settings.federalRegistration = companie ? companie.federalRegistration : settings.federalRegistration

        if (companiesOnlyActive && !settings.codeCompanieAccountSystem && settings.federalRegistration) {
            throw 'COMPANIE_NOT_CLIENT_THIS_ACCOUNTING_OFFICE'
        }
        return settings
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'CheckIfCompanieIsActive'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao checar se empresa está ativa como cliente da contabilidade.'

        if (String(error).indexOf('COMPANIE') >= 0) settings.typeLog = 'warning'
        if (error === 'COMPANIE_NOT_CLIENT_THIS_ACCOUNTING_OFFICE') {
            settings.messageLogToShowUser = 'Empresa não é cliente desta contabilidade neste período.'
        }
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings, null)
        await treatsMessageLog.saveLog()
    }
}