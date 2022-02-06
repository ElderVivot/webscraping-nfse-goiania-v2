import ISettingsGoiania from '../../models/ISettingsGoiania'
import SaveXMLsGoiania from '../../queues/lib/SaveXMLsGoiania'

const SendXMLToQueues = async (settings: ISettingsGoiania, content: string): Promise<void> => {
    settings.typeLog = 'success'
    await SaveXMLsGoiania.add({
        dataXml: `<geral>${content}</geral>`,
        settings
    })
}

export default SendXMLToQueues