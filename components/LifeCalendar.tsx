
import React, { forwardRef, useState } from 'react';
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

    const getWeekClass = (weekNumber: number) => {
      if (goals[weekNumber]) {
        return 'bg-amber-400 hover:bg-amber-300 cursor-pointer';
      }
      if (weekNumber < weeksLived) {
        return 'bg-indigo-400 hover:bg-indigo-300 cursor-pointer';
      }
      return 'bg-gray-700 hover:bg-gray-600 cursor-pointer';
    };

    const getWeekTitle = (weekNumber: number) => {
      const year = Math.floor(weekNumber / WEEKS_IN_YEAR) + 1;
      const week = (weekNumber % WEEKS_IN_YEAR) + 1;
      if (goals[weekNumber]) {
        return t(language, 'goalSetTooltip', { year, week, goal: goals[weekNumber] });
      }
      return t(language, 'weekTitle', { year, week });
    };

    return (
      <>
        <div ref={ref} className="bg-gray-900 text-white p-4 sm:p-6 md:p-8 font-sans inline-block">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">{t(language, 'calendarTitle')}</h2>
            <p className="text-gray-400">{t(language, 'calendarSubtitle')}</p>
            {birthDate && <p className="text-xs text-gray-500 mt-1">{t(language, 'bornLabel', { birthDate })}</p>}
          </div>

          <div className="flex items-start">
            <div className="grid gap-y-0.5">
              {Array.from({ length: TOTAL_YEARS }).map((_, yearIndex) => (
                <div key={yearIndex} className="h-3 md:h-3.5 text-xs text-gray-500 pr-3 text-right flex items-center justify-end font-mono">
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
