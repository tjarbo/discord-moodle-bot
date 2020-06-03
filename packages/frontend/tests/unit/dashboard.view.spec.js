import { expect } from 'chai';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Dashboard from '@/views/Dashboard.vue';

const localVue = createLocalVue();
localVue.use(Vuex);


describe('Dashboard.view', () => {
  let wrapper = null;
  let getters;
  let store;

  beforeEach(() => {
    getters = {
      authGetError: () => null,
      authGetStatus: () => ({
        fail: false,
      }),
      administratorGetStatus: () => ({
        fail: false,
      }),
    };

    store = new Vuex.Store({
      getters,
    });

    wrapper = mount(Dashboard, { store, localVue });
  });

  it('should render a navbar', () => {
    expect(wrapper.contains('#navbar')).is.true;
  });

  it('should render \'Add Administrator\'', () => {
    expect(wrapper.contains('#addadministrator')).is.true;
  });

  it('should render \'set Refreshrate\'', () => {
    expect(wrapper.contains('#refreshRateInput')).is.true;
  });
});
