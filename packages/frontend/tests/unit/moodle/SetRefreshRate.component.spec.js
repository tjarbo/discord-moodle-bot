import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import SetRefreshRate from '@/components/moodle/SetRefreshRate.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('SetRefreshRate.component', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(SetRefreshRate, { localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#setrefreshrate')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal('Aktualisierungsintervall ändern:');
  });

  it('should render refresh-rate-input', async () => {
    const refreshRateInput = wrapper.find('#refreshrateinput');
    const testRefreshRate = '123123';

    // correct attributes
    expect(refreshRateInput.element.placeholder).to.be.equal('15000');
    expect(refreshRateInput.element.type).to.be.equal('number');

    // changes are in sync with local store
    refreshRateInput.setValue(testRefreshRate);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.newRefreshRate).to.be.equal(testRefreshRate);
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-moodle.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal('Aktualisieren');
    expect(submitButton.exists()).to.be.true;
  });
});
