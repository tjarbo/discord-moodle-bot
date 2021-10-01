<template>
  <div id="statusboard">
    <article class="panel is-status">
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
      <p class="panel-heading">{{ $t('components.status.panelHeading') }}:</p>
      <a class="panel-block">
        <p class="control">
          <b-table :data="rows" hoverable>
            <b-table-column
              v-for="(column, index) in columns"
              v-slot="props"
              :key="index"
              :label="column.label"
              :width="'50%'"
            ><span :class="classObject(props.row, column.field)"></span>{{ props.row[column.field] }}</b-table-column>
          </b-table>
        </p>
      </a>
      <div class="panel-block">
        <b-button
          @click="onSubmit"
          class="button is-outlined is-status"
          style="width: 50%; margin: 5px;"
        >
          {{ $t('components.status.updateStatusButton') }}
        </b-button>
        <b-button
          @click="fetchAndNotify"
          class="button is-outlined is-moodle"
          style="width: 50%; margin: 5px;"
          :loading="fetchGetStatus.pending"
        >
          {{ $t('components.status.checkForMoodleUpdatesButton') }}
        </b-button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../notification';

export default {
  name: 'TheStatusBoard',
  computed: {
    rows() {
      // Avoid console errors at early loading time
      if (!this.statusBoardGetData) return [];

      // Get data
      const {
        moodleConnectionStatus,
        moodleLastFetchTimestamp,
        moodleNextFetchTimestamp,
        moodleCurrentFetchInterval,
        connectorsLength,
        connectorsActiveLength,
        connectorsDefaultLength,
      } = this.statusBoardGetData[0];

      // Generate default (error) strings
      let moodleLastFetchString = 'N/A';
      let moodleNextFetchString = 'N/A';
      let moodleCurrentFetchIntervalString = this.$t('general.error');
      if (moodleLastFetchTimestamp !== 'Error') {
        // Calculate lastFetch
        if (moodleLastFetchTimestamp === 0) moodleLastFetchString = this.$t('general.none');
        else {
          const moodleLastFetchDate = new Date(moodleLastFetchTimestamp * 1000).toLocaleString();
          moodleLastFetchString = this.$t(
            'general.time.ago', this.getTimeObject(moodleLastFetchTimestamp * 1000, moodleLastFetchDate),
          );
        }
      }

      if (moodleCurrentFetchInterval !== 'Error') {
        // Calculate currentFetchIntervall
        const timeEvery = this.$t('general.time.every', this.getFormattedTime(moodleCurrentFetchInterval));
        moodleCurrentFetchIntervalString = `${timeEvery} (${moodleCurrentFetchInterval} ms)`;
      }

      if (moodleNextFetchTimestamp !== 'Error' && (moodleNextFetchTimestamp > Date.now() / 1000)) {
        // Calculate nextFetch
        const moodleNextFetchDate = new Date(moodleNextFetchTimestamp * 1000).toLocaleString();
        moodleNextFetchString = this.$t(
          'general.time.in', this.getTimeObject(moodleNextFetchTimestamp * 1000, moodleNextFetchDate),
        );
      }

      // Return data array
      return [
        { key: this.keys.moodleConnectionStatus, value: moodleConnectionStatus },
        { key: this.keys.moodleLastFetch, value: moodleLastFetchString },
        { key: this.keys.moodleNextFetch, value: moodleNextFetchString },
        { key: this.keys.moodleCurrentFetchInterval, value: moodleCurrentFetchIntervalString },
        { key: this.keys.connectorsLength, value: connectorsLength },
        { key: this.keys.connectorsActiveLength, value: connectorsActiveLength },
        { key: this.keys.connectorsDefaultLength, value: connectorsDefaultLength },
      ];
    },
    ...mapGetters(['statusBoardGetStatus', 'statusBoardGetData', 'fetchGetStatus']),
  },
  data() {
    return {
      // Column titles
      columns: [
        {
          field: 'key',
          label: this.$t('general.name'),
        },
        {
          field: 'value',
          label: this.$t('general.value'),
        },
      ],
      // First-column values
      keys: {
        moodleConnectionStatus: this.$t('components.status.columnValues.moodleConnectionStatusKey'),
        moodleLastFetch: this.$t('components.status.columnValues.moodleLastFetchKey'),
        moodleNextFetch: this.$t('components.status.columnValues.moodleNextFetchKey'),
        moodleCurrentFetchInterval: this.$t('components.status.columnValues.moodleCurrentFetchIntervalKey'),
        connectorsLength: this.$t('components.status.columnValues.connectorsLength'),
        connectorsActiveLength: this.$t('components.status.columnValues.connectorsActiveLength'),
        connectorsDefaultLength: this.$t('components.status.columnValues.connectorsDefaultLength'),
      },
    };
  },
  mounted() {
    // Import status data at loading time
    this.$store
      .dispatch('getStatus')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);

        // Request failed locally - maybe no internet connection etc?
        return notifyFailure(this.$t('general.notifications.requestFailedLocally'));
      });
  },
  methods: {
    onSubmit() {
      // Update data
      this.$store
        .dispatch('getStatus')
        .then(() => {
          notifySuccess(this.$t('components.status.notifications.updatedStatusData'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(this.$t('general.notifications.accessExpired'));
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(this.$t('general.notifications.requestFailedLocally'));
          }
        });
    },

    fetchAndNotify() {
      this.$store
        .dispatch('triggerFetch')
        .then(() => {
          notifySuccess(this.$t('components.status.notifications.fetchedMoodleUpdates'));
          this.$store.dispatch('getStatus');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(this.$t('general.notifications.accessExpired'));
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(this.$t('general.notifications.requestFailedLocally'));
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
      // Check if time to last fetch is greater than fetch interval
      if (row.key === this.keys.moodleLastFetch
          && row[property] !== this.keys.moodleLastFetch) {
        const { moodleLastFetchTimestamp, moodleCurrentFetchInterval } = this.statusBoardGetData[0];
        const timeToLastFetch = this.getCurrentTimeDifference(moodleLastFetchTimestamp * 1000);
        return { error: timeToLastFetch > moodleCurrentFetchInterval };
      }
      return {};
    },

    /**
     * Returns multilingual time string
     * e.g: '6 Minuten' or '6 minutes'
     *
     * @param ms Time in ms
     * @returns {{ time: number, unit: string }} time template
     */
    getFormattedTime(ms) {
      const seconds = Math.round(ms / 1000);
      const minutes = Math.round(ms / (1000 * 60));
      const hours = Math.round(ms / (1000 * 60 * 60));
      const days = Math.round(ms / (1000 * 60 * 60 * 24));
      if (ms === 1) return { time: ms, unit: this.$t('general.time.millisecond') };
      if (ms < 1000) return { time: ms, unit: this.$t('general.time.milliseconds') };
      if (seconds === 1) return { time: seconds, unit: this.$t('general.time.second') };
      if (seconds < 60) return { time: seconds, unit: this.$t('general.time.seconds') };
      if (minutes === 1) return { time: minutes, unit: this.$t('general.time.minute') };
      if (minutes < 60) return { time: minutes, unit: this.$t('general.time.minutes') };
      if (hours === 1) return { time: hours, unit: this.$t('general.time.hour') };
      if (hours < 24) return { time: hours, unit: this.$t('general.time.hours') };
      if (days === 1) return { time: days, unit: this.$t('general.time.day') };
      return { time: days, unit: this.$t('general.time.days') };
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
     * Returns the timestamp difference and date combined in a custom object
     * e.g. { time: 6, unit: 'Minuten', date: '31.8.2020, 09:52:18'}
     *
     * @param timestamp
     * @param date
     * @returns {{ time: number, unit: string, date: string }}
     */
    getTimeObject(timestamp, date) {
      return { ...this.getFormattedTime(this.getCurrentTimeDifference(timestamp)), date };
    },
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
