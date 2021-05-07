<template>
  <div id="administratorlist">
    <article class="panel is-primary">
      <b-loading :is-full-page="false" :active="administratorListGetStatus.pending"></b-loading>
      <p class="panel-heading">{{ $t('components.administratorList.panelHeading') }}:</p>
      <a class="panel-block">
        <p class="control">
          <b-table
            :data="rows"
            :hoverable="true"
          >
            <b-table-column field="username" v-slot="props" :label="$t('components.administratorList.usernameLabel')">
              {{ props.row.username }}
            </b-table-column>

            <b-table-column field="createdAt" v-slot="props" :label="$t('components.administratorList.createdAtLabel')">
              {{ new Date(props.row.createdAt).toLocaleString() }}
            </b-table-column>

            <b-table-column field="hasDevice" centered v-slot="props" :label="$t('components.administratorList.hasDeviceLabel')">
              <span class="tag" :class="props.row.hasDevice ? 'is-success':'is-danger'">
                {{ props.row.hasDevice ? $t('general.registered') : $t('general.notFound') }}
              </span>
            </b-table-column>

            <b-table-column field="delete" v-slot="props" :label="$t('components.administratorList.deleteLabel')">
              <b-button
                @click="onDelete(props.row.username)"
                :disabled="!props.row.deletable"
                outlined
                size="is-small"
                type="is-danger"
                >
                {{ $t('general.delete') }}
             </b-button>
            </b-table-column>
          </b-table>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          class="button is-outlined is-fullwidth is-primary"
          >{{ $t('components.administratorList.createNewRegistrationTokenButton') }}</button>
      </div>
    </article>
    <registration-token-modal ref="registrationTokenModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../../notification';
import RegistrationTokenModal from './RegistrationTokenModal.vue';
import i18n from '../../i18n';

export default {
  name: 'AdministratorList',
  components: { RegistrationTokenModal },
  computed: {
    rows() {
      // Avoid console errors at early loading time
      if (!this.administratorListGetData) return [];

      return this.administratorListGetData;
    },
    ...mapGetters(['administratorListGetData', 'administratorListGetStatus']),
  },
  data: () => ({ active: false }),
  methods: {
    onDelete(username) {
      this.$store.dispatch('deleteAdministrator', username)
        .then(() => {
          notifySuccess(i18n.t('components.administratorList.notifications.deletedAdministrator'));
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
        });
    },

    onSubmit() {
      this.$store.dispatch('requestToken')
        .then((apiResponse) => {
          this.$refs.registrationTokenModal.show(apiResponse.data);
        })
        .catch((apiResponse) => {
          if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
          // Request failed locally - maybe no internet connection etc?
          return notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
        });
    },
  },
  mounted() {
    // Import list data at loading time
    this.$store.dispatch('getAdministrators')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) return notifyFailure(apiResponse.error[0].message);
        // Request failed locally - maybe no internet connection etc?
        return notifyFailure(i18n.t('general.notifications.requestFailedLocally'));
      });
  },
};
</script>

<style scoped>
.b-table {
  cursor: default;
}
</style>
