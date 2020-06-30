<template>
  <div id="setdiscordchannel">
    <article class="panel is-discord">
      <p class="panel-heading is-discord">Discord</p>
      <a class="panel-block">
        <p class="control">
          <b-field label="Discord Channel ändern:">
            <b-input
              id="channelinput"
              v-model="newDiscordChannel"
              placeholder="Neue Channel-ID"
            ></b-input>
          </b-field>
        </p>
      </a>
      <p class="panel-block" v-if="result != ''" :class="{error}">
        <span>{{result}}</span>
      </p>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-discord is-outlined is-fullwidth"
        >Aktualisieren</button>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'SetDiscordChannel',
  data: () => ({
    newDiscordChannel: '', // User input
    result: '', // Displays result message if set
    error: false, // Sets result message color to red if true
  }),
  methods: {
    onSubmit() {
      this.result = '';
      const update = { channelId: this.newDiscordChannel };
      this.$store
        .dispatch('setDiscordChannel', update)
        .then((response) => {
          const msg = `Aktualisierung erfolgreich! (Code ${response.status})`;
          this.error = false;
          this.result = msg;
          // Delete result message after 3 seconds
          setTimeout(() => {
            this.result = '';
          }, 3000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete result message after 3 seconds
          setTimeout(() => {
            this.result = '';
          }, 3000);
        });
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}
label {
  color: green;
}
</style>
