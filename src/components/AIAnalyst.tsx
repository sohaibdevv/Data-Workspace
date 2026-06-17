import { useState } from "react";
import { 
  Brain, Send, Sparkles, Loader2, FileText, Check, 
  HelpCircle, AlertCircle, BarChart, RefreshCw, Layers 
} from "lucide-react";
import { DataItem, ColumnSpec, AIAnalysisResult, ChartConfig, ChartType } from "../types";

interface AIAnalystProps {
  data: DataItem[];
  columns: ColumnSpec[];
  onApplyChartPreset: (preset: { type: ChartType; xCol: string; yCol: string }) => void;
  activeCategoryCol: string;
  activeNumericCol: string;
}

// Lightweight regex-based markdown parser to render basic markdown elements as clean React components
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2.5 text-slate-700 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        
        // H3 heading
        if (trimmed.startsWith("###")) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1 pt-3 font-sans">
              {trimmed.replace("###", "").trim()}
            </h4>
          );
        }
        
        // H2 heading
        if (trimmed.startsWith("##")) {
          return (
            <h3 key={idx} className="font-semibold text-slate-900 text-base border-b border-slate-200 pb-1.5 pt-4 font-sans uppercase tracking-tight">
              {trimmed.replace("##", "").trim()}
            </h3>
          );
        }

        // List item bullet
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const content = trimmed.substring(1).trim();
          return (
            <li key={idx} className="list-disc pl-2 ml-4 font-sans text-slate-600">
              {renderInlineBold(content)}
            </li>
          );
        }

        // Number list
        if (/^\d+\./.test(trimmed)) {
          const content = trimmed.replace(/^\d+\./, "").trim();
          return (
            <li key={idx} className="list-decimal pl-2 ml-4 font-sans text-slate-600">
              {renderInlineBold(content)}
            </li>
          );
        }

        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        // Default paragraph
        return (
          <p key={idx} className="font-sans text-slate-600">
            {renderInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Bold markdown handler **bold**
function renderInlineBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-slate-950 font-bold">{part}</strong>;
    }
    return part;
  });
}

export default function AIAnalyst({
  data,
  columns,
  onApplyChartPreset,
  activeCategoryCol,
  activeNumericCol,
}: AIAnalystProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const triggerAnalysis = async (customQuestion?: string) => {
    if (data.length === 0) return;
    
    if (customQuestion) {
      setQueryLoading(true);
    } else {
      setLoading(true);
      setLoadingStep("Structuring rows & columns indices...");
    }
    setErrorMsg("");

    try {
      if (!customQuestion) {
        setTimeout(() => setLoadingStep("Detecting metrics variance..."), 700);
        setTimeout(() => setLoadingStep("Consulting server-side Gemini 3.5 AI..."), 1500);
      }

      const res = await fetch("/api/analyze-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          columns,
          userQuestion: customQuestion,
          activeCategoryCol,
          activeNumericCol,
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Server returned status: " + res.status);
      }

      const parsed: AIAnalysisResult = await res.json();
      
      if (customQuestion) {
        setAnalysis((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            answers: parsed.answers,
          };
        });
        setUserQuery("");
      } else {
        setAnalysis(parsed);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to make endpoint connection. Please retry.");
    } finally {
      setLoading(false);
      setQueryLoading(false);
    }
  };

  return (
    <div id="ai-analyst-panel" className="space-y-6">
      
      {/* Overview Block */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        {/* Background glow elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
              Server-Side GenAI
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono font-bold">Gemini 3.5 Assistant</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">AI Data Scientist & Insight Engine</h2>
          <p className="text-xs text-indigo-200/80 leading-relaxed font-sans">
            Our backend pipeline structures your active variables and channels them to the Gemini model to parse core trends, generate custom graphs recipes, and provide rich statistical summaries instantly.
          </p>
        </div>

        <button
          onClick={() => triggerAnalysis()}
          disabled={loading || data.length === 0}
          className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:brightness-110 text-white font-extrabold px-6 py-3.5 rounded-xl transition duration-200 shadow-md hover:scale-[1.02] active:scale-95 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none relative z-10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Brain className="w-4 h-4 text-white" />
          )}
          <span>{analysis ? "Relaunch AI Analytics" : "Generate AI Insights"}</span>
        </button>
      </div>

      {/* Loading Canvas */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
            <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">Launching Analysis</p>
            <p className="text-xs text-slate-400 animate-pulse font-bold">{loadingStep}</p>
          </div>
        </div>
      )}

      {/* General error message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase">Analysis Connection Interrupted</h4>
            <p className="text-xs text-rose-700 font-mono leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* AI Response Display */}
      {analysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Executive Summary Block */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Executive Summary & General Findings
              </h3>
              {analysis.isMocked && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0">
                  Sandbox Active
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              <SimpleMarkdown text={analysis.generalSummary} />
            </div>

            {/* Custom Natural Language Queries Box */}
            <div className="pt-5 border-t border-slate-150 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-fuchsia-500" />
                  Ask My Data Questions
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Ask standard prompts like &apos;Compare the best categories&apos; or &apos;Explain variance in active columns&apos;</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userQuery.trim() && !queryLoading) {
                    triggerAnalysis(userQuery);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a custom query regarding live attributes..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  disabled={queryLoading}
                />
                <button
                  type="submit"
                  disabled={queryLoading || !userQuery.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 disabled:opacity-45 disabled:pointer-events-none shrink-0"
                >
                  {queryLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Query</span>
                </button>
              </form>

              {/* Chat answer stream */}
              {analysis.answers && (
                <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl space-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-extrabold uppercase text-[10px] tracking-widest font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Interactive Answer:
                  </div>
                  <SimpleMarkdown text={analysis.answers} />
                </div>
              )}
            </div>
          </div>

          {/* AI Recommended Insights & Actions */}
          <div className="space-y-6">
            
            {/* Suggested KPIs */}
            {analysis.metrics && analysis.metrics.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">AI Recommended Aggregates</h4>
                
                <div className="space-y-3 text-xs">
                  {analysis.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-700 font-sans text-xs">{m.label}</span>
                        <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded font-extrabold text-indigo-600 shadow-sm shrink-0">{m.value}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Discoveries */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">Recommended Visualizations</h4>
              
              <div className="space-y-4">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-xl border-y border-r border-slate-100 border-l-4 border-l-fuchsia-500 bg-slate-50/30 space-y-3">
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-900 font-sans tracking-tight">
                        {insight.headline}
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {insight.body}
                      </p>
                    </div>

                    {/* Chart recommendation action */}
                    {insight.chartRecommendation && insight.chartRecommendation.xCol && (
                      <button
                        onClick={() => onApplyChartPreset(insight.chartRecommendation)}
                        className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 bg-white hover:bg-slate-50/50 transition px-3 py-2 rounded-lg text-[10px] font-bold text-slate-700 font-mono shadow-xs cursor-pointer"
                        title="Configure active graph immediately"
                      >
                        <BarChart className="w-3.5 h-3.5" />
                        Apply preset: {insight.chartRecommendation.type.toUpperCase()} ({insight.chartRecommendation.xCol} &times; {insight.chartRecommendation.yCol})
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
