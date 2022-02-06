import INotesNfse from '../models/INotesNfse'
import api from '../services/api'

export default class SaveNotesNfse {
    async save (notesNfse: INotesNfse): Promise<any> {
        try {
            const result = await api.put('/notes_nfse', { ...notesNfse })
            if (result.status >= 200 && result.status < 300) {
                return result
            }
        } catch (error) {
            console.log(`- [controllers_NotesNfseController] --> Error --> ${error.message}`)
        }
    }
}