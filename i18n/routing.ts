import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'de', 'it', 'pt'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/chat': {
      en: '/chat',
      es: '/chat',
      fr: '/chat',
      de: '/chat',
      it: '/chat',
      pt: '/chat'
    },
    '/about': {
      en: '/about',
      es: '/acerca-de',
      fr: '/a-propos',
      de: '/uber-uns',
      it: '/chi-siamo',
      pt: '/sobre'
    },
    '/auth/signin': {
      en: '/auth/signin',
      es: '/auth/iniciar-sesion',
      fr: '/auth/connexion',
      de: '/auth/anmelden',
      it: '/auth/accedi',
      pt: '/auth/entrar'
    },
    '/auth/verified': {
      en: '/auth/verified',
      es: '/auth/verificado',
      fr: '/auth/verifie',
      de: '/auth/verifiziert',
      it: '/auth/verificato',
      pt: '/auth/verificado'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];