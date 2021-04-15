<template>
  <div id="loginview">
    <authentication-layout
      @submit="onSubmit"
      title="Fancy Moodle Discord Bot"
      subtitle="Melde dich an, um fortzufahren!"
      switchViewText="Du hast einen Token bekommen?"
      switchViewLink="/registration"
    >
      <b-loading
        :is-full-page="false"
        :active="authGetStatus.pending"
      ></b-loading>
      <div class="field">
        <div class="control">
          <input
            autofocus
            class="input is-large"
            id="discordusername"
            placeholder="username#0000"
            type="text"
            v-model="form.username"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <input
            class="input is-large"
            id="token"
            placeholder="Dein Token"
            type="password"
            v-model="form.token"
            :disabled="tokenInputDisabled"
          />
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button
            class="button is-block is-primary is-large is-fullwidth is-marginless"
            :disabled="$v.$invalid"
          >
            {{ form.submitButtonText }}
          </button>
        </div>
      </div>
    </authentication-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, helpers } from 'vuelidate/lib/validators';
import { notifyFailure, notifySuccess } from '../notification';
import AuthenticationLayout from '../Layouts/AuthenticationLayout.vue';

const usernameRegex = helpers.regex('usernameRegex', /^[\w\s]{2,32}#\d{4}$/);

export default {
  name: 'LoginView',
  components: { AuthenticationLayout },
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
        this.$store
          .dispatch('requestToken', this.form.username)
          .then(() => {
            // token request was successful
            this.tokenInputDisabled = false;
            this.form.submitButtonText = 'Anmelden';

            notifySuccess('Token wurde erfolgreich versendet!');
          })
          .catch((apiResponse) => {
            // token request failed
            this.tokenInputDisabled = true;
            this.form.submitButtonText = 'Token anfordern';

            if (apiResponse.code) {
              notifyFailure(apiResponse.error[0].message);
            } else {
              // request failed locally - maybe no internet connection etc?
              notifyFailure(
                'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
              );
            }
          });

        // login with token in the other case
      } else {
        // create object with login credentials
        const credentials = {
          username: this.form.username,
          token: this.form.token,
        };
        this.$store
          .dispatch('loginWithToken', credentials)
          .then(() => {
            // login was successful
            this.tokenInputDisabled = true;
            this.$router.push('dashboard');

            notifySuccess('Anmeldung war erfolgreich!');
          })
          .catch((apiResponse) => {
            // login failed
            this.tokenInputDisabled = false;

            if (!apiResponse.code) {
              // request failed locally - maybe no internet connection etc?
              notifyFailure(
                'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
              );
            } else {
              notifyFailure(apiResponse.error[0].message);
            }
          });
      }
    },
  },
  computed: {
    ...mapGetters(['authGetStatus']),
  },
  validations: {
    form: {
      username: {
        required,
        usernameRegex,
      },
    },
  },
};
</script>

<style scoped>
.logo {
  width: 300px;
}

#loginview {
  text-align: center;
}
</style>
