// import path from 'path'
import { Browser, Page } from 'puppeteer'

import SaveLogPrefGoiania from '../../controllers/SaveLogPrefGoiania'
import ISettingsGoiania from '../../models/ISettingsGoiania'
// import createFolderToSaveData from '../../utils/CreateFolderToSaveData'

export default class TreatsMessageLog {
    private page: Page
    private browser: Browser | undefined
    private settings: ISettingsGoiania
    private pathImg = ''

    constructor (page: Page, settings: ISettingsGoiania, browser?: Browser) {
        this.page = page
        this.browser = browser
        this.settings = settings
    }

    async saveLog (): Promise<void> {
        // this.pathImg = await createFolderToSaveData(this.settings)
        // this.pathImg = path.resolve(this.pathImg, `${this.settings.messageLog}.png`)
        // await this.page.screenshot({ path: this.pathImg, fullPage: true })
        await this.page.close()
        if (this.browser) {
            if (this.browser.isConnected()) await this.browser.close()
        }

        const saveLogPrefGoiania = new SaveLogPrefGoiania()
        await saveLogPrefGoiania.saveLog({
            id: this.settings.id,
            prefGoianiaAccess: this.settings.idUser,
            hourLog: this.settings.hourLog,
            typeLog: this.settings.typeLog || 'error',
            messageLog: this.settings.messageLog || '',
            messageError: this.settings.messageError,
            messageLogToShowUser: this.settings.messageLogToShowUser,
            urlImageDown: this.pathImg,
            codeCompanie: this.settings.codeCompanie,
            nameCompanie: this.settings.companie,
            inscricaoMunicipal: this.settings.inscricaoMunicipal,
            dateStartDown: this.settings.dateStartDown,
            dateEndDown: this.settings.dateEndDown,
            qtdNotesDown: this.settings.qtdTimesReprocessed,
            qtdTimesReprocessed: this.settings.qtdTimesReprocessed
        })

        throw `[${this.settings.typeLog}]-${this.settings.messageLog}-${this.settings.messageError}`
    }
}