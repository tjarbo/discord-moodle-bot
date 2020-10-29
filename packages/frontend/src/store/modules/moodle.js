import StoreUtil from '../utils/StoreUtil';
import ApiUtil from '../utils/ApiUtil';

export default {
  state: {
    refreshRate: StoreUtil.state(),
    courses: StoreUtil.state(),
    fetch: StoreUtil.state(),
  },
  mutations: {
    SET_REFRESH_RATE(state, payload) {
      state.refreshRate = StoreUtil.updateState(state.refreshRate, payload);
    },
    SET_COURSES(state, payload) {
      state.courses = StoreUtil.updateState(state.courses, payload);
    },

    SET_FETCH(state, payload) {
      state.fetch = StoreUtil.updateState(state.fetch, payload);
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
            console.error(err);
            commit('SET_REFRESH_RATE', err);
            reject();
          });
      });
    },

    fetchCourseList({ commit }) {
      commit('SET_COURSES');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/settings/courses')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_COURSES', apiResponse.data);
              resolve();
            } else {
              commit('SET_COURSES', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.error(err);
            commit('SET_COURSES', err);
            reject();
          });
      });
    },

    setCourse({ commit }, update) {
      commit('SET_COURSES');
      return new Promise((resolve, reject) => {
        ApiUtil.put(`/settings/courses/${update.courseId}`, { isActive: update.isActive })
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_COURSES', apiResponse.data);
              resolve();
            } else {
              commit('SET_COURSES', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.error(err);
            commit('SET_COURSES', err);
            reject();
          });
      });
    },

    triggerFetch({ commit }) {
      commit('SET_FETCH');
      return new Promise((resolve, reject) => {
        ApiUtil.get('/fetch')
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === 'success') {
              commit('SET_FETCH', null);
              resolve();
            } else {
              commit('SET_FETCH', new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch((err) => {
            console.error(err);
            commit('SET_FETCH', err);
            reject();
          });
      });
    },
  },
  getters: {
    fetchGetStatus: (state) => state.fetch.status,
    refreshRateGetStatus: (state) => state.refreshRate.status,
    coursesGetStatus: (state) => state.courses.status,
    coursesGetData: (state) => state.courses.data,
  },
};
