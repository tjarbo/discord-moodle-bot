<template>
  <div id="discordChannelInput">
    <h3>Discord Channel ändern:</h3>
    <input id="input" v-model="newDiscordChannel" placeholder="Neue Channel-ID" />
    <button type="button" id="button" v-on:click="onClick">Aktualisieren</button>
    <label id="label" v-bind:class="{error}" for="button">{{ result }}</label>
  </div>
</template>

<script>
export default {
  name: 'DiscordChannelInput',
  data: () => ({
    newDiscordChannel: '', // User input
    result: '', // Displays result message if set
    error: false, // Sets result message color to red if true
  }),
  methods: {
    onClick() {
      this.result = '';
      const update = { channelId: this.newDiscordChannel };
      this.$store.dispatch('setDiscordChannel', update)
        .then((response) => {
          const msg = `Aktualisierung erfolgreich! (Code ${response.status})`;
          this.error = false;
          this.result = msg;
          // Delete result message after 2 seconds
          setTimeout(() => { this.result = ''; }, 2000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete result message after 2 seconds
          setTimeout(() => { this.result = ''; }, 2000);
        });
    },
  },
};
</script>

<style scoped>
#button,
#label,
#input {
    margin: 10px;
}
.error {
    color: red;
}
label {
    color: green;
}
h3 {
    margin-bottom: 0px;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
