import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import store from '../store';
import addAdmin from '../components/inputs.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Anmeldung',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/AddAdmin',
    mame: 'AddAdmin',
    component: addAdmin,
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) next();

  if (store.getters.isLoggedIn) {
    next();
  } else {
    next('/');
  }
});

export default router;
