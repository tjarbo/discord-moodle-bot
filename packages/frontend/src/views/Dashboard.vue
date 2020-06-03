<template>
    <div id="dashboardview">
      <NavBar></NavBar>
      <RefreshRateInput></RefreshRateInput>
      <DiscordChannelInput></DiscordChannelInput>
      <CourseSelection></CourseSelection>
    </div>
</template>

<script>
import RefreshRateInput from '../components/RefreshRateInput.vue';
import NavBar from '../components/NavBar.vue';
import CourseSelection from '../components/CourseSelection.vue';
import DiscordChannelInput from '../components/DiscordChannelInput.vue';

export default {
  name: 'DashboardView',
  components: {
    RefreshRateInput, NavBar, CourseSelection, DiscordChannelInput,
  },
};
</script>

<style scoped>

</style>
