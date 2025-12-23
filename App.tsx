
import React, { useState, useEffect } from 'react';
import { fetchAnalystReport, fetchShortSqueezeCandidates, fetchTopMovers } from './geminiService';
import { AnalystReport, ShortSqueezeCandidate, StockMover, GroundingSource } from './types';
import { ReportCard } from './components/ReportCard';
import { NewsAnalysis } from './components/NewsAnalysis';
import { PriceChart } from './components/PriceChart';
import { ShortSqueezeTable } from './components/ShortSqueezeTable';
import { TopMoversTable } from './components/TopMoversTable';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Info, 
  ExternalLink,
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
  RefreshCw
} from 'lucide-react';

type MainTab = 'dashboard' | 'squeeze' | 'movers';
type ReportTab = 'verdicts' | 'charts';

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [report, setReport] = useState<AnalystReport | null>(null);
  
  const [squeezeData, setSqueezeData] = useState<ShortSqueezeCandidate[]>([]);
  const [squeezeIsLive, setSqueezeIsLive] = useState(false);
  const [squeezeSources, setSqueezeSources] = useState<GroundingSource[]>([]);
  
  const [moversData, setMoversData] = useState<StockMover[]>([]);
  const [moversIsLive, setMoversIsLive] = useState(false);
  const [moversSources, setMoversSources] = useState<GroundingSource[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanningSqueeze, setIsScanningSqueeze] = useState(false);
  const [isFetchingMovers, setIsFetchingMovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mainTab, setMainTab] = useState<MainTab>('dashboard');
  const [reportTab, setReportTab] = useState<ReportTab>('verdicts');

  const loadingMessages = [
    "Grounding real-time market price...",
    "Querying Yahoo/Google Finance feeds...",
    "Verifying exchange volume liquidity...",
    "Analyzing multi-horizon risk models...",
    "Finalizing analyst verdicts..."
  ];

  useEffect(() => {
    const saved = localStorage.getItem('equity_analyst_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('equity_analyst_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadSqueezeScan = async () => {
    setIsScanningSqueeze(true);
    try {
      const result = await fetchShortSqueezeCandidates();
      setSqueezeData(result.data);
      setSqueezeIsLive(result.isLive);
      setSqueezeSources(result.sources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanningSqueeze(false);
    }
  };

  const loadMoversScan = async () => {
    setIsFetchingMovers(true);
    try {
      const result = await fetchTopMovers();
      setMoversData(result.data);
      setMoversIsLive(result.isLive);
      setMoversSources(result.sources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingMovers(false);
    }
  };

  const performAnalysis = async (symbol: string) => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    setTicker(symbol.toUpperCase());
    setMainTab('dashboard');
    try {
      const data = await fetchAnalystReport(symbol);
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to generate report for ${symbol.toUpperCase()}. Check connectivity.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performAnalysis(ticker);
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      if (prev.includes(symbol)) return prev.filter(s => s !== symbol);
      return [symbol, ...prev].slice(0, 10);
    });
  };

  const isWatched = report ? watchlist.includes(report.ticker) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white hidden md:block">Equity Analyst <span className="text-blue-500">PRO</span></h1>
            </div>

            <nav className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setMainTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mainTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setMainTab('movers'); loadMoversScan(); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${mainTab === 'movers' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Activity size={14} className={mainTab === 'movers' ? 'animate-pulse' : ''} />
                Gainers
              </button>
              <button 
                onClick={() => { setMainTab('squeeze'); loadSqueezeScan(); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${mainTab === 'squeeze' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Flame size={14} className={mainTab === 'squeeze' ? 'animate-pulse' : ''} />
                Squeeze
              </button>
            </nav>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-sm">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Ticker Search..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-xs"
              />
            </div>
          </form>
        </div>

        {watchlist.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 py-2 border-t border-slate-800/50 flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-slate-500 shrink-0">
              <Star size={14} className="fill-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Watch</span>
            </div>
            <div className="flex gap-2">
              {watchlist.map(sym => (
                <div key={sym} className="relative group shrink-0">
                  <button
                    onClick={() => performAnalysis(sym)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${
                      report?.ticker === sym 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {sym}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(sym); }}
                    className="absolute -top-1 -right-1 bg-slate-800 text-slate-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all border border-slate-700"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {mainTab === 'squeeze' ? (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8">
              <div className="bg-purple-600/20 p-6 rounded-3xl border border-purple-500/30">
                <Flame size={48} className="text-purple-500 animate-pulse" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Alpha Scanner: Short Squeeze</h2>
                <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                  Real-time algorithmic scan targeting symbols with high Short Interest % of Float and Days to Cover. Focus on Mid-Cap NYSE/NASDAQ liquidity.
                </p>
              </div>
              <button 
                onClick={loadSqueezeScan}
                disabled={isScanningSqueeze}
                className="md:ml-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isScanningSqueeze ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isScanningSqueeze ? "Scanning..." : "Sync Scan"}
              </button>
            </div>
            {isScanningSqueeze && squeezeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Parsing exchange data...</p>
              </div>
            ) : (
              <ShortSqueezeTable 
                candidates={squeezeData} 
                isLive={squeezeIsLive} 
                sources={squeezeSources} 
                onSelectTicker={performAnalysis} 
              />
            )}
          </div>
        ) : mainTab === 'movers' ? (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8">
              <div className="bg-emerald-600/20 p-6 rounded-3xl border border-emerald-500/30">
                <TrendingUp size={48} className="text-emerald-500 animate-bounce" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Market Leaders: Gainer Scan</h2>
                <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                  Top 10 legitimate symbols with the highest percentage gain since market open. Mandatory $5+ price and 1M+ daily volume filters.
                </p>
              </div>
              <button 
                onClick={loadMoversScan}
                disabled={isFetchingMovers}
                className="md:ml-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isFetchingMovers ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isFetchingMovers ? "Fetching..." : "Sync Movers"}
              </button>
            </div>
            {isFetchingMovers && moversData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Identifying real-time leaders...</p>
              </div>
            ) : (
              <TopMoversTable 
                movers={moversData} 
                isLive={moversIsLive} 
                sources={moversSources} 
                onSelectTicker={performAnalysis} 
              />
            )}
          </div>
        ) : (
          <>
            {!report && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 max-w-lg">
                  <BarChart3 size={48} className="text-blue-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-3">Deep Equity Research</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Search a ticker for institutional-grade analysis grounded in real-time data.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    {['NVDA', 'TSLA', 'AAPL', 'AMD'].map(sym => (
                      <button 
                        key={sym} 
                        onClick={() => performAnalysis(sym)}
                        className="bg-slate-800 hover:bg-slate-700 py-2.5 px-4 rounded-xl border border-slate-700 text-sm transition-colors text-slate-300 flex items-center justify-between group"
                      >
                        Analyze {sym}
                        <TrendingUp size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                  <Loader2 className="animate-spin text-blue-500 relative" size={48} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white mb-2 tracking-tighter">Scanning {ticker}</p>
                  <p className="text-slate-500 animate-pulse text-sm h-5 font-medium">{loadingMessages[loadingStep]}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-start gap-3 text-rose-200 max-w-lg mx-auto mt-10">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {report && !isLoading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-4xl font-black text-white tracking-tighter">{report.ticker}</h2>
                        <button 
                          onClick={() => toggleWatchlist(report.ticker)}
                          className={`mt-2 p-1.5 rounded-lg border transition-all ${
                            isWatched 
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          <Star size={18} className={isWatched ? "fill-amber-500" : ""} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-2xl font-bold">
                        {report.price > 0 ? (
                          <span>${report.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-slate-600 italic text-lg">Price Pending Sync...</span>
                        )}
                        <span className={`flex items-center gap-1 ${report.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {report.change_percent >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                          {report.change_percent > 0 ? '+' : ''}{report.change_percent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-700 min-w-[240px]">
                      <p className="text-[10px] uppercase text-slate-500 font-black mb-1 tracking-widest">Executive Summary</p>
                      <p className="text-sm text-slate-200 leading-tight font-medium italic">"{report?.overall_summary?.one_liner || 'Finalizing data synthesis...'}"</p>
                    </div>
                  </div>

                  <div className="flex border-b border-slate-800 mb-6">
                    <button onClick={() => setReportTab('verdicts')} className={`px-4 py-2 text-xs font-bold transition-all relative ${reportTab === 'verdicts' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <LayoutGrid size={14} />
                        Strategic Verdicts
                      </div>
                      {reportTab === 'verdicts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                    </button>
                    <button onClick={() => setReportTab('charts')} className={`px-4 py-2 text-xs font-bold transition-all relative ${reportTab === 'charts' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <LineChartIcon size={14} />
                        Historical Action
                      </div>
                      {reportTab === 'charts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                    </button>
                  </div>

                  {reportTab === 'verdicts' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <ReportCard title="Day Trade" subtitle="Intraday • 48h" data={report.verdicts.day_trade} />
                      <ReportCard title="Swing Trade" subtitle="1 • 4 Weeks" data={report.verdicts.swing_trade} />
                      <ReportCard title="Long Term" subtitle="Institutional Hold" data={report.verdicts.long_term} />
                      <ReportCard title="Defensive" subtitle="Risk Management" data={report.verdicts.defensive} />
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                      <PriceChart data={report.historical_data} isPositive={report.change_percent >= 0} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <NewsAnalysis sentiment={report.news_analysis.sentiment} narrative={report.news_analysis.narrative_summary} risk={report.news_analysis.catalyst_risk} />
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4 text-slate-400">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <h3 className="font-bold text-white uppercase tracking-tight">Technical Confirmation Notes</h3>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.confidence_notes.map((note, i) => (
                          <li key={i} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 text-xs font-medium text-slate-300 leading-relaxed">{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                        <Info size={14} className="text-blue-500" />
                        Execution Context
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Zap className="text-amber-400 shrink-0 mt-1" size={16} />
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Momentum Strength</p>
                            <p className="text-sm text-slate-300 font-bold uppercase">{report.overall_summary.market_mood}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="text-blue-400 shrink-0 mt-1" size={16} />
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Analysis Status</p>
                            <p className="text-sm text-slate-300 font-bold">Verified via Search Grounding</p>
                          </div>
                        </div>
                      </div>
                      {report.grounding_sources && report.grounding_sources.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-800">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Verification Sources</h4>
                          <div className="space-y-2">
                            {report.grounding_sources.slice(0, 4).map((source, i) => (
                              <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px] font-bold group-hover:text-blue-400">{source.title}</span>
                                <ExternalLink size={10} className="text-slate-600 group-hover:text-blue-500" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
