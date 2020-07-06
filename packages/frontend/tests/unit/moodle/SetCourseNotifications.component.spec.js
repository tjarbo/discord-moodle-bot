import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Vuex from 'vuex';
import SetCourseNotifications from '@/components/moodle/SetCourseNotifications.vue';

const localVue = createLocalVue();

localVue.use(Buefy);
localVue.use(Vuex);

describe('SetCourseNotifications.component', () => {
  let wrapper = null;
  let store;
  beforeEach(() => {
    const actions = {
      setCourse: () => new Promise(),
      getCourseList: () => new Promise(() => {}),
    };
    store = new Vuex.Store({ actions });
    wrapper = mount(SetCourseNotifications, { store, localVue });
  });

  it('should render the component', () => {
    expect(wrapper.contains('#setcoursenotifications')).is.true;
  });

  it('should render title', () => {
    const titleObject = wrapper.find('p.panel-heading');
    expect(titleObject.text()).to.be.equal('Kurse mit aktivierten Benachrichtigungen:');
  });

  it('should render items', async () => {
    let labels = wrapper.findAll('label.panel-block');
    expect(labels.length).to.be.equal(0);

    const demoCourses = [];
    for (let index = 0; index < 6; index++) {
      const demoCourse = {
        isActive: true,
        name: `Test${index}`,
        courseId: index,
      };
      demoCourses.push(demoCourse);
    }

    wrapper.vm.$data.courses = demoCourses;
    await wrapper.vm.$nextTick();

    labels = wrapper.findAll('label.panel-block');
    expect(labels.length).to.be.equal(6);
  });
});
