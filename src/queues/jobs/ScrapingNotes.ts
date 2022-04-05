import { ISettingsGoiania } from '@scrapings/_interfaces'
// import { MainNFGoias } from '@scrapings/MainNFGoiasProcessTheQueue'
import { MainProcessLoguin } from '@scrapings/MainProcessLoguin'

interface IData {
    data: {
        settings: ISettingsGoiania
    }
}

const ScrapingNotesJob = {
    key: 'ScrapingNotesPrefGyn',
    async handle ({ data }: IData): Promise<void> {
        const settings = data.settings

        await MainProcessLoguin({
            ...settings
        })

        return Promise.resolve()
    }
}

export { ScrapingNotesJob }