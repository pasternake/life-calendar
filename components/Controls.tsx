import React from 'react';
import type { PaperSize, Language, Theme } from '../types';
import { t } from '../i18n/utils';

interface ControlsProps {
  birthDate: string;
  setBirthDate: (date: string) => void;
  paperSize: PaperSize;
  setPaperSize: (size: PaperSize) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

const SunIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);


const Controls: React.FC<ControlsProps> = ({
  birthDate,
  setBirthDate,
  paperSize,
  setPaperSize,
  language,
  setLanguage,
  theme,
  setTheme,
  onDownload,
  isGenerating,
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toRuFormat = (isoDate: string): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const baseInputClasses = "w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2";

  const dateInputControl = language === 'ru' ? (
    <div className="relative">
      <input
        type="text"
        value={toRuFormat(birthDate)}
        readOnly
        placeholder="ДД.ММ.ГГГГ"
        className={`${baseInputClasses} border-gray-300 dark:border-gray-600 cursor-pointer`}
      />
      <input
        type="date"
        id="birthDate"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={t(language, 'dobLabel')}
      />
    </div>
  ) : (
    <input
        type="date"
        id="birthDate"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className={`${baseInputClasses} border-gray-300 dark:border-gray-600`}
      />
  );

  return (
    <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-sm sticky top-4 z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-end">
        
        {/* Date of Birth Input */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t(language, 'dobLabel')}
          </label>
          {dateInputControl}
        </div>

        {/* Paper Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t(language, 'paperSizeLabel')}
          </label>
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1">
            {(['A3', 'A2'] as PaperSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  paperSize === size
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-gray-500 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Language & Theme Selection */}
        <div className="flex items-end gap-2">
           <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t(language, 'languageLabel')}
            </label>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1">
              {(['en', 'ru'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    language === lang
                      ? 'bg-indigo-500 text-white shadow'
                      : 'text-gray-500 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 invisible">
                Theme
            </label>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
           </div>
        </div>

        {/* Download Button */}
        <button
          onClick={onDownload}
          disabled={isGenerating}
          className="w-full flex justify-center items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t(language, 'generatingButton')}
            </>
          ) : (
            t(language, 'downloadButton')
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;