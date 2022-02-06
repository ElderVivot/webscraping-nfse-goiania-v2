import api from '../services/api'

export default class GetSettingsWayFiles {
    async getSettings (): Promise<any> {
        try {
            let accessResult = ''
            const access = await api.get('/settings_way_files')
            if (access.status === 200) {
                accessResult = access.data
            }
            return accessResult
        } catch (error) {
            console.log(`- [controllers_GetSettingsWayFiles] --> Error --> ${error}`)
            return ''
        }
    }
}

// const getPrefGoianiaAccess = new GetPrefGoianiaAccess()
// getPrefGoianiaAccess.getAccess().then(result => console.log(result))