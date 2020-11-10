import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';

import Vuex from 'vuex';
import Buefy from 'buefy';
import Vuelidate from 'vuelidate';
import AdministratorList from '@/components/administration/AdministratorList.vue';

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
          userId: '5f8064fd4968e80f782d6aad', deletable: false, userName: 'test#1243', createdAt: new Date().valueOf(),
        },
        {
          userId: '5f7f44e5558ce5032ded7800', deletable: false, userName: 'test#5678', createdAt: new Date().valueOf(),
        },
        {
          userId: '5f7f5e02e70f35055e7c9650', deletable: false, userName: 'test#9012', createdAt: new Date().valueOf(),
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
    wrapper = mount(AdministratorList, { store, localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#administratorlist')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal('Administratoren:');
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-primary.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal('Entfernen');
    expect(submitButton.exists()).to.be.true;
    expect(submitButton.element.disabled).to.be.true;
  });

  it('should render administrator list', () => {
    const adminList = wrapper.findAll('table tbody tr');

    expect(adminList.length).to.be.eq(3);
    for (let i = 0; i < adminList.length; i++) {
      const admin = adminList.at(i);
      const values = admin.findAll('td');

      expect(values.length).to.be.eq(4);
      expect(values.at(1).text()).to.be.eq(store.getters.administratorListGetData[i].userName);
      expect(values.at(2).text()).to.be.eq(store.getters.administratorListGetData[i].userId);

      const tempDate = new Date(store.getters.administratorListGetData[i].createdAt);
      expect(values.at(3).text()).to.be.eq(tempDate.toLocaleString());
    }
  });
});
