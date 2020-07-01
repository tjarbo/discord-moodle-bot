import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import SetDiscordChannel from '@/components/bots/SetDiscordChannel.vue';

const localVue = createLocalVue();

localVue.use(Buefy);

describe('SetDiscordChannel.component', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(SetDiscordChannel, { localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#setdiscordchannel')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal('Discord');
  });

  it('should render channel-input', async () => {
    const useridInput = wrapper.find('#channelinput');
    const testUserId = '000000000000000001';

    // correct attributes
    expect(useridInput.element.placeholder).to.be.equal('Neue Channel-ID');
    expect(useridInput.element.type).to.be.equal('number');

    // changes are in sync with local store
    useridInput.setValue(testUserId);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$data.channelId).to.be.equal(testUserId);
  });

  it('should render submit button', () => {
    const submitButton = wrapper.find('button.button.is-discord.is-outlined.is-fullwidth');

    expect(submitButton.text()).to.be.equal('Aktualisieren');
    expect(submitButton.exists()).to.be.true;
  });
});
