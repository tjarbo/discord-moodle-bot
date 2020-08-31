<template>
  <div id="statusboard">
    <article class="panel is-status">
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
      <p class="panel-heading">Status:</p>
      <a class="panel-block">
        <p class="control">
          <b-table :data="rows" :hoverable="true">
            <template v-slot="{row}">
              <b-table-column
                v-for="(column, index) in columns"
                :class="classObject(row, column.field)"
                :key="index"
                :label="column.label"
                :width="'50%'"
              >{{ row[column.field] }}</b-table-column>
            </template>
          </b-table>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-outlined is-fullwidth is-status"
        >
          Aktualisieren
        </button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../../notification';

export default {
  name: 'Status',
  mounted() {
    // Import status data at loading time
    this.$store
      .dispatch('getStatus')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);

        // Request failed locally - maybe no internet connection etc?
        return notifyFailure('Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.');
      });
  },
  data: () => ({
    // Column titles
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
    // First-column values
    keys: {
      moodleConnectionStatus: 'Status der Moodle Verbindung',
      moodleLastFetch: 'Letzte Moodle Aktualisierung',
      moodleNextFetch: 'Nächste Moodle Aktualisierung',
      moodleCurrentFetchInterval: 'Aktuelles Fetch-Intervall',
      discordLastReady: 'Letzte erfolgreiche Discord Verbindung',
      discordCurrentChannel: 'Aktueller Discord Channel',
    },
  }),
  methods: {
    onSubmit() {
      // Update data
      this.$store
        .dispatch('getStatus')
        .then(() => {
          notifySuccess('Aktualisierung erfolgreich!');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(
                'Zugang leider abgelaufen! Bitte melde dich erneut an!',
              );
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

    /**
     * Apply .error CSS class (red text) dynamically depending on cell values
     *
     * @param row
     * @param property
     * @returns { cssClassNameToApply: boolean }
     */
    classObject(row, property) {
      if (row.key === this.keys.moodleConnectionStatus
          && row[property] !== this.keys.moodleConnectionStatus) {
        return { error: row[property] !== 'Ok' };
      }
      if (row.key === this.keys.moodleNextFetch) {
        return { error: row[property] === 'N/A' };
      }
      if (row.key === this.keys.moodleLastFetch) {
        return { error: row[property] === 'N/A' };
      }
      if (row.key === this.keys.moodleCurrentFetchInterval) {
        return { error: row[property] === 'Error' };
      }
      if (row.key === this.keys.discordCurrentChannel
          && row[property] !== this.keys.discordCurrentChannel) {
        return { error: this.statusBoardGetData[0].discordCurrentChannelName === 'Unknown' };
      }
      // Check if time to last fetch is greater than fetch intervall
      if (row.key === this.keys.moodleLastFetch
          && row[property] !== this.keys.moodleLastFetch) {
        const { moodleLastFetchTimestamp, moodleCurrentFetchInterval } = this.statusBoardGetData[0];
        const timeToLastFetch = this.getCurrentTimeDifference(moodleLastFetchTimestamp * 1000);
        return { error: timeToLastFetch > moodleCurrentFetchInterval };
      }
      return {};
    },

    /**
     * Returns german time string
     * e.g: '6 Minuten'
     *
     * @param ms Time in ms
     * @returns {string} german time string
     */
    getFormattedTime(ms) {
      const seconds = Math.round(ms / 1000);
      const minutes = Math.round(ms / (1000 * 60));
      const hours = Math.round(ms / (1000 * 60 * 60));
      const days = Math.round(ms / (1000 * 60 * 60 * 24));
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

    /**
     * Returns time difference between timestamp and current time in ms
     *
     * @param timestamp
     * @returns {number} Difference in ms
     */
    getCurrentTimeDifference(timestamp) {
      const nowTimeStamp = new Date().getTime();
      const milliSecondsDiff = Math.abs(nowTimeStamp - timestamp);
      return milliSecondsDiff;
    },

    /**
     * Returns the timestamp and date combined in a predefined string
     * e.g. '6 Minuten (31.8.2020, 09:52:18)'
     *
     * @param timestamp
     * @param date
     * @returns {string}
     */
    getTimeString(timestamp, date) {
      return `${this.getFormattedTime(this.getCurrentTimeDifference(timestamp))} (${date})`;
    },
  },
  computed: {
    rows() {
      // Avoid console errors at early loading time
      if (!this.statusBoardGetData) return [];

      // Get data
      const {
        moodleConnectionStatus,
        moodleLastFetchTimestamp,
        moodleCurrentFetchInterval,
        discordLastReadyTimestamp,
        discordCurrentChannelId,
        discordCurrentChannelName,
      } = this.statusBoardGetData[0];

      // Generate default (error) strings
      let moodleLastFetchString = 'N/A';
      let moodleNextFetchString = 'N/A';
      let moodleCurrentFetchIntervalString = 'Error';
      if (moodleCurrentFetchInterval !== 'Error' && moodleLastFetchTimestamp !== 'Error') {
        // Calculate currentFetchIntervall
        moodleCurrentFetchIntervalString = `Alle ${this.getFormattedTime(moodleCurrentFetchInterval)} (${moodleCurrentFetchInterval} ms)`;

        // Calculate LastFetch
        const moodleLastFetchDate = new Date(moodleLastFetchTimestamp * 1000).toLocaleString();
        moodleLastFetchString = `Vor ${this.getTimeString(moodleLastFetchTimestamp * 1000, moodleLastFetchDate)}`;

        // Calculate nextFetch
        const moodleNextFetchTimeStamp = (moodleLastFetchTimestamp * 1000)
          + moodleCurrentFetchInterval;
        const moodleNextFetchDate = new Date(moodleNextFetchTimeStamp).toLocaleString();
        moodleNextFetchString = `In ${this.getTimeString(moodleNextFetchTimeStamp, moodleNextFetchDate)}`;
      } else if (moodleCurrentFetchInterval !== 'Error') {
        // Calculate currentFetchIntervall
        moodleCurrentFetchIntervalString = `Alle ${this.getFormattedTime(moodleCurrentFetchInterval)} (${moodleCurrentFetchInterval} ms)`;
      } else if (moodleLastFetchTimestamp !== 'Error') {
        // Calculate LastFetch
        const moodleLastFetchDate = new Date(moodleLastFetchTimestamp * 1000).toLocaleString();
        moodleLastFetchString = `Vor ${this.getTimeString(moodleLastFetchTimestamp * 1000, moodleLastFetchDate)}`;
      }

      // Generate discordLastReady string
      const discordLastReadyDate = new Date(discordLastReadyTimestamp).toLocaleString();
      const discordLastReadyString = `Vor ${this.getTimeString(discordLastReadyTimestamp, discordLastReadyDate)}`;

      // Generate discordCurrentChannel string
      let discordCurrentChannelString = `Unbekannt (${discordCurrentChannelId})`;
      if (discordCurrentChannelName !== 'Unknown') {
        discordCurrentChannelString = `${discordCurrentChannelName} (${discordCurrentChannelId})`;
      }

      // Return data array
      return [
        { key: this.keys.moodleConnectionStatus, value: moodleConnectionStatus },
        { key: this.keys.moodleLastFetch, value: moodleLastFetchString },
        { key: this.keys.moodleNextFetch, value: moodleNextFetchString },
        { key: this.keys.moodleCurrentFetchInterval, value: moodleCurrentFetchIntervalString },
        { key: this.keys.discordLastReady, value: discordLastReadyString },
        { key: this.keys.discordCurrentChannel, value: discordCurrentChannelString },
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
.b-table {
  cursor: default;
}
</style>
