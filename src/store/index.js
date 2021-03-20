import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    users: {}, // Users in the current room
  },
  mutations: {
    setUsers(state, users) {
      state.users = users
    },
    updateUser(state, user) {
      if (!state.users[user.uid]) {
        Vue.set(state.users, user.uid, {media: null, info: null})
      } 

      if (user.hasOwnProperty('_videoTrack')) {
        state.users[user.uid].media = { ...state.users[user.uid].media, ...user }
        //Vue.set(state.users[user.uid], 'media', { ...state.users[user.uid].media, ...user })
      } else {
        state.users[user.uid].info = { ...state.users[user.uid].info, ...user }
        //Vue.set(state.users[user.uid], 'info', { ...state.users[user.uid].info, ...user })
      }
    },
    clearUsers(state) {
      state.users = {}
    },
    removeUser(state, uid) {
      Vue.delete(state.users, uid)
    },
  },
  actions: {
  },
  modules: {
  }
})
