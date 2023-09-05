import { Page } from 'puppeteer'

export const CheckAndCloseIfMessageMEI = async (page: Page): Promise<void> => {
    try {
        await page.waitForTimeout(2000)
        page.frames().map(frame => console.log(frame.url()))
        const frame = page.frames().find(frame => frame.url().toUpperCase().indexOf('POPUP_MEI') >= 0)
        if (frame) {
            await frame.waitForSelector('input[id*="block_wtMainContent"]', { timeout: 7000 })
            await frame.click('input[id*="block_wtMainContent"]')
        }
    } catch (error) { }
}