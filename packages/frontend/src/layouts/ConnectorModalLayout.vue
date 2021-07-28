<template>
  <b-modal @close="onClose" :active.sync="active" :can-cancel.sync="canClose" :width="720" scroll="keep">
    <div class="box">
      <h1 class="title">{{title}}</h1>
      <slot />
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'ConnectorModalLayout',
  methods: {
    onClose() {
      this.$emit('close');
    },
  },
  props: {
    title: String,
    active: Boolean,
    canClose: Boolean,
  },
};
</script>

<style>
</style>
