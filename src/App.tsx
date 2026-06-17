import { useState, useMemo, useEffect } from "react";
import { 
  Layers, BarChart3, Database, FileSpreadsheet, Brain, Sparkles, 
  Settings, RefreshCw, Eye, Landmark, HelpCircle, CheckCircle2 
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import ChartViewer from "./components/ChartViewer";
import DataTable from "./components/DataTable";
import MetricsPanel from "./components/MetricsPanel";
import AIAnalyst from "./components/AIAnalyst";

import { PRELOADED_DATASETS, autoDetectColumns } from "./mockData";
import { Dataset, ColumnSpec, FilterRule, ChartConfig, ChartType } from "./types";

export default function App() {
  const initialDataset = PRELOADED_DATASETS[0];
  const initialColumns = autoDetectColumns(initialDataset.data);

  // States
  const [activeDataset, setActiveDataset] = useState<Dataset>(initialDataset);
  const [columns, setColumns] = useState<ColumnSpec[]>(initialColumns);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "explorer" | "ai_analyst">("dashboard");

  // Chart configuration state
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: "bar",
    xColumn: "Month",
    yColumns: ["Revenue"],
    showLegend: true,
    stacked: false,
    showGrid: true,
    animate: true,
    lineCurve: "monotone",
    barLayout: "vertical"
  });

  // Whenever columns change or a new dataset is loaded, automatically set appropriate default X and Y columns
  const resetChartDefaults = (colsSpec: ColumnSpec[]) => {
    const categorical = colsSpec.filter((c) => c.type === "categorical" || c.type === "date");
    const numeric = colsSpec.filter((c) => c.type === "numeric");

    const newX = categorical[0]?.name || colsSpec[0]?.name || "";
    // If there's a column with Name like 'Month' or 'Day' or 'Date', use it first as X
    const dateLike = categorical.find(c => /month|day|date/i.test(c.name));
    
    // Choose Y series
    const newY = numeric.slice(0, 2).map((c) => c.name);
    if (newY.length === 0 && colsSpec[0]) {
      newY.push(colsSpec[0].name);
    }

    setChartConfig({
      type: "bar",
      xColumn: dateLike ? dateLike.name : newX,
      yColumns: newY,
      showLegend: true,
      stacked: false,
      showGrid: true,
      animate: true,
      lineCurve: "monotone",
      barLayout: "vertical"
    });
  };

  // Run resets when loading preset datasets
  const handleDatasetChange = (newDataset: Dataset, newSpecs: ColumnSpec[]) => {
    setActiveDataset(newDataset);
    setColumns(newSpecs);
    setFilters([]); // Clear filters whenever a new schema is loaded
    resetChartDefaults(newSpecs);
  };

  // Cascade chart updates from AI recommendations
  const handleApplyAIPreset = (preset: { type: ChartType; xCol: string; yCol: string }) => {
    setChartConfig(prev => ({
      ...prev,
      type: preset.type,
      xColumn: preset.xCol,
      yColumns: [preset.yCol],
      secondaryYColumn: undefined
    }));
    // Snap directly to the dashboard visualization tab to see it!
    setCurrentTab("dashboard");
  };

  // Perform robust pipeline data filtering dynamically
  const filteredDatasetRows = useMemo(() => {
    if (filters.length === 0) return activeDataset.data;
    
    return activeDataset.data.filter((row) => {
      return filters.every((rule) => {
        const val = row[rule.column];
        if (val === undefined || val === null) return false;
        
        const cellValueStr = String(val).toLowerCase();
        const ruleValueStr = rule.value.toLowerCase();

        switch (rule.operator) {
          case "contains":
            return cellValueStr.includes(ruleValueStr);
          case "notContains":
            return !cellValueStr.includes(ruleValueStr);
          case "equals":
            return cellValueStr === ruleValueStr;
          case "notEquals":
            return cellValueStr !== ruleValueStr;
          case "startsWith":
            return cellValueStr.startsWith(ruleValueStr);
          case "endsWith":
            return cellValueStr.endsWith(ruleValueStr);
          case "greaterThan":
            const cellNumG = parseFloat(cellValueStr);
            const ruleNumG = parseFloat(ruleValueStr);
            if (isNaN(cellNumG) || isNaN(ruleNumG)) return false;
            return cellNumG > ruleNumG;
          case "lessThan":
            const cellNumL = parseFloat(cellValueStr);
            const ruleNumL = parseFloat(ruleValueStr);
            if (isNaN(cellNumL) || isNaN(ruleNumL)) return false;
            return cellNumL < ruleNumL;
          default:
            return true;
        }
      });
    });
  }, [activeDataset.data, filters]);

  // Initial resets to make sure first load is perfect
  useEffect(() => {
    resetChartDefaults(initialColumns);
  }, []);

  return (
    <div id="full-workspace-root" className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Side Workspace Console */}
      <Sidebar
        activeDataset={activeDataset}
        onDatasetChange={handleDatasetChange}
        columns={columns}
        onColumnsChange={setColumns}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Main Workspace Terminal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic Global Dashboard Header */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white transition hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">VISUALIZE.io</span>
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase tracking-wider font-mono">WORKSPACE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                ACTIVE DATA: {activeDataset.name.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Navigation Tab Controllers */}
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: "dashboard", label: "Dashboard", icon: Layers },
                { id: "explorer", label: "Data Sheets", icon: FileSpreadsheet },
                { id: "ai_analyst", label: "AI Insights", icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs tracking-tight transition duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white shadow-sm text-indigo-600 font-bold"
                        : "text-slate-500 hover:text-slate-900 font-semibold"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Profile badge from theme details */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-black text-slate-700">Client Hub</span>
                <span className="text-[9px] text-emerald-500 font-mono flex items-center justify-end gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LIVE NODE
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 border-2 border-white shadow-md transition hover:scale-105 cursor-pointer"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          
          {/* Dashboard Hub View */}
          {currentTab === "dashboard" && (
            <div className="space-y-6" id="dashboard-tab-content">
              {/* Core calculation aggregate cards */}
              <MetricsPanel
                data={filteredDatasetRows}
                columns={columns}
              />

              {/* Dynamic core charts config visualizer element */}
              <ChartViewer
                data={filteredDatasetRows}
                columns={columns}
                config={chartConfig}
                onConfigChange={setChartConfig}
              />
            </div>
          )}

          {/* Data Sheets Grid View */}
          {currentTab === "explorer" && (
            <div id="explorer-tab-content">
              <DataTable
                data={filteredDatasetRows}
                columns={columns}
              />
            </div>
          )}

          {/* AI Intelligence Module */}
          {currentTab === "ai_analyst" && (
            <div id="ai-tab-content">
              <AIAnalyst
                data={filteredDatasetRows}
                columns={columns}
                onApplyChartPreset={handleApplyAIPreset}
                activeCategoryCol={chartConfig.xColumn}
                activeNumericCol={chartConfig.yColumns[0] || ""}
              />
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
