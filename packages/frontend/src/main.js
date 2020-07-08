import Vue from 'vue';
import Axios from 'axios';
import Buefy from 'buefy';
import Vuelidate from 'vuelidate';
import App from './App.vue';
import router from './router';
import store from './store';

import './fmdb.scss';

Vue.use(Vuelidate);
Vue.use(Buefy);

Vue.prototype.$http = Axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
