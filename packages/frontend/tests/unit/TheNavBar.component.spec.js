import { expect } from 'chai';
import { mount, createLocalVue } from '@vue/test-utils';
import Buefy from 'buefy';
import NavBar from '@/components/TheNavBar.vue';
import i18n from '../../src/i18n';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('TheNavBar.component', () => {
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(NavBar, { i18n, localVue });
  });

  it('should render a navbar', () => {
    expect(wrapper.contains('#thenavbar')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('#title.has-text-weight-bold');

    // correct title with correct css
    expect(titleObject.text()).to.be.equal('Fancy Moodle Discord Bot');
  });

  it('should render logout button', () => {
    const logoutButton = wrapper.find('a.button.is-primary');

    // correct text with correct css
    expect(logoutButton.text()).to.be.equal('Logout');
  });
});
