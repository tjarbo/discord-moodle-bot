<template>
  <div id="navbar" class="navbar">
    <div id="title">Fancy Moodle Discord Bot</div>
    <a type="button" id="buttonLogOut" @click="onClick">Abmelden</a>
  </div>
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

.navbar {
  overflow: hidden;
  background-color: #4e5f67;
  font-family: Arial, Helvetica, sans-serif;
}

#title {
  float: left;
  font-size: 16px;
  color: white;
  text-align: center;
  padding: 16px 30px;
  text-decoration: none;
}

.navbar a {
  float: right;
  font-size: 16px;
  color: white;
  text-align: center;
  padding: 16px 30px;
  text-decoration: none;
}

.navbar a:hover, .dropdown:hover .dropbtn {
  background-color: #e2001a;
  color: white;
}


</style>
