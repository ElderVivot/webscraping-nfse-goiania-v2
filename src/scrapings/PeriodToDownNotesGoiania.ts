import { IDateAdapter } from '@common/adapters/date/date-adapter'
import { makeDateImplementation } from '@common/adapters/date/date-factory'

const getDateStart = (dateFactory: IDateAdapter): Date => {
    const dateStart = dateFactory.subMonths(new Date(), Number(process.env.RETROACTIVE_MONTHS_TO_DOWNLOAD) || 0)
    dateStart.setDate(1)
    return dateStart
}

const getDateEnd = (): Date => {
    const today = new Date()
    const dayToday = today.getDate()

    if (dayToday >= 1 && dayToday < 8) {
        return new Date(today.getFullYear(), today.getMonth(), 0)
    } else if (dayToday >= 8 && dayToday < 15) {
        return new Date(today.getFullYear(), today.getMonth(), 7)
    } else if (dayToday >= 15 && dayToday < 22) {
        return new Date(today.getFullYear(), today.getMonth(), 14)
    } else if (dayToday >= 22) {
        return new Date(today.getFullYear(), today.getMonth(), 21)
    }
}

export async function PeriodToDownNotesGoiania (): Promise<{dateStart: Date, dateEnd: Date}> {
    const dateFactory = makeDateImplementation()
    try {
        const dateStart = getDateStart(dateFactory)
        const dateEnd = getDateEnd()

        if (dateStart >= dateEnd) {
            throw 'DONT_HAVE_NEW_PERIOD_TO_PROCESS'
        }

        return {
            dateStart, dateEnd
        }
    } catch (error) {

    }
}