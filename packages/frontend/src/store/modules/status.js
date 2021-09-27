import ApiUtil from '../utils/ApiUtil';
import StoreUtil from '../utils/StoreUtil';

export default {
  state: {
    statusBoard: StoreUtil.state(),
  },
  mutations: {
    SET_STATUSBOARD(state, payload) {
      state.statusBoard = StoreUtil.updateState(state.statusBoard, payload);
    },
  },
  actions: {
    getStatus({ commit }) {
      commit('SET_STATUSBOARD');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/status')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_STATUSBOARD', apiResponse.data);
              resolve();
            } else {
              commit('SET_STATUSBOARD', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_STATUSBOARD', err);
            reject();
          });
      });
    },
  },
  getters: {
    statusBoardGetData: (state) => state.statusBoard.data,
    statusBoardGetStatus: (state) => state.statusBoard.status,
  },
};
