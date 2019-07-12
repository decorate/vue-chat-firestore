import 'firebase/storage'

export default class ImageService {
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
                console.log('Upload is ' + progress + '% done')

                stateChange(progress)

                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
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