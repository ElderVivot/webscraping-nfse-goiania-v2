import { Page } from 'puppeteer'

import { logger } from '@common/log'

export const CloseOnePage = async (page: Page, type: string = 'Empresa'): Promise<void> => {
    try {
        await page.close()
        if (type === 'Empresa') {
            logger.info('\t[Final-Empresa] - Fechando aba')
            logger.info('\t-------------------------------------------------')
        } else {
            logger.info(`[Final-${type}] - Fechando aba`)
            logger.info('-------------------------------------------------')
        }
    } catch (error) { }
}