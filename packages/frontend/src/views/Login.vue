<template>
  <div id="loginview">
    <form class="pure-form pure-form-stacked" @submit="onSubmit">
      <fieldset>
        <legend>Login - Fancy-Moodle-Discord-Bot</legend>
        <span class="warning-text">{{form.errorText}}</span>
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
        <button
          class="pure-button pure-button-primary"
          type="submit"
        >
        {{form.submitButtonText}}
        </button>
      </fieldset>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data: () => ({
    form: {
      errorText: '',
      token: '',
      username: '',
      submitButtonText: 'Token anfordern',
    },
    tokenInputDisabled: true,
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();
      // request token in first case
      if (this.tokenInputDisabled) {
        this.$store.dispatch('requestToken', this.form.username)
          .then(() => {
            // token request was successful
            this.form.errorText = '';
            this.form.submitButtonText = 'Anmelden';
            this.tokenInputDisabled = false;
          })
          .catch((err) => {
            // token request failed
            console.log(err);
            this.form.errorText = err;
            this.form.submitButtonText = 'Token anfordern';
            this.tokenInputDisabled = true;
          });
      // login with token in the other case
      } else {
        // create object with login credentials
        const credentials = {
          username: this.form.username,
          token: this.form.token,
        };
        this.$store.dispatch('loginWithToken', credentials)
          .then(() => {
            // login was successful
            this.form.errorText = '';
            this.form.submitButtonText = 'Token anfordern';
            this.tokenInputDisabled = true;
            this.$router.push('dashboard');
          })
          .catch((err) => {
            // login failed
            console.log(err);
            this.form.errorText = err;
            this.form.submitButtonText = 'Anmelden';
            this.tokenInputDisabled = false;
          });
      }
    },
  },
};
</script>

<style scoped>
.warning-text {
  color: rgb(202, 60, 60);;
}
</style>
