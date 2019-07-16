<template>
  <div id="app">
              <vue-chat-firestore apiKey="AIzaSyDVwUkgNwM9jDTuyQgX_pfQRgYi_scMu3s"
                                  authDomain="localhost"
                                  projectId="tani-match"
                                  chat-collection="dev-tani-match-chats"
                                  :receiver-icon="receiverIcon"
                                  :host-id="hostId"
                                  :guest-id="guestId"
                                  :room-id="roomId"
                                  @icon-click="test"
              >
              </vue-chat-firestore>
          </div>
</template>

<script>
    import VueChatFirestore from './components/vue-chat-firestore'

    export default {
        data() {
            return {
                hostId: 1,
                guestId: 2,
                receiverIcon: '',
                roomId: ''
            }
        },

        created() {
            this.roomId = `${this.hostId}_${this.guestId}`
            this.hostId = location.search ? 2: 1
            this.guestId = location.search ? 1: 2
            this.receiverIcon = location.search ? 'images/host.jpg' : 'images/guest.jpg'
        },

        methods: {
            test(fire) {
                console.log(fire)
            }
        },

        components: {
            VueChatFirestore
        }
    }

</script>

<style>
    .demo {
        /*height: 667px;*/
        /*width: 375px;*/
        background: #8b9a7a;
        margin: 25px auto 0;
    }
</style>
