<template>
  <div id="discordpanel">
    <article class="panel is-discord">
      <p class="panel-heading is-discord">Discord</p>
      <a class="panel-block">
        <p class="control">
          <b-field :label="$t('components.discordPanel.changeDiscordChannelLabel')" >
            <b-input
              id="channelinput"
              v-model="channelId"
              :placeholder="$t('components.discordPanel.newChannelIdPlaceholder')"
            ></b-input>
          </b-field>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-discord is-outlined is-fullwidth"
          :disabled="$v.$invalid"
        >{{ $t('general.update') }}</button>
      </div>
      <b-loading :is-full-page="false" :active="channelGetStatus.pending"></b-loading>
    </article>
  </div>
</template>

<script>
import { required, numeric } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../../notification';
import i18n from '../../i18n';

export default {
  name: 'DiscordPanel',
  data: () => ({
    channelId: '',
  }),
  methods: {
    onSubmit() {
      const update = { channelId: this.channelId };
      this.$store.dispatch('setDiscordChannel', update)
        .then(() => {
          notifySuccess(i18n.t('components.discordPanel.notifications.changedDiscordChannel'));
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
            notifyFailure(
              i18n.t('general.notifications.requestFailedLocally'),
            );
          }
        });
    },
  },
  computed: {
    ...mapGetters(['channelGetStatus']),
  },
  validations: {
    channelId: {
      required,
      numeric,
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}
label {
  color: green;
}
</style>
