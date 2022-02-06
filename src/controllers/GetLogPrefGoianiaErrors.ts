import api from '../services/api'

interface ILogPrefGoianiaErrors {
    id: number,
    user: string,
    password: string,
    inscricaoMunicipal: string,
    dateStartDown: string,
    dateEndDown: string,
    qtdTimesReprocessed: number,
    iduser: number
}

export default class GetLogPrefGoianiaErrors {
    async get (): Promise<ILogPrefGoianiaErrors[] | void> {
        try {
            const logPrefGoianiaErrors = await api.get('/log_pref_goiania_errors')
            if (logPrefGoianiaErrors.status === 200) {
                return logPrefGoianiaErrors.data
            }
        } catch (error) {
            console.log(`- [controllers_GetLogPrefGoianiaErrors] --> Error --> ${error}`)
        }
    }
}