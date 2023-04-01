import { Page } from 'puppeteer'

import { makeDateImplementation } from '@common/adapters/date/date-factory'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { handlesFetchError } from '@common/error/fetchError'

import { ILogNotaFiscalApi, ISettingsGoiania } from './_interfaces'
import { urlBaseApi } from './_urlBaseApi'
import { TreatsMessageLog } from './TreatsMessageLog'

export async function CheckIfPeriodAlreadyProcessed (page: Page, settings: ISettingsGoiania): Promise<ISettingsGoiania> {
    try {
        const dateFactory = makeDateImplementation()
        const fetchFactory = makeFetchImplementation()

        const dateStartDownString = dateFactory.formatDate(new Date(settings.dateStartDown), 'yyyy-MM-dd')
        const dateEndDownString = dateFactory.formatDate(new Date(settings.dateEndDown), 'yyyy-MM-dd')

        const urlBase = `${urlBaseApi}/log_nfs_pref_gyn`
        const urlFilter = `?cityRegistration=${settings.cityRegistration}&dateStartDownBetween=${dateStartDownString}&dateEndDownBetween=${dateEndDownString}`
        const response = await fetchFactory.get<ILogNotaFiscalApi[]>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
        if (response.status >= 400) throw response
        const data = response.data
        if (data.length > 0) throw 'DONT_HAVE_NEW_PERIOD_TO_PROCESS'
        return settings
    } catch (error) {
        let saveInDB = true
        settings.typeLog = 'error'
        settings.messageLog = 'CheckIfPeriodAlreadyProcessed'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao checar se o período já foi processado.'
        if (error === 'DONT_HAVE_NEW_PERIOD_TO_PROCESS') {
            saveInDB = false
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Nao ha um novo periodo pra processar, ou seja, o ultimo processamento ja buscou o periodo maximo.'
        }
        settings.pathFile = __filename
        settings.errorResponseApi = handlesFetchError(error) // if error is a fetchError

        const treatsMessageLog = new TreatsMessageLog(page, settings, null, true)
        await treatsMessageLog.saveLog(saveInDB)
    }
}