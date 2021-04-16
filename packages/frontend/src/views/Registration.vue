<template>
  <div id="registrationview">
    <authentication-layout
      @submit="onSubmit"
      title="Fancy Moodle Discord Bot"
      subtitle="Registriere dich an, um fortzufahren!"
      switchViewText="Du bist bereits registriert?"
      switchViewLink="/login"
    >
      <b-loading :is-full-page="false" :active="authGetStatus.pending"></b-loading>

      <div class="field">
        <div class="control">
          <input
            autofocus
            class="input is-large"
            id="discordusername"
            placeholder="Choose username"
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
            placeholder="109156be-c4fb-41ea-b1b4-efe1671c5836"
            type="text"
            v-model="form.token"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button
            class="button is-block is-primary is-large is-fullwidth is-marginless"
            :disabled="$v.$invalid"
          >
            Registrieren
          </button>
        </div>
      </div>
    </authentication-layout>
  </div>
</template>

<script>
import {
  required, minLength, maxLength, alphaNum,
} from 'vuelidate/lib/validators';
import { startAttestation } from '@simplewebauthn/browser';
import { mapGetters } from 'vuex';
import { notifyFailure, notifySuccess } from '../notification';
import AuthenticationLayout from '../Layouts/AuthenticationLayout.vue';

export default {
  name: 'RegistrationView',
  components: { AuthenticationLayout },
  data: () => ({
    form: {
      username: '',
      token: '',
    },
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();

      // Request attestation options from sever
      this.$store.dispatch('startAttestation', this.form)
        .then(async (attestationOptions) => {
          try {
            // Pass the attestation options to the authenticator and wait for a response
            // User will use an authenticator and will generate a response
            const attestationResponse = await startAttestation(attestationOptions);

            // Verify response from authenticator
            this.verifyAttestation(this.form, attestationResponse);
          } catch (error) {
            // Handle error during challange solving process
            switch (error.name) {
              case 'AbortError':
                // Registration proccess timed out or cancled
                notifyFailure('Registrierung wurde abgebrochen!');
                break;

              case 'InvalidStateError':
                // Authenticator is maybe already used for this
                notifyFailure('Authenticator wurde wahrscheinlich bereits von dir registriert!');
                break;

              default:
                notifyFailure('Fehler! Bitte versuche es erneut!');
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
              'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
            );
          }
        });
    },

    verifyAttestation(formData, attestationResponse) {
      this.$store.dispatch('finishAttestation', { username: formData.username, token: formData.token, attestationResponse })
        .then(() => {
          // registration was successful and jwt was received; redirect to dashboard
          this.$router.push('dashboard');
          notifySuccess('Anmeldung war erfolgreich!');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
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
      token: {
        required,
        minLength: minLength(36),
        maxLength: maxLength(36),
      },
    },
  },
};
</script>

<style>
</style>