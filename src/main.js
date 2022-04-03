import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import {store} from './store'
import VueDraggable from 'vue-draggable'
import GAuth from 'vue-google-oauth2'
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin)


const gauthOption = {
  clientId: '816455274220-vgemp9ar4ctms1uicp63tsp17mp1e2up.apps.googleusercontent.com',
  scope: 'profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly',
  prompt: 'select_account',
  access_type: 'offline'
}
Vue.use(GAuth, gauthOption)
Vue.use(VueDraggable)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
