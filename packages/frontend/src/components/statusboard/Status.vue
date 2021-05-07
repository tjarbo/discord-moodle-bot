<template>
  <div id="statusboard">
    <article class="panel is-status">
      <b-loading :is-full-page="false" :active="statusBoardGetStatus.pending"></b-loading>
      <p class="panel-heading">{{ $t('components.statusboard.status.panelHeading') }}:</p>
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
        <b-button
          @click="onSubmit"
          class="button is-outlined is-status"
          style="width: 50%; margin: 5px;"
        >
          {{ $t('components.statusboard.status.updateStatusButton') }}
        </b-button>
        <b-button
          @click="fetchAndNotify"
          class="button is-outlined is-moodle"
          style="width: 50%; margin: 5px;"
          :loading="fetchGetStatus.pending"
        >
          {{ $t('components.statusboard.status.checkForMoodleUpdatesButton') }}
        </b-button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../../notification';
import i18n from '../../i18n';

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
        return notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
      });
  },
  data: () => ({
    // Column titles
    columns: [
      {
        field: 'key',
        label: i18n.t('general.name'),
      },
      {
        field: 'value',
        label: i18n.t('general.value'),
      },
    ],
    // First-column values
    keys: {
      moodleConnectionStatus: i18n.t('components.statusboard.status.columnValues.moodleConnectionStatusKey'),
      moodleLastFetch: i18n.t('components.statusboard.status.columnValues.moodleLastFetchKey'),
      moodleNextFetch: i18n.t('components.statusboard.status.columnValues.moodleNextFetchKey'),
      moodleCurrentFetchInterval: i18n.t('components.statusboard.status.columnValues.moodleCurrentFetchIntervalKey'),
      discordLastReady: i18n.t('components.statusboard.status.columnValues.discordLastReadyKey'),
      discordCurrentChannel: i18n.t('components.statusboard.status.columnValues.discordCurrentChannelKey'),
    },
    fetchInProgress: false,
  }),
  methods: {
    onSubmit() {
      // Update data
      this.$store
        .dispatch('getStatus')
        .then(() => {
          notifySuccess(i18n.t('components.statusboard.status.notifications.updatedStatusData'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(i18n.t('general.notifications.accessExpired'));
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
          }
        });
    },

    fetchAndNotify() {
      this.$store
        .dispatch('triggerFetch')
        .then(() => {
          notifySuccess(i18n.t('components.statusboard.status.notifications.fetchedMoodleUpdates'));
          this.$store.dispatch('getStatus');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(i18n.t('general.notifications.accessExpired'));
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
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
      if (ms === 1) return { time: ms, unit: i18n.t('general.time.millisecond') };
      if (ms < 1000) return { time: ms, unit: i18n.t('general.time.milliseconds') };
      if (seconds === 1) return { time: seconds, unit: i18n.t('general.time.second') };
      if (seconds < 60) return { time: seconds, unit: i18n.t('general.time.seconds') };
      if (minutes === 1) return { time: minutes, unit: i18n.t('general.time.minute') };
      if (minutes < 60) return { time: minutes, unit: i18n.t('general.time.minutes') };
      if (hours === 1) return { time: hours, unit: i18n.t('general.time.hour') };
      if (hours < 24) return { time: hours, unit: i18n.t('general.time.hours') };
      if (days === 1) return { time: days, unit: i18n.t('general.time.day') };
      return { time: days, unit: i18n.t('general.time.days') };
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
        discordLastReadyTimestamp,
        discordCurrentChannelId,
        discordCurrentChannelName,
      } = this.statusBoardGetData[0];

      // Generate default (error) strings
      let moodleLastFetchString = 'N/A';
      let moodleNextFetchString = 'N/A';
      let moodleCurrentFetchIntervalString = i18n.t('general.error');
      if (moodleLastFetchTimestamp !== 'Error') {
        // Calculate lastFetch
        if (moodleLastFetchTimestamp === 0) moodleLastFetchString = i18n.t('general.none');
        else {
          const moodleLastFetchDate = new Date(moodleLastFetchTimestamp * 1000).toLocaleString();
          moodleLastFetchString = i18n.t('general.time.ago', this.getTimeObject(moodleLastFetchTimestamp * 1000, moodleLastFetchDate));
        }
      }
      if (moodleCurrentFetchInterval !== 'Error') {
        // Calculate currentFetchIntervall
        moodleCurrentFetchIntervalString = `${i18n.t('general.time.every', this.getFormattedTime(moodleCurrentFetchInterval))} (${moodleCurrentFetchInterval} ms)`;
      }
      if (moodleNextFetchTimestamp !== 'Error' && (moodleNextFetchTimestamp > Date.now() / 1000)) {
        // Calculate nextFetch
        const moodleNextFetchDate = new Date(moodleNextFetchTimestamp * 1000).toLocaleString();
        moodleNextFetchString = i18n.t('general.time.in', this.getTimeObject(moodleNextFetchTimestamp * 1000, moodleNextFetchDate));
      }

      // Generate discordLastReady string
      const discordLastReadyDate = new Date(discordLastReadyTimestamp).toLocaleString();
      const discordLastReadyString = i18n.t('general.time.ago', this.getTimeObject(discordLastReadyTimestamp, discordLastReadyDate));

      // Generate discordCurrentChannel string
      let discordCurrentChannelString = `${i18n.t('general.unknown')} (${discordCurrentChannelId})`;
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
    ...mapGetters(['statusBoardGetStatus', 'statusBoardGetData', 'fetchGetStatus']),
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
