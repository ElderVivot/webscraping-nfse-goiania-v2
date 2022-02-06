import IDateDownGoiania from '../models/IDateDownGoiania'
import api from '../services/api'

export default class GetMaxDateDownGoiania {
    async getMaxDateDown (filter: string): Promise<IDateDownGoiania | any> {
        try {
            const access = await api.get(`/log_pref_goiania_max_date_down${filter}`)
            if (access.status === 200) {
                return access.data
            }
        } catch (error) {
            console.log(`- [controllers_GetMaxDateDownGoiania] --> Error --> ${error}`)
        }
    }
}

// const getPrefGoianiaAccess = new GetPrefGoianiaAccess()
// getPrefGoianiaAccess.getAccess().then(result => console.log(result))