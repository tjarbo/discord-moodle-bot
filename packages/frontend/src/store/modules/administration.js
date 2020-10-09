import ApiUtil from '../utils/ApiUtil';
import StoreUtil from '../utils/StoreUtil';

export default {
  state: {
    changeRequest: StoreUtil.state(),
    administrators: StoreUtil.state(),
  },
  mutations: {
    SET_CHANGE_REQUEST(state, payload) {
      state.newAdministrator = StoreUtil.updateState(state.changeRequest, payload);
    },
    SET_ADMINISTRATORS(state, payload) {
      state.administrators = StoreUtil.updateState(state.administrators, payload);
    },
  },
  actions: {
    addAdministrator({ commit }, administratorObject) {
      commit('SET_CHANGE_REQUEST');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/settings/administrator', administratorObject)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_CHANGE_REQUEST', {});
              resolve();
            } else {
              commit('SET_CHANGE_REQUEST', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_CHANGE_REQUEST', err);
            reject(err);
          });
      });
    },
    deleteAdministrator({ commit }, administratorId) {
      commit('SET_CHANGE_REQUEST');
      return new Promise((resolve, reject) => {
        ApiUtil.delete(`/settings/administrator/${administratorId}`)
          .then(({ status, data: apiResponse }) => {
          /**
           * Axios doesn't pass the response body of a successful
           * delete operation.
           */
            if (status === 204 || apiResponse.status === 'success') {
              commit('SET_CHANGE_REQUEST', {});
              console.log('## resolve');
              resolve();
            } else {
              commit('SET_CHANGE_REQUEST', new Error(apiResponse.error[0].message));
              console.log('## reject');
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_CHANGE_REQUEST', err);
            reject();
          });
      });
    },
    getAdministrators({ commit }) {
      commit('SET_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/administrator')
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
    administratorChangeRequestGetStatus: (state) => state.changeRequest.status,
    administratorListGetData: (state) => state.administrators.data,
    administratorListGetStatus: (state) => state.administrators.status,
  },
};
