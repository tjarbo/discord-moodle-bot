import { expect } from 'chai';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Buefy from 'buefy';
import Vuelidate from 'vuelidate';
import Login from '@/views/Login.vue';
import AuthenticationLayout from '@/layouts/AuthenticationLayout.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuelidate);
localVue.use(Buefy);

describe('Login.view', () => {
  let wrapper = null;
  let getters;
  let actions;
  let store;

  let usernameInput;
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

    wrapper = shallowMount(Login, { store, localVue });

    usernameInput = wrapper.find('#username');
    submitButton = wrapper.find('#loginSubmitButton');
  });

  it('should render a form', () => {
    expect(wrapper.find(AuthenticationLayout).exists()).is.true;
  });

  it('should render username input correctly', () => {
    const testUserName = 'testusername';

    expect(usernameInput.element.placeholder).to.be.equal('Dein Benutzername');
    expect(usernameInput.element.type).to.be.equal('text');

    usernameInput.setValue(testUserName);
    expect(wrapper.vm.$data.form.username).to.be.equal(testUserName);
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

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      test.prepare();

      await wrapper.vm.$nextTick();
      expect(submitButton.element.disabled).to.equal(test.expect);
    }
  });
});
