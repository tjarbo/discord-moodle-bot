<template>
  <div id="loginview">
    <authentication-layout
      title="Fancy Moodle Discord Bot"
      switchViewLink="/registration"
      @submit="onSubmit"
      :subtitle="$t('views.login.subtitle')"
      :switchViewText="$t('views.login.switchViewText')"
    >
      <b-loading
        :is-full-page="false"
        :active="authGetStatus.pending"
      ></b-loading>

      <username-input-field class="mb-3" @input="onInput"/>

      <div class="field">
        <div class="control">
          <button
            id="loginSubmitButton"
            class="button is-block is-primary is-large is-fullwidth is-marginless"
            :disabled="this.form.invalid"
          >
            {{ $t('views.login.loginSubmitButton') }}
          </button>
        </div>
      </div>
    </authentication-layout>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import { startAssertion } from '@simplewebauthn/browser';
import { notifyFailure, notifySuccess } from '../notification';
import AuthenticationLayout from '../layouts/AuthenticationLayout.vue';
import UsernameInputField from '../components/UsernameInputField.vue';

export default {
  name: 'LoginView',
  components: { AuthenticationLayout, UsernameInputField },
  computed: {
    ...mapGetters(['authGetStatus']),
  },
  data: () => ({
    form: {
      username: '',
      isInvalid: true,
    },
    loading: true,
  }),
  methods: {
    onInput(username, isInvalid) {
      this.form.username = username;
      this.form.isInvalid = isInvalid;
    },
    onSubmit(event) {
      event.preventDefault();

      // Request assertion options from server
      this.$store.dispatch('startAssertion', this.form.username)
        .then(async (assertionOptions) => {
          try {
            // Pass the assertion options to the authenticator and wait for a response
            // User will use an authenticator and will generate a response
            const assertionResponse = await startAssertion(assertionOptions);

            // Verify response from authenticator
            this.verifyAssertion(this.form, assertionResponse);
          } catch (error) {
            // Handle error during challenge solving process
            console.log(error);
            switch (error.name) {
              case 'AbortError':
                // Login process timed out or cancelled
                notifyFailure(this.$t('views.login.notifications.abortError'));
                break;

              default:
                notifyFailure(this.$t('views.login.notifications.defaultError'));
                break;
            }
          }
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);

          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(this.$t('general.notifications.requestFailedLocally'));
        });
    },

    verifyAssertion(formData, assertionResponse) {
      this.$store.dispatch('finishAssertion', { username: formData.username, assertionResponse })
        .then(() => {
          // login was successful and jwt was received; redirect to dashboard
          this.$router.push('dashboard');
          notifySuccess(this.$t('views.login.notifications.loginSuccess'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              this.$t('general.notifications.requestFailedLocally'),
            );
          }
        });
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
