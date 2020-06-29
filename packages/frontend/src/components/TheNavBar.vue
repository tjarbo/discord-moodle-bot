<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item has-text-weight-bold">
        <img src="../assets/FMDB_logo.png" height="auto">
      </div>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button is-primary" @click="onClick">
              <strong>Logout</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
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
