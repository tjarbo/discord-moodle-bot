import { expect } from 'chai';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import Registration from '@/views/Registration.vue';
import AuthenticationLayout from '@/layouts/AuthenticationLayout.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuelidate);
localVue.use(Buefy);
localVue.use(VueRouter);

describe('Registration.view', () => {
  let wrapper = null;
  let getters;
  let actions;
  let store;

  let usernameInput;
  let tokenInput;
  let submitButton;

  beforeEach(() => {
    getters = {
      authGetStatus: () => ({
        fail: false,
      }),
    };

    actions = {
      startAttestation: () => new Promise(() => {}),
      finishAttestation: () => new Promise(() => {}),
    };

    store = new Vuex.Store({
      getters,
      actions,
    });

    wrapper = shallowMount(Registration, { store, localVue });

    usernameInput = wrapper.find('#username');
    tokenInput = wrapper.find('#token');
    submitButton = wrapper.find('#registrationSubmitButton');
  });

  it('should render a form', () => {
    expect(wrapper.find(AuthenticationLayout).exists()).is.true;
  });

  it('should render username input correctly', () => {
    const testUserName = 'testusername';

    expect(usernameInput.element.placeholder).to.be.equal('Wähle Benutzernamen');
    expect(usernameInput.element.type).to.be.equal('text');

    usernameInput.setValue(testUserName);
    expect(wrapper.vm.$data.form.username).to.be.equal(testUserName);
  });

  it('should render token input correctly', () => {
    expect(tokenInput.element.placeholder).not.to.be.equal('');
    expect(tokenInput.element.type).to.be.equal('text');
  });

  it('should change disabled submit button based on username input', async () => {
    const tests = [
      {
        // required
        prepare: () => { },
        expect: true,
      },
      {
        // minLength
        prepare: () => {
          usernameInput.setValue('a'.repeat(7));
        },
        expect: true,
      },
      {
        // maxLength
        prepare: () => {
          usernameInput.setValue('a'.repeat(65));
        },
        expect: true,
      },
      {
        // alphanum
        prepare: () => {
          usernameInput.setValue('test#123');
        },
        expect: true,
      },
      {
        prepare: () => {
          usernameInput.setValue('testuser123');
        },
        expect: false,
      },
    ];

    tokenInput.setValue('109156be-c4fb-41ea-b1b4-efe1671c5836');

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      test.prepare();

      await wrapper.vm.$nextTick();
      expect(submitButton.element.disabled).to.be.equal(test.expect);
    }
  });

  it('should change disabled submit button based on token input', async () => {
    const tests = [
      {
        // required
        prepare: () => { },
        expect: true,
      },
      {
        // minLength
        prepare: () => {
          tokenInput.setValue('a'.repeat(35));
        },
        expect: true,
      },
      {
        // maxLength
        prepare: () => {
          tokenInput.setValue('a'.repeat(37));
        },
        expect: true,
      },
      {
        prepare: () => {
          tokenInput.setValue('a'.repeat(36));
        },
        expect: false,
      },
    ];

    usernameInput.setValue('12345testuser');

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      test.prepare();

      await wrapper.vm.$nextTick();
      expect(submitButton.element.disabled).to.be.equal(test.expect);
    }
  });
});
