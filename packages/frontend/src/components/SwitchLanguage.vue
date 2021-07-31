<template>
  <b-field id="switchlanguage">
    <b-select v-model="$i18n.locale">
      <option
        v-for="lang in langs"
        v-bind:value="lang.key"
        v-bind:key="lang.key"
        >
          {{ lang.name }}
      </option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  name: 'SwitchLanguage',
  data: () => {
    return {
      langs: [
        { key: 'en', name: 'English' },
        { key: 'de', name: 'Deutsch'  },
      ]
    };
  },
};
</script>
