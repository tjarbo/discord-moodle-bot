<template>
  <div id="dashboardview">
    <TheNavBar></TheNavBar>
    <div class="columns">
      <div class="column is-10 is-offset-1">
        <b-tabs position="is-centered" class="block">
          <b-tab-item label="Administration">
            <add-administrator></add-administrator>
          </b-tab-item>
          <b-tab-item label="Moodle">
            <course-selection></course-selection>
            <refresh-rate-input></refresh-rate-input>
          </b-tab-item>
          <b-tab-item label="Discord">
            <discord-channel-input></discord-channel-input>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import RefreshRateInput from '../components/moodle/RefreshRateInput.vue';
import TheNavBar from '../components/TheNavBar.vue';
import CourseSelection from '../components/moodle/CourseSelection.vue';
import DiscordChannelInput from '../components/DiscordChannelInput.vue';
import AddAdministrator from '../components/administration/AddAdministrator.vue';

export default {
  name: 'DashboardView',
  components: {
    RefreshRateInput,
    TheNavBar,
    AddAdministrator,
    CourseSelection,
    DiscordChannelInput,
  },
};
</script>

<style scoped>
</style>
