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
    { title: 'Activities', key: 'activities' as const },
    { title: 'Inputs', key: 'inputs' as const },
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
              <h3 className="text-[27px] font-black uppercase tracking-widest mb-2">
                {data.programName || 'Program Logic'}
              </h3>
              <p className="text-[19px] font-normal opacity-90 max-w-4xl mx-auto">
                {data.goal || 'Not Defined'}
              </p>
            </div>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-[0.75fr_0.75fr_1fr_1fr_1fr_1fr_1fr] gap-4 mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-2 z-20">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white p-3 rounded-xl shadow-sm border-2 border-nsw-blue/10 text-center">
                <h4 className="text-[13px] font-black uppercase tracking-widest text-nsw-blue">{cat.title}</h4>
              </div>
            ))}
          </div>

          {/* Hierarchical Flow - Flat Grid for Perfect Alignment */}
          <div 
            className="grid grid-cols-[0.75fr_0.75fr_1fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-2"
            style={{ gridAutoRows: 'min-content' }}
          >
            {data.needs.length === 0 ? (
              <div className="col-span-7 p-20 text-center text-gray-300 italic bg-white rounded-2xl border-2 border-dashed">
                No data to display.
              </div>
            ) : (() => {
              const rows: React.ReactNode[] = [];
              let currentRow = 1;

              data.needs.forEach((need) => {
                // Calculate total rows for this need
                const needRows = need.aims.length === 0 ? 1 : need.aims.reduce((acc, aim) => {
                  const maxItems = Math.max(
                    1,
                    aim.activities.length,
                    aim.inputs.length,
                    aim.outputs.length,
                    aim.shortTermImpacts.length,
                    aim.longTermImpacts.length
                  );
                  return acc + maxItems;
                }, 0);

                const needStart = currentRow;

                // Render Need Box
                rows.push(
                  <div 
                    key={`need-${need.id}`}
                    className="col-start-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-[15px] font-bold text-center leading-relaxed flex items-center justify-center"
                    style={{ gridRow: `span ${needRows}` }}
                  >
                    {need.description}
                  </div>
                );

                if (need.aims.length === 0) {
                  rows.push(
                    <div key={`no-aim-${need.id}`} className="col-start-2 col-span-6 p-10 text-center text-gray-300 italic text-[15px] border-2 border-dashed rounded-xl">
                      No Aims defined
                    </div>
                  );
                  currentRow++;
                } else {
                  need.aims.forEach((aim) => {
                    const aimMaxItems = Math.max(
                      1,
                      aim.activities.length,
                      aim.inputs.length,
                      aim.outputs.length,
                      aim.shortTermImpacts.length,
                      aim.longTermImpacts.length
                    );
                    const aimStart = currentRow;

                    // Render Aim Box
                    rows.push(
                      <div 
                        key={`aim-${aim.id}`}
                        className="col-start-2 bg-nsw-blue text-white p-4 rounded-xl shadow-sm border border-nsw-blue/20 text-[15px] font-bold text-center leading-relaxed flex items-center justify-center"
                        style={{ gridRow: `span ${aimMaxItems}` }}
                      >
                        {aim.description}
                      </div>
                    );

                    // Render Detail Rows
                    for (let i = 0; i < aimMaxItems; i++) {
                      const detailCols = [
                        { key: 'activities', color: 'bg-white' },
                        { key: 'inputs', color: 'bg-white' },
                        { key: 'outputs', color: 'bg-white' },
                        { key: 'shortTermImpacts', color: 'bg-nsw-light-blue/10 text-nsw-blue border-nsw-light-blue/20' },
                        { key: 'longTermImpacts', color: 'bg-nsw-light-blue/10 text-nsw-blue border-nsw-light-blue/20 font-bold' }
                      ];

                      detailCols.forEach((col, colIdx) => {
                        const items = (aim[col.key as keyof Aim] as string[]) || [];
                        const text = items[i];
                        
                        if (text) {
                          rows.push(
                            <div 
                              key={`detail-${aim.id}-${col.key}-${i}`}
                              className={`col-start-${colIdx + 3} p-3 rounded-lg shadow-sm border border-gray-100 text-[13px] leading-tight flex items-center ${col.color}`}
                            >
                              {text}
                            </div>
                          );
                        } else if (aimMaxItems === 1 || i === 0) {
                          // Only show dashed placeholder for the first row of an aim if it's empty
                          const hasAnyInCol = items.length > 0;
                          if (!hasAnyInCol) {
                            rows.push(
                              <div 
                                key={`empty-${aim.id}-${col.key}`}
                                className={`col-start-${colIdx + 3} border border-dashed border-gray-200 rounded-xl min-h-[60px]`}
                              />
                            );
                          }
                        }
                      });
                      currentRow++;
                    }
                  });
                }
              });

              return rows;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
