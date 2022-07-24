import Queue from 'bull'

import { logger } from '@common/log'
import redisConfig from '@config/redis'
import { ILogNotaFiscalApi, ISettingsGoiania } from '@scrapings/_interfaces'
import { saveLogDynamo } from '@services/dynamodb'
import { SaveLogPrefGoiania } from '@services/SaveLogPrefGoiania'

import { SaveXMLsGoianiaJobs } from '../jobs/SaveXMLsGoiania'

export const saveXMLsGoianiaLib = new Queue(SaveXMLsGoianiaJobs.key, { redis: redisConfig })

saveXMLsGoianiaLib.on('failed', async (job, error) => {
    const settings: ISettingsGoiania = job.data.settings
    const dataToSave: ILogNotaFiscalApi = {
        idLogNfsPrefGyn: settings.idLogNfsPrefGyn,
        idAccessPortals: settings.idAccessPortals,
        idCompanie: settings.idCompanie,
        typeLog: 'error',
        messageLog: 'ErrorToProcessDataInQueue',
        messageError: error.message?.toString(),
        messageLogToShowUser: 'Erro ao salvar XMLs na pasta.',
        federalRegistration: settings.federalRegistration,
        nameCompanie: settings.nameCompanie,
        cityRegistration: settings.cityRegistration,
        dateStartDown: new Date(settings.dateStartDown).toISOString(),
        dateEndDown: new Date(settings.dateEndDown).toISOString(),
        qtdNotesDown: settings.qtdNotes || 0,
        qtdTimesReprocessed: settings.qtdTimesReprocessed || 0
    }

    const saveLog = new SaveLogPrefGoiania(dataToSave)
    const idLogNfsPrefGyn = await saveLog.save()

    await saveLogDynamo({
        ...settings,
        typeLog: 'error',
        messageLog: 'ErrorToProcessDataInQueue',
        pathFile: __filename,
        messageError: error.message?.toString(),
        messageLogToShowUser: 'Erro ao salvar XMLs na pasta.'
    })

    logger.error('Job failed', `ID ${idLogNfsPrefGyn} | ${settings.codeCompanieAccountSystem} - ${settings.nameCompanie} - ${settings.federalRegistration} | ${settings.dateStartDown} - ${settings.dateEndDown}`)
})

saveXMLsGoianiaLib.on('completed', async (job) => {
    const settings: ISettingsGoiania = job.data.settings
    const dataToSave: ILogNotaFiscalApi = {
        idLogNfsPrefGyn: settings.idLogNfsPrefGyn,
        idAccessPortals: settings.idAccessPortals,
        idCompanie: settings.idCompanie,
        typeLog: 'success',
        messageLog: 'SucessToSaveNotes',
        messageLogToShowUser: 'Notas salvas com sucesso',
        messageError: '',
        federalRegistration: settings.federalRegistration,
        nameCompanie: settings.nameCompanie,
        cityRegistration: settings.cityRegistration,
        dateStartDown: new Date(settings.dateStartDown).toISOString(),
        dateEndDown: new Date(settings.dateEndDown).toISOString(),
        qtdNotesDown: settings.qtdNotes || 0,
        qtdTimesReprocessed: settings.qtdTimesReprocessed || 0
    }

    const saveLog = new SaveLogPrefGoiania(dataToSave)
    const idLogNfsPrefGyn = await saveLog.save()

    await saveLogDynamo({
        ...settings,
        typeLog: 'success',
        messageLog: 'SucessToSaveNotes',
        pathFile: __filename,
        messageError: '',
        messageLogToShowUser: 'Notas salvas com sucesso'
    })

    logger.info('Job success', `ID ${idLogNfsPrefGyn} | ${settings.codeCompanieAccountSystem} - ${settings.nameCompanie} - ${settings.federalRegistration} | ${settings.dateStartDown} - ${settings.dateEndDown}`)
})