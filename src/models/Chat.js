import {Model, ImageUploadable} from '@team-decorate/alcjs'
import moment from 'moment'
import FU from '../utility/fileUtility'

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

    get imageView () {
        if (this.file && this.checkImage()) {
            fU.bindResult(this.file, (p) => this.blobImage = p)
            return this.blobImage
        }

        if(!this.checkImage()) {
            return this.addFileImage()
        }

        return this.path
    }

    checkImage() {
        return this.extension.match(/(gif|jpg|jpeg|png)/i)
    }

    addFileImage() {
        if(this.extension.match(/(pdf)/i)) {
            return 'images/pdfimg.png'
        }

        if(this.extension.match(/xls|xlt|xml|xlsx|xlsm|xlsb|xltx|xltm|xlam|xla|xlw|xlr/i)) {
            return 'images/excelimg.png'
        }

        return 'images/noimage.png'
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