import React, { forwardRef, useState, useMemo } from 'react';
import type { Language, Goals } from '../types';
import { t } from '../i18n/utils';
import GoalModal from './GoalModal';

interface LifeCalendarProps {
  weeksLived: number;
  birthDate: string;
  language: Language;
  goals: Goals;
  onSetGoal: (weekNumber: number, goalText: string) => void;
  onDeleteGoal: (weekNumber: number) => void;
}

const TOTAL_YEARS = 90;
const WEEKS_IN_YEAR = 52;

const LifeCalendar = forwardRef<HTMLDivElement, LifeCalendarProps>(
  ({ weeksLived, birthDate, language, goals, onSetGoal, onDeleteGoal }, ref) => {
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

    /**
     * Parses a 'YYYY-MM-DD' string into a Date object at midnight UTC.
     * Using UTC prevents issues with local timezones and daylight saving.
     * @param dateString The date string to parse.
     * @returns A Date object or null if the string is invalid.
     */
    const parseDateAsUTC = (dateString: string): Date | null => {
      if (!dateString) return null;
      
      const parts = dateString.split('-');
      if (parts.length !== 3) return null;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

      const date = new Date(Date.UTC(year, month, day));

      // Verify that the created date is valid and wasn't rolled over by the Date constructor
      // e.g., for an invalid date like '2023-02-30'.
      if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
        return date;
      }
      
      return null;
    };


    const formatDate = (date: Date, lang: Language): string => {
      // Dates are in UTC, so format them according to UTC to avoid timezone shifts.
      if (lang === 'ru') {
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
    };
    
    const getWeekDateRange = (weekNumber: number): string => {
      const dob = parseDateAsUTC(birthDate);
      if (!dob) return '';

      try {
        const yearIndex = Math.floor(weekNumber / WEEKS_IN_YEAR);
        const weekIndexInYear = weekNumber % WEEKS_IN_YEAR;
        
        // The start of the year-row is the anniversary for that year.
        const currentAnniversary = new Date(Date.UTC(dob.getUTCFullYear() + yearIndex, dob.getUTCMonth(), dob.getUTCDate()));

        // The start of the week is 7 days * week index from the anniversary.
        const startDate = new Date(currentAnniversary.getTime());
        startDate.setUTCDate(startDate.getUTCDate() + weekIndexInYear * 7);

        const endDate = new Date(startDate.getTime());

        // For the last week of the year, extend it to the day before the next anniversary
        // to account for the extra 1-2 days in a year (365/366 vs 364).
        if (weekIndexInYear === WEEKS_IN_YEAR - 1) {
          const nextAnniversary = new Date(Date.UTC(dob.getUTCFullYear() + yearIndex + 1, dob.getUTCMonth(), dob.getUTCDate()));
          endDate.setTime(nextAnniversary.getTime() - (24 * 60 * 60 * 1000)); // Subtract one day in milliseconds
        } else {
          endDate.setUTCDate(endDate.getUTCDate() + 6);
        }
        
        return `${formatDate(startDate, language)} - ${formatDate(endDate, language)}`;
      } catch (e) {
        console.error("Error calculating date range:", e);
        return '';
      }
    };

    const getWeekClass = (weekNumber: number) => {
      if (goals[weekNumber]) {
        return 'bg-amber-400 hover:bg-amber-300 cursor-pointer';
      }
      if (weekNumber < weeksLived) {
        return 'bg-indigo-400 hover:bg-indigo-300 cursor-pointer';
      }
      return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer';
    };

    const getWeekTitle = (weekNumber: number) => {
      const year = Math.floor(weekNumber / WEEKS_IN_YEAR) + 1;
      const week = (weekNumber % WEEKS_IN_YEAR) + 1;
      const dateRange = getWeekDateRange(weekNumber);

      if (goals[weekNumber]) {
        return t(language, 'goalDetailsTooltip', { year, week, dateRange, goal: goals[weekNumber] });
      }
      return t(language, 'weekDetailsTooltip', { year, week, dateRange });
    };

    const formattedBirthDate = useMemo(() => {
      const dob = parseDateAsUTC(birthDate);
      if (!dob) {
        return birthDate; // Fallback to original string if parsing fails
      }
      try {
        return formatDate(dob, language);
      } catch(e) {
        return birthDate;
      }
    }, [birthDate, language]);

    return (
      <>
        <div ref={ref} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 md:p-8 font-sans inline-block">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{t(language, 'calendarTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t(language, 'calendarSubtitle')}</p>
            {birthDate && <p className="text-xs text-gray-500 mt-1">{t(language, 'bornLabel', { birthDate: formattedBirthDate })}</p>}
          </div>

          <div className="flex">
            <div className="grid gap-y-0.5 mr-3 text-right font-mono text-xs text-gray-400 dark:text-gray-500">
              {Array.from({ length: TOTAL_YEARS }).map((_, yearIndex) => (
                <div key={yearIndex} className="h-3 md:h-3.5 flex items-center justify-end">
                  {(yearIndex + 1) % 5 === 0 && (yearIndex + 1)}
                </div>
              ))}
            </div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, 1fr)` }}>
              {Array.from({ length: TOTAL_YEARS * WEEKS_IN_YEAR }).map((_, weekNumber) => (
                <div
                  key={weekNumber}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm transition-colors duration-300 ${getWeekClass(weekNumber)}`}
                  title={getWeekTitle(weekNumber)}
                  onClick={() => setSelectedWeek(weekNumber)}
                  role="button"
                  aria-label={`Set goal for week ${weekNumber + 1}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        {selectedWeek !== null && (
          <GoalModal
            isOpen={selectedWeek !== null}
            onClose={() => setSelectedWeek(null)}
            onSave={(goalText) => {
              onSetGoal(selectedWeek, goalText);
              setSelectedWeek(null);
            }}
            onDelete={() => {
              onDeleteGoal(selectedWeek);
              setSelectedWeek(null);
            }}
            initialGoalText={goals[selectedWeek] || ''}
            year={Math.floor(selectedWeek / WEEKS_IN_YEAR) + 1}
            week={(selectedWeek % WEEKS_IN_YEAR) + 1}
            language={language}
          />
        )}
      </>
    );
  }
);

export default LifeCalendar;
