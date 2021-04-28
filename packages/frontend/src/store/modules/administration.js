import ApiUtil from '../utils/ApiUtil';
import StoreUtil from '../utils/StoreUtil';

export default {
  state: {
    administrators: StoreUtil.state(),
  },
  mutations: {
    SET_ADMINISTRATORS(state, payload) {
      state.administrators = StoreUtil.updateState(state.administrators, payload);
    },
    UNLOCK_ADMINISTRATORS(state, payload) {
      state.administrators = StoreUtil.unlockState(state.administrators, payload);
    },
    LOCK_ADMINISTRATORS(state) {
      state.administrators = StoreUtil.unlockState(state.administrators);
    },
  },
  actions: {
    requestToken({ commit }) {
      commit('LOCK_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/settings/administrators')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('UNLOCK_ADMINISTRATORS', true);
              resolve(apiResponse);
            } else {
              commit('SET_ADMINISTRATORS', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_ADMINISTRATORS', err);
            reject(err);
          });
      });
    },
    deleteAdministrator({ commit }, username) {
      commit('LOCK_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.delete(`/settings/administrators/${username}`)
          .then(({ status, data: apiResponse }) => {
            /**
             * Axios doesn't pass the response body of a successful
             * delete operation.
             */
            if (status === 204 || apiResponse.status === 'success') {
              commit('UNLOCK_ADMINISTRATORS', true);
              resolve();
            } else {
              // Do not use SET_ADMINISTRATORS to avoid empty table
              commit('UNLOCK_ADMINISTRATORS', false);
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_ADMINISTRATORS', err);
            reject();
          });
      });
    },
    getAdministrators({ commit }) {
      commit('LOCK_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/administrators')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_ADMINISTRATORS', apiResponse.data);
              resolve();
            } else {
              commit('SET_ADMINISTRATORS', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_ADMINISTRATORS', err);
            reject();
          });
      });
    },
  },
  getters: {
    administratorListGetData: (state) => state.administrators.data,
    administratorListGetStatus: (state) => state.administrators.status,
  },
};
