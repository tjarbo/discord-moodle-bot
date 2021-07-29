<template>
  <div id="connectorslist">
    <b-loading :is-full-page="false" :active="connectorsListGetStatus.pending"></b-loading>
    <div class="actions pb-4">
      <nav class="level">
        <div class="level-left"></div>
        <div class="level-right">
          <div class="level-item">
            <connector-create />
          </div>
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
import ConnectorCreate from './ConnectorCreate.vue';

export default {
  name: 'ConnectorsList',
  components: {
    ConnectorPanel,
    ConnectorCreate,
  },
  computed: {
    ...mapGetters(['connectorsListGetData', 'connectorsListGetStatus']),
  },
  data: () => ({
    showCreate: false,
  }),
  methods: {
    onCreate() {
      this.showCreate = true;
    },
  },
  mounted() {
    this.$store.dispatch('loadConnectors');
  },
};
</script>

<style>

</style>
