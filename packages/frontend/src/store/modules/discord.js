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
    setDiscordChannel(_, update) {
      return new Promise((resolve, reject) => {
        ApiUtil.put('/settings/discordChannel', update)
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

  },
};
