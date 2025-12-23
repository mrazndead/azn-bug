import { GoogleGenAI } from "@google/genai";
import { AnalystReport, ShortSqueezeCandidate, StockMover, ScannerResult, GroundingSource, TimeHorizonVerdict } from "./types";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const AV_KEY = process.env.ALPHAVANTAGE_API_KEY;

const SYSTEM_INSTRUCTION = `You are a professional AI-powered equity research analyst. 
Your MISSION is to synthesize market data into actionable verdicts.
You will be provided with REAL-TIME API data (Price, Change, etc.). Use this as the source of truth.
Exclude all penny stocks (under $5), OTC stocks, and low-liquidity symbols.
Return valid JSON only. No markdown. No commentary.`;

const ensureNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// --- Real-time API Fetchers ---

const fetchFinnhubQuote = async (symbol: string) => {
  if (!FINNHUB_KEY) return null;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    return {
      price: data.c, // Current price
      change_pct: data.dp, // Percent change
      high: data.h,
      low: data.l
    };
  } catch (e) {
    console.error("Finnhub fetch failed", e);
    return null;
  }
};

const fetchAVHistorical = async (symbol: string) => {
  if (!AV_KEY) return [];
  try {
    const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol.toUpperCase()}&apikey=${AV_KEY}`);
    const data = await res.json();
    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries) return [];
    
    return Object.entries(timeSeries).slice(0, 30).map(([date, values]: [string, any]) => ({
      date: date.split('-').slice(1).join('/'), // MM/DD format
      price: parseFloat(values["4. close"])
    })).reverse();
  } catch (e) {
    return [];
  }
};

// --- Sanitization Helpers ---

const sanitizeVerdict = (v: any): TimeHorizonVerdict => ({
  verdict: (v?.verdict || "hold").toLowerCase() as any,
  confidence: ensureNumber(v?.confidence) || 0.5,
  rationale: Array.isArray(v?.rationale) ? v.rationale : ["Awaiting specific market catalysts."]
});

const sanitizeReport = (data: any, ticker: string, apiPrice: number, apiChange: number, apiHistory: any[]): AnalystReport => {
  return {
    ticker: data?.ticker || ticker.toUpperCase(),
    price: apiPrice || ensureNumber(data?.price),
    change_percent: apiChange || ensureNumber(data?.change_percent),
    overall_summary: {
      one_liner: data?.overall_summary?.one_liner || "Synthesizing real-time market data...",
      market_mood: data?.overall_summary?.market_mood || "neutral",
      risk_level: data?.overall_summary?.risk_level || "medium"
    },
    verdicts: {
      day_trade: sanitizeVerdict(data?.verdicts?.day_trade),
      swing_trade: sanitizeVerdict(data?.verdicts?.swing_trade),
      long_term: sanitizeVerdict(data?.verdicts?.long_term),
      defensive: sanitizeVerdict(data?.verdicts?.defensive),
    },
    news_analysis: {
      sentiment: data?.news_analysis?.sentiment || "neutral",
      narrative_summary: data?.news_analysis?.narrative_summary || "Scanning recent news flow...",
      catalyst_risk: data?.news_analysis?.catalyst_risk || "medium"
    },
    historical_data: apiHistory.length > 0 ? apiHistory : (Array.isArray(data?.historical_data) ? data.historical_data : []),
    confidence_notes: Array.isArray(data?.confidence_notes) ? data.confidence_notes : ["Model synthesizing data."],
    grounding_sources: []
  };
};

// --- Main Exported Functions ---

export const fetchAnalystReport = async (ticker: string): Promise<AnalystReport> => {
  if (!GEMINI_KEY) throw new Error("Gemini API Key is missing.");

  // 1. Get Real-time data from APIs first
  const [quote, history] = await Promise.all([
    fetchFinnhubQuote(ticker),
    fetchAVHistorical(ticker)
  ]);

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION 
  });
  
  const prompt = `
    ANALYSIS TARGET: ${ticker.toUpperCase()}
    REAL-TIME DATA: Price: $${quote?.price || 'Unknown'}, Change: ${quote?.change_pct || '0'}%
    Provide technical analysis, sentiment, and multi-horizon verdicts based on this data.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean potential markdown from response
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const rawData = JSON.parse(cleanJson);
    
    return sanitizeReport(rawData, ticker, quote?.price || 0, quote?.change_pct || 0, history);
  } catch (error: any) {
    console.error("Analyst report failed:", error);
    throw error;
  }
};

export const fetchTopMovers = async (): Promise<ScannerResult<StockMover>> => {
  // Use Finnhub's market news or top gainers if available, or Gemini as a backup
  if (!GEMINI_KEY) return { data: [], isLive: false };

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Find today's top 10 stock gainers with high volume (>1M) and price > $5. Return as JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    const sanitized = (Array.isArray(data) ? data : []).map(item => ({
      ticker: item?.ticker || "UNKNOWN",
      company_name: item?.company_name || "N/A",
      price: ensureNumber(item?.price),
      change_percent: ensureNumber(item?.change_percent),
      volume: item?.volume || "N/A",
      catalyst: item?.catalyst || "N/A"
    }));

    return { data: sanitized, isLive: !!FINNHUB_KEY };
  } catch (error) {
    return { data: [], isLive: false };
  }
};

export const fetchShortSqueezeCandidates = async (): Promise<ScannerResult<ShortSqueezeCandidate>> => {
  if (!GEMINI_KEY) return { data: [], isLive: false };
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Search for top 10 high short interest stocks (>15% SI). Return as JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    const sanitized = (Array.isArray(data) ? data : []).map(item => ({
      ticker: item?.ticker || "UNKNOWN",
      company_name: item?.company_name || "N/A",
      short_interest_pct: ensureNumber(item?.short_interest_pct),
      days_to_cover: ensureNumber(item?.days_to_cover),
      float_size: item?.float_size || "N/A",
      squeeze_score: ensureNumber(item?.squeeze_score),
      rationale: item?.rationale || "N/A"
    }));

    return { data: sanitized, isLive: true };
  } catch (error) {
    return { data: [], isLive: false };
  }
};