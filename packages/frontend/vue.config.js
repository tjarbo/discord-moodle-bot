// vue.config.js
module.exports = {
  // options...
  devServer: {
    disableHostCheck: true,
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
};
