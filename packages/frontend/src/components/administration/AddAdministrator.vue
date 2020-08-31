<template>
  <div id="addadministrator">
    <article class="panel is-primary">
      <p class="panel-heading">Administrator hinzufügen</p>
      <a class="panel-block">
        <p class="control">
          <b-field label="Discord-Name">
            <b-input
              id="discordusername"
              placeholder="username#0000"
              type="text"
              v-model="username"
              :disabled="administratorGetStatus.pending"
            ></b-input>
          </b-field>
        </p>
      </a>
      <a class="panel-block">
        <p class="control">
          <b-field label="Discord-ID">
            <b-input
              id="discorduserid"
              placeholder="000000000000000000"
              type="text"
              v-model="userid"
              :disabled="administratorGetStatus.pending"
            ></b-input>
          </b-field>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-primary is-outlined is-fullwidth"
          :disabled="$v.$invalid"
        >Hinzufügen</button>
      </div>
      <b-loading :is-full-page="false" :active="administratorGetStatus.pending"></b-loading>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, helpers } from 'vuelidate/lib/validators';
import { notifySuccess, notifyFailure } from '../../notification';

const usernameRegex = helpers.regex('usernameRegex', /^[\w\s]+#\d{4}$/);
const userIdRegex = helpers.regex('usernameRegex', /^\d{18}$/);

export default {
  name: 'AddAdministrator',
  data: () => ({
    userid: '',
    username: '',
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();
      const administrator = {
        userid: this.userid,
        username: this.username,
      };
      this.$store
        .dispatch('addAdministrator', administrator)
        .then(() => {
          this.userid = '';
          this.username = '';
          // Refresh administrator list
          this.$store.dispatch('getAdministrators');
          notifySuccess('Administrator erfolgreich hinzugefügt!');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure('Zugang leider abgelaufen! Bitte melde dich erneut an!');
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
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
    ...mapGetters(['administratorGetStatus']),
  },
  validations: {
    userid: {
      required,
      userIdRegex,
    },
    username: {
      required,
      usernameRegex,
    },
  },
};
</script>

<style scoped>
#addAdministrator {
  margin: 10px;
}

span {
  color: red;
}
</style>
