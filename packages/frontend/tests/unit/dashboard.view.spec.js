import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Dashboard from '@/views/Dashboard.vue';

describe('Dashboard.view', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(Dashboard);
  });

  it('renders a navbar', () => {
    expect(wrapper.contains('#navbar')).is.true;
  });
});
