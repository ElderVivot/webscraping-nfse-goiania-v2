import Queue from 'bull'

import redisConfig from '../../config/redis'
import SaveLogPrefGoiania from '../../controllers/SaveLogPrefGoiania'
import SaveXMLsGoiania from '../jobs/SaveXMLsGoiania'

const saveXMLsGoiania = new Queue(SaveXMLsGoiania.key, { redis: redisConfig })

saveXMLsGoiania.on('failed', async (job, error) => {
    const { settings } = job.data
    const saveLogPrefGoiania = new SaveLogPrefGoiania()
    await saveLogPrefGoiania.saveLog({
        id: settings.id,
        prefGoianiaAccess: settings.idUser,
        hourLog: settings.hourLog,
        typeLog: 'error',
        messageLog: 'ErrorToProcessDataInQueue',
        messageLogToShowUser: 'Erro ao salvar XMLs na pasta.',
        messageError: error.message,
        urlImageDown: '',
        codeCompanie: settings.codeCompanie,
        nameCompanie: settings.companie,
        inscricaoMunicipal: settings.inscricaoMunicipal,
        dateStartDown: settings.dateStartDown,
        dateEndDown: settings.dateEndDown,
        qtdNotesDown: settings.qtdNotes,
        qtdTimesReprocessed: settings.qtdTimesReprocessed
    })

    console.log('Job failed', job.data)
    console.log(error)
})

saveXMLsGoiania.on('completed', async (job) => {
    const { settings } = job.data
    const saveLogPrefGoiania = new SaveLogPrefGoiania()
    await saveLogPrefGoiania.saveLog({
        id: settings.id,
        prefGoianiaAccess: settings.idUser,
        hourLog: settings.hourLog,
        typeLog: 'success',
        messageLog: 'SucessToSaveNotes',
        messageLogToShowUser: 'Notas salvas com sucesso',
        messageError: '',
        urlImageDown: '',
        codeCompanie: settings.codeCompanie,
        nameCompanie: settings.companie,
        inscricaoMunicipal: settings.inscricaoMunicipal,
        dateStartDown: settings.dateStartDown,
        dateEndDown: settings.dateEndDown,
        qtdNotesDown: settings.qtdNotes,
        qtdTimesReprocessed: settings.qtdTimesReprocessed
    })
})

export default saveXMLsGoiania