<template>
  <div id="app">
          <vue-chat-firestore apiKey="AIzaSyDVwUkgNwM9jDTuyQgX_pfQRgYi_scMu3s"
                              authDomain="localhost"
                              projectId="tani-match"
                              chat-collection="dev-tani-match-chats"
                              receiver-icon="images/guest.jpg"
          ></vue-chat-firestore>
  </div>
</template>

<script>
    import VueChatFirestore from './components/vue-chat-firestore'

    export default {
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
