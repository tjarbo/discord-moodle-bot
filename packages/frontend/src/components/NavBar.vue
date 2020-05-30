<template>
  <div id="navbar">
    <button type="button" id="button" v-on:click="onClick">LOG OUT</button>


  </div>
</template>

<script>
export default {
  name: 'NavBar',
  methods: {
    onClick() {
      this.$store.dispatch('logout');
    },
  },
};
</script>
