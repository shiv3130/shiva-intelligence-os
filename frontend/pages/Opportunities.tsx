import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Crosshair, TrendingUp, AlertCircle, Search, Filter, Briefcase, MapPin, DollarSign, Users, CheckCircle2, XCircle, Activity, Zap, ArrowRight, X, Database, FileText, MessageSquareText, UserPlus, Copy, Check, BrainCircuit, Clock, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobApplication } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';
import { generateOutreachMessage } from '../lib/aiService';

export const Opportunities: React.FC = () => {
  const { state } = useData();
  const { jobs, resume } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ats' | 'recruiter' | 'jd'>('overview');
  
  // Outreach State
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedJob]);

  // Sort jobs by opportunity score
  const rankedJobs = useMemo(() => {
    return jobs
      .filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
  }, [jobs, searchTerm]);

  // Portfolio Analysis Stats
  const portfolioStats = useMemo(() => {
    if (!jobs.length) return null;
    
    const elite = jobs.filter(j => j.opportunityClassification === 'Elite Opportunity').length;
    const followUp = jobs.filter(j => j.recommendedAction === 'Follow Up' || j.recommendedAction === 'Contact Recruiter').length;
    const ghostRisks = jobs.filter(j => j.ghostJobWarning).length;
    
    let expectedInt = 0;
    let expectedOff = 0;
    let totalOppScore = 0;

    jobs.forEach(j => {
      expectedInt += (j.interviewProbability || 0) / 100;
      expectedOff += (j.offerProbability || 0) / 100;
      totalOppScore += (j.opportunityScore || 0);
    });

    return {
      total: jobs.length,
      elite,
      followUp,
      ghostRisks,
      expectedInterviews: expectedInt.toFixed(1),
      expectedOffers: expectedOff.toFixed(1),
      avgOppScore: Math.round(totalOppScore / jobs.length)
    };
  }, [jobs]);

  // Scatter Plot Data
  const scatterData = useMemo(() => {
    return jobs.map(j => ({
      id: j.id,
      name: j.company,
      title: j.title,
      oppScore: j.opportunityScore || 0,
      competition: j.applicantCount,
      salary: j.extractedSalary || 60000,
      prob: j.interviewProbability || 0
    }));
  }, [jobs]);

  const handleGenerateMessage = async (type: 'connection' | 'followup') => {
    if (!selectedJob) return;
    setIsGenerating(true);
    setCopied(false);
    try {
      const msg = await generateOutreachMessage(selectedJob, resume, type);
      setGeneratedMessage(msg);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!jobs.length || !portfolioStats) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-surfaceHighlight/50 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <Briefcase className="w-10 h-10 text-primary animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-textMain mb-3 neon-text tracking-tight">OPPORTUNITY ENGINE OFFLINE</h2>
        <p className="text-textMuted max-w-md text-lg">
          Upload your application history to initialize the Opportunity Intelligence Engine.
        </p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, colorClass }: any) => (
    <Card className={`p-4 border-${colorClass}/30 bg-gradient-to-br from-surface to-${colorClass}/5 shadow-[0_0_15px_rgba(var(--${colorClass}-rgb),0.1)]`}>
      <div className={`text-[10px] text-${colorClass} font-mono uppercase tracking-widest mb-1`}>{title}</div>
      <div className="text-3xl font-bold text-textMain font-mono">{value}</div>
      {subtitle && <div className="text-xs text-textMuted mt-1">{subtitle}</div>}
    </Card>
  );

  const getActionColor = (action?: string) => {
    switch(action) {
      case 'Apply Immediately': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Contact Recruiter': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Follow Up': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Monitor': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Ignore': return 'bg-surfaceHighlight text-textMuted border-surfaceHighlight';
      case 'Archive': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-surfaceHighlight text-textMuted border-surfaceHighlight';
    }
  };

  const getClassificationColor = (classification?: string) => {
    switch(classification) {
      case 'Elite Opportunity': return 'text-emerald-400';
      case 'High Value': return 'text-primary';
      case 'Good Fit': return 'text-blue-400';
      case 'Average': return 'text-amber-400';
      case 'Low Yield': return 'text-rose-400';
      case 'Avoid': return 'text-danger';
      default: return 'text-textMuted';
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" /> Opportunity Command Center
          </h1>
          <p className="text-textMuted mt-2 text-lg">Algorithmic ranking of all active applications by expected return.</p>
        </motion.div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search roles or companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surfaceHighlight/30 border border-surfaceHighlight rounded-lg pl-9 pr-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary/50 w-64 transition-colors"
            />
          </div>
          <button className="p-2 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-lg text-textMuted hover:text-textMain transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PORTFOLIO ANALYSIS */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
        <StatCard title="Total Pipeline" value={portfolioStats.total} colorClass="primary" />
        <StatCard title="Elite Opps" value={portfolioStats.elite} colorClass="emerald-500" />
        <StatCard title="Action Required" value={portfolioStats.followUp} colorClass="purple-500" />
        <StatCard title="Ghost Risks" value={portfolioStats.ghostRisks} colorClass="rose-500" />
        <StatCard title="Expected Int." value={portfolioStats.expectedInterviews} colorClass="amber-500" />
        <StatCard title="Expected Offers" value={portfolioStats.expectedOffers} colorClass="emerald-500" />
      </motion.div>

      {/* AI STRATEGIC ADVISOR */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative z-10">
        <Card className="border-primary/30 bg-gradient-to-br from-surface to-primary/5">
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceHighlight pb-4">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Strategic Advisor</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
              <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">Focus recruiter outreach on the top {portfolioStats.elite} Elite Opportunities.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
              <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">Remove or ignore {jobs.filter(j => j.opportunityScore && j.opportunityScore < 40).length} low-yield applications below score 40.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
              <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">Average pipeline opportunity score is {portfolioStats.avgOppScore}/100.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
              <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">You have {portfolioStats.followUp} applications requiring immediate follow-up.</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* OPPORTUNITY MATRIX */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card title="Opportunity Matrix" subtitle="Competition vs Opportunity Score (Bubble size = Salary, Color = Probability)" className="h-[500px] border-blue-500/20">
            <div className="h-full w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="competition" name="Applicants" stroke="#64748b" />
                  <YAxis type="number" dataKey="oppScore" name="Opp Score" stroke="#64748b" domain={[0, 100]} />
                  <ZAxis type="number" dataKey="salary" range={[50, 400]} name="Salary" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface/95 border border-surfaceHighlight p-3 rounded-lg shadow-xl">
                            <p className="font-bold text-textMain">{data.title}</p>
                            <p className="text-xs text-textMuted mb-2">{data.name}</p>
                            <p className="text-sm"><span className="text-textMuted">Opp Score:</span> <span className="font-mono text-primary">{data.oppScore}</span></p>
                            <p className="text-sm"><span className="text-textMuted">Int Prob:</span> <span className="font-mono text-purple-400">{data.prob}%</span></p>
                            <p className="text-sm"><span className="text-textMuted">Applicants:</span> <span className="font-mono text-rose-400">{data.competition}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Jobs" data={scatterData} fill="#3b82f6" fillOpacity={0.7}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.prob > 70 ? '#10b981' : entry.prob > 40 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* TOP 10 OPPORTUNITIES LIST */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
          <Card title="Top Opportunities" subtitle="Ranked by expected return" className="h-[500px] border-emerald-500/20 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mt-4 custom-scrollbar">
              {rankedJobs.slice(0, 10).map((job, i) => (
                <div 
                  key={job.id} 
                  onClick={() => {
                    setSelectedJob(job);
                    setActiveTab('overview');
                    setGeneratedMessage('');
                  }}
                  className="p-4 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-surfaceHighlight/50 text-[10px] font-mono px-2 py-1 rounded-bl-lg text-textMuted">
                    #{i + 1}
                  </div>
                  <div className="pr-8">
                    <h4 className="font-bold text-textMain group-hover:text-emerald-400 transition-colors truncate">{job.title}</h4>
                    <p className="text-xs text-textMuted truncate">{job.company}</p>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <div className="text-[10px] text-textMuted uppercase tracking-widest">Opp Score</div>
                      <div className={`text-xl font-mono font-bold ${getClassificationColor(job.opportunityClassification)}`}>
                        {job.opportunityScore}
                      </div>
                    </div>
                    <Badge className={`text-[10px] py-0.5 ${getActionColor(job.recommendedAction)}`}>
                      {job.recommendedAction}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* FULL RANKINGS TABLE */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10">
        <Card className="p-0 overflow-hidden border-surfaceHighlight">
          <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/20 flex items-center gap-2">
            <Database className="w-4 h-4 text-textMuted" />
            <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest">Complete Pipeline Rankings</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30 sticky top-0 z-20 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-mono">Opportunity</th>
                  <th className="px-6 py-4 font-mono">Classification</th>
                  <th className="px-6 py-4 font-mono">Opp Score</th>
                  <th className="px-6 py-4 font-mono">Int. Prob</th>
                  <th className="px-6 py-4 font-mono">Offer Prob</th>
                  <th className="px-6 py-4 font-mono">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight/50">
                {rankedJobs.map((job, i) => (
                  <tr 
                    key={job.id} 
                    onClick={() => {
                      setSelectedJob(job);
                      setActiveTab('overview');
                      setGeneratedMessage('');
                    }}
                    className="hover:bg-surfaceHighlight/20 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-textMain group-hover:text-primary transition-colors">{job.title}</div>
                      <div className="text-xs text-textMuted">{job.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium text-xs ${getClassificationColor(job.opportunityClassification)}`}>
                        {job.opportunityClassification}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-lg text-textMain">{job.opportunityScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-purple-400">{job.interviewProbability}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-emerald-400">{job.offerProbability}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`text-[10px] py-0.5 ${getActionColor(job.recommendedAction)}`}>
                        {job.recommendedAction}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* FULLSCREEN OPPORTUNITY WORKSPACE MODAL (PORTAL) */}
      {selectedJob && createPortal(
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-primary/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-[95vw] h-[95vh] max-w-[1800px] flex flex-col overflow-hidden"
            >
              {/* STICKY HEADER */}
              <div className="p-6 border-b border-surfaceHighlight flex justify-between items-start bg-surfaceHighlight/10 shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-textMain tracking-tight">{selectedJob.title}</h2>
                    {selectedJob.ghostJobWarning && (
                      <Badge variant="danger" className="animate-pulse"><ShieldAlert className="w-3 h-3 mr-1"/> Ghost Risk</Badge>
                    )}
                    <Badge className={getActionColor(selectedJob.recommendedAction)}>{selectedJob.recommendedAction}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-textMuted text-sm">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {selectedJob.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedJob.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> {selectedJob.extractedSalary ? `£${selectedJob.extractedSalary.toLocaleString()}` : 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {selectedJob.applicantCount} Applicants</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] text-textMuted uppercase tracking-widest mb-1">Opportunity Score</div>
                    <div className={`text-4xl font-mono font-bold ${getClassificationColor(selectedJob.opportunityClassification)}`}>
                      {selectedJob.opportunityScore}
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-surfaceHighlight bg-surfaceHighlight/5 shrink-0 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'ats', label: 'ATS Analysis' },
                  { id: 'recruiter', label: 'Recruiter Strategy' },
                  { id: 'jd', label: 'Job Description' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                      activeTab === tab.id 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-textMuted hover:text-textMain hover:bg-surfaceHighlight/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SCROLLABLE CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background/50">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                      <Card className="border-primary/20 bg-primary/5 p-5">
                        <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Intelligence Scores</h3>
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs text-textMuted uppercase">ATS Match</span>
                              <span className="text-lg font-bold font-mono text-textMain">{selectedJob.matchScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${selectedJob.matchScore}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs text-textMuted uppercase">Interview Prob</span>
                              <span className="text-lg font-bold font-mono text-purple-400">{selectedJob.interviewProbability}%</span>
                            </div>
                            <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500" style={{ width: `${selectedJob.interviewProbability}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs text-textMuted uppercase">Offer Prob</span>
                              <span className="text-lg font-bold font-mono text-emerald-400">{selectedJob.offerProbability}%</span>
                            </div>
                            <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${selectedJob.offerProbability}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="border-surfaceHighlight p-5">
                        <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest mb-4">Market Context</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted flex items-center gap-2"><Activity className="w-4 h-4"/> Status</span>
                            <Badge variant={selectedJob.reposted ? 'warning' : 'success'}>{selectedJob.reposted ? 'Reposted' : 'Fresh'}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted flex items-center gap-2"><Briefcase className="w-4 h-4"/> Level</span>
                            <span className="font-medium">{selectedJob.jobLevel || 'Unspecified'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted flex items-center gap-2"><MapPin className="w-4 h-4"/> Visa</span>
                            <span className={`font-medium ${selectedJob.visa.toUpperCase().includes('NO') ? 'text-rose-400' : 'text-textMain'}`}>
                              {selectedJob.visa || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted flex items-center gap-2"><Clock className="w-4 h-4"/> Applied</span>
                            <span className="font-mono">{new Date(selectedJob.dateApplied).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      {selectedJob.executiveSummary && (
                        <Card className="border-primary/30 bg-gradient-to-br from-surface to-primary/5 p-6">
                          <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Executive Summary</h3>
                          <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {selectedJob.executiveSummary}
                          </p>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-emerald-500/20 bg-emerald-500/5 p-5">
                          <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4"/> Why This Job?
                          </h3>
                          <ul className="space-y-3">
                            {selectedJob.whyThisJob?.map((reason, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                                <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {reason}
                              </li>
                            ))}
                            {(!selectedJob.whyThisJob || selectedJob.whyThisJob.length === 0) && (
                              <li className="text-sm text-textMuted italic">No specific positive factors identified.</li>
                            )}
                          </ul>
                        </Card>

                        <Card className="border-rose-500/20 bg-rose-500/5 p-5">
                          <h3 className="text-sm font-mono text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <XCircle className="w-4 h-4"/> Why Not This Job?
                          </h3>
                          <ul className="space-y-3">
                            {selectedJob.whyNotThisJob?.map((reason, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                                <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> {reason}
                              </li>
                            ))}
                            {(!selectedJob.whyNotThisJob || selectedJob.whyNotThisJob.length === 0) && (
                              <li className="text-sm text-textMuted italic">No specific negative factors identified.</li>
                            )}
                          </ul>
                        </Card>
                      </div>

                      <Card className="border-purple-500/30 bg-purple-500/5 p-6">
                        <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">The "Why Not" Analyzer Feedback</h3>
                        <p className="text-lg text-slate-300 italic leading-relaxed">
                          "{selectedJob.atsFeedback || 'No deep analysis available for this role.'}"
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB: ATS ANALYSIS */}
                {activeTab === 'ats' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-surfaceHighlight p-5 text-center">
                        <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2">JD Quality Score</div>
                        <div className={`text-2xl font-bold font-mono ${selectedJob.jdQualityScore === 'High' ? 'text-emerald-400' : selectedJob.jdQualityScore === 'Low' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {selectedJob.jdQualityScore || 'Unknown'}
                        </div>
                      </Card>
                      <Card className="border-surfaceHighlight p-5 text-center">
                        <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2">ATS Confidence</div>
                        <div className="text-2xl font-bold font-mono text-primary">{selectedJob.atsConfidenceScore || 50}%</div>
                      </Card>
                      <Card className="border-surfaceHighlight p-5 text-center">
                        <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2">Hard Req Coverage</div>
                        <div className="text-2xl font-bold font-mono text-purple-400">{selectedJob.hardRequirementsCoverage || 0}%</div>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-emerald-500/20 p-6">
                        <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5"/> Matched Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.matchedSkills?.map((skill, i) => (
                            <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5 text-sm">{skill}</Badge>
                          ))}
                          {(!selectedJob.matchedSkills || selectedJob.matchedSkills.length === 0) && (
                            <span className="text-sm text-textMuted">No direct matches found.</span>
                          )}
                        </div>
                      </Card>

                      <Card className="border-rose-500/20 p-6">
                        <h3 className="text-sm font-mono text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <XCircle className="w-5 h-5"/> Missing Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.missingSkills?.map((skill, i) => (
                            <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-3 py-1.5 text-sm">{skill}</Badge>
                          ))}
                          {(!selectedJob.missingSkills || selectedJob.missingSkills.length === 0) && (
                            <span className="text-sm text-textMuted">No missing skills identified!</span>
                          )}
                        </div>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-blue-500/20 p-6">
                        <h3 className="text-sm font-mono text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Layers className="w-5 h-5"/> Explicit Requirements
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.explicitRequirements?.map((skill, i) => (
                            <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1.5 text-sm">{skill}</Badge>
                          ))}
                          {(!selectedJob.explicitRequirements || selectedJob.explicitRequirements.length === 0) && (
                            <span className="text-sm text-textMuted">No explicit requirements extracted.</span>
                          )}
                        </div>
                      </Card>

                      <Card className="border-amber-500/20 p-6">
                        <h3 className="text-sm font-mono text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5"/> Inferred Requirements
                        </h3>
                        <div className="space-y-2">
                          {selectedJob.inferredRequirements?.map((req, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-amber-500/5 border border-amber-500/20 rounded">
                              <span className="text-sm text-amber-400">{req.skill}</span>
                              <span className="text-xs font-mono text-textMuted">{req.confidence}% Conf.</span>
                            </div>
                          ))}
                          {(!selectedJob.inferredRequirements || selectedJob.inferredRequirements.length === 0) && (
                            <span className="text-sm text-textMuted">No inferred requirements generated.</span>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB: RECRUITER STRATEGY */}
                {activeTab === 'recruiter' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <Card className="border-primary/20 bg-primary/5 p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-1">Target Contact</h3>
                          <div className="text-2xl font-bold text-textMain">{selectedJob.hrName || 'Hiring Manager'}</div>
                        </div>
                        <Badge className={getActionColor(selectedJob.recommendedAction)}>{selectedJob.recommendedAction}</Badge>
                      </div>

                      <div className="flex gap-4 mb-8">
                        <Button 
                          onClick={() => handleGenerateMessage('connection')} 
                          isLoading={isGenerating}
                          className="flex-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        >
                          <UserPlus className="w-4 h-4 mr-2" /> Draft Connection Request
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleGenerateMessage('followup')} 
                          isLoading={isGenerating}
                          className="flex-1 border border-surfaceHighlight"
                        >
                          <MessageSquareText className="w-4 h-4 mr-2" /> Draft Follow-up
                        </Button>
                      </div>

                      <div className="flex flex-col min-h-[200px]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono uppercase tracking-widest text-primary">AI Generated Output</span>
                          {generatedMessage && (
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-textMuted hover:text-textMain">
                              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              <span className="ml-2 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                            </Button>
                          )}
                        </div>
                        <div className="flex-1 bg-background/80 border border-surfaceHighlight rounded-xl p-6 relative group">
                          {generatedMessage ? (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-textMain whitespace-pre-wrap font-mono text-base leading-relaxed"
                            >
                              {generatedMessage}
                            </motion.p>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted text-sm opacity-50">
                              <BrainCircuit className="w-12 h-12 mb-3" />
                              Select an action above to generate a 3-sentence outreach message.
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* TAB: JOB DESCRIPTION */}
                {activeTab === 'jd' && (
                  <Card className="border-surfaceHighlight p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/20 flex items-center gap-2 shrink-0">
                      <FileText className="w-4 h-4 text-textMuted" />
                      <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest">Raw Job Description</h3>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-background/50">
                      <p className="text-base text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-w-4xl mx-auto">
                        {selectedJob.aboutJob || "No job description provided in the CSV."}
                      </p>
                    </div>
                  </Card>
                )}

              </div>

              {/* STICKY FOOTER */}
              <div className="p-4 border-t border-surfaceHighlight bg-surfaceHighlight/10 shrink-0 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>Close Workspace</Button>
                <Button variant="secondary" onClick={() => setActiveTab('recruiter')}>Contact Recruiter</Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
