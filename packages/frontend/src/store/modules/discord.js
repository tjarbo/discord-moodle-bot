import StoreUtil from '../utils/StoreUtil';
import ApiUtil from '../utils/ApiUtil';

export default {
  state: {
    channel: StoreUtil.state(),
  },
  mutations: {
    SET_CHANNEL(state, payload) {
      state.channel = StoreUtil.updateState(state.channel, payload);
    },
  },
  actions: {
    setDiscordChannel({ commit }, update) {
      commit('SET_CHANNEL');
      return new Promise((resolve, reject) => {
        ApiUtil.put('/settings/discordChannel', update)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_CHANNEL', apiResponse.data);
              resolve();
            } else {
              commit('SET_CHANNEL', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_CHANNEL', err);
            reject();
          });
      });
    },
  },
  getters: {
    channelGetStatus: (state) => state.channel.status,
  },
};
