import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to retrieve Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // API Route - Analyze dataset with Gemini API
  app.post("/api/analyze-data", async (req, res) => {
    try {
      const { data, userQuestion, columns, activeCategoryCol, activeNumericCol } = req.body;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "No dataset provided or data is invalid." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          isMocked: true,
          generalSummary: "### AI Insights (Sandbox Mode)\n\nTo unlock fully automated AI Data Analytics and smart interactive questions, please provide a valid **GEMINI_API_KEY** in the **Settings > Secrets** panel of AI Studio.\n\nRunning in local analyzer mode currently. I have calculated statistics for your columns below!",
          metrics: [
            { label: "Total Records", value: `${data.length}`, description: "Total rows parsed successfully" },
            { label: "Available Columns", value: `${columns?.length || 0}`, description: "Categorical and numerical attributes detected" }
          ],
          insights: [
            {
              headline: "Local Statistical Discovery",
              body: `We detected ${columns?.length || 0} attributes. You can visualize variables such as ${activeCategoryCol || "the category columns"} against numerical counts or sums like ${activeNumericCol || "your numeric columns"} using the sidebar tools.`,
              chartRecommendation: { type: "bar", xCol: activeCategoryCol || "", yCol: activeNumericCol || "" }
            }
          ],
          answers: userQuestion ? "Configure your Gemini API Key in secrets to ask custom natural language questions about your data." : ""
        });
      }

      // Sample or slice data to prevent payload token bloating, while still offering excellent resolution.
      const maxRowsForAI = 150;
      const slicedData = data.slice(0, maxRowsForAI);
      const columnsSpec = columns || Object.keys(data[0] || {});

      const systemPrompt = `You are a high-caliber Senior Data Analyst and Visualizer.
Your goal is to inspect a user's uploaded dataset, suggest outstanding insights, recommend visual charts, generate dynamic KPI metrics, and answer any custom question.
You MUST output your response in STRICTRULY valid JSON format conforming to the requested schema. Do not output any markdown codeblock backticks or surrounding text. Only returning valid JSON.`;

      const analysisPrompt = `Here is the structured dataset.
Total rows in dataset: ${data.length}
Columns: ${JSON.stringify(columnsSpec)}
Currently visualized: Category Column = "${activeCategoryCol}", Numeric Column = "${activeNumericCol}"

Data sample (first ${slicedData.length} records):
${JSON.stringify(slicedData, null, 2)}

User's custom question or instruction (if any): "${userQuestion || "None"}"

Please perform a thorough analysis of this data and generate the following JSON payload.
Conform strictly to the following JSON structure:
{
  "generalSummary": "A concise executive summary of the dataset including major characteristics, quality evaluation, and general findings. Write in clean markdown.",
  "metrics": [
    {
      "label": "The name of a calculated metric (e.g., 'Total Revenue', 'Avg Response Time', 'Success Rate')",
      "value": "The computed string or formatted number value",
      "description": "Short explanation of the calculation"
    }
  ],
  "insights": [
    {
      "headline": "A punchy description of a discovery (e.g., 'Q3 Regional Outperfomance', 'Spike in Weekend Conversions')",
      "body": "Detailed paragraph explaining the breakdown, the correlation, or the pattern observed in the data.",
      "chartRecommendation": {
        "type": "one of: bar, line, area, pie, scatter, radar",
        "xCol": "Column name from columnsSpec to use as X-axis or Categorical label",
        "yCol": "Column name from columnsSpec to use as Y-axis or quantitative variable"
      }
    }
  ],
  "answers": "If the user provided a custom question, write a thorough, context-grounded analytical answer here. If no custom question was provided, you can leave this empty."
}

Analyze deeply, focusing on unexpected correlations, outliers, periods of peak activity, and trends. Return only the raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: analysisPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.2,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generalSummary: { type: Type.STRING, description: "Executive summary in markdown format" },
              answers: { type: Type.STRING, description: "Specific reply to the user's question, if any" },
              metrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["label", "value", "description"]
                }
              },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                    chartRecommendation: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        xCol: { type: Type.STRING },
                        yCol: { type: Type.STRING }
                      },
                      required: ["type", "xCol", "yCol"]
                    }
                  },
                  required: ["headline", "body", "chartRecommendation"]
                }
              }
            },
            required: ["generalSummary", "metrics", "insights", "answers"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedAnalysis = JSON.parse(responseText.trim());
      res.json({ ...parsedAnalysis, isMocked: false });
    } catch (error: any) {
      console.error("Gemini data analysis request failed:", error);
      res.status(500).json({ error: error.message || "Failed to analyze data" });
    }
  });

  // Vite Integration for Asset Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully on http://localhost:${PORT}`);
  });
}

startServer();
