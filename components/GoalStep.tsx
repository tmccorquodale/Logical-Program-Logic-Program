import React, { useRef, useEffect } from 'react';

interface GoalStepProps {
  programName: string;
  setProgramName: (name: string) => void;
  goal: string;
  setGoal: (goal: string) => void;
}

export const GoalStep: React.FC<GoalStepProps> = ({ programName, setProgramName, goal, setGoal }) => {
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
        <div className="absolute top-0 left-0 w-full h-2 bg-nsw-blue" />
        
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-4">
            Program Name
          </h2>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g. NSW Clinical Trials Capacity Building Program"
            className="w-full p-4 text-xl font-bold border-b-2 border-gray-100 focus:border-nsw-blue transition-all outline-none bg-transparent placeholder:text-gray-200"
          />
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-4">
          Define the Overarching Goal/Vision
        </h2>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          In one sentence, what is the ultimate goal of this program? (e.g. to increase the capacity and capability of the NSW Clinical Trials workforce)
        </p>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. To reduce healthcare inequality by providing affordable diagnostic tools to rural communities..."
            className="w-full min-h-[200px] p-6 text-2xl font-medium border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-nsw-light-blue/10 focus:border-nsw-light-blue transition-all outline-none resize-none bg-gray-50/50 focus:bg-white placeholder:text-gray-300"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
            Click to edit your vision
          </div>
        </div>
      </div>
    </div>
  );
};
