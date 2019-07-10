<template>
  <div id="app">
          <vue-chat-firestore></vue-chat-firestore>
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
