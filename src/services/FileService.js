import 'firebase/storage'

export default class FileService {
    constructor() {
        this.storage = window.firebase.storage().ref()
    }

    async put(path,
              file,
              uploadAfter = (url) => {},
              stateChange = (val) => {})
    {
        const task = this.storage.child(path).put(file)

        await task.on('state_changed', async snapshot => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                stateChange(progress)

                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        break;
                }

            },
            (error) => {},
            async () => {
                await task.snapshot.ref.getDownloadURL().then(url => {
                    uploadAfter(url)
                })
            }
        )
    }
}