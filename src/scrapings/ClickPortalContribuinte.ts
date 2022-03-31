import { Browser, Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ClickPortalContribuinte = async (page: Page, browser: Browser, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForSelector('table[id*="SistemaTable"]')

        const IDTablePortalContribuinte = await page.evaluate(() => {
            const trs = document.querySelectorAll('table[id*="SistemaTable"] > tbody > tr')
            let id = ''
            trs.forEach(value => {
                const tagA = value.getElementsByTagName('a')[0]
                if (tagA.textContent === 'Portal do Contribuinte') {
                    id = tagA.getAttribute('id') || ''
                }
            })
            return id
        })

        await page.click(`#${IDTablePortalContribuinte}`)
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ClickPortalContribuinte'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão "Portal do Contribuinte"'

        const treatsMessageLog = new TreatsMessageLog(page, settings, browser)
        await treatsMessageLog.saveLog()
    }
}