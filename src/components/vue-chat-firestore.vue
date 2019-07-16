<template>
    <div id="_chat-fire">

        <div :style="{height: (height + fixedHeight) + 'px'}" class="line__container">
            <div class="line__header line__flex line__align-center" ref="header">
                <div class="line__icon" @click="back">
                    <i class="fas fa-angle-left"></i>
                </div>
                <div class="line__title">
                    vue-chat-firestore
                </div>

                <transition name="line__alert">
                    <div v-if="alert" class="line__alert-box">
                        <p>{{alert}}</p>
                    </div>
                </transition>
            </div>

            <div  v-infinite-scroll="loadMore"
                     infinite-scroll-disabled="busy"
                     infinite-scroll-distance="450"
                    ref="content" class="line__contents scroll" :style="{maxHeight: height + 'px'}" @click="blur">

                <div ref="trans" class="line_clear-trans">

                    <div v-if="busy" class="line__icon line__loader">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>

                    <div v-for="m in messages"
                         :class="allocateClass(m.senderId)">
                        <div class="line__flex" v-if="!isHost(m.senderId)">
                            <figure>
                                <img :src="receiverIcon" />
                            </figure>
                            <div v-if="!m.hasImage" class="line__left-text">
                                <div class="text">{{m.message}}</div>
                                <span class="date">{{m.date}}</span>
                            </div>
                            <div v-if="m.hasImage" class="line__left-image">
                                <img :src="m.imageView">
                            </div>
                        </div>

                        <div class="line__right-text" v-if="isHost(m.senderId) && !m.hasImage">
                            <div class="text">{{m.message}}</div>
                            <!--<span class="date">既読<br>0:30</span>-->
                            <span class="date">{{m.date}}</span>
                        </div>

                        <div class="line__right-image" v-if="isHost(m.senderId) && m.hasImage">
                            <img :src="m.imageView">
                            <div class="line__progress-box">
                                <progress v-if="m.progress" :value="m.progress" max="100"></progress>
                            </div>
                            <!--<span class="date">既読<br>0:30</span>-->
                            <span class="date">{{m.date}}</span>
                        </div>
                    </div>

                </div>

            </div>

            <div class="line__footer line__flex" ref="footer">
                <div v-if="hasFiles" class="line__info-box">
                    <div @click="closeFilesInfo" class="line__icon mr-15">
                        <i class="fas fa-times"></i>
                    </div>
                    <p>{{files.length}}件選択中</p>
                </div>
                <transition name="line__icon-box">
                    <div class="line__icon-box" v-show="!isFocus">
                        <div class="line__icon mr-15">
                            <label for="line__image-file">
                                <i class="fas fa-image"></i>
                                <input @change="imageSelect" type="file" multiple="multiple" id="line__image-file"/>
                            </label>
                        </div>

                        <slot name="icons"></slot>
                    </div>
                </transition>

                <transition name="line__icon-box">
                    <div class="line__icon-box" v-show="isFocus">
                        <div class="line__icon mr-15" @click="blur">
                            <i class="fas fa-chevron-circle-right"></i>
                        </div>
                    </div>
                </transition>
                <div class="line__input-send-box">
                    <div class="line_input">
                    <textarea v-model="value"
                              ref="textarea"
                              :rows="rows"
                              @input="input"
                              @focus="focus"
                              ></textarea>
                    </div>
                    <div class="line__icon mr-15" @click="send" :class="{sendable: isSendable}">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
    import FirestoreService from '../services/FirestoreService'
    import InfiniteScroll from 'vue-infinite-scroll'
    import Chat from '../models/Chat'
    import * as FU from '../utility/fileUtility'
    import ImageService from '../services/ImageService'

    export default {
        name: 'vue-chat-firestore',

        props: {
            apiKey: {
                type: String,
                required: true
            },

            authDomain: {
                type: String,
                required: true
            },

            projectId: {
                type: String,
                required: true
            },

            chatCollection: {
                type: String,
                required: true
            },

            hostId: {
                required: true
            },

            guestId: {
                required: true
            },

            roomId: {
                required: true
            },

            isGroup: {
                type: Boolean,
                default: false
            },

            receiverIcon: {
                type: String,
            },

            receiverIcons: {
                type: Array
            }
        },

        data() {
            return {
                messages: [],
                height: 0,
                value: '',
                rows: 1,
                isFocus: false,
                firestore: new FirestoreService(
                    this.apiKey,
                    this.authDomain,
                    this.projectId,
                    this.chatCollection
                ),
                imageService: new ImageService(),
                busy: false,
                fireStoreDispose: null,
                alert: null,
                fixedHeight: 46,
                files: [],
            }
        },

        computed: {
            isSendable() {
                const length = this.value.length
                const match = (this.value.match(new RegExp(/( |　|\n)/, "g")) || []).length
                return length !== match && length || this.files.length
            },

            hasFiles() {
                return this.files.length
            }
        },

        async created() {
            this.watchDB()
        },

        async mounted() {
            this.contentHeight()
            window.addEventListener('resize', this.contentHeight)

            this.scrollTop()
            this.addChildEvent()
        },

        beforeDestroy: function () {
            this.fireStoreDispose()
            window.removeEventListener('resize', this.contentHeight)
            this.removeChildEvent()
        },

        methods: {
            addChildEvent() {
                if(!this.$slots.icons) return

                this.$slots.icons.forEach(x => {
                    x.context.$el.addEventListener('click', this.iconClick)
                })
            },

            removeChildEvent() {
                if(!this.$slots.icons) return

                this.$slots.icons.forEach(x => {
                    x.context.$el.removeEventListener('click', this.iconClick)
                })
            },

            iconClick(e) {
                this.$emit('icon-click', this.firestore)
            },

            async loadMore() {
                if(this.busy || this.firestore.isComplete) return
                this.busy = !this.busy
                const data =  await this.firestore.getChat(this.roomId)
                this.messages.unshift(...data)

                await this.$nextTick()
                this.busy = !this.busy
            },

            isHost(senderId) {
                return this.hostId == senderId
            },

            allocateClass(senderId) {
                return this.isHost(senderId) ? 'line__right' : 'line__left'
            },

            contentHeight() {
                this.height = window.innerHeight - (this.fixedHeight * 2)
            },

            scrollTop() {
                this.$refs.content.scrollTo(0, 0)
            },

            async finished() {
                this.value = ''
                this.files = []
                this.blur()
                setTimeout(async () => {
                    await this.$nextTick()
                    this.scrollTop()

                    await this.$nextTick()
                    this.contentHeight()
                }, 1000)

            },

            focus() {
                this.$refs.footer.style.paddingBottom = '45px'
                this.$refs.textarea.style.width = '70vw'
                this.input()
                this.isFocus = true
            },

            blur() {
                this.$refs.footer.style.paddingBottom = '5px'
                this.$refs.textarea.style.width = '55vw'
                this.rows = 1
                this.isFocus = false
            },

            input() {
                this.rows = this.getRows()
            },

            getRows() {
                const num = this.value.split("\n").length;
                return (num < 4) ? num : 4;
            },

            async send() {
                if(!this.isSendable) return

                if(this.hasFiles) {
                    this.imageUpload()
                    return
                }

                const chat = this.createSource({message: this.value})

                this.messages.push(chat)

                this.blur()

                await this.firestore.send(chat)

                this.finished()
            },

            createSource(source = {}) {
                return new Chat({
                    senderId: this.hostId,
                    receiverId: this.guestId,
                    read: false,
                    createdAt: new Date(),
                    ...source
                })
            },

            async watchDB() {
                let snap = true
                const query = await this.firestore.getChatDB(this.roomId)
                this.fireStoreDispose = query.orderBy('created_at', 'desc').onSnapshot(snapshot => {
                    if (snap) {
                        snap = false
                        return
                    }

                    snapshot.docChanges().forEach(async change => {
                        const data = change.doc.data()
                        if(this.hostId == data.sender_id) return

                        if(change.type === 'added') {
                            this.messages.push(new Chat(data))

                            await this.$nextTick()
                            this.contentHeight()

                            this.alert = data.message

                            setTimeout(() => {
                                this.alert = null
                            }, 2000)
                        }
                    })
                })
            },

            async imageUpload() {
                this.files
                    .map(x => {
                        return {name: x.name, file: x}
                    })
                    .map(async x => {

                        const chat = this.createSource({path: '/images/noimage.png'})
                        chat.filename = x.name
                        this.messages.push(chat)

                        await this.imageService.put(`images/${x.name}`, x.file, async (path) => {
                            const ext = x.file.name.split('.').pop()
                            const chat = this.createSource({path: path, extension: ext})

                            this.messages.map((xs, i) => {
                                if(xs.filename === x.file.name) {
                                    this.messages.splice(i, 1)
                                }
                            })
                            this.messages.push(chat)
                            await this.firestore.send(chat)

                        }, async (val) => {
                            chat.progress = val
                        })
                    })

                this.finished()
            },

            async imageSelect(e) {
                FU.getFile(e).select(x => this.files.push(x)).toArray()
            },

            closeFilesInfo() {
                this.files = []
            },

            back() {
                this.$emit('back')
            }

        },

        components: {
        },

        directives: {
            InfiniteScroll
        }
    }
</script>

<style lang="scss">
    @import "../style/style.scss";
    #_chat-fire {
        position: absolute;
        left: 0;
        top:0;
        width: 100%;
        z-index: 1200;
    }
</style>