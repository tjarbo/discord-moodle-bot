<template>
  <div>
    <a class="button is-success" @click="showCreate = true">{{ $t('general.create') }}</a>
    <ConnectorModalLayout
      @close="onClose"
      :active.sync="showCreate"
      :canClose.sync="canClose"
      :title="$t('components.connectorCreate.connectorModalTitle')"
    >
      <div class="m-4">
        <b-steps
          v-model="activeStep"
          :has-navigation="false"
          :mobile-mode="null"
        >
          <b-step-item step="1" :label="$t('components.connectorCreate.selectTypeLabel')">
            <div class="content">
              <p>
                {{ $t('components.connectorCreate.selectTypeContent') }}
              </p>
            </div>
            <div>
              <h2 class="subtitle mb-4">{{ $t('components.connectorCreate.selectTypeBotsTitle') }}</h2>
              <a class="box" @click="onSelectType('discord')">
                <article class="media">
                  <figure class="media-left">
                    <b-icon icon="discord" pack="fab" size="is-large"></b-icon>
                  </figure>
                  <div class="media-content">
                    <div class="content">
                      <p>
                        <strong>{{ $t('components.connectorCreate.selectTypeBotsDiscordTitle') }}</strong>
                        <br />
                        <!-- eslint-disable-next-line -->
                        <span v-html="$t('components.connectorCreate.selectTypeBotsDiscordDescription', [ docs.discordBot ])" />
                      </p>
                    </div>
                  </div>
                </article>
              </a>
            </div>
            <div class="my-4">
              <h2 class="subtitle mb-4">{{ $t('components.connectorCreate.selectTypeMiscellaneousTitle') }}</h2>
              <a
                class="box has-text-light disabled-item"
                @click="onSelectType('webhook')"
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
                        <strong>{{ $t('components.connectorCreate.selectTypeMiscellaneousWebhookTitle') }}</strong>
                        <br />
                        {{ $t('components.connectorCreate.selectTypeMiscellaneousWebhookDescription') }}
                      </p>
                    </div>
                  </div>
                </article>
              </a>
            </div>
          </b-step-item>

          <b-step-item step="2" :label="$t('components.connectorCreate.parametersLabel')">
            <component
              v-model="connectorDraft.socket"
              @input="isDirty = true"
              :activeStep="activeStep"
              :is="connectorSocket"
              :showDescription="true"
            />
            <a class="panel-block">
              <p class="control">
                <b-field :label="$t('components.connectorCreate.parametersConnectorName')">
                  <b-input
                    id="connectorname"
                    v-model="connectorDraft.name"
                    :placeholder="$t('components.connectorCreate.parametersConnectorNamePlaceholder')"
                  ></b-input>
                </b-field>
              </p>
            </a>
          </b-step-item>

          <b-step-item step="3" :label="$t('components.connectorCreate.doneLabel')">
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
                size="is-large"
                v-show="!loading.active"
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
                    {{ $t('general.back') }}
                  </b-button>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-button
                    type="is-success"
                    @click.prevent="onCreate"
                    :disabled="!isDirty || connectorDraft.name == ''"
                  >
                    {{ $t('general.create') }}
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
  type: '',
  socket: {},
};

export default {
  name: 'ConnectorCreate',
  components: {
    ConnectorModalLayout,
  },
  data: () => ({
    activeStep: 0,
    canClose: true,
    connectorSocket: undefined,
    connectorDraft: cloneDeep(connectorBlueprint),
    isDirty: false,
    loading: { ...loadingTemplate },
    showCreate: false,
    docs: {
      discordBot: `${process.env.VUE_APP_DOCS_BASE_URL}/`,
    },
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
      this.loading.active = true;
      this.$store.dispatch('createConnector', this.connectorDraft)
        .then(() => {
          this.setResult(true);
          notifySuccess(this.$t('components.connectorCreate.notifications.connectorCreated'));
          setTimeout(this.onClose, 2000);
        })
        .catch((apiResponse) => {
          this.setResult(false);
          setTimeout(() => { this.activeStep--; this.loading = loadingTemplate; }, 2000);
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(this.$t('general.notifications.requestFailedLocally'));
        }).finally(() => {
          this.canClose = true;
        });
    },
    onSelectType(type) {
      this.isDirty = false;
      switch (type) {
        case 'discord':
          console.log('Discord Bot');
          this.connectorSocket = DiscordSocket;
          this.connectorDraft.type = 'discord';
          this.activeStep++;
          break;
        default:
          console.warn(`${type} not implemented yet!`);
          break;
      }
    },
    setResult(success) {
      if (success) {
        this.loading.text = this.$t('components.connectorCreate.doneSuccessDescription');
        this.loading.active = false;
        this.loading.icon = 'check-circle';
        this.loading.color = 'is-success';
      } else {
        this.loading.text = this.$t('components.connectorCreate.doneFailedDescription');
        this.loading.active = false;
        this.loading.icon = 'times-circle';
        this.loading.color = 'is-danger';
      }
    },
  },
};
</script>

<style scoped>
.step-3 {
  height: 9rem;
}

.disabled-item {
  pointer-events: none;
}

</style>
