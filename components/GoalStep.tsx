
import React, { useRef, useEffect } from 'react';

interface GoalStepProps {
  goal: string;
  setGoal: (goal: string) => void;
}

export const GoalStep: React.FC<GoalStepProps> = ({ goal, setGoal }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [goal]);

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-4">
          <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-xl">1</span>
          Define the Overarching Goal
        </h2>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Start by defining the ultimate "North Star" for your program. What is the highest level of change you want to see in the world as a result of your work?
        </p>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. To reduce healthcare inequality by providing affordable diagnostic tools to rural communities..."
            className="w-full min-h-[200px] p-6 text-2xl font-medium border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none resize-none bg-gray-50/50 focus:bg-white placeholder:text-gray-300"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
            Click to edit your vision
          </div>
        </div>
      </div>
    </div>
  );
};
