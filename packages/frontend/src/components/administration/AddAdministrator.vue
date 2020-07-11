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
      <p class="panel-block" v-if="administratorGetStatus.fail">
        <span>{{administratorsGetError}}</span>
      </p>
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
import { required, helpers, numeric } from 'vuelidate/lib/validators';

const usernameRegex = helpers.regex('usernameRegex', /[\w\s]+#[0-9]{4}/);

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
        });
    },
  },
  computed: {
    ...mapGetters(['administratorsGetError', 'administratorGetStatus']),
  },
  validations: {
    userid: {
      required,
      numeric,
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
