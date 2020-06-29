<template>
  <b-navbar type="is-dark">
    <template slot="brand">
      <b-navbar-item >
        <span class="has-text-weight-bold">Fancy Moodle Discord Bot</span>
      </b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">
        <div class="buttons">
          <a class="button is-primary" @click="onClick">
            <strong>Logout</strong>
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  name: 'NavBar',
  methods: {
    onClick() {
      this.$store.dispatch('logout');
      this.$router.push('/');
    },
  },
};
</script>
<style scoped>
</style>
