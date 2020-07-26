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
      .then(() => this.$router.push('/dashboard'))
      .catch(() => {
        this.$router.push('/');
        notifyFailure('Zugang leider abgelaufen. Bitte erneut anmelden');
      });
  },
};
</script>
