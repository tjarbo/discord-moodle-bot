/* eslint-disable import/first */
import Vue from 'vue';
import Vuex from 'vuex';
import ApiUtil from './utils/ApiUtil';
import StoreUtil from './utils/StoreUtil';

import administrationModule from './modules/administration';
import connectorsModule from './modules/connectors';
import moodleModule from './modules/moodle';
import statusModule from './modules/status';

Vue.use(Vuex);

const token = localStorage.getItem('token');
if (token) ApiUtil.defaults.headers.common.Authorization = `Bearer ${token}`;

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

    verifyToken(context) {
      // if (!context.getters.isLoggedIn) return Promise.resolve();

      context.commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/verify')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              context.commit('SET_AUTH', token);
              resolve();
            } else {
              context.commit('SET_AUTH', apiResponse.error[0].message);
              context.dispatch('logout');
              reject();
            }
          })
          .catch((err) => {
            context.commit('SET_AUTH', err);
            context.dispatch('logout');
            reject();
          });
      });
    },

    startAttestation({ commit }, formData) {
      commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/webauthn/register', { params: formData })
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_AUTH', null);
              resolve(apiResponse.data);
            } else {
              commit('SET_AUTH', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit('SET_AUTH', new Error());
            reject();
          });
      });
    },

    finishAttestation({ commit }, payload) {
      commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/webauthn/register', payload)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              const jwt = apiResponse.data.accesstoken;
              ApiUtil.defaults.headers.common.Authorization = `Bearer ${jwt}`;
              localStorage.setItem('token', jwt);
              commit('SET_AUTH', jwt);
              resolve();
            } else {
              commit('SET_AUTH', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit('SET_AUTH', new Error());
            reject();
          });
      });
    },

    startAssertion({ commit }, username) {
      commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/webauthn/login', { params: { username } })
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_AUTH', null);
              resolve(apiResponse.data);
            } else {
              commit('SET_AUTH', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit('SET_AUTH', new Error());
            reject();
          });
      });
    },

    finishAssertion({ commit }, payload) {
      commit('SET_AUTH');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/webauthn/login', payload)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              const jwt = apiResponse.data.accesstoken;
              ApiUtil.defaults.headers.common.Authorization = `Bearer ${jwt}`;
              localStorage.setItem('token', jwt);
              commit('SET_AUTH', jwt);
              resolve();
            } else {
              commit('SET_AUTH', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit('SET_AUTH', new Error());
            reject();
          });
      });
    },

    logout(context) {
      context.commit('SET_AUTH', null);
      ApiUtil.defaults.headers.common.Authorization = '';
      localStorage.removeItem('token');
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.auth.data,
    authGetStatus: (state) => state.auth.status,
  },
  modules: {
    administration: administrationModule,
    connectors: connectorsModule,
    moodle: moodleModule,
    status: statusModule,
  },
});
