<template>
  <div>
    <h2>Admin hinzufügen:</h2>

    <form>
      <label>Username: </label>
      <input type="text" v-model="userName" required/><br><br>
      <lable>User-ID: </lable>
      <input type="text" v-model="userId" required/>
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
  data() {
    return {
      userName: '',
      userId: '',
    };
  },
};
</script>

<style scoped>

</style>
