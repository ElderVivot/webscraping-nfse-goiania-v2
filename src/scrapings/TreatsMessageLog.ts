// import path from 'path'
import { Browser, Page } from 'puppeteer'

import { logger } from '@common/log'
import { SaveLogPrefGoiania } from '@services/SaveLogPrefGoiania'

import { ILogNotaFiscalApi, ISettingsGoiania } from './_interfaces'

export class TreatsMessageLog {
    constructor (private page: Page, private settings: ISettingsGoiania, private browser?: Browser, private noClosePage?: boolean) {
        this.page = page
        this.browser = browser
        this.settings = settings
        this.noClosePage = noClosePage
    }

    async saveLog (saveInDB = true): Promise<void> {
        if (saveInDB) {
            if (this.settings.typeLog === 'error') { this.settings.qtdTimesReprocessed += 1 }

            const dataToSave: ILogNotaFiscalApi = {
                idLogNfsPrefGyn: this.settings.idLogNfsPrefGyn,
                idAccessPortals: this.settings.idAccessPortals,
                idCompanie: this.settings.idCompanie,
                typeLog: this.settings.typeLog || 'error',
                messageLog: this.settings.messageLog || '',
                messageError: this.settings.messageError?.toString() || this.settings.messageError || '',
                messageLogToShowUser: this.settings.messageLogToShowUser || '',
                federalRegistration: this.settings.federalRegistration,
                nameCompanie: this.settings.nameCompanie,
                cityRegistration: this.settings.cityRegistration,
                dateStartDown: new Date(this.settings.dateStartDown).toISOString(),
                dateEndDown: new Date(this.settings.dateEndDown).toISOString(),
                qtdNotesDown: this.settings.qtdNotes || 0,
                qtdTimesReprocessed: this.settings.qtdTimesReprocessed || 0
            }

            const saveLogPref = new SaveLogPrefGoiania(dataToSave, true, this.page)
            await saveLogPref.save()
        }

        if (this.settings.typeLog === 'warning') {
            logger.warn({
                msg: this.settings.messageLogToShowUser,
                locationFile: this.settings.pathFile,
                error: this.settings.messageError
            })
        } else if (this.settings.typeLog === 'error') {
            logger.error({
                msg: this.settings.messageLogToShowUser,
                locationFile: this.settings.pathFile,
                error: this.settings.messageError,
                settings: this.settings
            })
        }

        if (!this.noClosePage) await this.page.close()
        if (this.browser) await this.browser.close()

        throw `[${this.settings.typeLog}]-${this.settings.messageLog}-${this.settings.messageError}`
    }
}