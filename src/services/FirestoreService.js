import firebase from 'firebase/app'
import 'firebase/firestore'
import linq from 'linq'
import Chat from '../models/Chat'

export default class FirestoreService {
    constructor(key, domain, projectId, collection) {

        this.key = key
        this.domain = domain
        this.projectId = projectId
        this.collection = collection
        this.startAfter = null
        this.page = 1
        this.complete = false
        this.limit = 15
        this.query = null

        if(window.firebase === undefined) {
            window.firebase = firebase
            window.firebase.initializeApp({
                apiKey: key,
                authDomain: domain,
                projectId: projectId,
                storageBucket: 'tani-match-dev-chat'
            })

            window.db = window.firebase.firestore()
        }
    }

    setLimit(num) {
        this.limit = num
        return this
    }

    async getChatDB(roomId) {
        return await db.collection(this.collection).doc(roomId).collection('chats')
    }

    async getChat(roomId) {
        const data = []
        this.query = await this.getChatDB(roomId)
        if(this.page === 1) {
            await this.query.orderBy('created_at', 'desc').limit(this.limit).get()
                .then(snap => {
                    snap.forEach(x => {
                        data.push(x.data())
                    })

                    this.startAfter = snap.docs[snap.docs.length - 1]

                })
        } else {
            await this.query.orderBy('created_at', 'desc').limit(this.limit)
                .startAfter(this.startAfter.data().created_at)
                .get().then(snap => {
                    snap.forEach(x => data.push(x.data()))

                    this.startAfter = snap.docs[snap.docs.length - 1]
                })
        }
        this.page++

        if(data.length < this.limit) {
            this.complete = true
        }
        return linq.from(data).select(x => new Chat(x)).orderBy(x => x.createdAt).toArray()
    }

    async send(chat) {
        await this.query.add(chat.getPostable())
    }

    get isComplete() {
        return this.complete
    }
}