import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { generateOutreachMessage } from '../lib/aiService';
import { JobApplication, RecruiterProfile } from '../types';
import { Send, Copy, Check, UserPlus, MessageSquareText, ExternalLink, Clock, AlertCircle, BrainCircuit, Users, Target, Activity, Zap, ArrowRight, Mail, Calendar, Building2, TrendingUp, HeartPulse, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

export const RecruiterCRM: React.FC = () => {
  const { state } = useData();
  const { jobs, resume, insights } = state;
  
  const [selectedRecruiter, setSelectedRecruiter] = useState<RecruiterProfile | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageType, setMessageType] = useState<'connection' | 'followup' | 'email'>('connection');

  // --- RECRUITER DISCOVERY ENGINE ---
  const recruiters = useMemo(() => {
    const recruiterMap = new Map<string, RecruiterProfile>();
    
    jobs.forEach(job => {
      // If no HR name, we still want to track the company for outreach
      const hrName = job.hrName || 'Recruiter Not Identified';
      const key = `${hrName}-${job.company}`;
      const existing = recruiterMap.get(key);
      
      if (existing) {
        existing.associatedJobs.push(job);
        // Update scores based on highest value job
        if ((job.opportunityScore || 0) > existing.priorityScore) {
          existing.priorityScore = job.opportunityScore || 0;
        }
      } else {
        // Dynamic Reply Probability
        let prob = (job.matchScore || 50) * 0.5;
        if (job.applicantCount < 50) prob += 20;
        if (job.applicantCount > 200) prob -= 15;
        if (job.ghostJobWarning) prob -= 25;
        if (job.workStyle.toUpperCase().includes('REMOTE')) prob -= 10; // Remote is more competitive
        if (job.jobLevel.toUpperCase().includes('SENIOR')) prob += 10; // Senior roles often have higher reply rates if matched
        
        prob = Math.max(5, Math.min(95, Math.round(prob)));
        
        let level: 'High' | 'Medium' | 'Low' = 'Medium';
        if (prob > 70) level = 'High';
        if (prob < 30) level = 'Low';

        // Determine Contact Status (Mocked based on date for demo)
        const daysSince = Math.floor((new Date().getTime() - new Date(job.dateApplied).getTime()) / (1000 * 3600 * 24));
        let status: RecruiterProfile['contactStatus'] = 'Not Contacted';
        if (daysSince > 14) status = 'Responded';
        else if (daysSince > 5) status = 'Contacted';

        // Suggested Action
        let action = 'Send Connection Request';
        if (status === 'Contacted') action = 'Send Follow-up';
        if (status === 'Responded') action = 'Schedule Interview';

        // Best Contact Date
        const contactDate = new Date(job.dateApplied);
        contactDate.setDate(contactDate.getDate() + 5);

        // Recommended Contact Role if HR Name is missing
        let recommendedRole = 'Technical Recruiter';
        if (!job.hrName) {
          if (job.jobLevel.toUpperCase().includes('SENIOR') || job.jobLevel.toUpperCase().includes('LEAD')) {
            recommendedRole = 'Engineering Manager / Head of AI';
          } else {
            recommendedRole = 'Talent Partner / Hiring Manager';
          }
        }

        // Contact Strategy Engine
        const strategy = [
          { step: 1, action: 'Apply via ATS', timing: 'Day 0', status: 'Completed' as const },
          { step: 2, action: 'Send LinkedIn Connection', timing: 'Day 2', status: status === 'Not Contacted' ? 'Pending' as const : 'Completed' as const },
          { step: 3, action: 'Send Direct Message', timing: 'Day 5', status: status === 'Contacted' ? 'Pending' as const : status === 'Responded' ? 'Completed' as const : 'Pending' as const },
          { step: 4, action: 'Follow Up Email', timing: 'Day 10', status: 'Pending' as const }
        ];

        // Dynamic Priority Score
        let priority = (job.opportunityScore || 50) * 0.4 + (job.matchScore || 50) * 0.3;
        if (job.extractedSalary && job.extractedSalary > 100000) priority += 10;
        if (job.applicantCount < 50) priority += 10;
        priority = Math.max(0, Math.min(100, Math.round(priority)));

        recruiterMap.set(key, {
          id: key,
          name: hrName,
          company: job.company,
          role: recommendedRole,
          link: job.hrLink,
          priorityScore: priority,
          responseProbability: prob,
          responseLevel: level,
          relationshipScore: Math.floor(Math.random() * 40) + 60, // Mocked relationship score
          contactStatus: status,
          bestContactDate: contactDate.toLocaleDateString(),
          suggestedAction: action,
          associatedJobs: [job],
          isIdentified: !!job.hrName,
          recommendedContactRole: recommendedRole,
          whyContact: `High match score (${job.matchScore}%) and low competition.`,
          expectedImpact: `+${Math.round(prob * 0.2)}% Interview Prob`,
          networkingRoiScore: Math.round((priority + prob) / 2),
          contactStrategy: strategy
        });
      }
    });

    return Array.from(recruiterMap.values()).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [jobs]);

  // --- KPI METRICS ---
  const kpis = useMemo(() => {
    const total = recruiters.length;
    const identified = recruiters.filter(r => r.isIdentified).length;
    const contacted = recruiters.filter(r => r.contactStatus !== 'Not Contacted').length;
    const responded = recruiters.filter(r => r.contactStatus === 'Responded' || r.contactStatus === 'Interviewing').length;
    const replyRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0;
    const avgRelScore = total > 0 ? Math.round(recruiters.reduce((acc, r) => acc + r.relationshipScore, 0) / total) : 0;

    return { total, identified, contacted, responded, replyRate, avgRelScore };
  }, [recruiters]);

  // --- NETWORKING HEATMAP DATA ---
  const companyHeatmap = useMemo(() => {
    const companyScores = new Map<string, { score: number, count: number }>();
    recruiters.forEach(r => {
      const current = companyScores.get(r.company) || { score: 0, count: 0 };
      current.score += r.priorityScore;
      current.count += 1;
      companyScores.set(r.company, current);
    });
    return Array.from(companyScores.entries())
      .map(([company, data]) => ({ company, value: Math.round(data.score / data.count) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [recruiters]);

  const handleGenerate = async (type: 'connection' | 'followup' | 'email') => {
    if (!selectedRecruiter || !selectedRecruiter.associatedJobs[0]) return;
    setIsGenerating(true);
    setCopied(false);
    setMessageType(type);
    try {
      // Use the highest priority job for context
      const job = selectedRecruiter.associatedJobs.sort((a,b) => (b.opportunityScore||0) - (a.opportunityScore||0))[0];
      const msg = await generateOutreachMessage(job, resume, type === 'email' ? 'followup' : type); // Map email to followup for now
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

  if (!jobs.length || recruiters.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-surfaceHighlight/50 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <Users className="w-10 h-10 text-purple-400 animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-textMain mb-3 neon-text tracking-tight">RECRUITER ENGINE OFFLINE</h2>
        <p className="text-textMuted max-w-md text-lg">Upload your application history to activate the Recruiter Intelligence CRM.</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, colorClass, icon: Icon }: any) => (
    <Card className={`p-4 border-${colorClass}/30 bg-gradient-to-br from-surface to-${colorClass}/5 shadow-[0_0_15px_rgba(var(--${colorClass}-rgb),0.1)] flex items-center gap-4`}>
      <div className={`p-3 rounded-lg bg-${colorClass}/10 text-${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className={`text-[10px] text-${colorClass} font-mono uppercase tracking-widest mb-1`}>{title}</div>
        <div className="text-2xl font-bold text-textMain font-mono">{value}</div>
        {subtitle && <div className="text-xs text-textMuted mt-1">{subtitle}</div>}
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" /> Recruiter Intelligence
          </h1>
          <p className="text-textMuted mt-2 text-lg">AI-powered discovery, outreach, and relationship management.</p>
        </motion.div>
      </header>

      {/* TOP KPI CARDS */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
        <StatCard title="Identified" value={kpis.identified} icon={Target} colorClass="primary" />
        <StatCard title="Total Targets" value={kpis.total} icon={Users} colorClass="blue-400" />
        <StatCard title="Contacted" value={kpis.contacted} icon={Send} colorClass="amber-500" />
        <StatCard title="Replies" value={kpis.responded} icon={MessageSquareText} colorClass="emerald-500" />
        <StatCard title="Reply Rate" value={`${kpis.replyRate}%`} icon={Activity} colorClass="purple-500" />
        <StatCard title="Rel. Score" value={kpis.avgRelScore} icon={HeartPulse} colorClass="rose-500" />
      </motion.div>

      {/* EXECUTIVE ADVISOR & FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full border-purple-500/30 bg-gradient-to-br from-surface to-purple-500/5">
            <div className="flex items-center gap-2 mb-4 border-b border-surfaceHighlight pb-4">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
              <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest">Executive Networking Briefing</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">You have <span className="font-bold text-textMain">{recruiters.filter(r => r.priorityScore > 80 && r.contactStatus === 'Not Contacted').length}</span> high-priority recruiters to contact today.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">Expected interview gain from completing today's outreach: <span className="font-bold text-emerald-400">+{insights?.expectedInterviewIncrease || 7}%</span></p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">Highest ROI opportunity: <span className="font-bold text-textMain">{recruiters[0]?.company}</span> (Priority Score: {recruiters[0]?.priorityScore})</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">Most urgent follow-up: <span className="font-bold text-textMain">{recruiters.find(r => r.contactStatus === 'Contacted')?.name || 'None pending'}</span>.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
          <Card title="Company Heatmap" subtitle="Top targets by opportunity value" className="h-full border-surfaceHighlight">
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyHeatmap} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="company" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} />
                  <Bar dataKey="value" name="Value Score" radius={[0, 4, 4, 0]} barSize={15}>
                    {companyHeatmap.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#10b981' : entry.value > 60 ? '#8b5cf6' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* MAIN CRM WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* RECRUITER DISCOVERY LIST */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
          <Card className="h-[700px] border-surfaceHighlight p-0 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/20 flex justify-between items-center">
              <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Target Contacts
              </h3>
              <Badge variant="outline">{recruiters.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {recruiters.map((recruiter, i) => (
                <div 
                  key={recruiter.id}
                  onClick={() => {
                    setSelectedRecruiter(recruiter);
                    setGeneratedMessage('');
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedRecruiter?.id === recruiter.id 
                      ? 'bg-purple-500/10 border-purple-500/50 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-surface/80 border-surfaceHighlight hover:border-purple-500/30 hover:bg-surfaceHighlight/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-4">
                      <div className={`font-bold truncate ${!recruiter.isIdentified ? 'text-textMuted italic' : 'text-textMain'}`}>
                        {recruiter.name}
                      </div>
                      <div className="text-xs text-textMuted truncate flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {recruiter.company}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-mono font-bold text-purple-400">
                        {recruiter.priorityScore}
                      </div>
                      <div className="text-[8px] text-textMuted uppercase">Priority</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-surfaceHighlight/50">
                    <Badge variant={
                      recruiter.contactStatus === 'Not Contacted' ? 'default' :
                      recruiter.contactStatus === 'Contacted' ? 'warning' : 'success'
                    } className="text-[10px] py-0">
                      {recruiter.contactStatus}
                    </Badge>
                    <span className={`text-xs font-mono ${recruiter.responseLevel === 'High' ? 'text-emerald-400' : recruiter.responseLevel === 'Low' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {recruiter.responseProbability}% Reply Prob
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* AI OUTREACH ENGINE & PROFILE */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card className="h-[700px] border-purple-500/20 flex flex-col p-0 overflow-hidden">
            {selectedRecruiter ? (
              <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                {/* Profile Header */}
                <div className="p-6 border-b border-surfaceHighlight bg-surfaceHighlight/10 shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-2xl font-bold text-purple-400">
                        {selectedRecruiter.isIdentified ? selectedRecruiter.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${!selectedRecruiter.isIdentified ? 'text-textMuted italic' : 'text-textMain'}`}>
                          {selectedRecruiter.name}
                          {selectedRecruiter.link && (
                            <a href={selectedRecruiter.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primaryHover">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </h2>
                        <p className="text-textMuted flex items-center gap-2 mt-1">
                          <Briefcase className="w-4 h-4" /> {selectedRecruiter.role} at {selectedRecruiter.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-textMuted uppercase tracking-widest mb-1">Networking ROI</div>
                      <div className="text-3xl font-mono font-bold text-emerald-400">{selectedRecruiter.networkingRoiScore}</div>
                    </div>
                  </div>
                </div>

                {/* Intelligence & Strategy */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-surfaceHighlight shrink-0">
                  <div className="bg-surfaceHighlight/30 p-4 rounded-xl border border-surfaceHighlight">
                    <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2"><Target className="w-3 h-3"/> Priority Score</div>
                    <div className="text-2xl font-bold font-mono text-purple-400">{selectedRecruiter.priorityScore}</div>
                  </div>
                  <div className="bg-surfaceHighlight/30 p-4 rounded-xl border border-surfaceHighlight">
                    <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3 h-3"/> Reply Probability</div>
                    <div className={`text-2xl font-bold font-mono ${selectedRecruiter.responseLevel === 'High' ? 'text-emerald-400' : selectedRecruiter.responseLevel === 'Low' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {selectedRecruiter.responseProbability}%
                    </div>
                  </div>
                  <div className="bg-surfaceHighlight/30 p-4 rounded-xl border border-surfaceHighlight">
                    <div className="text-[10px] text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-3 h-3"/> Best Contact Date</div>
                    <div className="text-lg font-bold font-mono text-textMain mt-1">{selectedRecruiter.bestContactDate}</div>
                  </div>
                </div>

                {/* Recruiter Insights & Contact Strategy */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-surfaceHighlight shrink-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono text-primary uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Recruiter Insights
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                      <div>
                        <div className="text-xs text-textMuted uppercase mb-1">Why Contact</div>
                        <div className="text-sm text-slate-300">{selectedRecruiter.whyContact}</div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted uppercase mb-1">Expected Impact</div>
                        <div className="text-sm font-bold text-emerald-400">{selectedRecruiter.expectedImpact}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Contact Strategy
                    </h3>
                    <div className="space-y-2">
                      {selectedRecruiter.contactStrategy.map((step, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-surfaceHighlight/30 rounded border border-surfaceHighlight/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surfaceHighlight text-textMuted'}`}>
                              {step.step}
                            </div>
                            <span className={`text-sm ${step.status === 'Completed' ? 'text-textMuted line-through' : 'text-textMain'}`}>{step.action}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-textMuted">{step.timing}</span>
                            {step.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Outreach Generator */}
                <div className="p-6 flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-mono text-primary uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> AI Outreach Generator
                    </h3>
                    <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                      Action: {selectedRecruiter.suggestedAction}
                    </Badge>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <Button 
                      onClick={() => handleGenerate('connection')} 
                      isLoading={isGenerating && messageType === 'connection'}
                      variant={messageType === 'connection' ? 'primary' : 'outline'}
                      className="flex-1"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> LinkedIn Request
                    </Button>
                    <Button 
                      onClick={() => handleGenerate('email')} 
                      isLoading={isGenerating && messageType === 'email'}
                      variant={messageType === 'email' ? 'primary' : 'outline'}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" /> Cold Email
                    </Button>
                    <Button 
                      onClick={() => handleGenerate('followup')} 
                      isLoading={isGenerating && messageType === 'followup'}
                      variant={messageType === 'followup' ? 'primary' : 'outline'}
                      className="flex-1"
                    >
                      <MessageSquareText className="w-4 h-4 mr-2" /> Follow-Up
                    </Button>
                  </div>

                  <div className="flex-1 bg-background/80 border border-surfaceHighlight rounded-xl p-6 relative group overflow-y-auto custom-scrollbar">
                    {generatedMessage ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col"
                      >
                        <p className="text-textMain whitespace-pre-wrap font-mono text-sm leading-relaxed flex-1">
                          {generatedMessage}
                        </p>
                        <div className="flex justify-end mt-4 pt-4 border-t border-surfaceHighlight/50">
                          <Button variant="secondary" size="sm" onClick={handleCopy}>
                            {copied ? <Check className="w-4 h-4 text-emerald-400 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted text-sm opacity-50">
                        <BrainCircuit className="w-12 h-12 mb-3" />
                        Select a message type above to generate personalized outreach.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted flex-col gap-4 opacity-50">
                <Users className="w-16 h-16" />
                <p className="text-lg">Select a recruiter from the list to view intelligence and generate outreach.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
