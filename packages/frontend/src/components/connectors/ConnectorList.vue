<template>
  <div id="connectorslist">
    <b-loading :is-full-page="false" :active="connectorsListGetStatus.pending"></b-loading>
    <div class="actions pb-4">
      <nav class="level">
        <div class="level-left"></div>
        <div class="level-right">
          <p class="level-item"><a class="button is-success">{{ $t('general.create') }}</a></p>
        </div>
      </nav>
    </div>
    <div class="list">
      <div class="item container has-text-centered" v-if="connectorsListGetData && connectorsListGetData.length === 0">
        {{ $t('components.connectorList.noConnectorFoundContent') }}
      </div>
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
  methods: {
    onCreate() {
      console.log('Not implemented yet');
    },
  },
  mounted() {
    this.$store.dispatch('loadConnectors');
  },
};
</script>

<style>

</style>
