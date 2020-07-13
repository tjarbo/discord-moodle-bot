import { expect } from 'chai';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Buefy from 'buefy';
import Login from '@/views/Login.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

describe('Login.view', () => {
  let wrapper = null;
  let getters;
  let actions;
  let store;

  beforeEach(() => {
    getters = {
      authGetError: () => null,
      authGetStatus: () => ({
        fail: false,
      }),
    };

    actions = {
      verifyToken: () => new Promise(() => {}),
    };

    store = new Vuex.Store({
      getters,
      actions,
    });

    wrapper = mount(Login, { store, localVue });
  });

  it('should render a form', () => {
    expect(wrapper.contains('form')).is.true;
  });

  it('should render username input correctly', () => {
    const usernameInput = wrapper.find('#discordusername');
    const testUserName = 'testusername';

    expect(usernameInput.element.placeholder).to.be.equal('username#0000');
    expect(usernameInput.element.type).to.be.equal('text');

    usernameInput.setValue(testUserName);
    expect(wrapper.vm.$data.form.username).to.be.equal(testUserName);
  });

  it('should render token input correctly', () => {
    const tokenInput = wrapper.find('#token');
    const testToken = '123123';

    expect(tokenInput.element.placeholder).to.be.equal('Dein Token');
    expect(tokenInput.element.type).to.be.equal('password');

    expect(tokenInput.element.disabled).to.be.true;

    tokenInput.element.disabled = false;
    tokenInput.setValue(testToken);
    expect(wrapper.vm.$data.form.token).to.be.equal(testToken);
  });

  it('should change disabled attribute for token input', async () => {
    const tokenInput = wrapper.find('#token');

    wrapper.vm.$set(wrapper.vm, 'tokenInputDisabled', false);
    await wrapper.vm.$nextTick();

    expect(tokenInput.element.disabled).to.be.false;
  });
});
