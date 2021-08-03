<template>
  <div id="connectorpanel">
     <article class="panel" :class="color">
        <p class="panel-heading">
          <nav class="level">
            <div class="level-left"><span class="level-item">{{connector.name}}:</span></div>
            <div class="level-right">
              <div class="level-item" v-show="connector.default">
                <button class="button is-small is-primary">
                  {{ $t('general.default') }}
                </button>
              </div>
              <div class="level-item">
                <button class="button is-small" :class="isOn">
                  {{ connector.active ? $t('general.on') : $t('general.off') }}
                </button>
              </div>
            </div>
          </nav>
        </p>
        <a class="panel-block">
            {{ $t('general.createdAt') }} {{new Date(connector.createdAt).toLocaleString()}}
        </a>
        <a class="panel-block">
          <div class="control">
            <b-tooltip
              :label="$t('components.connectorPanel.connectorIsActivatedLabel')"
              position="is-right"
              :delay="500"
              :type="color">
              <b-switch
                v-model="connectorDataChanged.active"
                @input="onInput"
                :type="color"
              >{{ $t('general.activated') }}</b-switch>
            </b-tooltip>
          </div>
        </a>
        <a class="panel-block">
          <div class="control">
            <b-tooltip
              :label="$t('components.connectorPanel.connectorIsDefaultLabel')"
              position="is-right"
              :delay="500"
              :type="color">
              <b-switch
                v-model="connectorDataChanged.default"
                @input="onInput"
                :type="color"
              >{{ $t('general.default') }}</b-switch>
            </b-tooltip>
          </div>
        </a>
        <component
          v-model="connectorDataChanged.socket"
          @input="onInput"
          :is="connectorSocket"
        />
        <div class="panel-block">
          <div class="columns control">
            <div class="column">
              <b-button
                expanded
                @click="onSave"
                :outlined="!this.hasBeenModified"
                :type="this.hasBeenModified ? 'is-danger' : this.color"
              >{{ $t('general.update') }}</b-button>
            </div>
            <div class="column">
              <b-button
                expanded
                outlined
                @click="onShowLogs"
                :type="color"
              >{{ $t('components.connectorPanel.showLogsButton') }}</b-button>
            </div>
            <div class="column is-1">
              <b-button
                expanded
                outlined
                type="is-danger"
                @click="onDelete"
              >{{ $t('general.delete') }}</b-button>
            </div>
          </div>
        </div>
     </article>
  </div>
</template>

<script>
import DiscordSocket from './sockets/DiscordSocket.vue';
import { notifySuccess, notifyFailure } from '../../notification';

export default {
  name: 'ConnectorPanel',
  computed: {
    color() {
      let result;
      switch (this.connector.type) {
        case 'discord':
          result = 'is-discord';
          break;

        default:
          result = 'is-link';
          break;
      }
      return result;
    },
    isOn() {
      return this.connector.active ? 'is-success' : 'is-danger';
    },
  },
  data: () => ({
    connectorSocket: undefined,
    connectorDataChanged: {
      active: false,
    },
    hasBeenModified: false,
  }),
  methods: {
    onSave(event) {
      event.preventDefault();

      const payload = {
        /* eslint-disable no-underscore-dangle */
        id: this.connector._id,
        body: {
          active: this.connectorDataChanged.active,
          courses: this.connectorDataChanged.courses,
          default: this.connectorDataChanged.default,
          name: this.connectorDataChanged.name,
          socket: this.connectorDataChanged.socket,
        },
      };

      if (payload.body.socket.token === this.connector.socket.token) delete payload.body.socket.token;

      this.$store.dispatch('updateConnector', payload)
        .then(() => {
          notifySuccess(this.$t('components.connectorPanel.notifications.updatedConnector'));
          this.hasBeenModified = false;
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(
            this.$t('general.notifications.requestFailedLocally'),
          );
        });
    },
    onShowLogs() {
      console.log('Not implemented yet');
    },
    onInput() {
      this.hasBeenModified = true;
    },
    onDelete() {
      this.$buefy.dialog.confirm({
        title: this.$t('components.connectorPanel.deleteConnectorDialogTitle'),
        message: this.$t('components.connectorPanel.deleteConnectorDialogMessage'),
        confirmText: this.$t('components.connectorPanel.deleteConnectorDialogConfirmText'),
        type: 'is-danger',
        hasIcon: true,
        cancelText: this.$t('general.cancel'),
        onConfirm: this.onDeleteConfirm,
      });
    },

    onDeleteConfirm() {
      this.$store.dispatch('deleteConnector', this.connector._id)
        .then(() => {
          notifySuccess(this.$t('components.connectorPanel.notifications.deletedConnector'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(
            this.$t('general.notifications.requestFailedLocally'),
          );
        });
    },
  },
  mounted() {
    // Copy connector so that changes (active, default) do not affect header until the data is stored
    this.connectorDataChanged = JSON.parse(JSON.stringify(this.connector));

    switch (this.connector.type) {
      case 'discord':
        this.connectorSocket = DiscordSocket;
        break;

      default:
        this.connectorSocket = undefined;
        break;
    }
  },
  props: {
    connector: Object,
  },
};
</script>

<style>
</style>
