<template>
  <div id="statusboard">
    <article class="panel is-status">
      <p class="panel-heading">Status:</p>
      <a class="panel-block">
        <p class="control">
          {{test}}
          <b-table :data="rows" :columns="columns"></b-table>
        </p>
      </a>
      <div class="panel-block">
        <button @click="onSubmit"
        class="button is-outlined is-fullwidth is-status">Aktualisieren</button>
      </div>
      <b-loading :is-full-page="false"></b-loading>
      <!-- :active="statusBoardGetStatus.pending" -->
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import { required, numeric, between } from 'vuelidate/lib/validators';
// import { notifySuccess, notifyFailure } from '../../notification';

export default {
  name: 'StatusBoard',
  data: () => ({
    rows: [
      { setting: 'Letzte Moodle Aktualisierung', value: '28.08.2020 12:50:34' },
      { setting: 'Moodle Token funktioniert', value: 'Ja' },
      { setting: 'Discordverbindung erfolgreich', value: 'Ja' },
      { setting: 'Datenbankverbindung erfolgreich', value: 'Nein' },
    ],
    columns: [
      {
        field: 'setting',
        label: 'Name',
      },
      {
        field: 'value',
        label: 'Wert',
      },
    ],
    count: 0,
  }),
  methods: {
    onSubmit() {
      this.count += 1;
    },
  },
  computed: {
    test() { return this.count ? `Refresh Button ${this.count}x gedrückt` : ''; },
    ...mapGetters(['statusBoardGetStatus']),
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
