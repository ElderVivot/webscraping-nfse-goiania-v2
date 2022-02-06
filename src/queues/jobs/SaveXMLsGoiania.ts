import fs from 'fs'
import path from 'path'
import { Parser, Builder } from 'xml2js'

import SaveNotesNfse from '../../controllers/SaveNotesNfse'
import ISettingsGoiania from '../../models/ISettingsGoiania'
import NFSeGoiania from '../../services/read_xmls/NFSeGoiania'
import createFolderToSaveData from '../../utils/CreateFolderToSaveData'
import { returnDataInDictOrArray } from '../../utils/functions'

const parser = new Parser()
const builder = new Builder()

const SaveXMLsGoiania = {
    key: 'SaveXMLsGoiania',
    async handle ({ data }): Promise<void> {
        const settings: ISettingsGoiania = data.settings
        const dataXml: string = data.dataXml

        console.log('---------------------------------------------------')
        console.log(`- [XMLsGoiania] - Iniciando processamento ${settings.companie} comp. ${settings.month}-${settings.year}`)

        let pathNote = await createFolderToSaveData(settings)
        const pathOriginal = pathNote

        let pathNoteRoutineAutomactic = await createFolderToSaveData(settings, true)
        const pathOriginalRoutineAutomactic = pathNoteRoutineAutomactic

        const noteJson = await parser.parseStringPromise(dataXml)

        const nfsXml = returnDataInDictOrArray(noteJson, ['geral', 'GerarNfseResposta'])

        settings.qtdNotes = Number(nfsXml.length)
        for (let i = 0; i < settings.qtdNotes; i++) {
            const nf = nfsXml[i]
            console.log(`\t- Processando nota ${i + 1} de ${settings.qtdNotes}`)
            const nfToXml = {
                GerarNfseResposta: nf
            }

            const nfseGoiania = NFSeGoiania(nf)

            const saveNotesNfse = new SaveNotesNfse()
            await saveNotesNfse.save({
                codeCompanie: settings.codeCompanie,
                nameCompanie: settings.companie,
                cgceCompanie: nfseGoiania.cgcePrestador,
                inscricaoMunicipalCompanie: settings.inscricaoMunicipal,
                numberNote: nfseGoiania.numero,
                keyNote: nfseGoiania.codigoVerificacao,
                dateNote: nfseGoiania.dataEmissao,
                nameTomador: nfseGoiania.nameTomador,
                cgceTomador: nfseGoiania.cgceTomador,
                statusNote: nfseGoiania.statusNota,
                amountNote: nfseGoiania.valorServicos,
                amountCalculationBase: nfseGoiania.baseCalculo,
                rateISS: nfseGoiania.aliquotaIss,
                amountISS: nfseGoiania.valorIss,
                amountCSLL: nfseGoiania.valorCsll,
                amountINSS: nfseGoiania.valorInss,
                amountIRRF: nfseGoiania.valorIr,
                amountPIS: nfseGoiania.valorPis,
                amountCOFINS: nfseGoiania.valorCofins
            })

            const nameFileToSave = `${nfseGoiania.numero}-${nfseGoiania.codigoVerificacao}`

            pathNote = path.join(pathOriginal, `${nameFileToSave}.xml`)
            pathNoteRoutineAutomactic = path.join(pathOriginalRoutineAutomactic, `${nameFileToSave}.xml`)

            const xml = builder.buildObject(nfToXml)
            fs.writeFileSync(pathNote, xml)
            if (settings.codeCompanie && pathOriginalRoutineAutomactic) {
                fs.writeFileSync(pathNoteRoutineAutomactic, xml)
            }
        }
    }
}

export default SaveXMLsGoiania