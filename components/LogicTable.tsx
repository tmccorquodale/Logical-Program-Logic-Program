import React from 'react';
import { ProgramLogic } from '../types';

interface LogicTableProps {
  data: ProgramLogic;
  onJumpTo: (step: 'GOAL' | 'NEEDS' | 'AIMS' | 'DETAILS', needId?: string, aimId?: string) => void;
}

export const LogicTable: React.FC<LogicTableProps> = ({ data, onJumpTo }) => {
  return (
    <div className="w-full overflow-x-auto shadow-2xl rounded-2xl border border-gray-200 bg-white">
      <table className="w-full border-collapse min-w-[1200px] text-xs">
        <thead>
          <tr className="bg-emerald-700 text-white">
            <th colSpan={6} className="p-4 text-left border-b border-emerald-800">
              <div className="flex items-center gap-4">
                <span className="font-black uppercase tracking-widest text-lg">Goal: {data.goal || 'NOT DEFINED'}</span>
                <button onClick={() => onJumpTo('GOAL')} className="bg-white/10 hover:bg-white/20 text-[10px] px-2 py-1 rounded border border-white/20 transition-all">Edit Goal</button>
              </div>
            </th>
          </tr>
          <tr className="bg-gray-100 text-gray-500 font-black uppercase tracking-tighter border-b">
            <th className="p-3 border-r text-left w-[15%]">Needs</th>
            <th className="p-3 border-r text-left w-[15%]">Aims</th>
            <th className="p-3 border-r text-left w-[17%]">Activities</th>
            <th className="p-3 border-r text-left w-[17%]">Outputs</th>
            <th className="p-3 border-r text-left w-[18%]">Short Term Impacts</th>
            <th className="p-3 text-left w-[18%]">Long Term Impacts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.needs.length === 0 ? (
            <tr><td colSpan={6} className="p-20 text-center text-gray-300 italic">Upload an Excel file or use the wizard to build your logic.</td></tr>
          ) : data.needs.map((need, nIdx) => (
            <React.Fragment key={need.id}>
              {need.aims.length === 0 ? (
                <tr className="group">
                  <td className="p-3 border-r align-top font-bold bg-gray-50/50">
                    <div className="flex flex-col gap-2">
                      <span>{need.description}</span>
                      <button onClick={() => onJumpTo('NEEDS')} className="opacity-0 group-hover:opacity-100 text-emerald-600 font-black uppercase text-[9px] text-left">Edit Need</button>
                    </div>
                  </td>
                  <td colSpan={5} className="p-10 text-center text-gray-300 italic">No Aims defined. <button onClick={() => onJumpTo('AIMS', need.id)} className="text-emerald-600 font-bold hover:underline ml-2">Add Aims</button></td>
                </tr>
              ) : need.aims.map((aim, aIdx) => (
                <tr key={aim.id} className="hover:bg-gray-50 transition-colors group">
                  {aIdx === 0 && (
                    <td className="p-3 border-r align-top font-bold bg-gray-50/20" rowSpan={need.aims.length}>
                      <div className="flex flex-col gap-2">
                        <span className="leading-relaxed">{need.description}</span>
                        <button onClick={() => onJumpTo('NEEDS')} className="opacity-0 group-hover:opacity-100 text-emerald-600 font-black uppercase text-[9px] text-left">Edit</button>
                      </div>
                    </td>
                  )}
                  <td className="p-3 border-r align-top">
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-emerald-900">{aim.description}</span>
                      <button onClick={() => onJumpTo('AIMS', need.id)} className="opacity-0 group-hover:opacity-100 text-emerald-600 font-black uppercase text-[9px] text-left">Edit</button>
                    </div>
                  </td>
                  <td className="p-3 border-r align-top bg-white relative">
                     <ul className="list-disc ml-4 space-y-1 text-gray-600">
                       {aim.activities.map((it, i) => <li key={i}>{it}</li>)}
                     </ul>
                     <button onClick={() => onJumpTo('DETAILS', need.id, aim.id)} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-100 text-emerald-700 p-1 rounded">✏️</button>
                  </td>
                  <td className="p-3 border-r align-top bg-white relative">
                     <ul className="list-disc ml-4 space-y-1 text-gray-600">
                       {aim.outputs.map((it, i) => <li key={i}>{it}</li>)}
                     </ul>
                     <button onClick={() => onJumpTo('DETAILS', need.id, aim.id)} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-100 text-emerald-700 p-1 rounded">✏️</button>
                  </td>
                  <td className="p-3 border-r align-top bg-blue-50/20 relative">
                     <ul className="list-disc ml-4 space-y-1 text-blue-900 font-medium">
                       {aim.shortTermImpacts.map((it, i) => <li key={i}>{it}</li>)}
                     </ul>
                     <button onClick={() => onJumpTo('DETAILS', need.id, aim.id)} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-700 p-1 rounded">✏️</button>
                  </td>
                  <td className="p-3 align-top bg-emerald-50/20 relative">
                     <ul className="list-disc ml-4 space-y-1 text-emerald-950 font-bold">
                       {aim.longTermImpacts.map((it, i) => <li key={i}>{it}</li>)}
                     </ul>
                     <button onClick={() => onJumpTo('DETAILS', need.id, aim.id)} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-100 text-emerald-700 p-1 rounded">✏️</button>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
