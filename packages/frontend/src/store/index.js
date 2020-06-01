import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import StoreUtil from './utils/StoreUtil';

Vue.use(Vuex);

const URL = 'http://localhost:4040/api';

const api = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = localStorage.getItem('token');
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

export default new Vuex.Store({
  state: {
    auth: StoreUtil.state(token || null),
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
        api.post('/token', { username })
          .then(() => {
            context.commit('SET_AUTH', null);
            resolve();
          })
          .catch((err) => {
            context.commit('SET_AUTH', err);
            reject();
          });
      });
    },

    loginWithToken(context, creds) {
      context.commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        api.post('/login', creds)
          .then((data) => {
            const jwt = data.data.accesstoken;
            api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
            localStorage.setItem('token', jwt);
            context.commit('SET_AUTH', jwt);
            resolve();
          })
          .catch((err) => {
            context.commit('SET_AUTH', err);
            reject();
          });
      });
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.auth.data,
    authGetError: (state) => state.auth.status.error.response.data.message,
    authGetStatus: (state) => state.auth.status,
  },
});
