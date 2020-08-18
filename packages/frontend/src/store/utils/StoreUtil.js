export default class StoreUtil {
  /**
   * init the state.
   * @return {Object} default state
   */
  static state(data = null) {
    return {
      data,
      status: {
        pending: false,
        success: false,
        fail: false,
        error: null,
      },
    };
  }
  /**
   * @param {Object} state - the state to update
   * @param {Object,Error} data - data to update with
   * @returns {Object} state after update
   */

  static updateState(state, data = undefined) {
    if (!state) throw new Error('state object is missing');

    if (data === undefined) {
      // PENDING
      return this._mutationPending({ ...state });
    }
    // SUCCESS or FAIL
    return data instanceof Error
      ? this._mutationFail({ ...state }, data)
      : this._mutationSuccess({ ...state }, data);
  }

  /**
   * @param {Object} state - the status to be put in pending state
   * @returns {Object} updated state
   */
  static _mutationPending(state) {
    // state.data = null;
    state.status.pending = true;
    state.status.success = false;
    state.status.fail = false;
    state.status.error = null;
    return state;
  }

  /**
   * @param {Object} state - the status to be put in success state
   * @param {Object,array} - data to update with
   * @returns {Object} updated state
   */
  static _mutationSuccess(state, data) {
    state.data = data instanceof Array ? data : [data];
    state.status.pending = false;
    state.status.success = true;
    state.status.fail = false;
    state.status.error = null;
    return state;
  }

  /**
   * @param {Object} state - the status to be put in success state
   * @param {Object,array} - data to update with
   * @returns {object} updated state
   */
  static _mutationFail(state, data) {
    state.data = null;
    state.status.pending = false;
    state.status.success = false;
    state.status.fail = true;
    state.status.error = data;
    return state;
  }
}
