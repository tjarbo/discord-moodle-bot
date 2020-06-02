<template>
  <div id="refreshRateInput">
    <h3>Aktualisierungsintervall ändern:</h3>
    <input id="input" v-model="newRefreshRate" placeholder="Neues Intervall in ms" />
    <button type="button" id="button" v-on:click="onClick">Update</button>
    <label id="label" v-bind:class="{error}" for="button">{{ result }}</label>
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
          // Delete Message after 2 seconds
          setTimeout(() => { this.result = ''; }, 2000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete Message after 2 seconds
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
