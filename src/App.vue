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
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
