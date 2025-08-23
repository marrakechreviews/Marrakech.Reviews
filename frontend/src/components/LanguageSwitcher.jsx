import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const languages = [
  { code: 'en', lang: 'English' },
  { code: 'es', lang: 'Español' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lng) => (
        <Button
          key={lng.code}
          variant={i18n.language === lng.code ? 'secondary' : 'ghost'}
          onClick={() => changeLanguage(lng.code)}
        >
          {lng.lang}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
