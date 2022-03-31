import { ISettingsGoiania } from '@scrapings/_interfaces'
// import { MainNFGoias } from '@scrapings/MainNFGoiasProcessTheQueue'
import { MainProcessLoguin } from '@scrapings/MainProcessLoguin'

const ScrapingNotesJob = {
    key: 'ScrapingNotes',
    async handle ({ data }): Promise<void> {
        const settings: ISettingsGoiania = data.settings

        if (settings.typeProcessing === 'MainAddQueueLoguin') {
            await MainProcessLoguin({
                typeProcessing: settings.typeProcessing,
                idAccessPortals: settings.idAccessPortals,
                loguin: settings.loguin,
                password: settings.password,
                dateStartDown: settings.dateStartDown,
                dateEndDown: settings.dateEndDown
            })
        } else {

        }

        return Promise.resolve()
    }
}

export { ScrapingNotesJob }