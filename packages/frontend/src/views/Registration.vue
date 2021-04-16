<template>
  <div id="registrationview">
    <authentication-layout
      @submit="onSubmit"
      title="Fancy Moodle Discord Bot"
      subtitle="Registriere dich an, um fortzufahren!"
      switchViewText="Du bist bereits registriert?"
      switchViewLink="/login"
    >
      <b-loading
        :is-full-page="false"
        :active="false"
      ></b-loading>
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
    },
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
        alphaNum,
        minLength: minLength(36),
        maxLength: maxLength(36),
      },
    },
  },
};
</script>

<style>
</style>
