import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Login from '@/views/Login.vue';

describe('Login.view', () => {
  let wrapper = null;

  beforeEach(() => {
    // runs before each test in this block
    wrapper = mount(Login);
  });

  it('renders a form', () => {
    expect(wrapper.contains('form')).is.true;
  });

  it('renders username input correctly', () => {
    const usernameInput = wrapper.find('#discordusername');
    const testUserName = 'testusername';

    expect(usernameInput.element.placeholder).to.be.equal('username#0000');
    expect(usernameInput.element.type).to.be.equal('text');

    usernameInput.setValue(testUserName);
    expect(wrapper.vm.$data.form.username).to.be.equal(testUserName);
  });

  it('renders token input correctly', () => {
    const tokenInput = wrapper.find('#token');
    const testToken = '123123';

    expect(tokenInput.element.placeholder).to.be.equal('Token');
    expect(tokenInput.element.type).to.be.equal('password');

    expect(tokenInput.element.disabled).to.be.true;

    tokenInput.element.disabled = false;
    tokenInput.setValue(testToken);
    expect(wrapper.vm.$data.form.token).to.be.equal(testToken);
  });

  it('changes disabled attribute for token input', async () => {
    const tokenInput = wrapper.find('#token');

    wrapper.vm.$set(wrapper.vm, 'tokenInputDisabled', false);
    await wrapper.vm.$nextTick();

    expect(tokenInput.element.disabled).to.be.false;
  });
});
