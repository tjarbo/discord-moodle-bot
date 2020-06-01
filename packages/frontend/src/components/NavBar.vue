<template>
  <div id="navbar">
    <button type="button" id="buttonLogOut" v-on:click="onClick">LOG-OUT</button>
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
<style scoped>

  #buttonLogOut{
    background-color: #e2001a;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }

</style>
