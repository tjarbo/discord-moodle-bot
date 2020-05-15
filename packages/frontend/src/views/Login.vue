<template>
  <div id="loginview">
    <form class="pure-form pure-form-stacked" @submit="submit">
      <fieldset>
        <legend>Login - Fancy-Moodle-Discord-Bot</legend>
        <label for="discordusername">Discord Username</label>
        <input type="email" id="discordusername" placeholder="username#0000" />
        <label for="token">Zugangstoken</label>
        <input type="password" id="token" placeholder="Token" :disabled="tokenInputDisabled" />
        <button type="submit" class="pure-button pure-button-primary">{{submitButtonText}}</button>
      </fieldset>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data: () => ({
    submitButtonText: 'Token anfordern',
    tokenInputDisabled: true,
  }),
  methods: {
    submit: () => {
      console.log('Hallo Welt');
    },
  },
};
</script>

<style>
</style>
