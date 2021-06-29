<template>
  <div id="connectorslist">
    <b-loading :is-full-page="false" :active="connectorsListGetStatus.pending"></b-loading>
    <div class="actions pb-4">
      <nav class="level">
        <div class="level-left"></div>
        <div class="level-right">
          <p class="level-item">All</p>
          <p class="level-item">Active</p>
          <p class="level-item">Inactive</p>
          <p class="level-item"><a class="button is-success">Create</a></p>
        </div>
      </nav>
    </div>
    <div class="list">
      <div class="item" v-for="connector in connectorsListGetData" :key="connector._id">
        <ConnectorPanel :connector="connector"></ConnectorPanel>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ConnectorPanel from './ConnectorPanel.vue';

export default {
  name: 'ConnectorsList',
  components: {
    ConnectorPanel,
  },
  computed: {
    ...mapGetters(['connectorsListGetData', 'connectorsListGetStatus']),
  },
  mounted() {
    this.$store.dispatch('loadConnectors');
  },
};
</script>

<style>

</style>
