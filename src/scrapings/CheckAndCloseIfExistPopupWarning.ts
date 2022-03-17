import { Page } from 'puppeteer'

// import ISettingsGoiania from '../../models/ISettingsGoiania'
// import TreatsMessageLog from './TreatsMessageLog'

const CheckAndCloseIfExistPopupWarning = async (page: Page): Promise<void> => {
    try {
        await page.waitFor(2000)
        const frame = page.frames().find(frame => frame.url().toUpperCase().indexOf('GOIANIAPATTERNS/POPUP') >= 0)
        if (frame) {
            await frame.waitFor('.CloseButtonPopup', { timeout: 7000 })
            await frame.click('.CloseButtonPopup')
        }
    } catch (error) { }
}

export default CheckAndCloseIfExistPopupWarning