<template>
  <div>
    <h2>Admin hinzufügen:</h2>

    <form>
      <label>Username: </label>
      <input type="text" v-model="userName" required/><br><br>
      <lable>User-ID: </lable>
      <input type="text" v-model="userId" required/><br><br>
      <button type="button" id="button" v-on:click="onPress">Add Admin</button>
    </form>

    <br>

    <h3>Preview</h3>
    <p>Username: {{ userName }}</p>
    <p>User-ID: {{ userId }}</p>

  </div>
</template>

<script>
export default {
  name: 'addAdmin',

  methods: {
    onPress(event) {
      event.preventDefault();

      const administrator = {
        userId: this.userId,
        userName: this.userName,
      };

      this.$store.dispatch('addAdministrator', administrator);

      return {
        userName: '',
        userId: '',
      };
    },
  },
};
</script>

<style scoped>

</style>
