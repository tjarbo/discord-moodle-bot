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
    result: StoreUtil.state(),
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.auth = StoreUtil.updateState(state.auth, payload);
    },

    REFRESH_RATE(state, payload) {
      state.result = StoreUtil.updateState(state.result, payload);
    },

  },
  actions: {

    verifyToken(context) {
      if (!context.getters.isLoggedIn) return Promise.resolve();

      context.commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        api.post('/verify')
          .then(() => {
            context.commit('SET_AUTH', null);
            resolve();
          })
          .catch((err) => {
            api.defaults.headers.common.Authorization = '';
            localStorage.removeItem('token');
            context.commit('SET_AUTH', err);
            reject();
          });
      });
    },

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

    refreshRate(context, update) {
      return new Promise((resolve, reject) => {
        api.put('/settings/refreshRate', update)
          .then((response) => {
            context.commit('REFRESH_RATE', response);
            resolve(response);
          })
          .catch((error) => {
            context.commit('REFRESH_RATE', error);
            reject(error);
          });
      });
    },

    logout(context) {
      context.commit('SET_AUTH', null);
      api.defaults.headers.common.Authorization = '';
      localStorage.removeItem('token');
    },

    courseList() {
      return new Promise((resolve, reject) => {
        api.get('/settings/courses')
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setCourse(_, update) {
      return new Promise((resolve, reject) => {
        api.put(`/settings/courses/${update.courseId}`, { isActive: update.isActive })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
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
