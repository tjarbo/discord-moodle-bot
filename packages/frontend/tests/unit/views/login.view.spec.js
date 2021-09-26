import { expect } from 'chai';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Buefy from 'buefy';
import Vuelidate from 'vuelidate';
import Login from '@/views/Login.vue';
import AuthenticationLayout from '@/layouts/AuthenticationLayout.vue';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuelidate);
localVue.use(Buefy);

describe('Login.view', () => {
  let wrapper = null;
  let getters;
  let actions;
  let store;

  let submitButton;

  beforeEach(() => {
    getters = {
      authGetStatus: () => ({
        fail: false,
        pending: false,
      }),
    };

    actions = {
      startAssertion: () => new Promise(() => {}),
      finishAssertion: () => new Promise(() => {}),
    };

    store = new Vuex.Store({
      getters,
      actions,
    });

    wrapper = shallowMount(Login, { i18n, store, localVue });
    submitButton = wrapper.find('#loginSubmitButton');
  });

  it('should render a form', () => {
    expect(wrapper.find(AuthenticationLayout).exists()).is.true;
  });

  it('should disable submit button', async () => {
    wrapper.vm.$data.form.isInvalid = true;
    await wrapper.vm.$nextTick();
    expect(submitButton.element.disabled).to.equal(true);
  });
});
