import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Vuex from 'vuex';
import SetCourseNotifications from '@/components/moodle/SetCourseNotifications.vue';
import i18n from '../../../src/i18n';

const localVue = createLocalVue();

localVue.use(Buefy);
localVue.use(Vuex);

describe('SetCourseNotifications.component', () => {
  let wrapper = null;
  let store;
  beforeEach(() => {
    const demoCourses = [];
    for (let index = 0; index < 6; index++) {
      const demoCourse = {
        isActive: true,
        name: `Test${index}`,
        courseId: index,
      };
      demoCourses.push(demoCourse);
    }
    const getters = {
      coursesGetStatus: () => ({
        pending: false,
      }),
      coursesGetData: () => demoCourses,
    };

    const actions = {
      fetchCourseList: () => new Promise(() => {}),
    };
    store = new Vuex.Store({ actions, getters });
    wrapper = mount(SetCourseNotifications, { i18n, store, localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#setcoursenotifications')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal(`${i18n.t('components.setCourseNotifications.panelHeading')}:`);
  });

  it('should render items', async () => {
    const labels = wrapper.findAll('label.panel-block');

    expect(labels.length).to.be.equal(6);
  });
});
