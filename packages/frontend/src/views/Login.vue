<template>
  <div id="loginview">
    <authentication-layout
      @submit="onSubmit"
      title="Fancy Moodle Discord Bot"
      switchViewLink="/registration"
      :subtitle="$t('views.login.subtitle')"
      :switchViewText="$t('views.login.switchViewText')"
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
            id="username"
            type="text"
            v-model="form.username"
            :placeholder="$t('views.login.usernamePlaceholder')"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button
            id="loginSubmitButton"
            class="button is-block is-primary is-large is-fullwidth is-marginless"
            :disabled="$v.$invalid"
          >
            {{ $t('views.login.loginSubmitButton') }}
          </button>
        </div>
      </div>
    </authentication-layout>
  </div>
</template>

<script>
import {
  required, alphaNum, minLength, maxLength,
} from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import { startAssertion } from '@simplewebauthn/browser';
import { notifyFailure, notifySuccess } from '../notification';
import AuthenticationLayout from '../layouts/AuthenticationLayout.vue';
import i18n from '../i18n';

export default {
  name: 'LoginView',
  components: { AuthenticationLayout },
  data: () => ({
    form: {
      username: '',
    },
    loading: true,
  }),
  methods: {
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
                notifyFailure(i18n.t('views.login.notifications.abortError'));
                break;

              default:
                notifyFailure(i18n.t('views.login.notifications.defaultError'));
                break;
            }
          }
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);

          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
        });
    },

    verifyAssertion(formData, assertionResponse) {
      this.$store.dispatch('finishAssertion', { username: formData.username, assertionResponse })
        .then(() => {
          // login was successful and jwt was received; redirect to dashboard
          this.$router.push('dashboard');
          notifySuccess(i18n.t('views.login.notifications.loginSuccess'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              i18n.t('general.notifications.requestFailedLocally'),
            );
          }
        });
    },
  },
  computed: {
    ...mapGetters(['authGetStatus']),
  },
  validations: {
    form: {
      username: {
        required,
        alphaNum,
        minLength: minLength(8),
        maxLength: maxLength(64),
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
