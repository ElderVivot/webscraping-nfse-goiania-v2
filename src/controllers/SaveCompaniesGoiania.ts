import ICompaniesGoiania from '../models/ICompaniesGoiania'
import api from '../services/api'

export default class SaveCompaniesGoiania {
    async save (companiesGoiania: ICompaniesGoiania): Promise<any> {
        try {
            const result = await api.put('/companies_goiania', { ...companiesGoiania })
            if (result.status === 200) {
                return result
            }
        } catch (error) {
            console.log(`- [controllers_SaveLCompaniesGoiania] --> Error --> ${error}`)
        }
    }
}