export type ChartType = "bar" | "line" | "area" | "pie" | "scatter" | "radar" | "mixed";

export interface DataItem {
  [key: string]: any;
}

export interface ColumnSpec {
  name: string;
  type: "numeric" | "categorical" | "date" | "boolean";
}

export interface FilterRule {
  id: string;
  column: string;
  operator: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | "lessThan" | "startsWith" | "endsWith";
  value: string;
}

export interface ChartConfig {
  type: ChartType;
  xColumn: string;
  yColumns: string[]; // Supports multiple quantitative variables
  secondaryYColumn?: string; // For dual axis
  showLegend: boolean;
  stacked: boolean;
  showGrid: boolean;
  animate: boolean;
  lineCurve: "basis" | "linear" | "natural" | "monotone";
  barLayout: "vertical" | "horizontal";
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  colors: string[];
}

export interface CalculatedMetric {
  id: string;
  label: string;
  column: string;
  aggregation: "sum" | "avg" | "count" | "min" | "max";
  value: string | number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  data: DataItem[];
  icon: string;
  category: string;
}

export interface AIAnalysisResult {
  generalSummary: string;
  metrics: {
    label: string;
    value: string;
    description: string;
  }[];
  insights: {
    headline: string;
    body: string;
    chartRecommendation: {
      type: ChartType;
      xCol: string;
      yCol: string;
    };
  }[];
  answers?: string;
  isMocked: boolean;
}
