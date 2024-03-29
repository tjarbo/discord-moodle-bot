import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';
import DiscordPanel from '@/components/discord/DiscordPanel.vue';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(Vuelidate);

describe('DiscordPanel.component', () => {
  let wrapper = null;
  let store;

  beforeEach(() => {
    const getters = {
      channelGetStatus: () => ({
        pending: false,
      }),
    };

    store = new Vuex.Store({
      getters,
    });

    wrapper = mount(DiscordPanel, { i18n, localVue, store });
  });

  it.skip('should render the component', () => {
    expect(wrapper.contains('#discordpanel')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal('Discord');
  });

  it('should render channel-input', async () => {
    const channelInput = wrapper.find('#channelinput');
    const testChannel = '000000000000000001';

    // correct attributes
    expect(channelInput.element.placeholder).to.be.equal(i18n.t('components.discordPanel.newChannelIdPlaceholder'));
    expect(channelInput.element.type).to.be.equal('text');

    // changes are in sync with local store
    channelInput.setValue(testChannel);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.channelId).to.be.equal(testChannel);
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-discord.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal(i18n.t('general.update'));
    expect(submitButton.exists()).to.be.true;
    expect(submitButton.element.disabled).to.be.true;
  });

  it('should disable submit button based on input using right validators', async () => {
    const submitButton = wrapper.find('button.button.is-discord.is-outlined.is-fullwidth');
    const channelInput = wrapper.find('#channelinput');

    expect(submitButton.element.disabled).to.be.true;
    const reset = async () => {
      // enter valid input
      channelInput.setValue('000000000000000001');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$v.$invalid).to.be.false;
    };

    const setChannel = async (nbr) => {
      channelInput.setValue(nbr);
      await wrapper.vm.$nextTick();
    };

    // valid
    await reset();

    // test validations.newRefreshRate.required
    await setChannel('');
    expect(wrapper.vm.$v.$invalid).to.be.true;

    await reset();

    // test validations.newRefreshRate.numeric
    await setChannel('123asd');
    expect(wrapper.vm.$v.$invalid).to.be.true;
  });
});
