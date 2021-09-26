<template>
  <div class="has-text-left">
    <b-field
      :type="errorDescription !== '' ? 'is-danger' : ''"
      :message="errorDescription">
      <b-input
        id="username"
        type="text"
        size="is-large"
        v-model="$v.username.$model"
        @input="onInput"
        :placeholder="$t('components.usernameInputField.placeholder')"
      >
      </b-input>
    </b-field>
  </div>
</template>

<script>
import {
  required, alphaNum, minLength, maxLength, or, helpers,
} from 'vuelidate/lib/validators';

const discordUsername = helpers.regex('discordusername', /^[\w\s]{3,32}#[0-9]{4}$/);

export default {
  name: 'UsernameInputField',
  computed: {
    errorDescription() {
      if (!this.$v.$dirty) return '';
      let result;

      switch (false) {
        case this.$v.username.required:
          result = this.$t('general.validationErrors.required');
          break;

        case this.$v.username.minLength:
          result = this.$t('general.validationErrors.minLength', [8]);
          break;

        case this.$v.username.maxLength:
          result = this.$t('general.validationErrors.maxLength', [32]);
          break;

        case this.$v.username.or:
          result = this.$t('components.usernameInputField.validationErrors.alphaNumOrDiscord');
          break;

        default:
          break;
      }

      return result;
    },
  },
  data: () => ({
    username: '',
  }),
  methods: {
    onInput() {
      this.$emit('input', this.username, this.$v.$invalid);
    },
  },
  validations: {
    username: {
      required,
      or: or(alphaNum, discordUsername),
      minLength: minLength(8),
      maxLength: maxLength(64),
    },
  },
};
</script>

<style>

</style>
