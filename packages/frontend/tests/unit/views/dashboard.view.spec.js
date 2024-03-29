import { expect } from 'chai';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Buefy from 'buefy';
import Dashboard from '@/views/Dashboard.vue';

import SetCourseNotifications from '@/components/moodle/SetCourseNotifications.vue';
import ConnectorList from '@/components/connectors/ConnectorList.vue';
import SetRefreshRate from '@/components/moodle/SetRefreshRate.vue';
import TheNavBar from '@/components/TheNavBar.vue';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('Dashboard.view', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = shallowMount(Dashboard, { i18n, localVue });
  });

  it('should render TheNavBar', () => {
    expect(wrapper.find(TheNavBar).exists()).is.true;
  });

  it('should render SetRefreshRate', () => {
    expect(wrapper.find(SetRefreshRate).exists()).is.true;
  });

  it('should render ConnectorList', () => {
    expect(wrapper.find(ConnectorList).exists()).is.true;
  });

  it('should render SetCourseNotifications', () => {
    expect(wrapper.find(SetCourseNotifications).exists()).is.true;
  });

  it('should render column with css: is-10 is-offset-1', () => {
    expect(wrapper.find('.column.is-10.is-offset-1').exists()).to.be.true;
  });
});
