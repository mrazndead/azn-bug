
import React from 'react';
import { Sentiment, RiskLevel } from '../types';

interface NewsAnalysisProps {
  sentiment: Sentiment;
  narrative: string;
  risk: RiskLevel;
}

const SENTIMENT_ICONS = {
  positive: '▲',
  neutral: '◆',
  negative: '▼',
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-rose-400',
};

export const NewsAnalysis: React.FC<NewsAnalysisProps> = ({ sentiment, narrative, risk }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-2xl ${sentiment === 'positive' ? 'text-emerald-400' : sentiment === 'negative' ? 'text-rose-400' : 'text-slate-400'}`}>
          {SENTIMENT_ICONS[sentiment]}
        </div>
        <div>
          <h3 className="font-semibold text-white">News Narrative</h3>
          <p className="text-xs text-slate-400">Current Sentiment: <span className="capitalize">{sentiment}</span></p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Catalyst Risk</p>
          <p className={`text-sm font-bold uppercase ${RISK_COLORS[risk]}`}>{risk}</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">
        {narrative}
      </p>
    </div>
  );
};
