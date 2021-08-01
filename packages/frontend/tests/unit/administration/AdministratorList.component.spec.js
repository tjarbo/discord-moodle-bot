import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';

import Vuex from 'vuex';
import Buefy from 'buefy';
import Vuelidate from 'vuelidate';
import AdministratorList from '@/components/administration/AdministratorList.vue';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(Vuelidate);

describe('AdministratorList.component', () => {
  let wrapper = null;
  let store;

  beforeEach(() => {
    const getters = {
      administratorListGetStatus: () => ({
        pending: false,
      }),
      administratorListGetData: () => ([
        {
          hasDevice: 'true', deletable: false, username: 'test1243', createdAt: new Date().valueOf(),
        },
        {
          hasDevice: 'true', deletable: false, username: 'test5678', createdAt: new Date().valueOf(),
        },
        {
          hasDevice: 'false', deletable: false, username: 'test9012', createdAt: new Date().valueOf(),
        },
      ]),
    };

    const actions = {
      getAdministrators: () => {},
    };

    store = new Vuex.Store({
      getters,
      actions,
    });
    wrapper = mount(AdministratorList, { i18n, store, localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#administratorlist')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal(`${i18n.t('components.administratorList.panelHeading')}:`);
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-primary.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal(i18n.t('components.administratorList.createNewRegistrationTokenButton'));
    expect(submitButton.exists()).to.be.true;
  });

  it('should render administrator list', async () => {
    const adminList = wrapper.findAll('table tbody tr');

    expect(adminList.length).to.be.eq(3);
    await wrapper.vm.$nextTick();
    for (let i = 0; i < adminList.length; i++) {
      const admin = adminList.at(i);
      const values = admin.findAll('td');

      expect(values.length).to.be.eq(4);
      expect(values.at(0).text()).to.be.eq(store.getters.administratorListGetData[i].username);
      const tempDate = new Date(store.getters.administratorListGetData[i].createdAt);
      expect(values.at(1).text()).to.be.eq(tempDate.toLocaleString());
    }
  });
});
