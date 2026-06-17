import { useState } from "react";
import { Plus, Trash, BarChart4, Sliders, Hash, DollarSign } from "lucide-react";
import { DataItem, ColumnSpec, CalculatedMetric } from "../types";

interface MetricsPanelProps {
  data: DataItem[];
  columns: ColumnSpec[];
}

export default function MetricsPanel({ data, columns }: MetricsPanelProps) {
  const numericCols = columns.filter((c) => c.type === "numeric");
  
  // Local state for custom KPIs
  const [customKPIs, setCustomKPIs] = useState<CalculatedMetric[]>([
    { id: "1", label: "Dataset Row Count", column: "*", aggregation: "count", value: 0 },
  ]);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCol, setNewCol] = useState(numericCols[0]?.name || "");
  const [newAgg, setNewAgg] = useState<"sum" | "avg" | "min" | "max" | "count">("sum");

  // Keep track of the first numeric column for auto-population
  if (numericCols.length > 0 && !newCol) {
    setNewCol(numericCols[0].name);
  }

  // Value formatting helper
  const formatVal = (val: number, isAvg: boolean = false) => {
    if (isNaN(val) || val === null || val === undefined) return "0";
    if (val > 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val > 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(isAvg ? 2 : 0);
  };

  // Perform aggregation
  const computeValue = (item: CalculatedMetric): string | number => {
    if (data.length === 0) return 0;
    
    if (item.aggregation === "count") {
      return data.length;
    }

    const { column, aggregation } = item;
    const values = data
      .map((row) => Number(row[column]))
      .filter((v) => !isNaN(v) && v !== null && v !== undefined);

    if (values.length === 0) return 0;

    switch (aggregation) {
      case "sum":
        return values.reduce((sum, current) => sum + current, 0);
      case "avg":
        return values.reduce((sum, current) => sum + current, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      default:
        return 0;
    }
  };

  const addCustomKPI = () => {
    if (!newLabel.trim()) return;
    const item: CalculatedMetric = {
      id: Math.random().toString(36).substr(2, 9),
      label: newLabel,
      column: newCol,
      aggregation: newAgg,
      value: 0,
    };
    setCustomKPIs([...customKPIs, item]);
    setNewLabel("");
    setCreatorOpen(false);
  };

  const removeCustomKPI = (id: string) => {
    setCustomKPIs(customKPIs.filter((k) => k.id !== id));
  };

  // Prepopulate standard metrics if user has columns but no custom KPI
  const standardKPIs = numericCols.slice(0, 3).map((col) => {
    const vals = data.map((r) => Number(r[col.name])).filter((v) => !isNaN(v));
    const averageVal = vals.length > 0 ? vals.reduce((s, c) => s + c, 0) / vals.length : 0;
    const sumVal = vals.length > 0 ? vals.reduce((s, c) => s + c, 0) : 0;
    
    // Choose sum for things named Revenue, UnitsSold, AdsSpend, otherwise average
    const isSumPrevalent = /revenue|sold|spend|cost|quota|steps/i.test(col.name);
    return {
      label: isSumPrevalent ? `Total ${col.name}` : `Avg ${col.name}`,
      value: isSumPrevalent ? sumVal : averageVal,
      isAvg: !isSumPrevalent,
      column: col.name,
      aggregation: isSumPrevalent ? "Sum" : "Average"
    };
  });

  return (
    <div id="metrics-control-container" className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Dynamic Pre-Calculated KPI Cards */}
        {standardKPIs.map((kpi, idx) => (
          <div 
            key={`${kpi.label}-${idx}`} 
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-3 text-slate-500">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block truncate max-w-[170px]" title={kpi.label}>
                {kpi.label}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase shrink-0">
                {kpi.aggregation}
              </span>
            </div>
            
            <div className="flex items-end justify-between mt-4">
              <p className="text-3xl font-black text-slate-900 font-sans tracking-tight truncate">
                {formatVal(kpi.value, kpi.isAvg)}
              </p>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        ))}

        {/* User-Custom Aggregates */}
        {customKPIs.map((kpi) => {
          const val = computeValue(kpi);
          return (
            <div 
              key={kpi.id} 
              className="bg-white border-slate-100 hover:border-fuchsia-200 p-5 rounded-2xl border shadow-sm relative group flex flex-col justify-between transition-all duration-205"
            >
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block truncate max-w-[150px]" title={kpi.label}>
                  {kpi.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {kpi.id !== "1" && (
                    <button
                      onClick={() => removeCustomKPI(kpi.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                      title="Delete metric card"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full uppercase font-mono">
                    {kpi.aggregation}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-4">
                <p className="text-3xl font-black text-slate-900 font-sans tracking-tight truncate">
                  {typeof val === "number" ? formatVal(val, kpi.aggregation === "avg") : val}
                </p>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase truncate max-w-[100px]">
                  {kpi.column}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add Metric Prompt Tool */}
        {!creatorOpen ? (
          <button
            onClick={() => setCreatorOpen(true)}
            disabled={numericCols.length === 0}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/30 hover:bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-6 h-6 mb-1 text-slate-400 transition group-hover:scale-110" />
            <span className="text-xs font-bold text-slate-700">Custom KPI Card</span>
            <span className="text-[10px] opacity-75 font-mono">Aggregate variables</span>
          </button>
        ) : (
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Metrics Architect</h4>
              <p className="text-[9px] text-indigo-300 font-mono">Setup dynamic KPI card aggregation</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-400"
                placeholder="Card label (e.g. Sales Forecast)..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-indigo-400"
                  value={newCol}
                  onChange={(e) => setNewCol(e.target.value)}
                >
                  {numericCols.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>

                <select
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-indigo-400"
                  value={newAgg}
                  onChange={(e) => setNewAgg(e.target.value as any)}
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Mean</option>
                  <option value="min">Min</option>
                  <option value="max">Max</option>
                  <option value="count">Count Rows</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-[11px]">
              <button
                onClick={() => setCreatorOpen(false)}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addCustomKPI}
                disabled={!newLabel.trim()}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl cursor-pointer transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                Assemble KPI
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
