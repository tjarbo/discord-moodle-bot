<template>
  <b-field id="thelanguageswitch">
    <b-select v-model="$i18n.locale">
      <option
        v-for="lang in langs"
        :value="lang.key"
        :key="lang.key"
        >
          {{ lang.name }}
      </option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  name: 'TheLanguageSwitch',
  data: () => ({
    langs: [
      { key: 'en', name: 'English' },
      { key: 'de', name: 'Deutsch' },
    ],
  }),
};
</script>
