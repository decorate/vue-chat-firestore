<template>
    <div id="_chat-fire">

        <div class="line__container">
            <div class="line__header line__flex line__align-center" ref="header">
                <div class="line__icon">
                    <i class="fas fa-angle-left"></i>
                </div>
                <div class="line__title">
                    vue-chat-firestore
                </div>
            </div>

            <div  v-infinite-scroll="loadMore"
                     infinite-scroll-disabled="busy"
                     infinite-scroll-distance="450"
                    ref="content" class="line__contents scroll" :style="{height: height + 'px'}" @click="blur">

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
                            <div class="line__left-text">
                                <div class="name">guest</div>
                                <div class="text">{{m.message}}</div>
                            </div>
                        </div>

                        <div class="line__right-text" v-if="isHost(m.senderId)">
                            <div class="text">{{m.message}}</div>
                            <span class="date">既読<br>0:30</span>
                        </div>
                    </div>

                </div>

            </div>

            <div class="line__footer line__flex line__align-center" ref="footer">
                <transition name="line__icon-box">
                    <div class="line__icon-box" v-show="!isFocus">
                        <div class="line__icon mr-15">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="line__icon mr-15">
                            <i class="fas fa-camera"></i>
                        </div>
                        <div class="line__icon mr-15">
                            <i class="fas fa-image"></i>
                        </div>
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

                host: 1,

                height: window.innerHeight - (46 * 2),

                value: '',

                rows: 1,

                isFocus: false,

                firestore: new FirestoreService(
                    this.apiKey,
                    this.authDomain,
                    this.projectId,
                    this.chatCollection
                ),

                busy: false
            }
        },

        computed: {
            isSendable() {
                const length = this.value.length
                const match = (this.value.match(new RegExp(/( |　|\n)/, "g")) || []).length
                return length !== match && length
            }
        },

        async created() {
            this.busy = !this.busy
            this.messages =  await this.firestore.getChat('1_2')
            this.busy = !this.busy
        },

        async mounted() {
            window.addEventListener('resize', this.contentHeight)
            this.$refs.content.addEventListener('scroll', this.scrolling)

            this.scrollTop()

            setTimeout(async () => {
                // this.messages.push(
                // {
                //     message: 'OK!',
                //         senderId: 2,
                //     receiverId: 1,
                //     read: false,
                // })
                // this.finished()
            }, 3000)
        },

        beforeDestroy: function () {
            window.removeEventListener('resize', this.contentHeight)
            this.$refs.content.removeEventListener('scroll', this.scrolling)
        },

        methods: {
            async loadMore() {
                if(this.busy || this.firestore.isComplete) return
                console.log('load')
                this.busy = !this.busy
                const data =  await this.firestore.getChat('1_2')
                this.messages.unshift(...data)

                await this.$nextTick()
                this.busy = !this.busy
            },

            isHost(senderId) {
                return this.host === senderId
            },

            allocateClass(senderId) {
                return this.isHost(senderId) ? 'line__right' : 'line__left'
            },

            contentHeight() {
                this.height = window.innerHeight - (46 * 2)
            },

            scrollTop() {
                this.$refs.content.scrollTo(0, 0)
            },

            scrolling(e) {
                //if(this.height * 0.8)
                //console.log(e.target.scrollTop)
            },

            async finished() {
                this.value = ''
                await this.$nextTick()
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

                this.messages.push({
                    message: this.value,
                    senderId: 2,
                    receiverId: 1,
                    read: false,
                })
                this.finished()
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
        width: 100%;
        height: 100%;

        ._chat-fire-header {
            height: 45px;
            background: #ddd;
            padding: 0 5px;

            ._chat-fire-header-icon {
                font-size: 1.7rem;
            }
        }
    }
</style>