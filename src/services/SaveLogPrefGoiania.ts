import { Page } from 'puppeteer'

import { IFetchAdapter } from '@common/adapters/fetch/fetch-adapter'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { handlesFetchError } from '@common/error/fetchError'
import { logger } from '@common/log'
import { ILogNotaFiscalApi } from '@scrapings/_interfaces'
import { urlBaseApi } from '@scrapings/_urlBaseApi'

export class SaveLogPrefGoiania {
    private fetchFactory: IFetchAdapter
    private urlBase: string

    constructor (private dataToSave: ILogNotaFiscalApi, private saveScreenshot = false, private page: Page = null) {
        this.dataToSave = dataToSave
        this.saveScreenshot = saveScreenshot
        this.page = page
        this.fetchFactory = makeFetchImplementation()
        this.urlBase = `${urlBaseApi}/log_nfs_pref_gyn`
    }

    private async getScreenshot (idLogNfsPrefGyn: string): Promise<void> {
        if (this.saveScreenshot) {
            const screenshot = await this.page.screenshot({ encoding: 'base64', type: 'png', fullPage: true })

            await this.fetchFactory.patch<ILogNotaFiscalApi>(
                `${this.urlBase}/${idLogNfsPrefGyn}/upload_print_log`,
                {
                    bufferImage: screenshot
                },
                { headers: { tenant: process.env.TENANT } }
            )
        }
    }

    async save (): Promise<string> {
        try {
            if (this.dataToSave.idLogNfsPrefGyn) {
                const response = await this.fetchFactory.put<ILogNotaFiscalApi>(
                    `${this.urlBase}/${this.dataToSave.idLogNfsPrefGyn}`,
                    { ...this.dataToSave },
                    { headers: { tenant: process.env.TENANT } }
                )
                if (response.status >= 400) throw response

                await this.getScreenshot(this.dataToSave.idLogNfsPrefGyn)

                return response.data.idLogNfsPrefGyn
            } else {
                const response = await this.fetchFactory.post<ILogNotaFiscalApi>(
                    `${this.urlBase}`,
                    { ...this.dataToSave },
                    { headers: { tenant: process.env.TENANT } }
                )
                if (response.status >= 400) throw response

                await this.getScreenshot(response.data.idLogNfsPrefGyn)

                return response.data.idLogNfsPrefGyn
            }
        } catch (error) {
            const responseFetch = handlesFetchError(error)
            if (responseFetch) logger.error(responseFetch, __filename)
            else logger.error(error, __filename)
        }
    }
}