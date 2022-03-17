import MainNfseGoiania from './MainNfseGoiania'

class Applicattion {
    constructor () { }

    async process (): Promise<void> {
        const allAccess = {}
        for (const access of allAccess) {
            const settings = {
                loguin: access.user,
                password: access.password,
                idUser: access.id
            }
            try {
                await MainNfseGoiania(settings)
            } catch (error) {
                console.log(error)
            }
        }
    }
}

// const applicattion = new Applicattion()
// applicattion.process().then(_ => console.log(_))

export default Applicattion