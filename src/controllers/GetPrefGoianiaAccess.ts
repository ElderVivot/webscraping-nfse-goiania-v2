import api from '../services/api'

export default class GetPrefGoianiaAccess {
    async getAccess (): Promise<any> {
        try {
            const access = await api.get('/pref_goiania_access')
            if (access.status === 200) {
                return access.data
            }
        } catch (error) {
            console.log(`- [controllers_GetPrefGoianiaAccess] --> Error --> ${error}`)
        }
    }
}

// const getPrefGoianiaAccess = new GetPrefGoianiaAccess()
// getPrefGoianiaAccess.getAccess().then(result => console.log(result))