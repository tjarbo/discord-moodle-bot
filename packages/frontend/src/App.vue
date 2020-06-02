<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log('Hi');
    this.$store.dispatch('verifyToken')
      .then(() => this.$router.push('/dashboard'))
      .catch(() => this.$router.push('/'));
  },
};
</script>
