export type VerdictType = "buy" | "hold" | "sell" | "avoid" | "short";
export type RiskLevel = "low" | "medium" | "high";
export type MarketMood = "bullish" | "neutral" | "bearish";
export type Sentiment = "positive" | "neutral" | "negative";

export interface HistoryPoint {
  date: string;
  price: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ShortSqueezeCandidate {
  ticker: string;
  company_name: string;
  short_interest_pct: number;
  days_to_cover: number;
  float_size: string;
  squeeze_score: number;
  rationale: string;
}

export interface StockMover {
  ticker: string;
  company_name: string;
  price: number;
  change_percent: number;
  volume: string;
  catalyst: string;
}

export interface ScannerResult<T> {
  data: T[];
  isLive: boolean;
  sources?: GroundingSource[];
}

export interface TimeHorizonVerdict {
  verdict: VerdictType;
  confidence: number;
  rationale: string[];
}

export interface AnalystReport {
  ticker: string;
  price: number;
  change_percent: number;
  overall_summary: {
    one_liner: string;
    market_mood: MarketMood;
    risk_level: RiskLevel;
  };
  verdicts: {
    day_trade: TimeHorizonVerdict;
    swing_trade: TimeHorizonVerdict;
    long_term: TimeHorizonVerdict;
    defensive: TimeHorizonVerdict;
  };
  news_analysis: {
    sentiment: Sentiment;
    narrative_summary: string;
    catalyst_risk: RiskLevel;
  };
  historical_data: HistoryPoint[];
  confidence_notes: string[];
  grounding_sources?: GroundingSource[];
  related_stocks?: string[];
}