import { saveXMLsGoianiaLib } from '@queues/lib/SaveXMLsGoiania'

import { ISettingsGoiania } from './_interfaces'

export const SendXMLToQueues = async (settings: ISettingsGoiania, content: string): Promise<void> => {
    settings.typeLog = 'success'
    await saveXMLsGoianiaLib.add({
        dataXml: `<geral>${content}</geral>`,
        settings
    })
}