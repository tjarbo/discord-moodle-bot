import StoreUtil from '../utils/StoreUtil';
import ApiUtil from '../utils/ApiUtil';

export default {
  state: {
    refreshRate: StoreUtil.state(),
    courses: StoreUtil.state(),
  },
  mutations: {
    SET_REFRESH_RATE(state, payload) {
      state.refreshRate = StoreUtil.updateState(state.refreshRate, payload);
    },
    SET_COURSES(state, payload) {
      state.courses = StoreUtil.updateState(state.courses, payload);
    },
  },
  actions: {
    refreshRate({ commit }, update) {
      commit('SET_REFRESH_RATE');
      return new Promise((resolve, reject) => {
        ApiUtil.put('/settings/refreshRate', update)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_REFRESH_RATE', apiResponse.data);
              resolve(apiResponse);
            } else {
              commit('SET_REFRESH_RATE', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.log(err);
            commit('SET_REFRESH_RATE', err);
            reject();
          });
      });
    },

    fetchCourseList({ commit }) {
      commit('SET_COURSES');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/courses')
        // TODO: New handler like in administration.ts
          .then((response) => {
            commit('SET_COURSES', response.data.data);
            resolve();
          })
          .catch((error) => {
            commit('SET_COURSES', error);
            reject(error);
          });
      });
    },

    setCourse(_, update) {
      return new Promise((resolve, reject) => {
        ApiUtil.put(`/settings/courses/${update.courseId}`, { isActive: update.isActive })
        // TODO: New handler like in administration.ts
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
    refreshRateGetStatus: (state) => state.refreshRate.status,
  },
};
