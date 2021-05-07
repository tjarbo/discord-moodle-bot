<template>
  <div id="setrefreshrate">
    <article class="panel is-moodle">
      <p class="panel-heading">{{ $t('components.setRefreshRate.panelHeading') }}:</p>
       <a class="panel-block">
        <p class="control">
          <b-field :label="$t('components.setRefreshRate.newIntervalLabel')">
            <b-input
              id="refreshrateinput"
              placeholder="15000"
              v-model="newRefreshRate"
            ></b-input>
          </b-field>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-moodle is-outlined is-fullwidth"
          :disabled="$v.$invalid"
        >{{ $t('general.update') }}</button>
      </div>
      <b-loading :is-full-page="false" :active="refreshRateGetStatus.pending"></b-loading>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, numeric, between } from 'vuelidate/lib/validators';
import { notifySuccess, notifyFailure } from '../../notification';
import i18n from '../../i18n';

export default {
  name: 'SetRefreshRate',
  data: () => ({
    newRefreshRate: '', // User input
  }),
  methods: {
    onSubmit() {
      const update = { refreshRate: this.newRefreshRate };

      this.$store.dispatch('refreshRate', update)
        .then(() => {
          this.newRefreshRate = '';
          notifySuccess(i18n.t('components.setRefreshRate.notifications.updatedInterval'));
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
    ...mapGetters(['refreshRateGetStatus']),
  },
  validations: {
    newRefreshRate: {
      required,
      numeric,
      between: between(5000, 2678400000),
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
