<template>
  <div id="discordChannelInput">
    <form class="pure-form pure-form-stacked">
      <h3>Discord Channel ändern:</h3>
      <input id="discordChannelInputField" v-model="newDiscordChannel"
        placeholder="Neue Channel-ID" />
      <button type="button" class="pure-button" id="discordChannelInputButton"
        v-on:click="onClick">Aktualisieren</button>
      <label id="discordChannelInputLabel" v-bind:class="{error}"
        for="discordChannelInputButton">{{ result }}</label>
    </form>
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
          // Delete result message after 3 seconds
          setTimeout(() => { this.result = ''; }, 3000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete result message after 3 seconds
          setTimeout(() => { this.result = ''; }, 3000);
        });
    },
  },
};
</script>

<style scoped>
#discordChannelInputButton,
#discordChannelInputLabel,
#discordChannelInputField {
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
