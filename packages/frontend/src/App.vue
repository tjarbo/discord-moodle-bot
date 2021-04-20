<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { notifyFailure } from './notification';

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
          notifyFailure('Zugang leider abgelaufen! Bitte erneut anmelden!');
        }
      }).catch((err) => console.log('err', err));
  },
};
</script>
