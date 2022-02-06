import { subMonths, subDays } from 'date-fns'

import GetMaxDateDownGoiania from '../controllers/GetMaxDateDownGoiania'
import IPeriodToDownNotes from '../models/IPeriodToDownNotes'
import ISettingsGoiania from '../models/ISettingsGoiania'

const PeriodToDownNotesGoiania = async (settings: ISettingsGoiania): Promise<IPeriodToDownNotes> => {
    const getMaxDateDownGoiania = new GetMaxDateDownGoiania()
    const maxDate = await getMaxDateDownGoiania.getMaxDateDown(`?inscricaoMunicipal=${settings.inscricaoMunicipal}`)
    const datedownmax = maxDate?.datedownmax
    let dateStart: Date
    if (!datedownmax) {
        dateStart = subMonths(new Date(), 4)
    } else {
        dateStart = new Date(datedownmax)
    }

    const dateEnd = subDays(new Date(), 1)

    return {
        dateStart, dateEnd
    }
}

export default PeriodToDownNotesGoiania

// const periodToDownNotesGoiania = new PeriodToDownNotesGoiania({
//     dateHourProcessing: '',
//     hourLog: '',
//     idUser: 0,
//     loguin: '',
//     password: '',
//     inscricaoMunicipal: '4273222'
// })
// periodToDownNotesGoiania.process().then(result => console.log(result))