import Vue from 'vue'
import App from './App.vue'
import '@babel/polyfill'
import '@fortawesome/fontawesome'
import '@fortawesome/fontawesome-free-brands'
import '@fortawesome/fontawesome-free-solid'
import '@fortawesome/fontawesome-free-regular'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
