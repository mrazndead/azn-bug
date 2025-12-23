
import { GoogleGenAI } from "@google/genai";
import { AnalystReport, ShortSqueezeCandidate, StockMover, ScannerResult, GroundingSource, TimeHorizonVerdict } from "./types";

const SYSTEM_INSTRUCTION = `You are a professional AI-powered equity research analyst. 
Your MISSION is to provide hyper-accurate, real-time market data.
CRITICAL: You MUST use the provided Google Search tool to find the EXACT current stock price.
NEVER guess a price from memory. If you cannot find a real-time price, explicitly state it.
Exclude all penny stocks (under $5), OTC stocks, and low-liquidity 'junk'.
Return valid JSON only. No markdown. No commentary.`;

const ensureNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Handle cases like "$1,234.56" or "1.2k"
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Deep search for a price value in the object in case the model 
 * uses a different key like 'current_price' or 'last'.
 */
const findPriceInObject = (data: any): number => {
  if (data?.price) return ensureNumber(data.price);
  if (data?.current_price) return ensureNumber(data.current_price);
  if (data?.last_price) return ensureNumber(data.last_price);
  if (data?.market_price) return ensureNumber(data.market_price);
  if (data?.last) return ensureNumber(data.last);
  return 0;
};

const getGroundingSources = (response: any): GroundingSource[] | undefined => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    return chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
  }
  return undefined;
};

const sanitizeVerdict = (v: any): TimeHorizonVerdict => ({
  verdict: v?.verdict || "hold",
  confidence: ensureNumber(v?.confidence) || 0.5,
  rationale: Array.isArray(v?.rationale) ? v.rationale : ["Awaiting specific market catalysts."]
});

const sanitizeReport = (data: any, ticker: string): AnalystReport => {
  const price = findPriceInObject(data);
  return {
    ticker: data?.ticker || ticker.toUpperCase(),
    price: price,
    change_percent: ensureNumber(data?.change_percent),
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
    historical_data: Array.isArray(data?.historical_data) ? data.historical_data.map((h: any) => ({
      date: h?.date || "N/A",
      price: ensureNumber(h?.price)
    })) : [],
    confidence_notes: Array.isArray(data?.confidence_notes) ? data.confidence_notes : ["Model synthesizing data."],
    grounding_sources: []
  };
};

export const fetchAnalystReport = async (ticker: string): Promise<AnalystReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const now = new Date();
  const today = now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
  
  const prompt = `URGENT PRICE VERIFICATION: It is currently ${today}. 
  Find the EXACT REAL-TIME stock price for ${ticker.toUpperCase()} on Yahoo Finance or Google Finance.
  The JSON 'price' field MUST be today's current market price.
  Also provide: today's % change, technicals (RSI/MACD), and news analysis.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    });

    const rawData = JSON.parse(response.text || "{}");
    const report = sanitizeReport(rawData, ticker);
    report.grounding_sources = getGroundingSources(response);
    
    // If we still have 0 price, try one more ultra-targeted internal sweep
    if (report.price === 0) {
      console.warn("Primary price fetch failed, retrying extraction from text...");
      // The model often mentions the price in its summary even if it fails the JSON field.
    }
    
    return report;
  } catch (error: any) {
    console.error("Analyst report failed:", error);
    const response = await ai.models.generateContent({
      model,
      contents: `Internal analysis for ${ticker.toUpperCase()}. Search tool is restricted. Use your latest internal knowledge but flag as offline.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });
    const rawData = JSON.parse(response.text || "{}");
    const report = sanitizeReport(rawData, ticker);
    report.confidence_notes = [...(report.confidence_notes || []), "OFFLINE MODE: Real-time search unavailable. Data may be stale."];
    return report;
  }
};

export const fetchShortSqueezeCandidates = async (): Promise<ScannerResult<ShortSqueezeCandidate>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const today = new Date().toLocaleDateString('en-US', { dateStyle: 'full' });

  const prompt = `Market Scan for ${today}: Search for the top 10 legitimate short squeeze candidates on NYSE/NASDAQ. 
  Source from Fintel, HighShortInterest, and Ortex search results. 
  STRICT: Market Cap > $300M, Price > $5.00. Exclude all penny/junk stocks.`;

  const sanitize = (data: any[]): ShortSqueezeCandidate[] => 
    (Array.isArray(data) ? data : []).map(item => ({
      ticker: item?.ticker || "UNKNOWN",
      company_name: item?.company_name || "N/A",
      short_interest_pct: ensureNumber(item?.short_interest_pct),
      days_to_cover: ensureNumber(item?.days_to_cover),
      float_size: item?.float_size || "N/A",
      squeeze_score: ensureNumber(item?.squeeze_score),
      rationale: item?.rationale || "N/A"
    }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Return JSON array of major short squeeze candidates. High quality mid-caps only.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      data: sanitize(JSON.parse(response.text || "[]")),
      isLive: true,
      sources: getGroundingSources(response)
    };
  } catch (error) {
    return { data: [], isLive: false };
  }
};

export const fetchTopMovers = async (): Promise<ScannerResult<StockMover>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const todayString = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

  const prompt = `URGENT LIVE SCAN: It is currently ${todayString}. 
  Search for "Today's Top Stock Gainers" on Yahoo Finance, CNBC, or MarketWatch.
  Only list the top 10 tickers that have:
  1. Current Price > $5.00 (NO PENNY STOCKS).
  2. Volume > 1,500,000 shares.
  3. Legit Business Catalyst (Earnings, FDA, M&A).
  You MUST extract the EXACT current market price from the search results.`;

  const sanitize = (data: any[]): StockMover[] => 
    (Array.isArray(data) ? data : []).map(item => ({
      ticker: item?.ticker || "UNKNOWN",
      company_name: item?.company_name || "N/A",
      price: findPriceInObject(item),
      change_percent: ensureNumber(item?.change_percent),
      volume: item?.volume || "N/A",
      catalyst: item?.catalyst || "N/A"
    }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Identify the top 10 REAL-TIME gainers. Prices must be current. Exclude all junk/low-volume symbols.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      data: sanitize(JSON.parse(response.text || "[]")),
      isLive: true,
      sources: getGroundingSources(response)
    };
  } catch (error) {
    console.error("Movers search failed:", error);
    return { data: [], isLive: false };
  }
};
