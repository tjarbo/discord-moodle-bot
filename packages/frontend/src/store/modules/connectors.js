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
  },
  actions: {
    loadConnectors({ commit }) {
      commit('SET_CONNECTORS');
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
  },
  getters: {
    connectorsListGetData: (state) => state.connectors.data,
    connectorsListGetStatus: (state) => state.connectors.status,
  },
};
