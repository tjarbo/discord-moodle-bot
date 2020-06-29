<template>
  <div id="addAdministrator">
    <article class="panel is-primary">
      <p class="panel-heading">Administrator hinzufügen</p>
      <a class="panel-block">
        <p class="control">
        <b-field label="Discord-Name">
          <b-input
            id="discord-username"
            placeholder="username#00000"
            type="text"
            v-model="userName"
            :disabled="administratorGetStatus.pending"
          ></b-input>
        </b-field>
        </p>
      </a>
      <a class="panel-block">
        <p class="control">
          <b-field label="Discord-ID">
            <b-input
              id="discord-id"
              placeholder="123123..."
              type="number"
              v-model="userId"
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
          class="button is-link is-outlined is-fullwidth"
        >Hinzufügen</button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AddAdministrator',
  data: () => ({
    userId: '',
    userName: '',
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();
      const administrator = {
        userid: this.userId,
        username: this.userName,
      };
      this.$store
        .dispatch('addAdministrator', administrator)
        .then(() => {
          this.userId = '';
          this.userName = '';
        })
        .catch();
    },
  },
  computed: {
    ...mapGetters(['administratorsGetError', 'administratorGetStatus']),
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
