<template>
  <div id="dashboardview">
    <the-nav-bar></the-nav-bar>
    <div class="columns">
      <div class="column is-10 is-offset-1">
        <b-tabs position="is-centered" class="block">
          <b-tab-item class="spacing" label="Administration">
            <add-administrator></add-administrator>
          </b-tab-item>
          <b-tab-item class="spacing is-moodle" label="Moodle">
            <set-course-notifications></set-course-notifications>
            <set-refresh-rate></set-refresh-rate>
          </b-tab-item>
          <b-tab-item class="spacing" label="Bots">
            <set-discord-channel></set-discord-channel>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import AddAdministrator from '../components/administration/AddAdministrator.vue';
import SetCourseNotifications from '../components/moodle/SetCourseNotifications.vue';
import SetDiscordChannel from '../components/bots/SetDiscordChannel.vue';
import SetRefreshRate from '../components/moodle/SetRefreshRate.vue';
import TheNavBar from '../components/TheNavBar.vue';

export default {
  name: 'DashboardView',
  components: {
    AddAdministrator,
    SetCourseNotifications,
    SetDiscordChannel,
    SetRefreshRate,
    TheNavBar,
  },
};
</script>

<style scoped>
.spacing > * {
  padding-bottom: 16px;
}
</style>
