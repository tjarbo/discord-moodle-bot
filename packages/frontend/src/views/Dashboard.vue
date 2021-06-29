<template>
  <div id="dashboardview">
    <TheNavBar></TheNavBar>
    <div class="columns">
      <div class="column is-10 is-offset-1">
        <b-tabs position="is-centered" class="block">
          <b-tab-item class="spacing" label="System">
            <Status></Status>
            <AdministratorList></AdministratorList>
          </b-tab-item>
          <b-tab-item class="spacing is-moodle" label="Moodle">
            <SetCourseNotifications></SetCourseNotifications>
            <SetRefreshRate></SetRefreshRate>
          </b-tab-item>
          <b-tab-item class="spacing" label="Connectors">
            <ConnectorsList></ConnectorsList>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import AdministratorList from '../components/administration/AdministratorList.vue';
import SetCourseNotifications from '../components/moodle/SetCourseNotifications.vue';
import ConnectorsList from '../components/connectors/ConnectorsList.vue';
import SetRefreshRate from '../components/moodle/SetRefreshRate.vue';
import TheNavBar from '../components/TheNavBar.vue';
import Status from '../components/statusboard/Status.vue';

export default {
  name: 'DashboardView',
  components: {
    AdministratorList,
    SetCourseNotifications,
    ConnectorsList,
    SetRefreshRate,
    TheNavBar,
    Status,
  },
};
</script>

<style scoped>
.spacing > * {
  padding-bottom: 16px;
}
</style>
