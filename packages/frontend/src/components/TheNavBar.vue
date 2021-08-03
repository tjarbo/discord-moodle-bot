<template>
  <b-navbar id="thenavbar" type="is-light">
    <template slot="brand">
      <b-navbar-item>
        <span id="title" class="has-text-weight-bold">Fancy Moodle Discord Bot</span>
      </b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">
        <TheLanguageSwitch></TheLanguageSwitch>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <div class="buttons">
          <a class="button is-primary" @click="onClick">
            <strong>{{ $t('components.theNavBar.logoutButton') }}</strong>
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import TheLanguageSwitch from './TheLanguageSwitch.vue';

export default {
  name: 'TheNavBar',
  components: { TheLanguageSwitch },
  methods: {
    onClick() {
      this.$store.dispatch('logout');
      this.$router.push({ name: 'Login' });
    },
  },
};
</script>
<style scoped>
</style>
