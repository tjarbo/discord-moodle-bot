<template>
    <div id="dashboardview">
      <NavBar></NavBar>
      <RefreshRateInput></RefreshRateInput>
      <CourseSelection></CourseSelection>
    </div>
</template>

<script>
import RefreshRateInput from '../components/RefreshRateInput.vue';
import NavBar from '../components/NavBar.vue';
import CourseSelection from '../components/CourseSelection.vue';

export default {
  name: 'DashboardView',
  components: { RefreshRateInput, NavBar, CourseSelection },
};
</script>

<style scoped>

</style>
