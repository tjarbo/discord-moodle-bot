<template>
  <div id="setrefreshrate">
    <article class="panel is-moodle">
      <p class="panel-heading">Aktualisierungsintervall ändern:</p>
       <a class="panel-block">
        <p class="control">
          <b-field label="Neues Intervall in ms:">
            <b-input
              id="refreshrateinput"
              max="3147483647"
              min="5000"
              placeholder="15000"
              type="number"
              v-model="newRefreshRate"
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
          class="button is-moodle is-outlined is-fullwidth"
        >
        Aktualisieren
        </button>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'SetRefreshRate',
  data: () => ({
    newRefreshRate: '', // User input
    result: '', // Result to be displayed
    error: false, // Sets result color to red if true
  }),
  methods: {
    onSubmit() {
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
.error {
    color: red;
}
label {
    color: green;
}
</style>
