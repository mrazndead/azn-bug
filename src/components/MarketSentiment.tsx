"use client";

import React from 'react';
import { Globe, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const MarketSentiment = () => {
  return (
    <div className="bg-slate-900/50 border-y border-slate-800 px-4 py-1.5 overflow-hidden">
      <div className="max-w-5xl mx-auto flex items-center gap-4 animate-in fade-in duration-500">
        <Globe size={12} className="text-blue-400 shrink-0" />
        
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">S&P 500</span>
            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={10} /> +0.42%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">NASDAQ</span>
            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={10} /> +0.81%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">VIX</span>
            <span className="text-[10px] font-black text-rose-400 flex items-center gap-0.5">
              <TrendingDown size={10} /> -2.15%
            </span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
            <Activity size={10} className="text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Sentiment: Bullish</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSentiment;