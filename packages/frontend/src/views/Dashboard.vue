<template>
    <div id="dashboardview">
      <NavBar></NavBar>
      <RefreshRateInput></RefreshRateInput>
      <DiscordChannelInput></DiscordChannelInput>
      <CourseSelection></CourseSelection>
      <AddAdministrator></AddAdministrator>
    </div>
</template>

<script>
import RefreshRateInput from '../components/RefreshRateInput.vue';
import NavBar from '../components/NavBar.vue';
import CourseSelection from '../components/CourseSelection.vue';
import DiscordChannelInput from '../components/DiscordChannelInput.vue';
import AddAdministrator from '../components/AddAdministrator.vue';

export default {
  name: 'DashboardView',
  components: {
    RefreshRateInput,
    NavBar,
    AddAdministrator,
    CourseSelection,
    DiscordChannelInput,
  },
};
</script>

<style scoped>

</style>
