import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';

import Vuex from 'vuex';
import Buefy from 'buefy';
import AddAdministrator from '@/components/administration/AddAdministrator.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

describe('AddAdministrator.component', () => {
  let wrapper = null;
  let store;
  beforeEach(() => {
    const getters = {
      administratorsGetError: () => null,
      administratorGetStatus: () => ({
        pending: false,
      }),
    };
    store = new Vuex.Store({
      getters,
    });
    wrapper = mount(AddAdministrator, { store, localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#addadministrator')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');

    expect(titleObject.text()).to.be.equal('Administrator hinzufügen');
  });

  it('should render discord-username-input', async () => {
    const usernameInput = wrapper.find('#discordusername');
    const testUserName = 'testusername';

    // correct attributes
    expect(usernameInput.element.placeholder).to.be.equal('username#0000');
    expect(usernameInput.element.type).to.be.equal('text');

    // changes are in sync with local store
    usernameInput.setValue(testUserName);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.username).to.be.equal(testUserName);
  });

  it('should render discord-id-input', async () => {
    const useridInput = wrapper.find('#discorduserid');
    const testUserId = '000000000000000001';

    // correct attributes
    expect(useridInput.element.placeholder).to.be.equal('000000000000000000');
    expect(useridInput.element.type).to.be.equal('number');

    // changes are in sync with local store
    useridInput.setValue(testUserId);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.userid).to.be.equal(testUserId);
  });
});
