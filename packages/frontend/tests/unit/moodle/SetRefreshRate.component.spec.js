import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';
import SetRefreshRate from '@/components/moodle/SetRefreshRate.vue';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(Vuelidate);

describe('SetRefreshRate.component', () => {
  let wrapper = null;
  let store;

  beforeEach(() => {
    const getters = {
      refreshRateGetStatus: () => ({
        pending: false,
      }),
    };

    store = new Vuex.Store({
      getters,
    });

    wrapper = mount(SetRefreshRate, { i18n, localVue, store });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#setrefreshrate')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal(`${i18n.t('components.setRefreshRate.panelHeading')}:`);
  });

  it('should render refresh-rate-input', async () => {
    const refreshRateInput = wrapper.find('#refreshrateinput');
    const testRefreshRate = '123123';

    // correct attributes
    expect(refreshRateInput.element.placeholder).to.be.equal('15000');
    expect(refreshRateInput.element.type).to.be.equal('text');

    // changes are in sync with local store
    refreshRateInput.setValue(testRefreshRate);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.newRefreshRate).to.be.equal(testRefreshRate);
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-moodle.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal(i18n.t('general.update'));
    expect(submitButton.exists()).to.be.true;
    expect(submitButton.element.disabled).to.be.true;
  });

  it('should disable submit button based on input using right validators', async () => {
    const submitButton = wrapper.find('button.button.is-moodle.is-outlined.is-fullwidth');
    const refreshRateInput = wrapper.find('#refreshrateinput');
    const testRefreshRate = '123123';

    expect(submitButton.element.disabled).to.be.true;
    const reset = async () => {
      // enter valid input
      refreshRateInput.setValue(testRefreshRate);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$v.$invalid).to.be.false;
    };

    const setRefreshRate = async (nbr) => {
      refreshRateInput.setValue(nbr);
      await wrapper.vm.$nextTick();
    };

    // valid
    await reset();

    // test validations.newRefreshRate.required
    await setRefreshRate('');
    expect(wrapper.vm.$v.$invalid).to.be.true;

    await reset();

    // test validations.newRefreshRate.numeric
    await setRefreshRate('123asd');
    expect(wrapper.vm.$v.$invalid).to.be.true;

    await reset();

    // test validations.newRefreshRate.between.lower
    await setRefreshRate('4999');
    expect(wrapper.vm.$v.$invalid).to.be.true;

    await reset();

    // test validations.newRefreshRate.between.upper
    await setRefreshRate('2678400001');
    expect(wrapper.vm.$v.$invalid).to.be.true;
  });
});
