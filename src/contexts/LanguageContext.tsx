import { createContext, useContext } from 'react';

import { TranslationKey, translations } from '@/lib/i18n';

interface LanguageContextValue {
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  t: key => translations.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  function t(key: TranslationKey): string {
    return translations.en[key];
  }

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
