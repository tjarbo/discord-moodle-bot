<template>
  <div id="statusboard">
    <article class="panel is-status">
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
      <p class="panel-heading">Status:</p>
      <a class="panel-block">
        <p class="control">
          <b-table :data="rows" :hoverable="true">
            <template v-slot="{row}" >
              <b-table-column v-for="(column, index) in columns" :key="index"
              :label="column.label" v-bind:class="classObject(row, column.field)" :width="'50%'">
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
import { notifySuccess, notifyFailure } from '../../notification';

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
        field: 'key',
        label: 'Name',
      },
      {
        field: 'value',
        label: 'Wert',
      },
    ],
    keys: {
      moodleConnectionStatus: 'Status der Moodle Verbindung',
      moodleLastFetch: 'Letzte Moodle Aktualisierung',
      moodleNextFetch: 'Nächste Moodle Aktualisierung',
      moodleCurrentFetchInterval: 'Aktuelles Fetch-Intervall',
      discordLastReady: 'Letzte aktive Discord Verbindung',
      discordCurrentChannelId: 'Aktuelle Discord Channel-ID',
    },
  }),
  methods: {
    onSubmit() {
      // Update data
      this.$store
        .dispatch('getStatus')
        .then(() => {
          notifySuccess(
            'Aktualisierung erfolgreich!',
          );
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure('Zugang leider abgelaufen! Bitte melde dich erneut an!');
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
            );
          }
        });
    },
    classObject(row, property) {
      console.log(row);
      if (row.key === this.keys.moodleConnectionStatus
          && row[property] !== this.keys.moodleConnectionStatus) {
        return { error: row[property] !== 'Ok' };
      }
      if (row.key === this.keys.moodleNextFetch) {
        return { error: row[property] === 'N/A' };
      }
      if (row.key === this.keys.moodleCurrentFetchInterval) {
        return { error: row[property] === 'Error' };
      }
      if (row.key === this.keys.moodleLastFetch
          && row[property] !== this.keys.moodleLastFetch) {
        const { moodleLastFetchTimestamp } = this.statusBoardGetData[0];
        const { moodleCurrentFetchInterval } = this.statusBoardGetData[0];
        const timeToLastFetch = this.getCurrentTimeDifference(moodleLastFetchTimestamp * 1000);
        return { error: timeToLastFetch > moodleCurrentFetchInterval };
      }
      return {};
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
      return milliSecondsDiff;
    },
    getTimeString(timestamp, date) {
      return `${this.getFormattedTime(this.getCurrentTimeDifference(timestamp))} (${date})`;
    },
  },
  computed: {
    rows() {
      // Get data
      const data = this.statusBoardGetData[0];

      // Generate moodleLastFetch string
      const moodleLastFetchDate = new Date(data.moodleLastFetchTimestamp * 1000).toLocaleString();
      const moodleLastFetchString = `Vor ${this.getTimeString(data.moodleLastFetchTimestamp * 1000, moodleLastFetchDate)}`;

      // Initalize strings
      let moodleNextFetchString = 'N/A';
      let moodleCurrentFetchIntervalString = 'Error';

      if (data.moodleCurrentFetchInterval !== 'Error') {
        // Generate moodleNextFetch string
        const moodleNextFetchTimeStamp = (data.moodleLastFetchTimestamp * 1000)
          + data.moodleCurrentFetchInterval;
        const moodleNextFetchDate = new Date(moodleNextFetchTimeStamp).toLocaleString();
        moodleNextFetchString = `In ${this.getTimeString(moodleNextFetchTimeStamp, moodleNextFetchDate)}`;

        // Generate moodleCurrentFetchInterval string
        moodleCurrentFetchIntervalString = `Alle ${this.getFormattedTime(data.moodleCurrentFetchInterval)} (${data.moodleCurrentFetchInterval} ms)`;
      }

      // Generate discordLastReady string
      const discordLastReadyDate = new Date(data.discordLastReadyTimestamp).toLocaleString();
      const discordLastReadyString = `Vor ${this.getTimeString(data.discordLastReadyTimestamp, discordLastReadyDate)}`;

      // Return data array
      return [
        { key: this.keys.moodleConnectionStatus, value: data.moodleConnectionStatus },
        { key: this.keys.moodleLastFetch, value: moodleLastFetchString },
        { key: this.keys.moodleNextFetch, value: moodleNextFetchString },
        { key: this.keys.moodleCurrentFetchInterval, value: moodleCurrentFetchIntervalString },
        { key: this.keys.discordLastReady, value: discordLastReadyString },
        { key: this.keys.discordCurrentChannelId, value: data.discordCurrentChannelId },
      ];
    },
    ...mapGetters(['statusBoardGetStatus', 'statusBoardGetData']),
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
