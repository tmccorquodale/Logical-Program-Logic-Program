import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ProgramLogic, Aim } from '../types';

interface LogicDiagramProps {
  data: ProgramLogic;
}

export const LogicDiagram: React.FC<LogicDiagramProps> = ({ data }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportImage = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(diagramRef.current, { 
        cacheBust: true, 
        backgroundColor: '#f9fafb',
        pixelRatio: 2 // High quality
      });
      const link = document.createElement('a');
      link.download = `Program_Logic_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(diagramRef.current, { 
        cacheBust: true, 
        backgroundColor: '#f9fafb',
        pixelRatio: 2
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width, img.height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`Program_Logic_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsExporting(false);
    }
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
      <div className="flex justify-end gap-3 print:hidden">
        <button
          onClick={exportImage}
          disabled={isExporting}
          className="bg-white text-nsw-blue border-2 border-nsw-blue px-6 py-2 rounded-lg font-bold hover:bg-nsw-blue/5 transition-all text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">image</span>
          {isExporting ? 'Exporting...' : 'Download Image'}
        </button>
        <button
          onClick={exportPDF}
          disabled={isExporting}
          className="bg-nsw-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-nsw-blue/90 transition-all text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
          {isExporting ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>

      <div className="overflow-x-auto pb-6">
        <div 
          id="printable-diagram"
          ref={diagramRef} 
          className="min-w-[1600px] p-12 bg-gray-50 rounded-3xl border border-gray-200 shadow-inner"
        >
          {/* Goal Header */}
          <div className="w-full bg-nsw-blue text-white px-10 py-8 rounded-2xl shadow-xl border-4 border-white text-center mb-12">
            <h3 className="text-[27px] font-black uppercase tracking-widest mb-2">
              {data.programName || 'Program Logic'}
            </h3>
            <p className="text-[19px] font-normal opacity-90 max-w-4xl mx-auto">
              {data.goal || 'Not Defined'}
            </p>
          </div>

          {/* Hierarchical Flow - Single Flat Grid for Perfect Alignment */}
          <div 
            className="grid grid-cols-[0.8fr_0.8fr_1.5fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-2"
            style={{ gridAutoRows: 'min-content' }}
          >
            {/* Headers Row */}
            {categories.map((cat, idx) => (
              <div 
                key={cat.title} 
                className="bg-white p-3 rounded-xl shadow-sm border-2 border-nsw-blue/10 text-center sticky top-0 z-20 mb-4 print:static print:mb-2"
                style={{ gridRow: 1, gridColumn: idx + 1 }}
              >
                <h4 className="text-[13px] font-black uppercase tracking-widest text-nsw-blue">{cat.title}</h4>
              </div>
            ))}

            {data.needs.length === 0 ? (
              <div className="col-span-7 p-20 text-center text-gray-300 italic bg-white rounded-2xl border-2 border-dashed">
                No data to display.
              </div>
            ) : (() => {
              const rows: React.ReactNode[] = [];
              let currentRow = 2; // Start after headers

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

                // Render Need Box
                rows.push(
                  <div 
                    key={`need-${need.id}`}
                    className="col-start-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-[15px] font-bold text-center leading-relaxed flex items-center justify-center"
                    style={{ gridRow: `span ${needRows} / span ${needRows}`, gridRowStart: currentRow }}
                  >
                    {need.description}
                  </div>
                );

                if (need.aims.length === 0) {
                  rows.push(
                    <div 
                      key={`no-aim-${need.id}`} 
                      className="col-start-2 col-span-6 p-10 text-center text-gray-300 italic text-[15px] border-2 border-dashed rounded-xl"
                      style={{ gridRowStart: currentRow }}
                    >
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

                    // Render Aim Box
                    rows.push(
                      <div 
                        key={`aim-${aim.id}`}
                        className="col-start-2 bg-nsw-blue text-white p-4 rounded-xl shadow-sm border border-nsw-blue/20 text-[15px] font-bold text-center leading-relaxed flex items-center justify-center"
                        style={{ gridRow: `span ${aimMaxItems} / span ${aimMaxItems}`, gridRowStart: currentRow }}
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
                        { key: 'longTermImpacts', color: 'bg-nsw-light-blue/10 text-nsw-blue border-nsw-light-blue/20' }
                      ];

                      detailCols.forEach((col, colIdx) => {
                        const items = (aim[col.key as keyof Aim] as string[]) || [];
                        const text = items[i];
                        
                        rows.push(
                          <div 
                            key={`detail-${aim.id}-${col.key}-${i}`}
                            className={`col-start-${colIdx + 3} p-3 rounded-lg text-[13px] leading-tight flex items-center ${text ? `shadow-sm border border-gray-100 ${col.color}` : 'opacity-0'}`}
                            style={{ gridRowStart: currentRow }}
                          >
                            {text || ''}
                          </div>
                        );
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
