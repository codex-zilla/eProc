import React, { useState, useEffect, useRef } from 'react';
import { type Material, type MaterialSelection, MaterialUnit } from '../types/models';
import { materialService } from '../services/materialService';

interface Props {
  onChange: (selection: MaterialSelection | null) => void;
}

export const MaterialPicker: React.FC<Props> = ({ onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState<MaterialSelection | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2 && !selection) {
        setLoading(true);
        try {
          const data = await materialService.searchMaterials(query);
          setResults(data);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, selection]);

  const handleSelectCatalog = (material: Material) => {
    const sel: MaterialSelection = { mode: 'catalog', material };
    setSelection(sel);
    setQuery(material.name);
    setIsOpen(false);
    onChange(sel);
  };

  const handleSelectManual = () => {
    const sel: MaterialSelection = { 
      mode: 'manual', 
      manualName: query,
      manualUnit: 'PCS' // default
    };
    setSelection(sel);
    setIsOpen(false);
    onChange(sel);
  };

  const updateManualField = (field: keyof MaterialSelection, value: any) => {
    if (!selection) return;
    const newSel = { ...selection, [field]: value };
    setSelection(newSel);
    onChange(newSel);
  };

  const clearSelection = () => {
    setSelection(null);
    setQuery('');
    onChange(null);
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
      
      <div className="flex gap-2">
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          placeholder="Search material..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selection) {
              setSelection(null); // Reset selection if typing again
              onChange(null);
            }
          }}
        />
        {selection && (
          <button
            onClick={clearSelection}
            className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !selection && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {loading ? (
            <li className="p-2 text-gray-500">Loading...</li>
          ) : results.length > 0 ? (
            results.map((mat) => (
              <li
                key={mat.id}
                className="cursor-pointer hover:bg-indigo-50 p-2"
                onClick={() => handleSelectCatalog(mat)}
              >
                <div className="font-semibold">{mat.name}</div>
                <div className="text-xs text-gray-500">{mat.category} - {mat.defaultUnit}</div>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 italic">No matches found</li>
          )}
          
          {query.trim().length > 0 && (
            <li
              className="cursor-pointer bg-yellow-50 hover:bg-yellow-100 p-2 border-t border-gray-100"
              onClick={handleSelectManual}
            >
              <span className="font-bold text-yellow-700">+ Use Manual: "{query}"</span>
            </li>
          )}
        </ul>
      )}

      {/* Manual Mode Fields */}
      {selection?.mode === 'manual' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-2">Manual Entry Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Unit</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={selection.manualUnit || 'PCS'}
                onChange={(e) => updateManualField('manualUnit', e.target.value)}
              >
                {Object.values(MaterialUnit).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500">Est. Price</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="Optional"
                value={selection.manualPrice || ''}
                onChange={(e) => updateManualField('manualPrice', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
