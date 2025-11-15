
import type React from 'react';
import type { PaperSize, Language } from '../types';
import { t } from '../i18n/utils';

interface ControlsProps {
  birthDate: string;
  setBirthDate: (date: string) => void;
  paperSize: PaperSize;
  setPaperSize: (size: PaperSize) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  birthDate,
  setBirthDate,
  paperSize,
  setPaperSize,
  language,
  setLanguage,
  onDownload,
  isGenerating,
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-sm sticky top-4 z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-end">
        
        {/* Date of Birth Input */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-1">
            {t(language, 'dobLabel')}
          </label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          />
        </div>

        {/* Paper Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t(language, 'paperSizeLabel')}
          </label>
          <div className="flex bg-gray-700 rounded-md p-1">
            {(['A3', 'A2'] as PaperSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  paperSize === size
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t(language, 'languageLabel')}
          </label>
          <div className="flex bg-gray-700 rounded-md p-1">
            {(['en', 'ru'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  language === lang
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
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
