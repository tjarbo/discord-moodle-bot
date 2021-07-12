<template>
  <div class="">
    <a class="panel-block">
      <p class="control">
        <b-field label="Discord Channel:">
          <b-input
            id="channelinput"
            placeholder="Neue Channel-ID"
            v-model="socket.channel"
            @input="onInput"
          ></b-input>
        </b-field>
      </p>
    </a>
    <a class="panel-block">
      <p class="control">
        <b-field label="Discord-Token:">
          <b-input
            id="tokeninput"
            type="password"
            placeholder="Neuer Token"
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
  },
};
</script>

<style>
</style>
