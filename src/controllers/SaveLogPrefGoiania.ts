import ILogPrefGoiania from '../models/ILogPrefGoiania'
import api from '../services/api'

export default class SaveLogPrefGoiania {
    async saveLog (logPrefGoiania: ILogPrefGoiania): Promise<any> {
        try {
            const { id } = logPrefGoiania
            let result
            if (id) {
                result = await api.put(`/log_pref_goiania/${id}`, { ...logPrefGoiania })
            } else {
                result = await api.post('/log_pref_goiania', { ...logPrefGoiania })
            }
            if (result.status === 200) {
                return result
            }
        } catch (error) {
            console.log(`- [controllers_SaveLogPrefGoiania] --> Error --> ${error}`)
        }
    }
}