import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { 
  BarChart2, LineChart as LineIcon, AreaChart as AreaIcon, PieChart as PieIcon, 
  Settings2, Eye, Grid3X3, SlidersHorizontal, Sparkles 
} from "lucide-react";
import { DataItem, ColumnSpec, ChartConfig, ChartType } from "../types";

// Dynamic designer color palettes
export const COLOR_PALETTES = [
  { id: "teal_dream", name: "Teal Eclipse", colors: ["#2dd4bf", "#0d9488", "#0f766e", "#14b8a6", "#115e59", "#042f2e"] },
  { id: "volcanics", name: "Volcanic Dusk", colors: ["#ff4a4a", "#ff9000", "#e11d48", "#ff6b8b", "#f43f5e", "#be123c"] },
  { id: "neon_synth", name: "Retro Synthwave", colors: ["#a855f7", "#ec4899", "#e879f9", "#3b82f6", "#6366f1", "#4f46e5"] },
  { id: "emerald_forest", name: "Eco Emerald", colors: ["#10b981", "#059669", "#34d399", "#047857", "#065f46", "#064e3b"] },
  { id: "ocean_deep", name: "Oceanic Abysm", colors: ["#3b82f6", "#0ea5e9", "#2563eb", "#0284c7", "#1d4ed8", "#1e3a8a"] }
];

interface ChartViewerProps {
  data: DataItem[];
  columns: ColumnSpec[];
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
}

export default function ChartViewer({ data, columns, config, onConfigChange }: ChartViewerProps) {
  const [activePalette, setActivePalette] = useState("neon_synth");
  const categoricalCols = columns.filter((c) => c.type === "categorical" || c.type === "date");
  const numericCols = columns.filter((c) => c.type === "numeric");

  const colors = useMemo(() => {
    const palette = COLOR_PALETTES.find((p) => p.id === activePalette) || COLOR_PALETTES[0];
    return palette.colors;
  }, [activePalette]);

  // Handle checking/unchecking numeric columns as Y series
  const toggleYSeries = (colName: string) => {
    let updatedY = [...config.yColumns];
    if (updatedY.includes(colName)) {
      if (updatedY.length > 1) {
        updatedY = updatedY.filter((y) => y !== colName);
      }
    } else {
      updatedY.push(colName);
    }
    onConfigChange({ ...config, yColumns: updatedY });
  };

  // Setup dual axes toggle
  const toggleSecondaryY = () => {
    if (config.secondaryYColumn) {
      onConfigChange({ ...config, secondaryYColumn: undefined });
    } else {
      // Pick first non-included column or second included column
      const avail = numericCols.map(c => c.name).find(name => !config.yColumns.includes(name));
      if (avail) {
        onConfigChange({ ...config, secondaryYColumn: avail });
      } else if (config.yColumns.length > 1) {
        onConfigChange({ 
          ...config, 
          secondaryYColumn: config.yColumns[1],
          yColumns: [config.yColumns[0]] 
        });
      }
    }
  };

  // Convert key-values for Recharts specifically for Scatter/Pie configurations
  const chartsData = useMemo(() => {
    return data.map((row) => {
      const formatted: Record<string, any> = { ...row };
      // Make sure numeric values are genuine numbers
      numericCols.forEach((col) => {
        formatted[col.name] = row[col.name] !== undefined ? Number(row[col.name]) : 0;
      });
      return formatted;
    });
  }, [data, numericCols]);

  const primaryYColumn = config.yColumns[0] || "";

  // Render correct Recharts component based on type
  const renderChartElements = () => {
    if (!primaryYColumn) {
      return (
        <div className="flex flex-col items-center justify-center h-72 text-slate-400">
          <Sparkles className="w-8 h-8 mb-2 animate-bounce text-emerald-400" />
          <p className="text-xs font-semibold">No numerical column selected.</p>
          <p className="text-[10px] text-slate-500 font-mono">Select at least one Y-Axis series in settings.</p>
        </div>
      );
    }

    const animationProp = config.animate ? { isAnimationActive: true, animationDuration: 500 } : { isAnimationActive: false };

    switch (config.type) {
      case "bar":
        return (
          <BarChart data={chartsData} layout={config.barLayout}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            {config.barLayout === "horizontal" ? (
              <>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey={config.xColumn} type="category" stroke="#64748b" fontSize={11} width={100} />
              </>
            ) : (
              <>
                <XAxis dataKey={config.xColumn} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
              </>
            )}
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            {config.showLegend && <Legend />}
            {config.yColumns.map((colName, index) => (
              <Bar
                key={colName}
                dataKey={colName}
                fill={colors[index % colors.length]}
                stackId={config.stacked ? "stackedId" : undefined}
                radius={config.stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                {...animationProp}
              />
            ))}
            {config.secondaryYColumn && (
              <Bar
                dataKey={config.secondaryYColumn}
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                {...animationProp}
              />
            )}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={chartsData}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.xColumn} stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
            {config.secondaryYColumn && (
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={11} />
            )}
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            {config.showLegend && <Legend />}
            {config.yColumns.map((colName, index) => (
              <Line
                key={colName}
                yAxisId="left"
                type={config.lineCurve}
                dataKey={colName}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
                {...animationProp}
              />
            ))}
            {config.secondaryYColumn && (
              <Line
                yAxisId="right"
                type={config.lineCurve}
                dataKey={config.secondaryYColumn}
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
                {...animationProp}
              />
            )}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={chartsData}>
            <defs>
              {config.yColumns.map((colName, index) => (
                <linearGradient key={`grad-${colName}`} id={`grad-${colName}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.0}/>
                </linearGradient>
              ))}
            </defs>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.xColumn} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            {config.showLegend && <Legend />}
            {config.yColumns.map((colName, index) => (
              <Area
                key={colName}
                type={config.lineCurve}
                dataKey={colName}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                fill={`url(#grad-${colName})`}
                stackId={config.stacked ? "stackedId" : undefined}
                {...animationProp}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        // Accumulate/group data by categorical X to avoid multi-slice pollution
        const groupedData = chartsData.reduce((acc: any[], current) => {
          const key = current[config.xColumn] || "Unknown";
          const val = Number(current[primaryYColumn]) || 0;
          const match = acc.find((item) => item.name === key);
          if (match) {
            match.value += val;
          } else {
            acc.push({ name: key, value: val });
          }
          return acc;
        }, []);

        return (
          <PieChart>
            <Tooltip formatter={(value: any) => [Number(value).toFixed(1), primaryYColumn]} />
            {config.showLegend && <Legend />}
            <Pie
              data={groupedData}
              dataKey="value"
              nameKey="name"
              cx="55%"
              cy="50%"
              innerRadius="35%"
              outerRadius="75%"
              paddingAngle={2}
              {...animationProp}
            >
              {groupedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartsData}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey={config.xColumn} stroke="#64748b" fontSize={11} />
            <PolarRadiusAxis angle={30} stroke="#94a3b8" />
            <Tooltip />
            {config.showLegend && <Legend />}
            {config.yColumns.map((colName, index) => (
              <Radar
                key={colName}
                name={colName}
                dataKey={colName}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                {...animationProp}
              />
            ))}
          </RadarChart>
        );

      case "scatter":
        const scatterY = config.secondaryYColumn || config.yColumns[1] || primaryYColumn;
        return (
          <ScatterChart>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={primaryYColumn} type="number" name={primaryYColumn} stroke="#64748b" fontSize={11} />
            <YAxis dataKey={scatterY} type="number" name={scatterY} stroke="#64748b" fontSize={11} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            {config.showLegend && <Legend />}
            <Scatter
              name={`${primaryYColumn} vs ${scatterY}`}
              data={chartsData}
              fill={colors[0]}
              {...animationProp}
            />
          </ScatterChart>
        );

      case "mixed":
        const barSeries = primaryYColumn;
        const lineSeries = config.secondaryYColumn || config.yColumns[1] || primaryYColumn;
        return (
          <ComposedChart data={chartsData}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.xColumn} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            {config.showLegend && <Legend />}
            <Bar dataKey={barSeries} barSize={26} fill={colors[0]} radius={[4, 4, 0, 0]} {...animationProp} />
            {lineSeries !== barSeries && (
              <Line
                type="monotone"
                dataKey={lineSeries}
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 5 }}
                {...animationProp}
              />
            )}
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div id="chart-viewport-workspace" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Dynamic Graph Element View */}
      <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between min-h-[460px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Dynamic Graph</span>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              Visualizing {config.yColumns.join(", ")} by {config.xColumn}
            </h3>
          </div>

          {/* Color Palettes Swapper */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 pl-1">Palette:</span>
            {COLOR_PALETTES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActivePalette(theme.id)}
                className={`w-4 h-4 rounded-full border transition flex items-center justify-center cursor-pointer ${
                  activePalette === theme.id ? "scale-110 ring-2 ring-emerald-500" : "hover:scale-105 border-slate-300"
                }`}
                style={{ backgroundColor: theme.colors[0] }}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Chart View Container */}
        <div className="flex-1 mt-6 w-full flex items-center justify-center">
          <div className="w-full h-[360px]" id="chart-container-wrapper">
            <ResponsiveContainer width="99%" height="100%">
              {renderChartElements() as React.ReactElement}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Chart Modifiers & Settings Sidebar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Chart Settings</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Chart Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-medium font-sans">Chart Format:</label>
            <div className="grid grid-cols-4 gap-1.5 font-sans">
              {[
                { type: "bar", icon: BarChart2, label: "Bar" },
                { type: "line", icon: LineIcon, label: "Line" },
                { type: "area", icon: AreaIcon, label: "Area" },
                { type: "pie", icon: PieIcon, label: "Pie" },
                { type: "radar", icon: Sparkles, label: "Radar" },
                { type: "scatter", icon: SlidersHorizontal, label: "Scatter" },
                { type: "mixed", icon: Grid3X3, label: "Mixed" }
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => onConfigChange({ ...config, type: btn.type as ChartType })}
                  className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    config.type === btn.type
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-500"
                  }`}
                  title={btn.label}
                >
                  <btn.icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium tracking-tight block">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension selectors */}
          <div className="space-y-3 pt-2">
            
            {/* Horizontal / Categorical Axis X */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold">Categorical (X-Axis):</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 font-medium"
                value={config.xColumn}
                onChange={(e) => onConfigChange({ ...config, xColumn: e.target.value })}
              >
                {categoricalCols.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Numerical quantitative series Y checkboxes */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold block">Numerical Series (Y-Axis):</label>
              <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-100 rounded-lg bg-slate-50/50 p-2">
                {numericCols.map((col) => (
                  <label
                    key={col.name}
                    className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-slate-600 font-mono text-[11px]"
                  >
                    <input
                      type="checkbox"
                      checked={config.yColumns.includes(col.name)}
                      onChange={() => toggleYSeries(col.name)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-505 cursor-pointer pointer-events-auto"
                    />
                    <span className="truncate">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dual axis modifier */}
            {numericCols.length > 1 && (
              <div className="flex items-center justify-between py-1 border-t border-b border-slate-100 mt-2 font-semibold">
                <span className="text-slate-500">Dual Axis (Second Y):</span>
                <button
                  onClick={toggleSecondaryY}
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition cursor-pointer ${
                    config.secondaryYColumn
                      ? "bg-fuchsia-100 text-fuchsia-700"
                      : "bg-slate-100 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {config.secondaryYColumn ? `ON: ${config.secondaryYColumn}` : "OFF"}
                </button>
              </div>
            )}
          </div>

          {/* Graphical toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 font-semibold text-slate-600">
            <span className="text-slate-500 font-bold block">Layout Modifiers:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => onConfigChange({ ...config, showGrid: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-auto"
                />
                <span>Grid</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showLegend}
                  onChange={(e) => onConfigChange({ ...config, showLegend: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-auto"
                />
                <span>Legend</span>
              </label>

              {config.type === "bar" && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.barLayout === "horizontal"}
                    onChange={(e) => onConfigChange({ ...config, barLayout: e.target.checked ? "horizontal" : "vertical" })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-auto"
                  />
                  <span>Horizontal GP</span>
                </label>
              )}

              {["area", "bar"].includes(config.type) && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.stacked}
                    onChange={(e) => onConfigChange({ ...config, stacked: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-auto"
                  />
                  <span>Stacked</span>
                </label>
              )}

              {["line", "area"].includes(config.type) && (
                <div className="col-span-2 flex items-center justify-between pt-1">
                  <span className="text-slate-500">Curve Line:</span>
                  <select
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-1.5 py-0.5 text-[11px] focus:outline-none"
                    value={config.lineCurve}
                    onChange={(e) => onConfigChange({ ...config, lineCurve: e.target.value as any })}
                  >
                    <option value="monotone">Monotone Curve</option>
                    <option value="linear">Hard Linear</option>
                    <option value="natural">Natural Spline</option>
                    <option value="basis">Basis Curve</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.animate}
                  onChange={(e) => onConfigChange({ ...config, animate: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-auto"
                />
                <span>Animations</span>
              </label>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
