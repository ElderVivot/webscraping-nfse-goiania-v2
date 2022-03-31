import fs from 'fs'
import path from 'path'
import 'dotenv/config'

import { ISettingsGoiania } from '@scrapings/_interfaces'

import { treateTextField, zeroLeft } from './functions'

const mountFolder = (settings: ISettingsGoiania, folder: string) => {
    let newFolder = folder
    if (folder.substring(0, 2) === '\\\\') {
        newFolder = folder.substring(0, 2) + folder.substring(2).replace(/[\\]/g, '/')
    } else {
        newFolder = folder.replace(/[\\]/g, '/')
    }

    const nameCompanie = settings.nameCompanie ? treateTextField(settings.nameCompanie).substring(0, 70) : undefined
    const monthString = zeroLeft(settings.month.toString(), 2)

    const folderSplit = newFolder.split('/')
    let folderComplete = ''
    for (const field of folderSplit) {
        if (field === 'accessGoiania') {
            path.resolve(folderComplete, '')
            folderComplete += settings.loguin ? `${settings.loguin}/` : ''
        } else if (field === 'typeLog') {
            folderComplete += settings.typeLog ? `${settings.typeLog}/` : ''
        } else if (field === 'nameCompanieWithIM') {
            folderComplete += settings.nameCompanie && settings.cityRegistration ? `${nameCompanie} - ${settings.cityRegistration}/` : ''
        } else if (field === 'nameCompanieWithCodeCompanie') {
            folderComplete += settings.nameCompanie && settings.codeCompanieAccountSystem ? `${nameCompanie} - ${settings.codeCompanieAccountSystem}/` : `${nameCompanie} - ${settings.cityRegistration}/`
        } else if (field === 'year') {
            folderComplete += settings.year ? `${settings.year}/` : ''
        } else if (field === 'month') {
            folderComplete += monthString ? `${monthString}/` : ''
        } else if (field === 'EntradasOrSaidas') {
            folderComplete += 'Saidas/'
        } else if (field === 'typeNF') {
            folderComplete += 'NFS-e/'
        } else if (field === 'codeCompanieWithNameCompanie') {
            folderComplete += settings.nameCompanie && settings.codeCompanieAccountSystem ? `${settings.codeCompanieAccountSystem} - ${nameCompanie}/` : `${nameCompanie} - ${settings.cityRegistration}/`
        } else if (field === 'codeCompanieWithNameCompanieRotinaAutomatica') {
            folderComplete += settings.nameCompanie && settings.codeCompanieAccountSystem ? `${settings.codeCompanieAccountSystem}-${nameCompanie}/` : `${nameCompanie} - ${settings.cityRegistration}/`
        } else if (field === 'codeCompanieRotinaAutomatica') {
            folderComplete += settings.codeCompanieAccountSystem ? `${settings.codeCompanieAccountSystem}-/` : ''
        } else if (field === 'monthYearRotinaAutomatica') {
            folderComplete += settings.year && monthString ? `${monthString}${settings.year}/` : ''
        } else if (field === 'monthYear') {
            folderComplete += settings.year && monthString ? `${monthString}-${settings.year}/` : ''
        } else if (field === 'yearMonth') {
            folderComplete += settings.year && monthString ? `${settings.year}-${monthString}/` : ''
        } else {
            folderComplete += `${field}/`
        }
        fs.existsSync(folderComplete) || fs.mkdirSync(folderComplete)
    }
    return folderComplete
}

const createFolderToSaveData = async (settings: ISettingsGoiania, folderRoutineAutomactic = false): Promise<string> => {
    const folderToSaveXMLsGoiania = process.env.FOLDER_TO_SAVE_XMLs_GOIANIA
    const folderToSaveXMLsGoianiaRotinaAutomatica = process.env.FOLDER_TO_SAVE_XMLs_GOIANIA_ROT_AUT
    let folder = ''

    if (settings.typeLog === 'success') {
        folder = mountFolder(settings, folderToSaveXMLsGoiania)
        // when exists folderToSaveXMLsGoianiaRotinaAutomatica and I want to process folderRoutineAutomactic
        if (folderRoutineAutomactic && settings.codeCompanieAccountSystem) {
            if (folderToSaveXMLsGoianiaRotinaAutomatica) {
                folder = mountFolder(settings, folderToSaveXMLsGoianiaRotinaAutomatica)
            } else {
                return ''
            }
        }
    }

    return folder
}

export default createFolderToSaveData