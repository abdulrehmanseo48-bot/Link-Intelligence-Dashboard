import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Link as LinkIcon, 
  Search, 
  BarChart3, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  ExternalLink,
  Plus
} from "lucide-react";
import { SiteData, BacklinkOpportunity, AnalysisResult } from "./types";
import { analyzeSiteContent, findOpportunities, draftOutreachContent } from "./lib/gemini";

export default function App() {
  const [step, setStep] = useState<'welcome' | 'setup' | 'analyzing' | 'dashboard'>('welcome');
  const [url, setUrl] = useState('');
  const [mySite, setMySite] = useState<SiteData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [opportunities, setOpportunities] = useState<BacklinkOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<BacklinkOpportunity | null>(null);
  const [outreachDraft, setOutreachDraft] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    if (!url) return;
    setStep('analyzing');
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze website');
      }

      const siteData: SiteData = await response.json();
      setMySite(siteData);

      const analysisResult = await analyzeSiteContent(siteData);
      setAnalysis(analysisResult);

      const opps = await findOpportunities(analysisResult);
      setOpportunities(opps);

      setStep('dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStep('setup');
    }
  };

  const handleDraftOutreach = async (opp: BacklinkOpportunity) => {
    if (!mySite) return;
    setSelectedOpportunity(opp);
    setIsDrafting(true);
    setOutreachDraft('');
    try {
      const draft = await draftOutreachContent(opp, mySite);
      setOutreachDraft(draft);
    } catch (err) {
      console.error(err);
      setOutreachDraft('Failed to generate draft. Please try again.');
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-surface-ui border-r border-border-ui px-6 py-8 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-12 cursor-pointer group">
          <div className="w-6 h-6 bg-primary rounded" />
          <span className="text-xl font-extrabold text-primary tracking-tight">LinkForge AI</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className={`nav-item-ui ${step === 'dashboard' ? 'active' : ''}`} onClick={() => setStep('dashboard')}>Agent Dashboard</div>
          <div className="nav-item-ui">Target Lists</div>
          <div className="nav-item-ui">Anchor Settings</div>
          <div className="nav-item-ui">Success Reports</div>
          <div className="nav-item-ui">Proxy Config</div>
        </nav>

        <div className="mt-auto space-y-2">
          <div className="nav-item-ui">Settings</div>
          <div className="nav-item-ui">Logout</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-bg-site">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-border-ui bg-surface-ui">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Link Intelligence Dashboard</h1>
            <p className="text-sm text-text-light">
              {mySite ? `Active Project: ${mySite.url}` : 'Ready for target analysis'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="status-capsule">
              <div className="status-dot-ui" />
              Agent {step === 'analyzing' ? 'Running' : 'Ready'}
            </div>
            <button 
              onClick={() => { setStep('setup'); setUrl(''); setMySite(null); }}
              className="btn-primary-ui"
            >
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 shadow-sm">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                  Backlink Automation at <span className="text-primary italic">Scale</span>
                </h2>
                <p className="text-lg text-text-light mb-10 leading-relaxed">
                  LinkForge AI (Vese LinkGenie hi hai) aapki website ko analyze karta hai aur intelligent backlink opportunities dhoondhta hai. 
                  Optimization ab hamara kaam hai.
                </p>
                <button 
                  onClick={() => setStep('setup')}
                  className="btn-primary-ui py-5 px-10 text-lg rounded-2xl"
                >
                  Hamara Agent Start Karein <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'setup' && (
              <motion.div 
                key="setup"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex items-center justify-center"
              >
                <div className="w-full max-w-md card-ui p-10 bg-white">
                  <div className="mb-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                       <Globe className="w-7 h-7 text-text-light" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Configure Agent</h2>
                    <p className="text-text-light text-sm">Apni website ka URL dalein jo analyze karni hai.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-text-light mb-2 tracking-widest">Target Website URL</label>
                      <input 
                        type="url" 
                        placeholder="https://yourwebsite.com" 
                        className="w-full p-4 border border-border-ui rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </div>
                    )}
                    <button 
                      onClick={startAnalysis}
                      disabled={!url}
                      className="w-full btn-primary-ui py-4 rounded-xl text-md"
                    >
                      Start Deep Engine <Zap className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="text-center space-y-8">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 border-[6px] border-border-ui border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Agent Console Live</h2>
                    <p className="text-text-light max-w-sm mx-auto">
                      Analyzing site fingerprint, keywords, and niche mapping in real-time.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'dashboard' && analysis && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 flex flex-col h-full"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="card-ui p-6">
                    <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">Detected Niche</div>
                    <div className="text-2xl font-bold text-text-dark">{analysis.niche}</div>
                    <div className="text-xs text-success-ui font-semibold mt-2 flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Targeted keywords detected
                    </div>
                  </div>
                  <div className="card-ui p-6">
                    <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">Backlink Strategy</div>
                    <div className="text-2xl font-bold text-text-dark">Growth Mode</div>
                    <div className="text-xs text-text-light font-medium mt-2">Niche-Specific Relevant Tiers</div>
                  </div>
                  <div className="card-ui p-6">
                    <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">System Status</div>
                    <div className="text-2xl font-bold text-text-dark">84.2%</div>
                    <div className="text-xs text-primary font-semibold mt-2">Engine Confidence</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1">
                  {/* Task Panel (Opportunities) */}
                  <div className="card-ui p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Opportunity Queue</h3>
                      <span className="text-xs text-text-light font-bold bg-bg-site px-2 py-1 rounded">
                        {opportunities.length} Active Targets
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-auto pr-2 space-y-px">
                      <div className="grid grid-cols-[1fr_120px_100px] py-3 text-xs font-bold text-text-light uppercase tracking-widest border-b border-border-ui mb-2">
                        <div>Target Website</div>
                        <div>Category</div>
                        <div>Status</div>
                      </div>
                      
                      {opportunities.map((opp) => (
                        <div 
                          key={opp.id} 
                          className={`grid grid-cols-[1fr_120px_100px] py-4 items-center border-b border-border-ui last:border-0 hover:bg-bg-site px-2 -mx-2 rounded-lg transition-colors cursor-pointer ${selectedOpportunity?.id === opp.id ? 'bg-blue-50/50' : ''}`}
                          onClick={() => handleDraftOutreach(opp)}
                        >
                          <div className="text-sm font-semibold text-primary truncate pr-4">{opp.url}</div>
                          <div className="text-sm text-text-light">{opp.type}</div>
                          <div className={`text-xs font-bold flex items-center gap-2 ${
                            opp.id.length % 2 === 0 ? 'text-success-ui' : 'text-primary'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${opp.id.length % 2 === 0 ? 'bg-success-ui' : 'bg-primary'}`} />
                            {opp.id.length % 2 === 0 ? 'Placed' : 'Analyzing'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logs/Outreach Panel */}
                  <div className="flex flex-col gap-6">
                    <div className="log-panel-ui shrink-0">
                       <div className="text-white font-bold pb-2 border-b border-[#334155] mb-3 flex justify-between items-center">
                         <span>Agent Console Logs</span>
                         <span className="text-[10px] text-success-ui">LIVE</span>
                       </div>
                       <div className="space-y-1.5">
                         <div className="flex gap-2 leading-relaxed">
                           <span className="text-[#64748b]">[14:22:01]</span>
                           <span className="text-success-ui">INFO</span>
                           <span>Initializing Backlink AI Engine</span>
                         </div>
                         <div className="flex gap-2">
                           <span className="text-[#64748b]">[14:22:04]</span>
                           <span className="text-success-ui">SUCCESS</span>
                           <span>Target Analysis Complete</span>
                         </div>
                         <div className="flex gap-2">
                           <span className="text-[#64748b]">[14:23:01]</span>
                           <span className="text-success-ui">INFO</span>
                           <span>Mapping: {analysis.niche}</span>
                         </div>
                       </div>
                    </div>

                    <div className="card-ui p-6 flex-1 bg-surface-ui flex flex-col">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" /> Outreach Forge
                      </h3>
                      
                      {!selectedOpportunity ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-light opacity-50">
                          <BarChart3 className="w-10 h-10 mb-3" />
                          <p className="text-xs font-bold uppercase tracking-widest">Select a target website</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col">
                           <div className="mb-4">
                             <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1">Current Focus</div>
                             <div className="text-sm font-bold truncate">{selectedOpportunity.url}</div>
                           </div>
                           
                           <div className="flex-1 bg-bg-site border border-border-ui rounded-xl p-4 font-mono text-xs text-text-dark whitespace-pre-wrap overflow-auto custom-scrollbar">
                             {isDrafting ? (
                               <div className="space-y-2 animate-pulse">
                                 <div className="h-2.5 bg-gray-200 rounded w-5/6"></div>
                                 <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                                 <div className="h-2.5 bg-gray-200 rounded w-4/6"></div>
                               </div>
                             ) : outreachDraft || "Drafting specialized outreach..."}
                           </div>
                           
                           {!isDrafting && outreachDraft && (
                             <button className="btn-primary-ui w-full mt-4 text-sm" onClick={() => navigator.clipboard.writeText(outreachDraft)}>
                               Copy to Clipboard <CheckCircle2 className="w-3.5 h-3.5" />
                             </button>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
