<template>
  <div id="dashboardview">
    <TheNavBar></TheNavBar>
    <div class="columns">
      <div class="column is-10 is-offset-1">
        <b-tabs position="is-centered" class="block">
          <b-tab-item class="spacing" label="Statusboard">
            <Status></Status>
          </b-tab-item>
          <b-tab-item class="spacing" label="Administration">
            <AdministratorList></AdministratorList>
            <AddAdministrator></AddAdministrator>
          </b-tab-item>
          <b-tab-item class="spacing is-moodle" label="Moodle">
            <SetCourseNotifications></SetCourseNotifications>
            <SetRefreshRate></SetRefreshRate>
          </b-tab-item>
          <b-tab-item class="spacing" label="Discord">
            <DiscordPanel></DiscordPanel>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import AddAdministrator from '../components/administration/AddAdministrator.vue';
import AdministratorList from '../components/administration/AdministratorList.vue';
import SetCourseNotifications from '../components/moodle/SetCourseNotifications.vue';
import DiscordPanel from '../components/discord/DiscordPanel.vue';
import SetRefreshRate from '../components/moodle/SetRefreshRate.vue';
import TheNavBar from '../components/TheNavBar.vue';
import Status from '../components/statusboard/Status.vue';

export default {
  name: 'DashboardView',
  components: {
    AddAdministrator,
    AdministratorList,
    SetCourseNotifications,
    DiscordPanel,
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
