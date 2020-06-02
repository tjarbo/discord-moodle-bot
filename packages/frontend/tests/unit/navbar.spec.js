import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import NavBar from '@/components/NavBar.vue';

describe('NavBar.component', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(NavBar);
  });

  it('should render a navbar', () => {
    expect(wrapper.contains('#navbar.navbar')).is.true;
  });

  it('should render title correctly', () => {
    const titleObject = wrapper.find('#title');

    // correct title
    expect(titleObject.text()).to.be.equal('Fancy Moodle Discord Bot');

    // left alignment
    // expect(window.getComputedStyle(titleObject.element).float).to.be.equal('left');
  });
});
