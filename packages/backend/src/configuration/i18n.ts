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

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const t = (...args: any[]): string => i18n.__.call(i18n, ...args) as string;
