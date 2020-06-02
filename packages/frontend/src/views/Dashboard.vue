<template>
    <div id="dashboardview">
      <NavBar></NavBar>
      <RefreshRateInput></RefreshRateInput>
    </div>
</template>

<script>
import RefreshRateInput from '../components/RefreshRateInput.vue';
import NavBar from '../components/NavBar.vue';

export default {
  name: 'DashboardView',
  components: { RefreshRateInput, NavBar },
};
</script>

<style scoped>

</style>
