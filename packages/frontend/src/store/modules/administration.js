import ApiUtil from '../utils/ApiUtil';
import StoreUtil from '../utils/StoreUtil';

export default {
  state: {
    newAdministrator: StoreUtil.state(),
    administrators: StoreUtil.state(),
  },
  mutations: {
    SET_ADMINISTRATOR(state, payload) {
      state.newAdministrator = StoreUtil.updateState(state.newAdministrator, payload);
    },
    GET_ADMINISTRATORS(state, payload) {
      state.administrators = StoreUtil.updateState(state.administrators, payload);
    },
  },
  actions: {
    addAdministrator({ commit }, administratorObject) {
      commit('SET_ADMINISTRATOR');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/settings/administrator', administratorObject)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_ADMINISTRATOR', apiResponse.data);
              resolve();
            } else {
              commit('SET_ADMINISTRATOR', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_ADMINISTRATOR', err);
            reject();
          });
      });
    },
    deleteAdministrator({ commit }, administratorId) {
      commit('SET_ADMINISTRATOR');
      return new Promise((resolve, reject) => {
        ApiUtil.delete(`/settings/administrator/${administratorId}`)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_ADMINISTRATOR', apiResponse.data);
              resolve();
            } else {
              commit('SET_ADMINISTRATOR', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_ADMINISTRATOR', err);
            reject();
          });
      });
    },
    getAdministrators({ commit }) {
      commit('GET_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/administrator')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('GET_ADMINISTRATORS', apiResponse.data);
              resolve();
            } else {
              commit('GET_ADMINISTRATORS', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('GET_ADMINISTRATORS', err);
            reject();
          });
      });
    },
  },
  getters: {
    administratorGetStatus: (state) => state.newAdministrator.status,
    administratorListGetData: (state) => state.administrators.data,
    administratorListGetStatus: (state) => state.administrators.status,
  },
};
