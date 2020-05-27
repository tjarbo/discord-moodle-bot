import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import StoreUtil from './utils/StoreUtil';

Vue.use(Vuex);

const URL = 'http://localhost:4040/api';

export default new Vuex.Store({
  state: {
    auth: StoreUtil.state(),
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.auth = StoreUtil.updateState(state.auth, payload);
    },
  },
  actions: {
    requestToken(context, username) {
      context.commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        axios.post(`${URL}/token`, { username })
          .then(() => {
            context.commit('SET_AUTH', undefined);
            resolve({});
          })
          .catch((err) => {
            context.commit('SET_AUTH', err);
            reject(err.response.data.message);
          });
      });
    },

    loginWithToken(context, creds) {
      context.commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        axios.post(`${URL}/login`, creds)
          .then((data) => {
            const jwt = data.data;
            context.commit('SET_AUTH', jwt);
            resolve(jwt);
          })
          .catch((err) => {
            context.commit('SET_AUTH', err);
            reject(err.response.data.message);
          });
      });
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.auth.data,
  },
  modules: {
  },
});
