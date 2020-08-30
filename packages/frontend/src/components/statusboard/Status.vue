<template>
  <div id="statusboard">
    <article class="panel is-status">
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
      <p class="panel-heading">Status:</p>
      <a class="panel-block">
        <p class="control">
          {{test}}
          <b-table :data="rows">
            <template v-slot="{row}" >
              <b-table-column v-for="(column, index) in columns" :key="index"
              :label="column.label" v-bind:class="classObject(row, column.field)">
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
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import { required, numeric, between } from 'vuelidate/lib/validators';
import { /* notifySuccess, */ notifyFailure } from '../../notification';

export default {
  name: 'Status',
  mounted() {
  // Import status object at loading time
    this.$store
      .dispatch('getStatus')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) {
          notifyFailure(apiResponse.error[0].message);
        } else {
        // Request failed locally - maybe no internet connection etc?
          notifyFailure(
            'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
          );
        }
      });
  },
  data: () => ({
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
    classObject(row, property) {
      return { error: row[property] === 'Unknown' };
    },
    getFormattedTime(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(ms / (1000 * 60));
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      if (ms === 1) return `${ms} Millisekunde`;
      if (ms < 1000) return `${ms} Millisekunden`;
      if (seconds === 1) return `${seconds} Sekunde`;
      if (seconds < 60) return `${seconds} Sekunden`;
      if (minutes === 1) return `${minutes} Minute`;
      if (minutes < 60) return `${minutes} Minuten`;
      if (hours === 1) return `${hours} Stunde`;
      if (hours < 24) return `${hours} Stunden`;
      if (days === 1) return `${days} Tag`;
      return `${days} Tage`;
    },
    getCurrentTimeDifference(timestamp) {
      const nowTimeStamp = new Date().getTime();
      const milliSecondsDiff = Math.abs(nowTimeStamp - timestamp);
      return this.getFormattedTime(milliSecondsDiff);
    },
  },
  computed: {
    rows() {
      if (this.statusBoardGetStatus.pending) { return []; }
      const data = this.statusBoardGetData[0];
      const moodleLastFetchTimestamp = new Date(data.moodleLastFetchTimestamp * 1000)
        .toLocaleString();
      const discordLastReadyTimestamp = new Date(data.discordLastReadyTimestamp).toLocaleString();
      const moodleCurrentFetchInterval = `Alle ${this.getFormattedTime(data.moodleCurrentFetchInterval)}`;
      return [
        { setting: 'Moodle Verbindung funktioniert', value: data.moodleConnectionStatus },
        { setting: 'Letzte Moodle Aktualisierung', value: moodleLastFetchTimestamp },
        { setting: 'Aktuelles Fetch-Intervall', value: moodleCurrentFetchInterval },
        { setting: 'Letzte aktive Discord Verbindung', value: discordLastReadyTimestamp },
        { setting: 'Aktuelle Discord Channel-ID', value: data.discordCurrentChannelId },
        { setting: 'Aktuelle Uhrzeit', value: new Date().toLocaleString() },
      ];
    },
    test() { return this.count ? `Refresh Button ${this.count}x gedrückt` : ''; },
    ...mapGetters(['statusBoardGetStatus', 'statusBoardGetData']),
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
