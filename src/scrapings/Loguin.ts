import { Browser, Page } from 'puppeteer'

import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'

import { treateTextField } from '../utils/functions'
import { ISettingsGoiania } from './_interfaces'
import { urlBaseApi } from './_urlBaseApi'
import { TreatsMessageLog } from './TreatsMessageLog'

async function ckeckIfExistWarningLogin (page: Page, settings: ISettingsGoiania) {
    try {
        const userInvalid = treateTextField(await page.$eval('.Feedback_Message_Error', el => el.textContent))

        if (userInvalid.indexOf('SENHA INVALIDA') >= 0) {
            const fetchFactory = makeFetchImplementation()
            await fetchFactory.put<any>(
                `${urlBaseApi}/access_portals/${settings.idAccessPortals}/password_incorrect`,
                { },
                { headers: { tenant: process.env.TENANT } }
            )
            return 'USER_OR_PASS_INVALID'
        }
        if (userInvalid.indexOf('MUITAS TENTATIVAS') >= 0 || userInvalid.indexOf('TOO MANY FAILED LOGIN') >= 0) {
            return 'MANY_FAILED_LOGIN_ATTEMPTS'
        }
    } catch (error) { }
}

export const Loguin = async (page: Page, browser: Browser, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForSelector('input[name*="UserNameInput"]')
        await page.type('input[name*="UserNameInput"]', settings.loguin)
        await page.type('input[name*="PasswordInput"]', settings.password)
        await page.click('input[value="ENTRAR"]')
        await page.waitForTimeout(4000)

        const messageWarningLogin = await ckeckIfExistWarningLogin(page, settings)
        if (messageWarningLogin) throw messageWarningLogin
    } catch (error) {
        if (error === 'USER_OR_PASS_INVALID') {
            settings.messageLogToShowUser = 'Usuário ou senha inválida'
        } else if (error === 'MANY_FAILED_LOGIN_ATTEMPTS') {
            settings.messageLogToShowUser = 'Muitas tentativas inválidas de loguin'
        } else {
            settings.messageLogToShowUser = 'Erro ao tentar fazer loguin'
        }
        settings.typeLog = 'error'
        settings.messageLog = 'Loguin'
        settings.messageError = error
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings, browser)
        await treatsMessageLog.saveLog()
    }
}