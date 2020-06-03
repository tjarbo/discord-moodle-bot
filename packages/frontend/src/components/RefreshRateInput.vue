<template>
  <div id="refreshRateInput">
    <form class="pure-form pure-form-stacked">
      <h3>Aktualisierungsintervall ändern:</h3>
      <input id="refreshRateInputField" v-model="newRefreshRate"
        placeholder="Neues Intervall in ms" />
      <button class="pure-button" type="button" id="refreshRateInputButton"
        v-on:click="onClick">Update</button>
      <label id="refreshRateInputLabel" v-bind:class="{error}"
        for="refreshRateInputButton">{{ result }}</label>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RefreshRateInput',
  data: () => ({
    newRefreshRate: '', // User input
    result: '', // Result to be displayed
    error: false, // Sets result color to red if true
  }),
  methods: {
    onClick() {
      this.result = '';
      const update = { refreshRate: this.newRefreshRate };
      this.$store.dispatch('refreshRate', update)
        .then((response) => {
          const msg = `Success! (Code ${response.status})`;
          this.error = false;
          this.result = msg;
          // Delete Message after 3 seconds
          setTimeout(() => { this.result = ''; }, 3000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete Message after 3 seconds
          setTimeout(() => { this.result = ''; }, 3000);
        });
    },
  },
};
</script>

<style scoped>
#refreshRateInputButton,
#refreshRateInputLabel,
#refreshRateInputField {
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
