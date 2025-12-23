
import React from 'react';
import { TimeHorizonVerdict, VerdictType } from '../types';

interface ReportCardProps {
  title: string;
  subtitle: string;
  data: TimeHorizonVerdict;
}

const VERDICT_COLORS: Record<VerdictType, string> = {
  buy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  hold: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  sell: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  avoid: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  short: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export const ReportCard: React.FC<ReportCardProps> = ({ title, subtitle, data }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{subtitle}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${VERDICT_COLORS[data.verdict]}`}>
          {data.verdict}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Analyst Confidence</span>
          <span className="text-slate-200">{Math.round(data.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${data.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      <ul className="space-y-2">
        {data.rationale.map((point, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <span className="text-slate-500 mt-1">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};
