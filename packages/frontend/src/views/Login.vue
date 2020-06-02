<template>
  <div id="loginview">
    <form class="pure-form pure-form-stacked" @submit="onSubmit">
      <fieldset>
        <img class=logo alt="FMDB logo" src="../assets/FMDB_logo.png">
        <legend id="title">Login - Fancy-Moodle-Discord-Bot</legend>
        <span
          class="warning-text"
          v-if="authGetStatus.fail"
        >{{authGetError}}</span>
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
        <div id="button">
        <button
          class="pure-button pure-button-primary"
          type="submit"
          :disabled="authGetStatus.pending"
        >
        {{form.submitButtonText}}
        </button>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'LoginView',
  data: () => ({
    form: {
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
            this.tokenInputDisabled = false;
            this.form.submitButtonText = 'Anmelden';
          })
          .catch(() => {
            // token request failed
            this.tokenInputDisabled = true;
            this.form.submitButtonText = 'Token anfordern';
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
            this.tokenInputDisabled = true;
            this.$router.push('dashboard');
          })
          .catch(() => {
            // login failed
            this.tokenInputDisabled = false;
          });
      }
    },
  },
  computed: {
    ...mapGetters(['authGetError', 'authGetStatus']),
  },
};
</script>

<style scoped>
.warning-text {
  color: rgb(202, 60, 60);;
}
.logo {
  width: 300px;
}

#loginview {
  text-align: center;
}

input[type=text] {
  text-align: center;
  display: inline-block;
}

input[type=password] {
  text-align: center;
  display: inline-block;
}

label {
  margin-top: 20px;
}

button {
  margin: 20px;
}
legend {
  color: #414141;
}

.warning-text {
  margin: 20px;
  display: block;
  text-decoration: underline;
}

</style>
