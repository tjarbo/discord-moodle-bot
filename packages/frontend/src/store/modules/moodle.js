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
          .then((response) => {
            commit('SET_REFRESH_RATE', response.data.data);
            resolve(response);
          })
          .catch((error) => {
            commit('SET_REFRESH_RATE', error.response.error);
            reject(error);
          });
      });
    },

    fetchCourseList({ commit }) {
      commit('SET_COURSES');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/courses')
          .then((response) => {
            commit('SET_COURSES', response.data.data);
            resolve();
          })
          .catch((error) => {
            commit('SET_COURSES', error.response.data.error);
            reject(error);
          });
      });
    },

    setCourse(_, update) {
      return new Promise((resolve, reject) => {
        ApiUtil.put(`/settings/courses/${update.courseId}`, { isActive: update.isActive })
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
    refreshRateGetError: (state) => state.refreshRate.status.error.response.data.message,
    refreshRateGetStatus: (state) => state.refreshRate.status,
  },
};
