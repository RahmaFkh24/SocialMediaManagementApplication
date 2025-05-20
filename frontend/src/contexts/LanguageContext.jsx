/*import React, { createContext, useState, useContext, useEffect } from 'react';
import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';
import arTranslations from '@/locales/ar.json';

const LanguageContext = createContext();

const translationsFiles = {
    en: enTranslations,
    fr: frTranslations,
    ar: arTranslations,
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const storedLang = localStorage.getItem('appLanguage');
        return storedLang || 'en';
    });

    const [translations, setTranslations] = useState(translationsFiles[language]);

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
        setTranslations(translationsFiles[language]);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);*/