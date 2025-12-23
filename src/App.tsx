import React, { useState, useEffect } from 'react';
import { fetchAnalystReport, fetchShortSqueezeCandidates, fetchTopMovers } from './marketService';
import { AnalystReport, ShortSqueezeCandidate, StockMover, GroundingSource } from './types';
import { ReportCard } from './components/ReportCard';
import { NewsAnalysis } from './components/NewsAnalysis';
import { PriceChart } from './components/PriceChart';
import { ShortSqueezeTable } from './components/ShortSqueezeTable';
import { TopMoversTable } from './components/TopMoversTable';
import MarketSentiment from './components/MarketSentiment';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Loader2,
  BarChart3,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  X,
  LayoutGrid,
  LineChart as LineChartIcon,
  Flame,
  Activity,
  RefreshCw,
  Users
} from 'lucide-react';

type MainTab = 'dashboard' | 'squeeze' | 'movers';
type ReportTab = 'verdicts' | 'charts';

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [report, setReport] = useState<AnalystReport | null>(null);
  
  const [squeezeData, setSqueezeData] = useState<ShortSqueezeCandidate[]>([]);
  const [moversData, setMoversData] = useState<StockMover[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanningSqueeze, setIsScanningSqueeze] = useState(false);
  const [isFetchingMovers, setIsFetchingMovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mainTab, setMainTab] = useState<MainTab>('dashboard');
  const [reportTab, setReportTab] = useState<ReportTab>('verdicts');

  useEffect(() => {
    const saved = localStorage.getItem('equity_analyst_watchlist');
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('equity_analyst_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const loadSqueezeScan = async () => {
    setIsScanningSqueeze(true);
    try {
      const result = await fetchShortSqueezeCandidates();
      setSqueezeData(result.data);
    } catch (e) { console.error(e); }
    finally { setIsScanningSqueeze(false); }
  };

  const loadMoversScan = async () => {
    setIsFetchingMovers(true);
    try {
      const result = await fetchTopMovers();
      setMoversData(result.data);
    } catch (e) { console.error(e); }
    finally { setIsFetchingMovers(false); }
  };

  const performAnalysis = async (symbol: string) => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    setTicker(symbol.toUpperCase());
    try {
      const data = await fetchAnalystReport(symbol);
      setReport(data);
      if (mainTab !== 'dashboard') setMainTab('dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [symbol, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <BarChart3 size={20} className="text-indigo-500" />
            <h1 className="text-sm font-bold tracking-tight text-white hidden md:block uppercase">Equity Quant</h1>
          </div>

          <div className="flex items-center gap-3 flex-1">
            <nav className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 shrink-0">
              <button 
                onClick={() => setMainTab('dashboard')} 
                className={`px-3 py-1 text-xs font-bold rounded ${mainTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Report
              </button>
              <button 
                onClick={() => { setMainTab('movers'); loadMoversScan(); }} 
                className={`px-3 py-1 text-xs font-bold rounded ${mainTab === 'movers' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Gainers
              </button>
              <button 
                onClick={() => { setMainTab('squeeze'); loadSqueezeScan(); }} 
                className={`px-3 py-1 text-xs font-bold rounded ${mainTab === 'squeeze' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Squeeze
              </button>
            </nav>

            <form onSubmit={(e) => { e.preventDefault(); performAnalysis(ticker); }} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text"
                  placeholder="Enter ticker (e.g. NVDA)..."
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-8 pr-4 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </form>
          </div>
        </div>
        <MarketSentiment />
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {mainTab === 'squeeze' ? (
          <ShortSqueezeTable candidates={squeezeData} isLive={true} onSelectTicker={performAnalysis} />
        ) : mainTab === 'movers' ? (
          <TopMoversTable movers={moversData} isLive={true} onSelectTicker={performAnalysis} />
        ) : (
          <div className="space-y-6">
            {!report && !isLoading && !error && (
               <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl max-w-2xl mx-auto px-8">
                  <h2 className="text-xl font-bold mb-6 text-white tracking-tight">Enter a Ticker for Real-time Quantitative Analysis</h2>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['AAPL', 'NVDA', 'TSLA', 'AVGO', 'VOO', 'VGT', 'RKLB', 'QBTS'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => performAnalysis(s)} 
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 text-xs text-slate-500 font-medium">Select a quick-link above or use the expanded search bar in the header.</p>
               </div>
            )}

            {isLoading && (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Syncing Real-time Prices...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-200 text-sm font-bold flex gap-2 max-w-2xl mx-auto">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            {report && !isLoading && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-5xl font-black text-white tracking-tighter">{report.ticker}</h2>
                        <button onClick={() => toggleWatchlist(report.ticker)}><Star className={watchlist.includes(report.ticker) ? "fill-amber-400 text-amber-400" : "text-slate-600"} size={24}/></button>
                        <button onClick={() => performAnalysis(report.ticker)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"><RefreshCw size={16} className="text-slate-400" /></button>
                      </div>
                      <div className="flex items-center gap-4 text-2xl font-bold mt-2">
                        <span>${report.price.toFixed(2)}</span>
                        <span className={report.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {report.change_percent >= 0 ? '+' : ''}{report.change_percent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Market Status</p>
                      <div className="flex items-center gap-1.5 text-emerald-500 font-bold mt-1">
                        <ShieldCheck size={14}/> Real-time Connected
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 border-b border-slate-800 mb-6">
                    <button onClick={() => setReportTab('verdicts')} className={`pb-2 text-xs font-black uppercase tracking-widest ${reportTab === 'verdicts' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-slate-500'}`}>Verdicts</button>
                    <button onClick={() => setReportTab('charts')} className={`pb-2 text-xs font-black uppercase tracking-widest ${reportTab === 'charts' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-slate-500'}`}>Charts</button>
                  </div>

                  {reportTab === 'verdicts' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <ReportCard title="Intraday" subtitle="Momentum" data={report.verdicts.day_trade} />
                      <ReportCard title="Swing" subtitle="Trend" data={report.verdicts.swing_trade} />
                      <ReportCard title="Long Term" subtitle="Quant" data={report.verdicts.long_term} />
                      <ReportCard title="Risk" subtitle="Defense" data={report.verdicts.defensive} />
                    </div>
                  ) : (
                    <PriceChart data={report.historical_data} isPositive={report.change_percent >= 0} />
                  )}
                </div>

                {/* Related Peers Section */}
                {report.related_stocks && report.related_stocks.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={16} className="text-blue-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Industry Peers & Related Stocks</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {report.related_stocks.map(peer => (
                        <button
                          key={peer}
                          onClick={() => performAnalysis(peer)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black text-slate-300 transition-all hover:scale-105 active:scale-95"
                        >
                          {peer}
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 font-medium">Click a peer ticker to view its quantitative report and technical verdicts.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NewsAnalysis sentiment={report.news_analysis.sentiment} narrative={report.news_analysis.narrative_summary} risk={report.news_analysis.catalyst_risk} />
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quant Confirmation</h3>
                    <ul className="space-y-3">
                      {report.confidence_notes.map((note, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <ShieldCheck size={14} className="text-emerald-500 mt-1 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;