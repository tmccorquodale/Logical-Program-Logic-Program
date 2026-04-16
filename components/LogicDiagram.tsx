import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { ProgramLogic, Aim } from '../types';

interface LogicDiagramProps {
  data: ProgramLogic;
}

export const LogicDiagram: React.FC<LogicDiagramProps> = ({ data }) => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const downloadImage = () => {
    if (diagramRef.current === null) {
      return;
    }

    toPng(diagramRef.current, { cacheBust: true, backgroundColor: '#f3f4f6' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Program_Logic_Diagram_${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  };

  const categories = [
    { title: 'Needs', key: 'needs' as const },
    { title: 'Aims', key: 'aims' as const },
    { title: 'Inputs', key: 'inputs' as const },
    { title: 'Activities', key: 'activities' as const },
    { title: 'Outputs', key: 'outputs' as const },
    { title: 'Short Term Impacts', key: 'shortTermImpacts' as const },
    { title: 'Long Term Impacts', key: 'longTermImpacts' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={downloadImage}
          className="bg-nsw-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-nsw-blue/90 transition-all text-sm flex items-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-lg">image</span>
          Download as Image
        </button>
      </div>

      <div className="overflow-x-auto pb-6">
        <div 
          ref={diagramRef} 
          className="min-w-[1600px] p-12 bg-gray-50 rounded-3xl border border-gray-200 shadow-inner"
        >
          {/* Goal Header */}
          <div className="mb-12">
            <div className="w-full bg-nsw-blue text-white px-10 py-8 rounded-2xl shadow-xl border-4 border-white text-center">
              <h3 className="text-2xl font-black uppercase tracking-widest mb-2">
                {data.programName || 'Program Logic'}
              </h3>
              <p className="text-base font-normal opacity-90 max-w-4xl mx-auto">
                {data.goal || 'Not Defined'}
              </p>
            </div>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-7 gap-4 mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-2 z-20">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white p-3 rounded-xl shadow-sm border-2 border-nsw-blue/10 text-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-nsw-blue">{cat.title}</h4>
              </div>
            ))}
          </div>

          {/* Hierarchical Flow */}
          <div className="flex flex-col gap-8">
            {data.needs.length === 0 ? (
              <div className="p-20 text-center text-gray-300 italic bg-white rounded-2xl border-2 border-dashed">
                No data to display.
              </div>
            ) : data.needs.map((need) => (
              <div key={need.id} className="grid grid-cols-7 gap-4 items-stretch">
                {/* Need Box */}
                <div className="col-span-1 flex items-stretch">
                  <div className="w-full p-4 rounded-xl shadow-sm border border-gray-200 bg-white text-xs font-bold text-center leading-relaxed flex items-center justify-center">
                    {need.description}
                  </div>
                </div>

                {/* Aims and beyond */}
                <div className="col-span-6 flex flex-col gap-4">
                  {need.aims.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-300 italic text-xs border-2 border-dashed rounded-xl">
                      No Aims defined
                    </div>
                  ) : need.aims.map((aim) => (
                    <div key={aim.id} className="grid grid-cols-6 gap-4 items-stretch flex-1">
                      {/* Aim Box */}
                      <div className="col-span-1 flex items-stretch">
                        <div className="w-full p-4 rounded-xl shadow-sm border border-nsw-blue/20 bg-nsw-blue text-white text-xs font-bold text-center leading-relaxed flex items-center justify-center">
                          {aim.description}
                        </div>
                      </div>

                      {/* Details Columns */}
                      <div className="col-span-5 flex flex-col gap-2">
                        {(() => {
                          const detailCols = [
                            { key: 'inputs', color: 'bg-white' },
                            { key: 'activities', color: 'bg-white' },
                            { key: 'outputs', color: 'bg-white' },
                            { key: 'shortTermImpacts', color: 'bg-nsw-light-blue/10 text-nsw-blue border-nsw-light-blue/20' },
                            { key: 'longTermImpacts', color: 'bg-nsw-light-blue/10 text-nsw-blue border-nsw-light-blue/20 font-bold' }
                          ];
                          
                          const maxItems = Math.max(
                            ...detailCols.map(c => ((aim[c.key as keyof Aim] as string[]) || []).length)
                          );

                          if (maxItems === 0) {
                            return (
                              <div className="grid grid-cols-5 gap-4 flex-1">
                                {detailCols.map(c => (
                                  <div key={c.key} className="border border-dashed border-gray-200 rounded-xl min-h-[60px]" />
                                ))}
                              </div>
                            );
                          }

                          return Array.from({ length: maxItems }).map((_, i) => (
                            <div key={i} className="grid grid-cols-5 gap-4 items-stretch">
                              {detailCols.map(col => {
                                const items = (aim[col.key as keyof Aim] as string[]) || [];
                                const text = items[i];
                                return (
                                  <div key={col.key} className="col-span-1 flex items-stretch">
                                    {text ? (
                                      <div className={`w-full p-3 rounded-lg shadow-sm border border-gray-100 text-[10px] leading-tight flex items-center ${col.color}`}>
                                        {text}
                                      </div>
                                    ) : (
                                      <div className="w-full min-h-[40px]" /> 
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
