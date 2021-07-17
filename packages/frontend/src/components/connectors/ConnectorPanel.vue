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
              label="Bestimmt, ob Nachrichten über diesen Connector versendet werden sollen"
              position="is-right"
              :delay="500"
              :type="color">
              <b-switch
                v-model="connectorDataChanged.active"
                @input="onInput"
                :type="color"
              >Aktiviert</b-switch>
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
              <b-switch
                v-model="connectorDataChanged.default"
                @input="onInput"
                :type="color"
              >Default</b-switch>
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
              >Aktualisieren</b-button>
            </div>
            <div class="column">
              <b-button
                expanded
                outlined
                @click="onShowLogs"
                :type="color"
              >Logs anzeigen</b-button>
            </div>
            <div class="column is-1">
              <b-button
                expanded
                outlined
                type="is-danger"
                @click="onDelete"
              >Löschen</b-button>
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
          notifySuccess('Connector erfolgreich aktualisiert!');
          this.hasBeenModified = false;
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(
            'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
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
        title: 'Connector löschen',
        message: `Bist du dir sicher, dass die diesen Connector <b>löschen</b> möchtest?
          Das kann nicht rückgängig gemacht werden.<br>
          <br>
          <b>Hinweis:</b><br>
          Wenn kein Connector mehr vorhanden ist, aber in .env entsprechende Variablen hinterlegt sind, wird
          bei einem Neustart ein neuer "default" Connector automatisch angelegt. 
          `,
        confirmText: 'Connector löschen',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: this.onDeleteConfirm,
      });
    },

    onDeleteConfirm() {
      this.$store.dispatch('deleteConnector', this.connector._id)
        .then(() => {
          notifySuccess('Connector erfolgreich gelöscht!');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(
            'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
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
