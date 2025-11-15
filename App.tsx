import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import LifeCalendar from './components/LifeCalendar';
import Controls from './components/Controls';
import type { PaperSize, Language, Goals, Theme } from './types';
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

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (storedPrefs === 'light' || storedPrefs === 'dark') {
      return storedPrefs;
    }
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

const getInitialBirthDate = (): string => {
  const today = new Date();
  // Set default to 30 years ago for a more interesting initial view
  today.setFullYear(today.getFullYear() - 30);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>(getInitialBirthDate());
  const [paperSize, setPaperSize] = useState<PaperSize>('A3');
  const [language, setLanguage] = useState<Language>(getInitialLanguage());
  const [theme, setTheme] = useState<Theme>(getInitialTheme());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [goals, setGoals] = useState<Goals>({});
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const weeksLived = useMemo(() => {
    if (!birthDate) return 0;
    try {
      const parts = birthDate.split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return 0;
      const [year, month, day] = parts;

      // Use UTC for all calculations to avoid timezone issues.
      const dob = new Date(Date.UTC(year, month - 1, day));
      
      // Check for invalid date rollover (e.g., Feb 30)
      if (dob.getUTCFullYear() !== year || dob.getUTCMonth() !== month - 1 || dob.getUTCDate() !== day) {
        return 0;
      }

      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      
      if (todayUTC.getTime() < dob.getTime()) return 0;

      // Calculate number of full years lived.
      let yearsLived = todayUTC.getUTCFullYear() - dob.getUTCFullYear();
      const anniversaryThisYear = new Date(Date.UTC(todayUTC.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
      if (todayUTC < anniversaryThisYear) {
        yearsLived--;
      }
      
      // This can be negative if birthday hasn't happened yet this year. Ensure it is at least 0.
      yearsLived = Math.max(0, yearsLived);

      // Calculate the most recent anniversary date.
      const mostRecentAnniversary = new Date(Date.UTC(dob.getUTCFullYear() + yearsLived, dob.getUTCMonth(), dob.getUTCDate()));
      
      // Calculate days passed since that anniversary.
      const diffInMillis = todayUTC.getTime() - mostRecentAnniversary.getTime();
      const daysSinceAnniversary = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
      
      // Calculate weeks passed in the current year of life, consistent with calendar display.
      const weeksInCurrentYear = Math.floor(daysSinceAnniversary / 7);
      
      // Total weeks lived is full years * 52 weeks/year + weeks into the current year of life.
      return (yearsLived * 52) + weeksInCurrentYear;
      
    } catch (error) {
      console.error("Error calculating weeks lived:", error);
      return 0;
    }
  }, [birthDate]);

  const handleSetGoal = useCallback((weekNumber: number, goalText: string) => {
    setGoals(prevGoals => {
      const newGoals = { ...prevGoals };
      if (goalText.trim() === '') {
        delete newGoals[weekNumber];
      } else {
        newGoals[weekNumber] = goalText;
      }
      return newGoals;
    });
  }, []);
  
  const handleDeleteGoal = useCallback((weekNumber: number) => {
    setGoals(prevGoals => {
      const newGoals = { ...prevGoals };
      delete newGoals[weekNumber];
      return newGoals;
    });
  }, []);

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
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
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
  }, [paperSize, birthDate, language, theme]);

  return (
    <main className="min-h-screen text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{t(language, 'title')}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t(language, 'subtitle')}</p>
        </header>
        
        <Controls
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          onDownload={handleDownloadPdf}
          isGenerating={isGenerating}
        />

        <div className="mt-8 bg-white/70 dark:bg-gray-800/50 rounded-lg shadow-2xl p-4 sm:p-6 overflow-x-auto">
          <LifeCalendar 
            ref={calendarRef} 
            weeksLived={weeksLived} 
            birthDate={birthDate} 
            language={language}
            goals={goals}
            onSetGoal={handleSetGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
        
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>{t(language, 'footer')}</p>
        </footer>
      </div>
    </main>
  );
};

export default App;
