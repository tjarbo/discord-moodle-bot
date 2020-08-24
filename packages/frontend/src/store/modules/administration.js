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
  },
  actions: {
    addAdministrator({ commit }, administratorObject) {
      commit('SET_ADMINISTRATORS');
      return new Promise((resolve, reject) => {
        ApiUtil.post('/settings/administrator', administratorObject)
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
    administratorGetStatus: (state) => state.administrators.status,
  },
};
