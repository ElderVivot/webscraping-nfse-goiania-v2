import fs from 'fs'
import path from 'path'
import { Parser, Builder } from 'xml2js'

import { logger } from '@common/log'
import { ISettingsGoiania } from '@scrapings/_interfaces'
import { NFSeGoiania } from '@services/read_xmls/NFSeGoiania'
import createFolderToSaveData from '@utils/CreateFolderToSaveData'
import { returnDataInDictOrArray } from '@utils/functions'

const parser = new Parser()
const builder = new Builder()

export const SaveXMLsGoianiaJobs = {
    key: 'SaveXMLsGoiania',
    async handle ({ data }): Promise<void> {
        const settings: ISettingsGoiania = data.settings
        const dataXml: string = data.dataXml

        logger.info('---------------------------------------------------')
        logger.info(`- [XMLsGoiania] - Iniciando processamento ${settings.nameCompanie} comp. ${settings.month}-${settings.year}`)

        let pathNote = await createFolderToSaveData(settings)
        const pathOriginal = pathNote

        let pathNoteRoutineAutomactic = await createFolderToSaveData(settings, true)
        const pathOriginalRoutineAutomactic = pathNoteRoutineAutomactic

        const noteJson = await parser.parseStringPromise(dataXml)

        const nfsXml = returnDataInDictOrArray(noteJson, ['geral', 'GerarNfseResposta'])

        settings.qtdNotes = Number(nfsXml.length)
        for (let i = 0; i < settings.qtdNotes; i++) {
            const nf = nfsXml[i]
            logger.info(`- Processando nota ${i + 1} de ${settings.qtdNotes}`)
            const nfToXml = {
                GerarNfseResposta: nf
            }

            const nfseGoiania = NFSeGoiania(nf)

            const nameFileToSave = `${nfseGoiania.numero}-${nfseGoiania.codigoVerificacao}`

            pathNote = path.join(pathOriginal, `${nameFileToSave}.xml`)
            pathNoteRoutineAutomactic = path.join(pathOriginalRoutineAutomactic, `${nameFileToSave}.xml`)

            const xml = builder.buildObject(nfToXml)
            /* fs.writeFile(pathNote, xml, (error) => {
                if (error) throw error
            }) */
            fs.writeFileSync(pathNote, xml)

            if (settings.codeCompanieAccountSystem && pathOriginalRoutineAutomactic) {
                /* fs.writeFile(pathNoteRoutineAutomactic, xml, (error) => {
                    if (error) throw error
                }) */
                fs.writeFileSync(pathNoteRoutineAutomactic, xml)
            }
        }
    }
}