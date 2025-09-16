import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

const base = import.meta.env.BASE_URL || '/'

i18n
  .use(HttpBackend) // load translations via HTTP
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n down to react-i18next
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'zh'],
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: `${base}locales/{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },
    react: { useSuspense: true },
    interpolation: { escapeValue: false },
  })

export default i18n
