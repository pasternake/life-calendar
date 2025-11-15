
import React, { forwardRef } from 'react';

interface LifeCalendarProps {
  weeksLived: number;
  birthDate: string;
}

const TOTAL_YEARS = 90;
const WEEKS_IN_YEAR = 52;

const LifeCalendar = forwardRef<HTMLDivElement, LifeCalendarProps>(({ weeksLived, birthDate }, ref) => {
  return (
    <div ref={ref} className="bg-gray-900 text-white p-4 sm:p-6 md:p-8 font-sans inline-block">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">My Life in Weeks</h2>
        <p className="text-gray-400">90 Years · 4680 Weeks</p>
        {birthDate && <p className="text-xs text-gray-500 mt-1">Born: {birthDate}</p>}
      </div>

      <div className="flex items-start">
        <div className="grid gap-y-[3px]" style={{ gridTemplateRows: `repeat(${TOTAL_YEARS}, 1fr)`}}>
          {Array.from({ length: TOTAL_YEARS }).map((_, yearIndex) => (
            <div key={yearIndex} className="h-4 text-xs text-gray-500 pr-3 text-right flex items-center justify-end font-mono">
              { (yearIndex + 1) % 5 === 0 && (yearIndex + 1) }
            </div>
          ))}
        </div>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, 1fr)` }}>
          {Array.from({ length: TOTAL_YEARS * WEEKS_IN_YEAR }).map((_, weekNumber) => {
            const year = Math.floor(weekNumber / WEEKS_IN_YEAR) + 1;
            const week = (weekNumber % WEEKS_IN_YEAR) + 1;
            const isLived = weekNumber < weeksLived;
            return (
              <div
                key={weekNumber}
                className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm transition-colors duration-300 ${
                  isLived ? 'bg-indigo-400 hover:bg-indigo-300' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={`Year ${year}, Week ${week}`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default LifeCalendar;
