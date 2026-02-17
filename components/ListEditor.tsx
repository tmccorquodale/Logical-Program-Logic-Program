import React, { useState, useRef, useEffect } from 'react';

interface ListEditorProps {
  title: string;
  description: string;
  items: { id: string; text: string }[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  typeLabel: string;
}

const AutoResizeTextArea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-transparent resize-none overflow-hidden transition-all duration-200 focus:outline-none ${className}`}
    />
  );
};

export const ListEditor: React.FC<ListEditorProps> = ({ 
  title, description, items, onAdd, onRemove, onUpdate, typeLabel
}) => {
  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    if (newText.trim()) {
      onAdd(newText);
      setNewText('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6 mt-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <AutoResizeTextArea
                  className="text-gray-700 leading-relaxed text-sm"
                  value={item.text}
                  onChange={(val) => onUpdate(item.id, val)}
                  placeholder="Enter text here..."
                />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-lg text-center text-gray-400 italic text-sm">
              No {typeLabel.toLowerCase()}s added yet.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add a new ${typeLabel.toLowerCase()}...`}
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm"
          />
          <button 
            onClick={handleAdd}
            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md active:scale-95 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};