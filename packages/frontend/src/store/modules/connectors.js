import ApiUtil from '../utils/ApiUtil';
import StoreUtil from '../utils/StoreUtil';

export default {
  state: {
    connectors: StoreUtil.state(),
  },
  mutations: {
    SET_CONNECTORS(state, payload) {
      state.connectors = StoreUtil.updateState(state.connectors, payload);
    },
    LOCK_CONNECTORS(state) {
      state.connectors = StoreUtil.lockState(state.connectors);
    },
    UNLOCK_CONNECTORS(state) {
      state.connectors = StoreUtil.unlockState(state.connectors);
    },
  },
  actions: {
    loadConnectors({ commit }) {
      commit('LOCK_CONNECTORS');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/connectors')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_CONNECTORS', apiResponse.data);
              resolve();
            } else {
              commit('SET_CONNECTORS', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_CONNECTORS', err);
            reject();
          });
      });
    },

    updateConnector({ commit, dispatch }, payload) {
      commit('LOCK_CONNECTORS');
      return new Promise((resolve, reject) => {
        ApiUtil.patch(`/connectors/${payload.id}`, payload.body)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              resolve();
              dispatch('loadConnectors');
            } else {
              reject(apiResponse);
              commit('UNLOCK_CONNECTORS');
            }
          })
          .catch((err) => {
            console.log(err);
            commit('UNLOCK_CONNECTORS');
            reject();
          });
      });
    },

    deleteConnector({ commit, dispatch }, id) {
      commit('LOCK_CONNECTORS');
      return new Promise((resolve, reject) => {
        ApiUtil.delete(`/connectors/${id}`)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              resolve();
              dispatch('loadConnectors');
            } else {
              reject(apiResponse);
              commit('UNLOCK_CONNECTORS');
            }
          })
          .catch((err) => {
            console.log(err);
            commit('UNLOCK_CONNECTORS');
            reject();
          });
      });
    },
  },
  getters: {
    connectorsListGetData: (state) => state.connectors.data,
    connectorsListGetStatus: (state) => state.connectors.status,
  },
};
