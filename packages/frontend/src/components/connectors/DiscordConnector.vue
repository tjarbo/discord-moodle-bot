<template>
  <div class="">
    <p class="panel-block">
      <b-field label="Discord Channel:">
        <b-input
          id="channelinput"
          placeholder="Neue Channel-ID"
          v-model="socket.channel"
        ></b-input>
      </b-field>
    </p>
    <p class="panel-block">
      <b-field label="Discord-Token:">
        <b-input
          id="tokeninput"
          type="password"
          placeholder="Neuer Token"
          v-model="socket.token"
        ></b-input>
      </b-field>
    </p>
  </div>
</template>

<script>
export default {
  name: 'DiscordConnector',
  model: {
    prop: 'socket',
    event: 'change',
  },
  mounted() {
    console.log('Hello World');
  },
  props: {
    socket: Object,
  },
};
</script>

<style>
</style>
