<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { notifyFailure } from './notification';
import i18n from './i18n';

export default {
  name: 'App',
  mounted() {
    this.$store.dispatch('verifyToken')
      .then(() => {
        if (this.$route.name === 'Dashboard') return;

        console.log('App redirects to dashboard');
        this.$router.push({ name: 'Dashboard' });
      })
      .catch(() => {
        if (this.$route.name === 'Login' || this.$route.name === 'Registration') return;

        this.$router.push({ name: 'Login' });
        if (this.$store.getters.isLoggedIn) {
          // print notification only if there was a token before
          notifyFailure(i18n.t('general.notifications.accessExpired'));
        }
      }).catch((err) => console.log('err', err));
  },
};
</script>
