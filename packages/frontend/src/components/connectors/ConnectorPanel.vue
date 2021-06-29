<template>
  <div id="connectorpanel">
     <article class="panel" :class="color">
        <p class="panel-heading">
          <nav class="level">
            <div class="level-left"><span class="level-item">{{connector.name}}:</span></div>
            <div class="level-right">
              <div class="level-item" v-show="connector.default">
                <button class="button is-small is-primary">
                  Default
                </button>
              </div>
              <div class="level-item">
                <button class="button is-small" :class="isOn">
                  {{ connector.active ? 'ON' : 'OFF' }}
                </button>
              </div>
            </div>
          </nav>
        </p>
        <a class="panel-block">
            Erstellt am {{new Date(connector.createdAt).toLocaleString()}}
        </a>
        <a class="panel-block">
          <div class="control">
            <b-tooltip
              label="Bestimmt ob Nachrichten über diesen Connector versendet werden sollen"
              position="is-right"
              :delay="500"
              :type="color">
              <b-switch :type="color" v-model="connectorDataChanged.active">Aktivieren</b-switch>
            </b-tooltip>
          </div>
        </a>
        <a class="panel-block">
          <div class="control">
            <b-tooltip
              label="Wenn kein passender Connector gefunden wurde, wird dieser Connector benutzt"
              position="is-right"
              :delay="500"
              :type="color">
              <b-switch :type="color" v-model="connectorDataChanged.default">Default</b-switch>
            </b-tooltip>
          </div>
        </a>
        <component :is="connectorSocket" v-model="connectorDataChanged.socket"></component>
        <div class="panel-block">
          <div class="columns control">
            <div class="column">
              <button
                @click="onSubmit"
                class="button is-outlined is-fullwidth"
                :class="color"
              >Aktualisieren</button>
            </div>
            <div class="column">
              <button
                @click="onShowLogs"
                class="button is-outlined is-fullwidth"
                :class="color"
              >Logs anzeigen</button>
            </div>
          </div>
        </div>
     </article>
  </div>
</template>

<script>
import DiscordSocket from './sockets/DiscordSocket.vue';

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
    connectorDataChanged: null,
  }),
  methods: {
    onSubmit() {
      console.log('Not tdb');
    },
    onShowLogs() {
      console.log('Not tdb 2');
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
