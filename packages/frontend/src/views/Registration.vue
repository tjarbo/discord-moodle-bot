<template>
  <div id="registrationview">
    <authentication-layout
      @submit="onSubmit"
      title="Fancy Moodle Discord Bot"
      switchViewLink="/login"
      :subtitle="$t('views.registration.subtitle')"
      :switchViewText="$t('views.registration.switchViewText')"
    >
      <b-loading :is-full-page="false" :active="authGetStatus.pending"></b-loading>

      <username-input-field class="mb-3"></username-input-field>

      <div class="field">
        <div class="control">
          <input
            id="token"
            class="input is-large"
            placeholder="109156be-c4fb-41ea-b1b4-efe1671c5836"
            type="text"
            v-model="form.token"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button
            id="registrationSubmitButton"
            class="button is-block is-primary is-large is-fullwidth is-marginless"
            :disabled="this.$v.$invalid || this.isInvalid"
          >
            {{ $t('views.registration.registrationSubmitButton') }}
          </button>
        </div>
      </div>
    </authentication-layout>
  </div>
</template>

<script>
import {
  required, minLength, maxLength,
} from 'vuelidate/lib/validators';
import { startAttestation } from '@simplewebauthn/browser';
import { mapGetters } from 'vuex';
import { validate } from 'uuid';
import { notifyFailure, notifySuccess } from '../notification';
import AuthenticationLayout from '../layouts/AuthenticationLayout.vue';
import UsernameInputField from '../components/UsernameInputField.vue';

export default {
  name: 'RegistrationView',
  components: { AuthenticationLayout, UsernameInputField },
  data: () => ({
    form: {
      username: '',
      token: '',
    },
    isInvalid: false,
  }),
  mounted() {
    // Check if token parameter is available
    if (!this.$route.query.token) return;

    // Validate token
    const { token } = this.$route.query;
    if (!validate(token)) return;

    this.form.token = token;
  },
  methods: {

    onUsernameInput(username, isInvalid) {
      this.form.username = username;
      this.isInvalid = isInvalid;
    },

    onSubmit(event) {
      event.preventDefault();

      // Request attestation options from server
      this.$store.dispatch('startAttestation', this.form)
        .then(async (attestationOptions) => {
          try {
            // Pass the attestation options to the authenticator and wait for a response
            // User will use an authenticator and will generate a response
            const attestationResponse = await startAttestation(attestationOptions);

            // Verify response from authenticator
            this.verifyAttestation(this.form, attestationResponse);
          } catch (error) {
            // Handle error during challenge solving process
            switch (error.name) {
              case 'AbortError':
                // Registration process timed out or cancelled
                notifyFailure(this.$t('views.registration.notifications.abortError'));
                break;

              case 'InvalidStateError':
                // Authenticator is maybe already used for this
                notifyFailure(this.$t('views.registration.notifications.invalidStateError'));
                break;

              default:
                notifyFailure(this.$t('views.registration.notifications.defaultError'));
                break;
            }
          }
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

    verifyAttestation(formData, attestationResponse) {
      const payload = { username: formData.username, token: formData.token, attestationResponse };
      this.$store.dispatch('finishAttestation', payload)
        .then(() => {
          // registration was successful and jwt was received; redirect to dashboard
          this.$router.push('dashboard');
          notifySuccess(this.$t('views.registration.notifications.registrationSuccess'));
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
  computed: {
    ...mapGetters(['authGetStatus']),
  },
  validations: {
    form: {
      token: {
        required,
        minLength: minLength(36),
        maxLength: maxLength(36),
      },
    },
  },
};
</script>

<style scoped>
</style>
