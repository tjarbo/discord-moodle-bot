/* eslint consistent-return: 0 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import StartLoading from '../views/StartLoading.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: StartLoading,
  },
  {
    path: '/login',
    name: 'Login',
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
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) return next();

  if (store.getters.isLoggedIn) {
    next();
  } else {
    next('/login');
  }
});

export default router;
