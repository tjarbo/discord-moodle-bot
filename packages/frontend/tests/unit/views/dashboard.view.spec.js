import { expect } from 'chai';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Buefy from 'buefy';
import Dashboard from '@/views/Dashboard.vue';

import AddAdministrator from '@/components/administration/AddAdministrator.vue';
import SetCourseNotifications from '@/components/moodle/SetCourseNotifications.vue';
import SetDiscordChannel from '@/components/bots/SetDiscordChannel.vue';
import SetRefreshRate from '@/components/moodle/SetRefreshRate.vue';
import TheNavBar from '@/components/TheNavBar.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('Dashboard.view', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = shallowMount(Dashboard, { localVue });
  });

  it('should render TheNavBar', () => {
    expect(wrapper.find(TheNavBar).exists()).is.true;
  });

  it('should render SetRefreshRate', () => {
    expect(wrapper.find(SetRefreshRate).exists()).is.true;
  });

  it('should render SetDiscordChannel', () => {
    expect(wrapper.find(SetDiscordChannel).exists()).is.true;
  });

  it('should render SetCourseNotifications', () => {
    expect(wrapper.find(SetCourseNotifications).exists()).is.true;
  });

  it('should render AddAdministrator', () => {
    expect(wrapper.find(AddAdministrator).exists()).is.true;
  });

  it('should render column with css: is-10 is-offset-1', () => {
    expect(wrapper.find('.column.is-10.is-offset-1').exists()).to.be.true;
  });
});
