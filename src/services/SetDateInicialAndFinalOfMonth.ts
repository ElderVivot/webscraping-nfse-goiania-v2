import IPeriodToDownNotes from '../models/IPeriodToDownNotes'
import ISettingsGoiania from '../models/ISettingsGoiania'
import * as functions from '../utils/functions'

export default function SetDateInicialAndFinalOfMonth (settings: ISettingsGoiania, periodToDown: IPeriodToDownNotes, month: number, year: number): ISettingsGoiania {
    const yearInicial = periodToDown.dateStart.getFullYear()
    const yearFinal = periodToDown.dateEnd.getFullYear()
    const monthInicial = periodToDown.dateStart.getMonth() + 1
    const monthFinal = periodToDown.dateEnd.getMonth() + 1

    // set default values at each iteration
    settings.month = undefined
    settings.year = undefined
    settings.dayInitialMonth = undefined
    settings.dayFinalMonth = undefined
    settings.dateStartDown = undefined
    settings.dateEndDown = undefined
    settings.error = undefined
    settings.messageError = undefined
    settings.messageLog = undefined
    settings.messageLogToShowUser = undefined
    settings.typeLog = 'error'

    settings.month = functions.zeroLeft(String(month), 2)
    settings.year = String(year)

    const daysInitialAndFinalOfMonth = functions.daysInitialAndEndOfMonth(month, year)

    if (month === monthInicial && month === monthFinal && year === yearInicial && year === yearFinal) {
        settings.dayInitialMonth = functions.zeroLeft(String(periodToDown.dateStart.getDate()), 2)
        settings.dateStartDown = functions.convertDateToString(periodToDown.dateStart)
        settings.dayFinalMonth = functions.zeroLeft(String(periodToDown.dateEnd.getDate()), 2)
        settings.dateEndDown = functions.convertDateToString(periodToDown.dateEnd)
    } else if (month === monthInicial && year === yearInicial) {
        settings.dayInitialMonth = functions.zeroLeft(String(periodToDown.dateStart.getDate()), 2)
        settings.dateStartDown = functions.convertDateToString(periodToDown.dateStart)
        settings.dayFinalMonth = functions.zeroLeft(String(daysInitialAndFinalOfMonth.dateFinal.getDate()), 2)
        settings.dateEndDown = functions.convertDateToString(daysInitialAndFinalOfMonth.dateFinal)
    } else if (month === monthFinal && year === yearFinal) {
        settings.dayInitialMonth = functions.zeroLeft(String(daysInitialAndFinalOfMonth.dateInitial.getDate()), 2)
        settings.dateStartDown = functions.convertDateToString(daysInitialAndFinalOfMonth.dateInitial)
        settings.dayFinalMonth = functions.zeroLeft(String(periodToDown.dateEnd.getDate()), 2)
        settings.dateEndDown = functions.convertDateToString(periodToDown.dateEnd)
    } else {
        settings.dayInitialMonth = functions.zeroLeft(String(daysInitialAndFinalOfMonth.dateInitial.getDate()), 2)
        settings.dayFinalMonth = functions.zeroLeft(String(daysInitialAndFinalOfMonth.dateFinal.getDate()), 2)
        settings.dateStartDown = functions.convertDateToString(daysInitialAndFinalOfMonth.dateInitial)
        settings.dateEndDown = functions.convertDateToString(daysInitialAndFinalOfMonth.dateFinal)
    }

    return settings
}