
import React, { useState, useRef, useMemo, useCallback } from 'react';
import LifeCalendar from './components/LifeCalendar';
import Controls from './components/Controls';
import type { PaperSize, Language } from './types';
import { t } from './i18n/utils';

// Declare global libraries loaded via script tags
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const getInitialLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ru' ? 'ru' : 'en';
};

const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('1990-01-01');
  const [paperSize, setPaperSize] = useState<PaperSize>('A3');
  const [language, setLanguage] = useState<Language>(getInitialLanguage());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const weeksLived = useMemo(() => {
    if (!birthDate) return 0;
    try {
      const dob = new Date(birthDate);
      const today = new Date();
      const diffInMillis = today.getTime() - dob.getTime();
      if (diffInMillis < 0) return 0;
      return Math.floor(diffInMillis / (1000 * 60 * 60 * 24 * 7));
    } catch (error) {
      return 0;
    }
  }, [birthDate]);

  const handleDownloadPdf = useCallback(async () => {
    if (!calendarRef.current || !window.jspdf || !window.html2canvas) {
      alert(t(language, 'pdfAlert'));
      return;
    }
    setIsGenerating(true);

    try {
      const { jsPDF } = window.jspdf;
      const calendarElement = calendarRef.current;
      
      const canvas = await window.html2canvas(calendarElement, {
        scale: 3,
        backgroundColor: '#111827', // bg-gray-900
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: paperSize.toLowerCase(),
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = pdfWidth - 20; // with margin
      let imgHeight = imgWidth / canvasAspectRatio;

      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * canvasAspectRatio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`life-calendar-${birthDate}-${paperSize}.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert(t(language, 'pdfError'));
    } finally {
      setIsGenerating(false);
    }
  }, [paperSize, birthDate, language]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{t(language, 'title')}</h1>
          <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">{t(language, 'subtitle')}</p>
        </header>
        
        <Controls
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          language={language}
          setLanguage={setLanguage}
          onDownload={handleDownloadPdf}
          isGenerating={isGenerating}
        />

        <div className="mt-8 bg-gray-800/50 rounded-lg shadow-2xl p-4 sm:p-6 overflow-x-auto">
          <LifeCalendar ref={calendarRef} weeksLived={weeksLived} birthDate={birthDate} language={language}/>
        </div>
        
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>{t(language, 'footer')}</p>
        </footer>
      </div>
    </main>
  );
};

export default App;
