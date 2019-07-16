import {Model, ImageUploadable} from '@team-decorate/alcjs'
import moment from 'moment'

const FILLABLE = [
    'message', 'senderId', 'receiverId', 'read', 'createdAt', 'path', 'extension'
]

export default class Chat extends ImageUploadable {
    constructor(data) {
        super()
        this.fillable = FILLABLE
        this.presents = ['senderId', 'receiverId', 'read']

        this.message = ''
        this.path = ''
        this.senderId = 0
        this.receiverId = 0
        this.read = false
        this.extension = ''
        this.createdAt = null

        this.progress = 0

        this.data = data
    }

    get date() {
        if(this.createdAt.toDate) {
            return moment(this.createdAt.toDate()).format('MM/DD HH:mm')
        }

        return moment(new Date).format('MM/DD HH:mm')
    }

    get hasImage() {
        return this.file || this.path !== ''
    }

    beforePostable() {
        super.beforePostable()

        if(this.file) {
            this.extension = this.file.name.split('.').pop()
        }
        if(!this.hasImage) {
            this.path = ''
        }
    }
}