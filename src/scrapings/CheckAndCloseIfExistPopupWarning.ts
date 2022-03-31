import { Page } from 'puppeteer'

export const CheckAndCloseIfExistPopupWarning = async (page: Page): Promise<void> => {
    try {
        await page.waitForTimeout(2000)
        const frame = page.frames().find(frame => frame.url().toUpperCase().indexOf('GOIANIAPATTERNS/POPUP') >= 0)
        if (frame) {
            await frame.waitForSelector('.CloseButtonPopup', { timeout: 7000 })
            await frame.click('.CloseButtonPopup')
        }
    } catch (error) { }
}