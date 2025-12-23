import React from 'react';
import { StockMover, GroundingSource } from '../types';
import { Activity, ShieldCheck, ShieldAlert, ExternalLink, Clock } from 'lucide-react';

interface TopMoversTableProps {
  movers: StockMover[];
  isLive: boolean;
  sources?: GroundingSource[];
  onSelectTicker: (ticker: string) => void;
}

export const TopMoversTable: React.FC<TopMoversTableProps> = ({ movers, isLive, sources, onSelectTicker }) => {
  const lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400" size={18} />
          <div>
            <h3 className="font-bold text-white leading-none">Market Leaders: Top Gainers</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">NYSE / NASDAQ • Vol {'>'} 1M • Price {'>'} $5</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Clock size={12} />
            Synced: {lastSyncTime}
          </div>
          {isLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">API: Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <ShieldAlert size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">API: Restricted</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {movers.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Activity className="mx-auto text-slate-800" size={48} />
            <p className="text-slate-500 font-medium italic">Scanning exchange for top gainers...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 uppercase text-[10px] tracking-widest">
                <th className="px-6 py-4 font-bold">Ticker</th>
                <th className="px-6 py-4 font-bold">Today's Price</th>
                <th className="px-6 py-4 font-bold">Day Change</th>
                <th className="px-6 py-4 font-bold">Volume</th>
                <th className="px-6 py-4 font-bold">Primary Catalyst</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {movers.map((mover) => (
                <tr 
                  key={mover.ticker} 
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectTicker(mover.ticker)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-white group-hover:text-blue-400 transition-colors text-base">{mover.ticker}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[150px] font-medium">{mover.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-black text-base">
                    ${Number(mover.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-emerald-400 font-black text-base">
                        +{Number(mover.change_percent || 0).toFixed(2)}%
                      </span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(Number(mover.change_percent), 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 font-bold text-xs tabular-nums">{mover.volume}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs italic leading-tight max-w-[220px]">
                    {mover.catalyst}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="px-3 py-1 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase rounded group-hover:bg-blue-500 group-hover:text-white transition-all">
                      Analyze
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sources && sources.length > 0 && (
        <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest shrink-0">Scanned Sources:</span>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title} <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};