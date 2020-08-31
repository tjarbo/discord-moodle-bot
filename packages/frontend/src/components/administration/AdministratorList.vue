<template>
  <div id="administratorlist">
    <article class="panel is-primary">
      <b-loading :is-full-page="false" :active="administratorListGetStatus.pending"></b-loading>
      <p class="panel-heading">Administratoren:</p>
      <a class="panel-block">
        <p class="control">
          <b-table
            :data="rows"
            :hoverable="true"
            checkable
            :checkbox-position="'left'"
            :checked-rows.sync="checkedRows"
            :is-row-checkable="(row) => row.userId !== firstAdminId">
            <template v-slot="{row}" >
              <b-table-column
                v-for="(column, index) in columns"
                :key="index"
                :label="column.label"
                >{{ row[column.field] }}</b-table-column>
            </template>
          </b-table>
        </p>
      </a>
      <div class="panel-block">
        <button
          @click="onSubmit"
          :disabled="!(this.checkedRows.length)"
          class="button is-outlined is-fullwidth is-primary"
          >Entfernen</button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifySuccess, notifyFailure } from '../../notification';

export default {
  name: 'AdministratorList',
  mounted() {
    // Import list data at loading time
    this.$store
      .dispatch('getAdministrators')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) notifyFailure(apiResponse.error[0].message);
        // Request failed locally - maybe no internet connection etc?
        return notifyFailure('Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.');
      });
  },
  data: () => ({
    // Column titles
    columns: [
      {
        field: 'userName',
        label: 'Anzeigename',
      },
      {
        field: 'userId',
        label: 'User ID',
      },
      {
        field: 'createdAt',
        label: 'Erstellungsdatum',
      },
    ],
    checkedRows: [],
  }),
  methods: {
    onSubmit() {
      // Delete admins
      const results = [];
      this.checkedRows.forEach((row) => {
        results.push(this.$store.dispatch('deleteAdministrator', row.userId));
      });
      Promise.all(results)
        .then(() => {
          // Clear checkboxes and update list
          this.checkedRows = [];
          this.$store.dispatch('getAdministrators');
          notifySuccess('Löschen erfolgreich!');
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              notifyFailure(
                'Zugang leider abgelaufen! Bitte melde dich erneut an!',
              );
              this.$store.dispatch('logout');
              this.$router.push({ name: 'Login' });
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
            );
          }
        });
    },
  },
  computed: {
    rows() {
      // Avoid console errors at early loading time
      if (!this.administratorListGetData) return [];

      // Prepare data
      const data = this.administratorListGetData.map((admin) => ({
        userName: admin.userName,
        userId: admin.userId,
        createdAt: new Date(admin.createdAt).toLocaleString(),
      }));
      return data;
    },
    /**
     * Returns the id of the first admin (time based).
     * This admin should not be deletable.
     */
    firstAdminId() {
      if (this.administratorListGetData) {
        const firstAdm = this.administratorListGetData.slice()
          .sort((adm1, adm2) => adm1.createdAt - adm2.createdAt)[0];
        return firstAdm.userId;
      }
      return ''; // Data not ready
    },
    ...mapGetters(['administratorListGetData', 'administratorListGetStatus']),
  },
};
</script>

<style scoped>
.b-table {
  cursor: default;
}
</style>
