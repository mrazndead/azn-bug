
import React from 'react';
import { ShortSqueezeCandidate, GroundingSource } from '../types';
import { TrendingUp, Info, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';

interface ShortSqueezeTableProps {
  candidates: ShortSqueezeCandidate[];
  isLive: boolean;
  sources?: GroundingSource[];
  onSelectTicker: (ticker: string) => void;
}

export const ShortSqueezeTable: React.FC<ShortSqueezeTableProps> = ({ candidates, isLive, sources, onSelectTicker }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-purple-400" size={18} />
          <h3 className="font-bold text-white">Market-Wide Squeeze Scan (NYSE/NASDAQ)</h3>
        </div>
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Search</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <ShieldAlert size={10} className="text-amber-500" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Model Estimate</span>
            </div>
          )}
        </div>
      </div>

      {!isLive && (
        <div className="px-4 py-2 bg-amber-900/20 border-b border-amber-500/10">
          <p className="text-[10px] text-amber-400 font-medium">
            Note: Search grounding is limited. Using internal model datasets for short interest estimations.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-950/50 text-slate-500 uppercase text-[10px] tracking-widest">
              <th className="px-6 py-4 font-bold">Ticker</th>
              <th className="px-6 py-4 font-bold">Short Interest %</th>
              <th className="px-6 py-4 font-bold">Days to Cover</th>
              <th className="px-6 py-4 font-bold">Float</th>
              <th className="px-6 py-4 font-bold">Squeeze Score</th>
              <th className="px-6 py-4 font-bold">Rationale</th>
              <th className="px-6 py-4 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {candidates.map((item) => {
              const si = Number(item.short_interest_pct || 0);
              const dtc = Number(item.days_to_cover || 0);
              const score = Number(item.squeeze_score || 0);
              
              return (
                <tr 
                  key={item.ticker} 
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectTicker(item.ticker)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-white group-hover:text-blue-400 transition-colors">{item.ticker}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{item.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${si > 25 ? 'text-rose-400' : si > 15 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {si.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {dtc.toFixed(1)}d
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {item.float_size}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-purple-300">{score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs italic">
                    {item.rationale}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-black uppercase text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Analyze
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sources && sources.length > 0 && (
        <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sources:</span>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {s.title.split(' ').slice(0, 3).join(' ')}... <ExternalLink size={8} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
