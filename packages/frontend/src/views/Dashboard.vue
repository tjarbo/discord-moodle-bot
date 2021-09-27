<template>
  <div id="dashboardview">
    <TheNavBar></TheNavBar>
    <div class="columns">
      <div class="column is-10 is-offset-1">
        <b-tabs position="is-centered" class="block">
          <b-tab-item class="spacing" :label="$t('views.dashboard.systemLabel')">
            <TheStatusBoard></TheStatusBoard>
            <AdministratorList></AdministratorList>
          </b-tab-item>
          <b-tab-item class="spacing is-moodle" label="Moodle">
            <SetCourseNotifications></SetCourseNotifications>
            <SetRefreshRate></SetRefreshRate>
          </b-tab-item>
          <b-tab-item class="spacing" label="Connectors">
            <ConnectorList></ConnectorList>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import AdministratorList from '../components/administration/AdministratorList.vue';
import SetCourseNotifications from '../components/moodle/SetCourseNotifications.vue';
import ConnectorList from '../components/connectors/ConnectorList.vue';
import SetRefreshRate from '../components/moodle/SetRefreshRate.vue';
import TheNavBar from '../components/TheNavBar.vue';
import TheStatusBoard from '../components/TheStatusBoard.vue';

export default {
  name: 'DashboardView',
  components: {
    AdministratorList,
    SetCourseNotifications,
    ConnectorList,
    SetRefreshRate,
    TheNavBar,
    TheStatusBoard,
  },
};
</script>

<style scoped>
.spacing > * {
  padding-bottom: 16px;
}
</style>
