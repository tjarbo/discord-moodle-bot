<template>
  <div>
    <a class="button is-success" @click="showCreate = true">{{ $t('general.create') }}</a>
    <ConnectorModalLayout
      title="Neuen Connector anlegen"
      :active.sync="showCreate"
      :canClose.sync="canClose"
      @close="onClose"
    >
      <div class="m-4">
        <b-steps
          v-model="activeStep"
          :has-navigation="false"
          :mobile-mode="null"
        >
          <b-step-item step="1" label="Typ">
            <div class="content">
              <p>
                Du möchtest einen neuen Connector erstellen? Sehr schön! Wähle
                dazu zuerst einen passenden Typen aus der Liste aus:
              </p>
            </div>
            <div class="">
              <h2 class="subtitle mb-4">Bots</h2>
              <a class="box" @click="onSelectType('discordbot')">
                <article class="media">
                  <figure class="media-left">
                    <b-icon icon="discord" pack="fab" size="is-large"></b-icon>
                  </figure>
                  <div class="media-content">
                    <div class="content">
                      <p>
                        <strong>Discord Bot</strong>
                        <br />
                        Für diesen Connetor musst du einen neuen Bot im Discord
                        Developer Portal anlegen. Mehr dazu findest du <a href="https://docs.tjarbo.me">hier</a>
                      </p>
                    </div>
                  </div>
                </article>
              </a>
            </div>
            <div class="my-4">
              <h2 class="subtitle mb-4">Weitere</h2>
              <a
                class="box has-text-light"
                @click="onSelectType('webhook')"
                disabled
              >
                <article class="media">
                  <figure class="media-left">
                    <b-icon
                      icon="share-square"
                      pack="fas"
                      size="is-large"
                    ></b-icon>
                  </figure>
                  <div class="media-content">
                    <div class="content">
                      <p>
                        <strong>Webhook</strong>
                        <br />
                        Kleine Vorschau ;) Kommt bald ...
                      </p>
                    </div>
                  </div>
                </article>
              </a>
            </div>
          </b-step-item>

          <b-step-item step="2" label="Parameter">
            <component
              v-model="connectorDraft.socket"
              @input="isDirty = true"
              :description="true"
              :is="connectorSocket"
              :activeStep="activeStep"
            />
            <a class="panel-block">
              <p class="control">
                <b-field label="Connector Name:">
                  <b-input
                    id="connectorname"
                    placeholder="This is a fany connector"
                    v-model="connectorDraft.name"
                  ></b-input>
                </b-field>
              </p>
            </a>
          </b-step-item>

          <b-step-item step="3" label="Fertig">
            <div
              class="
                step-3
                is-flex
                is-align-items-center
                is-justify-content-center
                is-flex-direction-column
              "
            >
              <b-loading :active.sync="loading.active" :is-full-page="false" />
              <b-icon
                v-show="!loading.active"
                size="is-large"
                :icon="loading.icon"
                :type="loading.color"
              />
              <h1 v-show="!loading.active" class="subtitle">
                {{ loading.text }}
              </h1>
            </div>
          </b-step-item>

          <template #navigation="{ previous }">
            <div class="level" v-if="activeStep === 1">
              <div class="level-left">
                <div class="level-item">
                  <b-button
                    outlined
                    icon-left="chevron-left"
                    :disabled="previous.disabled"
                    @click.prevent="previous.action"
                  >
                    Zurück
                  </b-button>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-button
                    type="is-success"
                    :disabled="!isDirty || connectorDraft.name == ''"
                    @click.prevent="onCreate"
                  >
                    Erstellen
                  </b-button>
                </div>
              </div>
            </div>
          </template>
        </b-steps>
      </div>
    </ConnectorModalLayout>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import ConnectorModalLayout from '../../layouts/ConnectorModalLayout.vue';
import DiscordSocket from './sockets/DiscordSocket.vue';
import { notifySuccess, notifyFailure } from '../../notification';

const loadingTemplate = {
  text: '',
  icon: '',
  color: '',
  active: true,
};

const connectorBlueprint = {
  name: '',
  socket: {},
};

export default {
  name: 'ConnectorCreate',
  components: {
    ConnectorModalLayout,
  },
  data: () => ({
    activeStep: 0,
    canClose: false,
    connectorSocket: undefined,
    connectorDraft: cloneDeep(connectorBlueprint),
    isDirty: false,
    loading: { ...loadingTemplate },
    showCreate: false,
  }),
  methods: {
    onClose() {
      this.showCreate = false;

      setTimeout(() => {
        this.isDirty = false;
        this.activeStep = 0;
        this.connectorDraft = cloneDeep(connectorBlueprint);
        this.connectorSocket = undefined;
        this.loading = cloneDeep(loadingTemplate);
      }, 700);
    },
    onCreate() {
      this.activeStep++;

      this.canClose = false;
      this.$store.dispatch('createConnector', this.connectorDraft)
        .then(() => {
          this.setResult(true);
          notifySuccess('Connector erfolgreich aktualisiert!');
          setTimeout(this.onClose, 2000);
        })
        .catch((apiResponse) => {
          this.setResult(false);
          setTimeout(() => { this.activeStep--; this.loading = loadingTemplate; }, 2000);
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(
            'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
          );
        }).finally(() => {
          this.canClose = true;
        });
    },
    onSelectType(type) {
      this.isDirty = false;
      switch (type) {
        case 'discordbot':
          console.log('Discord Bot');
          this.connectorSocket = DiscordSocket;
          this.activeStep++;
          break;
        default:
          console.warn(`${type} not implemented yet!`);
          break;
      }
    },
    setResult(success) {
      if (success) {
        this.loading.text = 'Connector erstellt!';
        this.loading.active = false;
        this.loading.icon = 'check-circle';
        this.loading.color = 'is-success';
      } else {
        this.loading.text = 'Connector erstellt!';
        this.loading.active = false;
        this.loading.icon = 'times-circle';
        this.loading.color = 'is-danger';
      }
    },
  },
};
</script>

<style>
.step-3 {
  height: 9rem;
}
</style>
