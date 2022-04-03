import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    filled: false,
    logged: false,
    user: undefined,
    token: undefined,
  },
  mutations: {
    setLogged(state, user) {
      state.logged = true
      state.user = user
    },
    setTokens(state, tokens) {
      state.token = tokens.accessToken
    },
    logout(state) {
      state.logged = false
      state.user = undefined
      state.token = undefined
    },
    initialiseStore(state) {
      // Check if the ID exists
      if (localStorage.getItem('store')) {
          // Replace the state object with the stored item
          this.replaceState(
              Object.assign(state, JSON.parse(localStorage.getItem('store')))
          );
      }
    }
  },
  actions: {
  },
  modules: {
  }
})

store.subscribe((_mutation, state) => {
	// Store the state object as a JSON string
	localStorage.setItem('store', JSON.stringify(state));
});
