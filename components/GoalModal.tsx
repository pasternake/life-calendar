
import React, { useState, useEffect, useCallback } from 'react';
import type { Language } from '../types';
import { t } from '../i18n/utils';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalText: string) => void;
  onDelete: () => void;
  initialGoalText: string;
  year: number;
  week: number;
  language: Language;
}

const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialGoalText,
  year,
  week,
  language,
}) => {
  const [text, setText] = useState(initialGoalText);

  useEffect(() => {
    setText(initialGoalText);
  }, [initialGoalText]);

  const handleSave = () => {
    onSave(text);
  };
  
  const handleDelete = () => {
    onDelete();
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="goal-modal-title" className="text-xl font-bold text-white mb-4">
          {t(language, 'goalModalTitle', { year, week })}
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t(language, 'goalInputPlaceholder')}
          className="w-full h-32 bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-base resize-none"
          autoFocus
        />

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto justify-center inline-flex items-center bg-indigo-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-indigo-700 disabled:bg-indigo-800 transition-colors"
          >
            {t(language, 'saveButton')}
          </button>
           {initialGoalText && (
             <button
               onClick={handleDelete}
               className="w-full sm:w-auto justify-center inline-flex items-center bg-red-600/80 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-red-700 transition-colors"
             >
               {t(language, 'deleteButton')}
             </button>
           )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto justify-center inline-flex items-center bg-gray-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-gray-500 transition-colors sm:mr-auto"
          >
            {t(language, 'closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
