<template>
  <div>
    <!-- eslint-disable-next-line -->
    <p class="my-4" v-if="showDescription" v-html="$t('components.discordSocket.description', ['https://docs.tjarbo.me'])"></p>
    <a class="panel-block" :class="showDescription ? 'no-separator' : ''">
      <p class="control">
        <b-field :label="$t('components.discordSocket.channelLabel')">
          <b-input
            id="channelinput"
            :placeholder="$t('components.discordSocket.channelPlaceholder')"
            v-model="socket.channel"
            @input="onInput"
          ></b-input>
        </b-field>
      </p>
    </a>
    <a class="panel-block is-radiusless">
      <p class="control">
        <b-field :label="$t('components.discordSocket.tokenLabel')">
          <b-input
            id="tokeninput"
            type="password"
            :placeholder="$t('components.discordSocket.tokenPlaceholder')"
            v-model="socket.token"
            @input="onInput"
          ></b-input>
        </b-field>
      </p>
    </a>
  </div>
</template>

<script>
export default {
  name: 'DiscordConnector',
  model: {
    prop: 'socket',
    event: 'change',
  },
  methods: {
    onInput() {
      this.$emit('input');
    },
  },
  props: {
    socket: {
      channel: {
        type: String,
        default: '',
      },
      token: {
        type: String,
        default: '',
      },
    },
    showDescription: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.no-separator {
  border-bottom: 0px !important;
}
</style>
