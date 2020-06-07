<template>
  <div id="addAdministrator">
    <form class="pure-form pure-form-stacked" @submit="onSubmit">
      <h3>Administrator hinzufügen</h3>
        <span
          v-if="administratorGetStatus.fail"
        >{{administratorsGetError}}</span>
      <fieldset>
        <label for="discord-username">Discord-Name</label>
        <input
          id="discord-username"
          placeholder="username#00000"
          type="text"
          v-model="userName"
          :disabled="administratorGetStatus.pending" />
        <label for="discord-id">Discord-ID</label>
        <input
          id="discord-id"
          placeholder="123123..."
          type="number"
          v-model="userId"
          :disabled="administratorGetStatus.pending"
        />
        <button type="submit" class="pure-button">Hinzufügen</button>
      </fieldset>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AddAdministrator',
  data: () => ({
    userId: '',
    userName: '',
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();
      const administrator = {
        userid: this.userId,
        username: this.userName,
      };
      this.$store.dispatch('addAdministrator', administrator)
        .then(() => {
          this.userId = '';
          this.userName = '';
        })
        .catch();
    },
  },
  computed: {
    ...mapGetters(['administratorsGetError', 'administratorGetStatus']),
  },
};
</script>

<style scoped>
#addAdministrator {
  margin: 10px;
}

span {
  color: red;
}
</style>
