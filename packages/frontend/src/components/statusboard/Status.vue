<template>
  <div id="statusboard">
    <article class="panel is-status">
      <p class="panel-heading">Status:</p>
      <a class="panel-block">
        <p class="control">
          {{test}}
          <b-table :data="rows">
            <template v-slot="{row}" >
              <b-table-column v-for="(column, index) in columns" :key="index"
              :label="column.label" v-bind:class="classObject(row[column.field])">
              {{ row[column.field] }}
              </b-table-column>
            </template>
          </b-table>
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
  name: 'Status',
  data: () => ({
    rows: [
      { setting: 'Moodle Verbindung funktioniert', value: 'Ja' },
      { setting: 'Letzte Moodle Aktualisierung', value: 'Vor 32 Minuten (28.08.2020 12:50:34)' },
      { setting: 'Aktuelles Fetch-Intervall', value: 'Alle 10 Minuten' },
      { setting: 'Letzte aktive Discord Verbindung', value: 'Vor 23 Minuten (28.08.2020 12:50:34)' },
      { setting: 'Aktuelle Discord Channel-ID', value: '12345678912345' },
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
    classObject(cellValue) {
      return { error: cellValue === 'Error' };
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
