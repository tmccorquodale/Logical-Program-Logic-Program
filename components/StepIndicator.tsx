
import React from 'react';
import { StepType } from '../types';

interface StepIndicatorProps {
  currentStep: StepType;
}

const steps: { key: StepType; label: string }[] = [
  { key: 'GOAL', label: '1. Goal' },
  { key: 'NEEDS', label: '2. Needs' },
  { key: 'AIMS', label: '3. Aims' },
  { key: 'DETAILS', label: '4. Logic Details' },
  { key: 'REVIEW', label: '5. Review' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isPast = steps.findIndex(s => s.key === currentStep) > index;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-[100px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 
                isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {isPast ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-medium whitespace-nowrap ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 min-w-[20px] ${isPast ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
