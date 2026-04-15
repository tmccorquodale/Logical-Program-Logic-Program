import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ProgramLogic, StepType, Need, Aim } from './types';
import { StepIndicator } from './components/StepIndicator';
import { GoalStep } from './components/GoalStep';
import { ListEditor } from './components/ListEditor';
import { LogicTable } from './components/LogicTable';

const STORAGE_KEY = 'logic_builder_data_standalone_v2';

const initialLogic: ProgramLogic = {
  goal: '',
  needs: []
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('GOAL');
  const [logic, setLogic] = useState<ProgramLogic>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialLogic;
  });
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [selectedAimId, setSelectedAimId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logic));
  }, [logic]);

  const updateLogic = (updater: (prev: ProgramLogic) => ProgramLogic) => {
    setLogic(prev => updater(prev));
  };

  const nextStep = () => {
    if (currentStep === 'GOAL') setCurrentStep('NEEDS');
    else if (currentStep === 'NEEDS') {
      if (logic.needs.length > 0) {
        if (!selectedNeedId) setSelectedNeedId(logic.needs[0].id);
        setCurrentStep('AIMS');
      } else {
        alert("Please add at least one need.");
      }
    } else if (currentStep === 'AIMS') {
      const allNeedsHaveAims = logic.needs.every(n => n.aims.length > 0);
      if (allNeedsHaveAims) {
        let targetNeed = logic.needs.find(n => n.id === selectedNeedId);
        if (!targetNeed) {
          targetNeed = logic.needs[0];
          setSelectedNeedId(targetNeed.id);
        }
        
        if (!selectedAimId || !targetNeed.aims.find(a => a.id === selectedAimId)) {
          setSelectedAimId(targetNeed.aims[0].id);
        }
        setCurrentStep('DETAILS');
      } else {
        alert("Each need must have at least one aim before proceeding.");
      }
    } else if (currentStep === 'DETAILS') {
      setCurrentStep('REVIEW');
    }
  };

  const prevStep = () => {
    if (currentStep === 'NEEDS') setCurrentStep('GOAL');
    else if (currentStep === 'AIMS') setCurrentStep('NEEDS');
    else if (currentStep === 'DETAILS') setCurrentStep('AIMS');
    else if (currentStep === 'REVIEW') setCurrentStep('DETAILS');
  };

  const jumpTo = (step: StepType, needId?: string, aimId?: string) => {
    setCurrentStep(step);
    if (needId) setSelectedNeedId(needId);
    if (aimId) setSelectedAimId(aimId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      try {
        const importedGoal = data[0]?.[1] || '';
        const importedNeeds: Need[] = [];
        
        for (let i = 3; i < data.length; i++) {
          const [needTxt, aimTxt, inpTxt, actTxt, outTxt, shortTxt, longTxt] = data[i];
          if (!needTxt && !aimTxt) continue;

          let targetNeed = importedNeeds[importedNeeds.length - 1];
          if (needTxt || !targetNeed) {
            targetNeed = { id: crypto.randomUUID(), description: needTxt || 'Unspecified Need', aims: [] };
            importedNeeds.push(targetNeed);
          }

          if (aimTxt) {
            targetNeed.aims.push({
              id: crypto.randomUUID(),
              description: aimTxt,
              inputs: inpTxt ? (typeof inpTxt === 'string' ? inpTxt.split('\n') : [inpTxt.toString()]) : [],
              activities: actTxt ? (typeof actTxt === 'string' ? actTxt.split('\n') : [actTxt.toString()]) : [],
              outputs: outTxt ? (typeof outTxt === 'string' ? outTxt.split('\n') : [outTxt.toString()]) : [],
              shortTermImpacts: shortTxt ? (typeof shortTxt === 'string' ? shortTxt.split('\n') : [shortTxt.toString()]) : [],
              longTermImpacts: longTxt ? (typeof longTxt === 'string' ? longTxt.split('\n') : [longTxt.toString()]) : []
            });
          }
        }

        setLogic({ goal: importedGoal, needs: importedNeeds });
        alert("Excel data imported successfully!");
      } catch (err) {
        alert("Error parsing Excel. Use the exported template format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Program Logic');

    // 1. Goal Row
    const goalRow = worksheet.addRow(['Goal: ' + (logic.goal || 'NOT DEFINED'), '', '', '', '', '', '']);
    worksheet.mergeCells('A1:G1');
    goalRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    goalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002664' } };
    goalRow.height = 40;
    goalRow.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // 2. Headers
    const headers = ['Needs', 'Aims', 'Inputs', 'Activities', 'Outputs', 'Short Term Impacts', 'Long Term Impacts'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FF6B7280' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    headerRow.height = 30;
    headerRow.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // 3. Data Rows
    let currentRow = 3;

    if (logic.needs.length === 0) {
      const emptyRow = worksheet.addRow(['Upload an Excel file or use the wizard to build your logic.', '', '', '', '', '', '']);
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      emptyRow.font = { italic: true, color: { argb: 'FF9CA3AF' } };
      emptyRow.alignment = { vertical: 'middle', horizontal: 'center' };
      emptyRow.height = 60;
    } else {
      logic.needs.forEach((need) => {
        const startRow = currentRow;

        if (need.aims.length === 0) {
          const row = worksheet.addRow([need.description, 'No Aims defined.', '', '', '', '', '']);
          worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
          row.alignment = { vertical: 'top', wrapText: true, indent: 1 };
          row.getCell(1).font = { bold: true };
          row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          row.getCell(2).font = { italic: true, color: { argb: 'FF9CA3AF' } };
          currentRow++;
        } else {
          need.aims.forEach((aim, aIdx) => {
            const row = worksheet.addRow([
              aIdx === 0 ? need.description : '',
              aim.description,
              aim.inputs.map(i => `• ${i}`).join('\n'),
              aim.activities.map(a => `• ${a}`).join('\n'),
              aim.outputs.map(o => `• ${o}`).join('\n'),
              aim.shortTermImpacts.map(s => `• ${s}`).join('\n'),
              aim.longTermImpacts.map(l => `• ${l}`).join('\n')
            ]);

            row.alignment = { vertical: 'top', wrapText: true, indent: 1 };
            
            // Need column styling
            const needCell = row.getCell(1);
            needCell.font = { bold: true };
            needCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };

            // Aim column styling
            const aimCell = row.getCell(2);
            aimCell.font = { bold: true, color: { argb: 'FF002664' } };

            // Short Term Impacts styling
            const stCell = row.getCell(6);
            stCell.font = { color: { argb: 'FF002664' } };
            stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FAFD' } };

            // Long Term Impacts styling
            const ltCell = row.getCell(7);
            ltCell.font = { bold: true, color: { argb: 'FF002664' } };
            ltCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FAFD' } };

            currentRow++;
          });
        }

        // Merge Need cells if there are multiple aims
        if (need.aims.length > 1) {
          worksheet.mergeCells(`A${startRow}:A${currentRow - 1}`);
        }
      });
    }

    // Set column widths
    worksheet.columns = [
      { width: 25 }, // Needs
      { width: 25 }, // Aims
      { width: 30 }, // Inputs
      { width: 35 }, // Activities
      { width: 35 }, // Outputs
      { width: 35 }, // Short Term
      { width: 35 }  // Long Term
    ];

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });
    });

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Program_Logic_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCellUpdate = (needId: string, aimId: string, field: keyof Aim, value: string | string[]) => {
    updateLogic(l => ({
      ...l,
      needs: l.needs.map(n => n.id === needId ? {
        ...n,
        aims: n.aims.map(a => a.id === aimId ? { ...a, [field]: value } : a)
      } : n)
    }));
  };

  const currentNeed = logic.needs.find(n => n.id === selectedNeedId);
  const currentAim = currentNeed?.aims.find(a => a.id === selectedAimId);

  return (
    <div className="min-h-screen bg-nsw-grey flex flex-col">
      <header className="bg-nsw-blue text-white py-6 shadow-lg border-b-4 border-nsw-blue/30">
        <div className="container mx-auto px-4 max-w-[95%] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-3xl text-white inline-block -scale-x-100">square_foot</span>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Program Logic Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 text-[10px] font-bold uppercase transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Import Excel
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>
            <button 
              onClick={() => { if(confirm("Clear all current data?")) setLogic(initialLogic); }}
              className="bg-nsw-red/20 hover:bg-nsw-red/40 px-3 py-1.5 rounded-lg border border-nsw-red/30 text-[10px] font-bold uppercase transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[95%] flex-grow">
        <StepIndicator currentStep={currentStep} onStepClick={(step) => jumpTo(step)} />

        <div className="min-h-[500px] mt-4">
          {currentStep === 'GOAL' && (
            <GoalStep goal={logic.goal} setGoal={(g) => updateLogic(l => ({ ...l, goal: g }))} />
          )}

          {currentStep === 'NEEDS' && (
            <ListEditor
              title="Identify Needs"
              description="Define the core problems addressed by the program."
              items={logic.needs.map(n => ({ id: n.id, text: n.description }))}
              typeLabel="Need"
              onAdd={(text) => updateLogic(l => ({ 
                ...l, 
                needs: [...l.needs, { id: crypto.randomUUID(), description: text, aims: [] }] 
              }))}
              onRemove={(id) => updateLogic(l => ({ ...l, needs: l.needs.filter(n => n.id !== id) }))}
              onUpdate={(id, text) => updateLogic(l => ({
                ...l,
                needs: l.needs.map(n => n.id === id ? { ...n, description: text } : n)
              }))}
            />
          )}

          {currentStep === 'AIMS' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4 space-y-2">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase px-2 mb-2">Select Need</h3>
                {logic.needs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNeedId(n.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 text-xs transition-all ${
                      selectedNeedId === n.id ? 'bg-nsw-blue border-nsw-blue text-white shadow-md' : 'bg-white border-gray-100 text-gray-500'
                    }`}
                  >
                    {n.description.substring(0, 50)}...
                  </button>
                ))}
              </div>
              <div className="flex-1">
                {selectedNeedId ? (
                  <ListEditor
                    title="Aims"
                    description="Outcomes for the selected need."
                    items={currentNeed?.aims.map(a => ({ id: a.id, text: a.description })) || []}
                    typeLabel="Aim"
                    onAdd={(text) => updateLogic(l => ({
                      ...l,
                      needs: l.needs.map(n => n.id === selectedNeedId ? {
                        ...n,
                        aims: [...n.aims, { id: crypto.randomUUID(), description: text, inputs: [], activities: [], outputs: [], shortTermImpacts: [], longTermImpacts: [] }]
                      } : n)
                    }))}
                    onRemove={(id) => updateLogic(l => ({
                      ...l,
                      needs: l.needs.map(n => n.id === selectedNeedId ? { ...n, aims: n.aims.filter(a => a.id !== id) } : n)
                    }))}
                    onUpdate={(id, text) => updateLogic(l => ({
                      ...l,
                      needs: l.needs.map(n => n.id === selectedNeedId ? {
                        ...n,
                        aims: n.aims.map(a => a.id === id ? { ...a, description: text } : a)
                      } : n)
                    }))}
                  />
                ) : <div className="p-12 text-center text-gray-400 bg-white rounded-xl border-2 border-dashed">Select a Need above.</div>}
              </div>
            </div>
          )}

          {currentStep === 'DETAILS' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4 space-y-2">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase px-2 mb-2">Select Aim</h3>
                <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                  {logic.needs.flatMap(n => n.aims.map(a => ({ needId: n.id, aim: a })))
                    .map(({ needId, aim }) => (
                    <button
                      key={aim.id}
                      onClick={() => { setSelectedNeedId(needId); setSelectedAimId(aim.id); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all leading-relaxed ${
                        selectedAimId === aim.id ? 'bg-nsw-blue text-white border-nsw-blue shadow-md scale-[1.02]' : 'bg-white text-gray-500 border-gray-100 hover:border-nsw-light-blue/30'
                      }`}
                    >
                      {aim.description}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {currentAim ? (
                  <div className="flex flex-col gap-6 relative">
                    <ListEditor
                      title="Inputs"
                      description="Resources needed"
                      items={currentAim.inputs.map((t, i) => ({ id: i.toString(), text: t }))}
                      typeLabel="Input"
                      onAdd={(t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'inputs', [...currentAim.inputs, t])}
                      onRemove={(i) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'inputs', currentAim.inputs.filter((_, idx) => idx !== parseInt(i)))}
                      onUpdate={(i, t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'inputs', currentAim.inputs.map((old, idx) => idx === parseInt(i) ? t : old))}
                    />
                    <ListEditor
                      title="Activities"
                      description="Steps taken"
                      items={currentAim.activities.map((t, i) => ({ id: i.toString(), text: t }))}
                      typeLabel="Activity"
                      onAdd={(t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'activities', [...currentAim.activities, t])}
                      onRemove={(i) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'activities', currentAim.activities.filter((_, idx) => idx !== parseInt(i)))}
                      onUpdate={(i, t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'activities', currentAim.activities.map((old, idx) => idx === parseInt(i) ? t : old))}
                    />
                    <ListEditor
                      title="Outputs"
                      description="Tangible results"
                      items={currentAim.outputs.map((t, i) => ({ id: i.toString(), text: t }))}
                      typeLabel="Output"
                      onAdd={(t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'outputs', [...currentAim.outputs, t])}
                      onRemove={(i) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'outputs', currentAim.outputs.filter((_, idx) => idx !== parseInt(i)))}
                      onUpdate={(i, t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'outputs', currentAim.outputs.map((old, idx) => idx === parseInt(i) ? t : old))}
                    />
                    <ListEditor
                      title="Short Term Impacts"
                      description="Immediate changes"
                      items={currentAim.shortTermImpacts.map((t, i) => ({ id: i.toString(), text: t }))}
                      typeLabel="Impact"
                      onAdd={(t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'shortTermImpacts', [...currentAim.shortTermImpacts, t])}
                      onRemove={(i) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'shortTermImpacts', currentAim.shortTermImpacts.filter((_, idx) => idx !== parseInt(i)))}
                      onUpdate={(i, t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'shortTermImpacts', currentAim.shortTermImpacts.map((old, idx) => idx === parseInt(i) ? t : old))}
                    />
                    <ListEditor
                      title="Long Term Impacts"
                      description="Sustainable goals"
                      items={currentAim.longTermImpacts.map((t, i) => ({ id: i.toString(), text: t }))}
                      typeLabel="Impact"
                      onAdd={(t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'longTermImpacts', [...currentAim.longTermImpacts, t])}
                      onRemove={(i) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'longTermImpacts', currentAim.longTermImpacts.filter((_, idx) => idx !== parseInt(i)))}
                      onUpdate={(i, t) => handleCellUpdate(selectedNeedId!, selectedAimId!, 'longTermImpacts', currentAim.longTermImpacts.map((old, idx) => idx === parseInt(i) ? t : old))}
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400 bg-white rounded-xl border-2 border-dashed h-full flex flex-col items-center justify-center">
                    <span className="text-4xl mb-4">🎯</span>
                    Select an Aim from the left to define its activities and impacts.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'REVIEW' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-lg">
                <h2 className="text-xl font-bold">Program Logic Review and Export</h2>
                <button onClick={exportToExcel} className="bg-nsw-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-nsw-blue/90 transition-all text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Download Excel
                </button>
              </div>
              <LogicTable data={logic} onJumpTo={jumpTo} />
            </div>
          )}
        </div>

        <footer className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8 pb-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 'GOAL'}
            className="px-6 py-2 border-2 border-gray-200 rounded-lg text-gray-500 font-bold hover:border-nsw-light-blue/30 hover:text-nsw-blue disabled:opacity-30 transition-all text-sm"
          >
            ← Previous
          </button>
          <button
            onClick={currentStep === 'REVIEW' ? exportToExcel : nextStep}
            className="px-10 py-2 bg-nsw-blue text-white font-bold rounded-lg hover:bg-nsw-blue/90 transition-all shadow-lg text-sm flex items-center gap-2"
          >
            {currentStep === 'REVIEW' ? (
              <>
                <span className="material-symbols-outlined text-lg">download</span>
                Download Result
              </>
            ) : 'Continue →'}
          </button>
        </footer>

        <div className="mt-8 py-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 max-w-2xl mx-auto leading-relaxed">
            This Program Logic Builder was developed by Thomas McCorquodale for use with The Office for Health and Medical Research's program management. 
            If you have any questions or issues with the program please contact him at <a href="mailto:thomas.mccorquodale@health.nsw.gov.au" className="text-nsw-blue hover:underline font-medium">thomas.mccorquodale@health.nsw.gov.au</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
