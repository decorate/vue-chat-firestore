import Model from '@team-decorate/alcjs'

const FILLABLE = [
    'message', 'senderId', 'receiverId', 'read'
]

export default class Chat extends Model {
    constructor(data) {
        super()
        this.fillable = FILLABLE
        this.presents = ['senderId', 'receiverId', 'read']

        this.message = ''
        this.senderId = 0
        this.receiverId = 0
        this.read = false
        this.createdAt = null

        this.data = data
    }
}