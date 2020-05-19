<template>
  <div id="loginview">
    <form class="pure-form pure-form-stacked" @submit="submit">
      <fieldset>
        <legend>Login - Fancy-Moodle-Discord-Bot</legend>
        <label for="discordusername">Discord Username</label>
        <input
          id="discordusername"
          placeholder="username#0000"
          type="text"
          v-model="form.username"
        />

        <label for="token">Zugangstoken</label>
        <input
          id="token"
          placeholder="Token"
          type="password"
          v-model="form.token"
          :disabled="tokenInputDisabled"
        />
        <button type="submit" class="pure-button pure-button-primary">{{submitButtonText}}</button>
      </fieldset>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data: () => ({
    form: {
      username: '',
      token: '',
    },
    submitButtonText: 'Token anfordern',
    tokenInputDisabled: true,
  }),
  methods: {
    submit() {
      if (this.tokenInputDisabled) {
        this.$store.dispatch('requestToken', this.form.username)
          .then(() => { this.tokenInputDisabled = false; })
          .catch((err) => {
            console.log(err);
            alert(`${err}`);
            this.tokenInputDisabled = true;
          });
      } else {
        const creds = {
          username: this.form.username,
          tokenKey: this.form.token,
        };
        this.$store.dispatch('loginWithToken', creds)
          .then(() => {
            alert('successfully logged in!');
          })
          .catch((err) => {
            console.log(err);
            alert(`${err}`);
            this.tokenInputDisabled = true;
          });
      }
    },
  },
};
</script>

<style>
</style>
