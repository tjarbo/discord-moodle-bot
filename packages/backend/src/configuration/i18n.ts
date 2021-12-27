import path from 'path';
import { I18n } from 'i18n';
import { config, allowedLocales } from './environment';

const i18n = new I18n();

i18n.configure({
  locales: allowedLocales,
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  objectNotation: true,
});

i18n.setLocale(config.language);

export const t = i18n.__;
