import en from './lang/en.json';
import pt from './lang/pt.json';
import es from './lang/es.json';
import zh from './lang/zh.json';

const languages = { en, pt, es, zh };

function getUserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

const currentLang = getUserLanguage();

export const i18n = languages[currentLang] || languages.en;
