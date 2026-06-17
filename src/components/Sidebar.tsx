import React, { useState, useRef } from "react";
import { 
  Database, Upload, Plus, Trash, Filter, Check, 
  HelpCircle, RefreshCw, Layers, Sliders, ChevronDown, CheckCircle2 
} from "lucide-react";
import { Dataset, ColumnSpec, FilterRule } from "../types";
import { PRELOADED_DATASETS, autoDetectColumns, cleanDatasetValues } from "../mockData";

interface SidebarProps {
  activeDataset: Dataset;
  onDatasetChange: (dataset: Dataset, columns: ColumnSpec[]) => void;
  columns: ColumnSpec[];
  onColumnsChange: (columns: ColumnSpec[]) => void;
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
}

export default function Sidebar({
  activeDataset,
  onDatasetChange,
  columns,
  onColumnsChange,
  filters,
  onFiltersChange,
}: SidebarProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom dataset JSON or CSV
  const parseRawText = (text: string, type: "csv" | "json") => {
    try {
      setPasteError("");
      let parsed: any[] = [];
      if (type === "json") {
        parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON structure must be an array of objects representing rows.");
        }
      } else {
        // Simple robust CSV parser which handles headers, quotes, and commas
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          throw new Error("CSV requires a header line and at least one data row.");
        }
        
        const parseRow = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseRow(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const cells = parseRow(lines[i]);
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            const val = cells[index] || "";
            rowObj[header] = val;
          });
          parsed.push(rowObj);
        }
      }

      if (parsed.length === 0) {
        throw new Error("No data records detected.");
      }

      // Auto-structure uploaded data
      const specs = autoDetectColumns(parsed);
      const cleanedData = cleanDatasetValues(parsed, specs);

      const customDataset: Dataset = {
        id: "custom_" + Date.now(),
        name: "Uploaded Workspace Data",
        description: `Imported with ${cleanedData.length} records. Cleaned and indexed locally.`,
        icon: "FileText",
        category: "Custom Raw Import",
        data: cleanedData,
      };

      onDatasetChange(customDataset, specs);
      setPasteText("");
      setPasteOpen(false);
    } catch (err: any) {
      setPasteError(err.message || "Failed to parse data input. Check formatting.");
    }
  };

  // Drag and drop mechanics
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadedFile = (file: File) => {
    const reader = new FileReader();
    const isCsv = file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".txt");
    const isJson = file.name.endsWith(".json");

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseRawText(text, isJson ? "json" : "csv");
      }
    };

    reader.readAsText(file);
  };

  // Manage individual columns
  const toggleColumnType = (colName: string) => {
    const updatedSpecs = columns.map((col) => {
      if (col.name === colName) {
        let nextType: "numeric" | "categorical" | "date" | "boolean" = "categorical";
        if (col.type === "categorical") nextType = "numeric";
        else if (col.type === "numeric") nextType = "date";
        else if (col.type === "date") nextType = "boolean";
        return { ...col, type: nextType };
      }
      return col;
    });
    
    // Re-clean data values based on new types
    const cleanedData = cleanDatasetValues(activeDataset.data, updatedSpecs);
    onDatasetChange({ ...activeDataset, data: cleanedData }, updatedSpecs);
  };

  // Manage Filter rules
  const addFilterRule = () => {
    if (columns.length === 0) return;
    const rule: FilterRule = {
      id: Math.random().toString(36).substr(2, 9),
      column: columns[0].name,
      operator: "contains",
      value: "",
    };
    onFiltersChange([...filters, rule]);
  };

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    onFiltersChange(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFilterRule = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div id="visualizer-sidebar" className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200 w-80 shrink-0 select-none">
      
      {/* Title Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
          <Layers className="w-4.5 h-4.5 text-indigo-600" id="sidebar-icon" />
        </div>
        <div>
          <h2 className="font-sans font-extrabold text-xs tracking-wider text-slate-900 uppercase">Data Workspace</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Ingestion & Schema</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Step 1: Active Dataset Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              1. Loaded Dataset
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 block font-mono">Select Preloaded Target:</label>
            <div className="relative">
              <select
                id="dataset-preset-select"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 appearance-none pointer-events-auto"
                value={PRELOADED_DATASETS.some(p => p.id === activeDataset.id) ? activeDataset.id : "custom"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "custom") {
                    const found = PRELOADED_DATASETS.find((d) => d.id === val);
                    if (found) {
                      const detected = autoDetectColumns(found.data);
                      onDatasetChange(found, detected);
                    }
                  }
                }}
              >
                {PRELOADED_DATASETS.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
                {!PRELOADED_DATASETS.some(p => p.id === activeDataset.id) && (
                  <option value="custom">★ Raw Workspace Upload</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed font-sans">
              {activeDataset.description}
            </p>
          </div>
        </div>

        {/* Dynamic File Dropzone & Manual File Ingestion */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-fuchsia-500" />
              2. Load Custom Data
            </label>
            <button
              onClick={() => {
                setPasteOpen(!pasteOpen);
                setPasteError("");
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 transition font-mono bg-indigo-50 px-2 py-0.5 rounded-lg cursor-pointer font-bold"
            >
              {pasteOpen ? "Hide Paste" : "Paste String"}
            </button>
          </div>

          {!pasteOpen ? (
            <div
              id="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                dragActive
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-500 hover:text-slate-700"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.tsv,.json,.txt"
                onChange={handleFileInputChange}
              />
              <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <span className="text-xs block font-bold text-slate-700">Click to import files</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Accepts CSV, TSV or nested JSON</span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <textarea
                className="w-full h-28 bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 text-[11px] font-mono focus:outline-none focus:border-indigo-500 text-xs"
                placeholder='[{"Month":"Jan","Sales":1200},...]\n\nor paste Standard Comma-Separated CSV rows'
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              {pasteError && (
                <div className="text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-mono">
                  {pasteError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => parseRawText(pasteText, pasteText.trim().startsWith("[") ? "json" : "csv")}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Ingest String
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Attribute Types Mapping and Calibration */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            3. Column Settings
          </h3>
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 py-1 rounded-2xl bg-slate-50/50 p-2 border border-slate-100">
            {columns.map((col) => (
              <div
                key={col.name}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 text-xs transition"
              >
                <span className="font-bold text-slate-700 truncate max-w-[140px]" title={col.name}>
                  {col.name}
                </span>
                <button
                  onClick={() => toggleColumnType(col.name)}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-mono tracking-tight font-extrabold hover:brightness-95 hover:scale-102 transition active:scale-95 cursor-pointer inline-flex items-center gap-1 ${
                    col.type === "numeric"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : col.type === "date"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : col.type === "boolean"
                      ? "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {col.type.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Interactive Filter Dashboard rules */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              4. Filtering Logic ({filters.length})
            </h3>
            {filters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] text-indigo-600 font-bold hover:underline transition cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filters.map((rule) => (
              <div key={rule.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-1.5">
                  <select
                    className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 font-semibold"
                    value={rule.column}
                    onChange={(e) => updateFilterRule(rule.id, { column: e.target.value })}
                  >
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFilterRule(rule.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-200/50 transition cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    className="bg-white border border-slate-200 text-slate-800 rounded-lg px-1.5 py-1 text-[11px] focus:outline-none focus:border-indigo-500 font-semibold"
                    value={rule.operator}
                    onChange={(e) => updateFilterRule(rule.id, { operator: e.target.value as any })}
                  >
                    <option value="contains">contains</option>
                    <option value="notContains">does not contain</option>
                    <option value="equals">equals</option>
                    <option value="notEquals">does not equal</option>
                    <option value="greaterThan">greater than</option>
                    <option value="lessThan">less than</option>
                    <option value="startsWith">starts with</option>
                    <option value="endsWith">ends with</option>
                  </select>

                  <input
                    type="text"
                    className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="Value..."
                    value={rule.value}
                    onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addFilterRule}
              disabled={columns.length === 0}
              className="w-full flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/30 text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-3.5 h-3.5" />
              Add logic condition
            </button>
          </div>
        </div>

        {/* Gradient Pro Card Upgrade element representing the exact aesthetic requested */}
        <div className="mt-8 p-4 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl text-white shadow-md transition-transform hover:scale-[1.01]">
          <p className="font-extrabold text-sm mb-1">VISUALIZE Pro</p>
          <p className="text-xs opacity-90 mb-3">Ask server-side Gemini 3.5 to suggest multi-dimensional layouts instantly!</p>
          <button 
            onClick={() => {
              const el = document.getElementById("ai-analyst-panel") || document.getElementById("ai-tab-content");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
              alert("Pro sandbox active. Head to the 'AI Insights' tab to generate multi-variable data summaries!");
            }} 
            className="w-full py-2 bg-white text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
          >
            Activate Now
          </button>
        </div>

      </div>

      {/* Workspace Footer details */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 flex justify-between items-center font-mono">
        <span>Rows: {activeDataset.data.length}</span>
        <span>Cols: {columns.length}</span>
        <span className="flex items-center gap-1 font-bold text-emerald-600">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Ingested
        </span>
      </div>
    </div>
  );
}
