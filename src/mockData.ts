import { Dataset, ColumnSpec } from "./types";

export const PRELOADED_DATASETS: Dataset[] = [
  {
    id: "saas_sales",
    name: "Enterprise SaaS Engines (Marketing & Sales)",
    description: "Multi-dimensional SaaS metrics (Revenue, Conversions, Upgrades, Churn, Support Traffic, Ads spend) tracked monthly over the 24 months of 2024 and 2025.",
    icon: "Activity",
    category: "Corporate Dynamics",
    data: [
      { Month: "Jan 2024", Revenue: 44000, NewSignups: 420, ChurnRate: 2.1, AdsSpend: 5400, SupportTickets: 120, ActiveUsers: 3400 },
      { Month: "Feb 2024", Revenue: 48000, NewSignups: 450, ChurnRate: 1.9, AdsSpend: 5900, SupportTickets: 135, ActiveUsers: 3750 },
      { Month: "Mar 2024", Revenue: 51200, NewSignups: 490, ChurnRate: 1.8, AdsSpend: 6200, SupportTickets: 110, ActiveUsers: 4100 },
      { Month: "Apr 2024", Revenue: 54500, NewSignups: 510, ChurnRate: 2.2, AdsSpend: 6800, SupportTickets: 140, ActiveUsers: 4500 },
      { Month: "May 2024", Revenue: 58000, NewSignups: 580, ChurnRate: 1.6, AdsSpend: 7300, SupportTickets: 98, ActiveUsers: 4980 },
      { Month: "Jun 2024", Revenue: 64200, NewSignups: 690, ChurnRate: 1.4, AdsSpend: 8100, SupportTickets: 85, ActiveUsers: 5600 },
      { Month: "Jul 2024", Revenue: 67100, NewSignups: 640, ChurnRate: 2.0, AdsSpend: 8200, SupportTickets: 155, ActiveUsers: 6100 },
      { Month: "Aug 2024", Revenue: 69000, NewSignups: 620, ChurnRate: 2.1, AdsSpend: 8000, SupportTickets: 160, ActiveUsers: 6500 },
      { Month: "Sep 2024", Revenue: 73400, NewSignups: 710, ChurnRate: 1.5, AdsSpend: 9200, SupportTickets: 112, ActiveUsers: 7200 },
      { Month: "Oct 2024", Revenue: 78000, NewSignups: 780, ChurnRate: 1.4, AdsSpend: 9900, SupportTickets: 104, ActiveUsers: 7900 },
      { Month: "Nov 2024", Revenue: 84300, NewSignups: 890, ChurnRate: 1.2, AdsSpend: 11000, SupportTickets: 90, ActiveUsers: 8750 },
      { Month: "Dec 2024", Revenue: 95000, NewSignups: 1120, ChurnRate: 1.1, AdsSpend: 13500, SupportTickets: 72, ActiveUsers: 9800 },
      { Month: "Jan 2025", Revenue: 98000, NewSignups: 910, ChurnRate: 1.8, AdsSpend: 12000, SupportTickets: 145, ActiveUsers: 10450 },
      { Month: "Feb 2025", Revenue: 102500, NewSignups: 940, ChurnRate: 1.6, AdsSpend: 12400, SupportTickets: 130, ActiveUsers: 11100 },
      { Month: "Mar 2025", Revenue: 108900, NewSignups: 1020, ChurnRate: 1.5, AdsSpend: 13000, SupportTickets: 118, ActiveUsers: 11980 },
      { Month: "Apr 2025", Revenue: 112400, NewSignups: 990, ChurnRate: 1.7, AdsSpend: 13200, SupportTickets: 124, ActiveUsers: 12850 },
      { Month: "May 2025", Revenue: 119000, NewSignups: 1150, ChurnRate: 1.3, AdsSpend: 14500, SupportTickets: 102, ActiveUsers: 13900 },
      { Month: "Jun 2025", Revenue: 131200, NewSignups: 1420, ChurnRate: 1.1, AdsSpend: 16800, SupportTickets: 88, ActiveUsers: 15300 },
      { Month: "Jul 2025", Revenue: 134500, NewSignups: 1290, ChurnRate: 1.5, AdsSpend: 16500, SupportTickets: 140, ActiveUsers: 16400 },
      { Month: "Aug 2025", Revenue: 138000, NewSignups: 1210, ChurnRate: 1.6, AdsSpend: 16000, SupportTickets: 152, ActiveUsers: 17350 },
      { Month: "Sep 2025", Revenue: 146900, NewSignups: 1380, ChurnRate: 1.2, AdsSpend: 18100, SupportTickets: 110, ActiveUsers: 18500 },
      { Month: "Oct 2025", Revenue: 154000, NewSignups: 1490, ChurnRate: 1.1, AdsSpend: 19500, SupportTickets: 95, ActiveUsers: 19800 },
      { Month: "Nov 2025", Revenue: 168500, NewSignups: 1710, ChurnRate: 0.9, AdsSpend: 22000, SupportTickets: 78, ActiveUsers: 21500 },
      { Month: "Dec 2025", Revenue: 192000, NewSignups: 2180, ChurnRate: 0.8, AdsSpend: 26000, SupportTickets: 60, ActiveUsers: 23600 }
    ]
  },
  {
    id: "tech_gadgets",
    name: "Global Consumer Tech Products (Inventory & Performance)",
    description: "Detailed inventory data on technology products covering categories, units sold, base MSRP, ratings, return rates, and primary distribution regions.",
    icon: "Laptop",
    category: "Product Performance",
    data: [
      { SKU: "W-PRO-12", Category: "Wearables", Product: "Quantum Watch Pro", UnitsSold: 12500, MSRP: 299, CustomerRating: 4.7, ReturnRatePct: 1.4, Region: "North America" },
      { SKU: "W-FIT-09", Category: "Wearables", Product: "Strive Active Band", UnitsSold: 24300, MSRP: 129, CustomerRating: 4.2, ReturnRatePct: 2.8, Region: "Europe" },
      { SKU: "W-LIT-02", Category: "Wearables", Product: "Strive Lite Band", UnitsSold: 31000, MSRP: 79, CustomerRating: 4.1, ReturnRatePct: 3.2, Region: "Latin America" },
      { SKU: "PH-MAX-01", Category: "Phones", Product: "Apex Alpha 5G", UnitsSold: 18900, MSRP: 999, CustomerRating: 4.9, ReturnRatePct: 0.9, Region: "North America" },
      { SKU: "PH-MID-04", Category: "Phones", Product: "Apex Nexus", UnitsSold: 34500, MSRP: 599, CustomerRating: 4.5, ReturnRatePct: 1.6, Region: "Asia-Pacific" },
      { SKU: "PH-BUD-06", Category: "Phones", Product: "Apex Core Explorer", UnitsSold: 46000, MSRP: 249, CustomerRating: 4.0, ReturnRatePct: 2.5, Region: "Asia-Pacific" },
      { SKU: "AU-ENC-03", Category: "Audio", Product: "SonicShield Over-Ear", UnitsSold: 15400, MSRP: 199, CustomerRating: 4.6, ReturnRatePct: 1.1, Region: "Europe" },
      { SKU: "AU-TWP-07", Category: "Audio", Product: "SonicBuds Air Play", UnitsSold: 52000, MSRP: 99, CustomerRating: 4.3, ReturnRatePct: 3.5, Region: "North America" },
      { SKU: "AU-SND-11", Category: "Audio", Product: "CinemaBar Soundstage", UnitsSold: 8900, MSRP: 349, CustomerRating: 4.8, ReturnRatePct: 0.7, Region: "Europe" },
      { SKU: "SM-THR-44", Category: "Smart Home", Product: "Omni Portal Hub", UnitsSold: 11200, MSRP: 149, CustomerRating: 4.4, ReturnRatePct: 2.0, Region: "North America" },
      { SKU: "SM-CAM-05", Category: "Smart Home", Product: "SentryView Guard Eye", UnitsSold: 21900, MSRP: 89, CustomerRating: 4.3, ReturnRatePct: 3.1, Region: "North America" },
      { SKU: "SM-LGT-19", Category: "Smart Home", Product: "Aura Smart Ambient Light", UnitsSold: 43000, MSRP: 39, CustomerRating: 4.5, ReturnRatePct: 1.2, Region: "Europe" },
      { SKU: "CO-LAP-10", Category: "Computing", Product: "Zenith Blade laptop", UnitsSold: 4200, MSRP: 1499, CustomerRating: 4.7, ReturnRatePct: 1.5, Region: "North America" },
      { SKU: "CO-DKS-15", Category: "Computing", Product: "Zenith Core Desktop", UnitsSold: 2800, MSRP: 1299, CustomerRating: 4.6, ReturnRatePct: 1.1, Region: "Asia-Pacific" },
      { SKU: "CO-TAB-03", Category: "Computing", Product: "Zenith View Slate", UnitsSold: 19200, MSRP: 449, CustomerRating: 4.4, ReturnRatePct: 2.2, Region: "Europe" }
    ]
  },
  {
    id: "fitness_logs",
    name: "Aura Personal Health & Activity Logs",
    description: "Daily personal tracking log detailing activity indexes, calorie burn offsets, sleep indexes, heart rate variance, and hydration levels.",
    icon: "Sparkles",
    category: "Wellness & Health",
    data: [
      { Day: "Monday", CaloriesBurned: 2450, Steps: 10400, ActiveMinutes: 55, WaterQuotaML: 2200, SleepPct: 82, HeartRateAvg: 64 },
      { Day: "Tuesday", CaloriesBurned: 2800, Steps: 12900, ActiveMinutes: 80, WaterQuotaML: 2600, SleepPct: 76, HeartRateAvg: 68 },
      { Day: "Wednesday", CaloriesBurned: 2200, Steps: 8500, ActiveMinutes: 40, WaterQuotaML: 1800, SleepPct: 88, HeartRateAvg: 62 },
      { Day: "Thursday", CaloriesBurned: 2950, Steps: 14100, ActiveMinutes: 95, WaterQuotaML: 2800, SleepPct: 74, HeartRateAvg: 70 },
      { Day: "Friday", CaloriesBurned: 2600, Steps: 11200, ActiveMinutes: 65, WaterQuotaML: 2300, SleepPct: 80, HeartRateAvg: 66 },
      { Day: "Saturday", CaloriesBurned: 3200, Steps: 16800, ActiveMinutes: 120, WaterQuotaML: 3100, SleepPct: 92, HeartRateAvg: 72 },
      { Day: "Sunday", CaloriesBurned: 1950, Steps: 6200, ActiveMinutes: 25, WaterQuotaML: 1600, SleepPct: 95, HeartRateAvg: 58 }
    ]
  }
];

export function autoDetectColumns(data: any[]): ColumnSpec[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    // Look through some values in the dataset to guess the type
    let isNumeric = true;
    let isBoolean = true;
    let isDate = true;

    // Check up to 10 rows
    const sampledRows = data.slice(0, Math.min(data.length, 10));
    for (const row of sampledRows) {
      const val = row[key];
      if (val === undefined || val === null) continue;

      // Check numeric
      if (typeof val === "string") {
        const cleanedStr = val.replace(/[\$,%]/g, "").trim();
        if (cleanedStr === "" || isNaN(Number(cleanedStr))) {
          isNumeric = false;
        }
      } else if (typeof val !== "number") {
        isNumeric = false;
      }

      // Check boolean
      if (typeof val !== "boolean" && val !== "true" && val !== "false" && val !== 1 && val !== 0) {
        isBoolean = false;
      }

      // Check date
      if (typeof val !== "string" || isNaN(Date.parse(val))) {
        // Regex checking for month names like "Jan 2024" or standard date formats
        const reMonthYear = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[- ]\d{2,4}$/i;
        const reDayName = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i;
        if (!reMonthYear.test(String(val)) && !reDayName.test(String(val))) {
          isDate = false;
        }
      }
    }

    let type: "numeric" | "categorical" | "date" | "boolean" = "categorical";
    if (isNumeric) {
      type = "numeric";
    } else if (isDate) {
      type = "date";
    } else if (isBoolean) {
      type = "boolean";
    }

    return { name: key, type };
  });
}

// Convert string values to safe numbers when identified as numeric columns
export function cleanDatasetValues(data: any[], specs: ColumnSpec[]): any[] {
  return data.map((row) => {
    const newRow = { ...row };
    specs.forEach((spec) => {
      if (spec.type === "numeric" && row[spec.name] !== undefined && row[spec.name] !== null) {
        if (typeof row[spec.name] === "string") {
          const cleaned = row[spec.name].replace(/[\$,%]/g, "").trim();
          newRow[spec.name] = Number(cleaned) || 0;
        } else {
          newRow[spec.name] = Number(row[spec.name]);
        }
      }
    });
    return newRow;
  });
}
