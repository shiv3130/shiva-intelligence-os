import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Sankey
} from 'recharts';
import { Activity, Target, AlertTriangle, TrendingUp, Database, Zap, Crosshair, ShieldAlert, X, MapPin, Briefcase, DollarSign, Users, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobApplication } from '../types';

export const Dashboard: React.FC = () => {
  const { state } = useData();
  const { jobs, insights } = state;
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);

  const stats = useMemo(() => {
    if (!jobs.length) return null;
    const total = jobs.length;
    const avgMatch = Math.round(jobs.reduce((acc, j) => acc + j.matchScore, 0) / total);
    const ghostRisk = jobs.filter(j => j.ghostJobWarning).length;
    
    const applied = total;
    const interviewing = jobs.filter(j => (j.interviewProbability || 0) >= 30 && !j.ghostJobWarning).length || Math.floor(total * 0.15); 
    const offers = Math.floor(interviewing * 0.2); 

    return { total, avgMatch, ghostRisk, applied, interviewing, offers };
  }, [jobs]);

  const timelineData = useMemo(() => {
    const data: Record<string, number> = {};
    jobs.forEach(j => {
      const date = j.dateApplied.split('T')[0] || 'Unknown';
      data[date] = (data[date] || 0) + 1;
    });
    return Object.entries(data)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); 
  }, [jobs]);

  const scatterData = useMemo(() => {
    return jobs.filter(j => j.applicantCount > 0).map(j => ({
      name: j.company,
      match: j.matchScore,
      competition: j.applicantCount,
      z: 100 
    })).slice(0, 50);
  }, [jobs]);

  const radarData = useMemo(() => {
    if (!insights?.topMissingSkills) return [];
    return insights.topMissingSkills.slice(0, 6).map(s => ({
      skill: s.skill,
      impact: s.impact,
      fullMark: 100,
    }));
  }, [insights]);

  const sankeyData = useMemo(() => {
    if (!jobs.length) return { nodes: [], links: [] };
    
    const total = jobs.length;
    const ghosted = jobs.filter(j => j.ghostJobWarning).length;
    const rejectedScreen = jobs.filter(j => (j.interviewProbability || 0) < 30 && !j.ghostJobWarning).length;
    const interviews = jobs.filter(j => (j.interviewProbability || 0) >= 30 && !j.ghostJobWarning).length;
    const offers = Math.max(1, Math.floor(interviews * 0.2)); 
    const rejectedInterview = Math.max(0, interviews - offers);

    return {
      nodes: [
        { name: 'Total Applications' }, 
        { name: 'Ghosted / Stale' },    
        { name: 'ATS Rejected' },       
        { name: 'Interviews' },         
        { name: 'Offers' },             
        { name: 'Post-Int Rejected' }   
      ],
      links: [
        { source: 0, target: 1, value: ghosted || 1 },
        { source: 0, target: 2, value: rejectedScreen || 1 },
        { source: 0, target: 3, value: interviews || 1 },
        { source: 3, target: 4, value: offers },
        { source: 3, target: 5, value: rejectedInterview || 1 }
      ].filter(l => l.value > 0)
    };
  }, [jobs]);

  const heatmapData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeBlocks = ['00-06', '06-12', '12-18', '18-24'];
    
    const grid = Array(7).fill(0).map(() => Array(4).fill(0));
    let maxVal = 0;

    jobs.forEach(job => {
      const d = new Date(job.dateApplied);
      if (isNaN(d.getTime())) return;
      
      const day = d.getDay();
      const hour = d.getHours();
      let block = 0;
      if (hour >= 6 && hour < 12) block = 1;
      else if (hour >= 12 && hour < 18) block = 2;
      else if (hour >= 18) block = 3;

      grid[day][block]++;
      if (grid[day][block] > maxVal) maxVal = grid[day][block];
    });

    return { grid, days, timeBlocks, maxVal };
  }, [jobs]);

  const aiAnalyzedJobs = useMemo(() => jobs.filter(j => j.aiAnalyzed).sort((a, b) => (b.interviewProbability || 0) - (a.interviewProbability || 0)), [jobs]);

  if (!jobs.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-surfaceHighlight/50 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <Database className="w-10 h-10 text-primary animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-textMain mb-3 neon-text tracking-tight">SYSTEM OFFLINE</h2>
        <p className="text-textMuted max-w-md text-lg">
          SHIVA requires data ingestion to initialize the intelligence engine. 
          Please navigate to Data Ingestion to upload your application history.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="flex justify-between items-end mb-8 relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text">Command Center</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-textMuted font-mono text-xs tracking-widest">SYS.STATUS: <span className="text-emerald-400">ONLINE</span> | LAST_SYNC: {state.lastUpdated ? new Date(state.lastUpdated).toLocaleTimeString() : 'N/A'}</p>
          </div>
        </motion.div>
        
        {insights && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-right">
            <div className="text-xs text-primary font-mono tracking-widest mb-1 uppercase">Career Health Index</div>
            <div className="text-5xl font-bold text-textMain font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              {insights.careerHealthScore}<span className="text-xl text-textMuted opacity-50">/100</span>
            </div>
          </motion.div>
        )}
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {[
          { label: 'Total Applications', value: stats?.total, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
          { label: 'Avg Match Score', value: `${stats?.avgMatch}%`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
          { label: 'Ghost Job Risk', value: stats?.ghostRisk, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
          { label: 'Est. Interview Rate', value: `${stats ? ((stats.interviewing / stats.total) * 100).toFixed(1) : 0}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-5 flex items-center gap-4 border ${stat.border} hover:bg-surfaceHighlight/50 transition-colors`}>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-textMuted font-mono uppercase tracking-wider">{stat.label}</div>
                <div className="text-2xl font-bold font-mono mt-1">{stat.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Velocity & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card title="Application Velocity" subtitle="14-Day Trajectory" className="h-[350px] flex flex-col border-primary/20">
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#06b6d4', color: '#f8fafc', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card title="Posting Heatmap" subtitle="Volume by Day & Time" className="h-[350px] border-purple-500/20 flex flex-col">
            <div className="flex-1 flex flex-col justify-center mt-2">
              <div className="flex mb-2">
                <div className="w-8"></div>
                {heatmapData.timeBlocks.map(tb => (
                  <div key={tb} className="flex-1 text-center text-[10px] text-textMuted font-mono">{tb}</div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                {heatmapData.days.map((day, dIdx) => (
                  <div key={day} className="flex flex-1 gap-1 items-center">
                    <div className="w-8 text-[10px] text-textMuted font-mono text-right pr-2">{day}</div>
                    {heatmapData.timeBlocks.map((_, tIdx) => {
                      const val = heatmapData.grid[dIdx][tIdx];
                      const intensity = heatmapData.maxVal > 0 ? val / heatmapData.maxVal : 0;
                      return (
                        <div 
                          key={`${dIdx}-${tIdx}`} 
                          className="flex-1 h-full rounded-sm transition-all hover:scale-105 cursor-pointer relative group"
                          style={{ 
                            backgroundColor: `rgba(168, 85, 247, ${Math.max(0.1, intensity)})`,
                            boxShadow: intensity > 0.5 ? `0 0 ${intensity * 10}px rgba(168, 85, 247, ${intensity})` : 'none'
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white drop-shadow-md">
                            {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Row 3: Sankey & Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card title="Pipeline Flow" subtitle="Application Conversion Funnel" className="h-[400px] border-emerald-500/20">
            <div className="h-full w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={sankeyData}
                  node={{ stroke: '#1e293b', strokeWidth: 2 }}
                  nodePadding={30}
                  margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  link={{ stroke: '#06b6d4', strokeOpacity: 0.2 }}
                >
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                </Sankey>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card title="Opportunity Matrix" subtitle="Match Score vs Competition (Lower is better)" className="h-[400px] border-blue-500/20">
            <div className="h-full w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="match" name="Match Score" unit="%" stroke="#64748b" domain={[0, 100]} />
                  <YAxis type="number" dataKey="competition" name="Applicants" stroke="#64748b" />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                  <Scatter name="Jobs" data={scatterData} fill="#3b82f6" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Row 4: Deep ATS Analysis & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
          <Card title="Deep ATS Analysis" subtitle="Click any job for X-Ray Data Drill-Down" className="h-[450px] flex flex-col border-primary/30">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4 custom-scrollbar">
              {aiAnalyzedJobs.length > 0 ? aiAnalyzedJobs.map((job, i) => {
                const prob = job.interviewProbability || 0;
                const isHighProb = prob >= 70;
                const isLowProb = prob < 30;
                
                let cardClass = "bg-surfaceHighlight/30 border-surfaceHighlight hover:border-primary/50 cursor-pointer";
                let probColor = "text-amber-400";
                let barColor = "bg-amber-500";
                
                if (isHighProb) {
                  cardClass = "neon-border-green bg-emerald-500/5 cursor-pointer";
                  probColor = "text-emerald-400 neon-text-green";
                  barColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]";
                } else if (isLowProb) {
                  cardClass = "neon-border-red bg-rose-500/5 cursor-pointer";
                  probColor = "text-rose-400 neon-text-red";
                  barColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]";
                }

                return (
                  <div 
                    key={job.id} 
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${cardClass}`}
                  >
                    {job.ghostJobWarning && (
                      <div className="absolute top-0 right-0 bg-danger/20 text-danger text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> GHOST JOB
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-24">
                        <h4 className="font-bold text-textMain text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                        <p className="text-sm text-textMuted">{job.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Probability</div>
                        <div className={`text-3xl font-mono font-bold ${probColor}`}>{prob}%</div>
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden mb-4">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${prob}%` }} 
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className={`h-full ${barColor}`}
                      />
                    </div>

                    <div className="text-sm text-slate-300 bg-background/60 p-3 rounded-lg border border-surfaceHighlight/50 italic font-light line-clamp-2">
                      "{job.atsFeedback}"
                    </div>
                  </div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50">
                  <Crosshair className="w-12 h-12 mb-2" />
                  <p>No deep analysis performed yet.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card title="Skill Gap Radar" subtitle="Market Demand vs Profile" className="h-[450px] border-purple-500/20">
            <div className="h-full w-full -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Impact" dataKey="impact" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Executive Briefing */}
      {insights && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
          <Card className="neon-border-cyan bg-gradient-to-br from-surface to-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
              <h3 className="text-xl font-bold text-textMain tracking-tight neon-text">Executive Briefing</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-slate-300 font-light">
                {insights.executiveBriefing}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Job X-Ray Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-background/80 backdrop-blur-md"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface/95 border border-primary/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full max-w-6xl max-h-full flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-surfaceHighlight flex justify-between items-start bg-surfaceHighlight/20">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-textMain tracking-tight">{selectedJob.title}</h2>
                    {selectedJob.ghostJobWarning && (
                      <Badge variant="danger" className="animate-pulse"><ShieldAlert className="w-3 h-3 mr-1"/> Ghost Risk</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-textMuted text-sm">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {selectedJob.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedJob.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> {selectedJob.extractedSalary ? `£${selectedJob.extractedSalary.toLocaleString()}` : 'Unknown'}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Metrics & Context */}
                <div className="space-y-6">
                  <Card className="border-primary/20 bg-primary/5 p-5">
                    <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Intelligence Scores</h3>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-textMuted">ATS Match</span>
                      <span className="text-2xl font-bold font-mono text-textMain">{selectedJob.matchScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-primary" style={{ width: `${selectedJob.matchScore}%` }}></div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                      <span className="text-textMuted">Interview Prob</span>
                      <span className={`text-2xl font-bold font-mono ${selectedJob.interviewProbability && selectedJob.interviewProbability >= 70 ? 'text-emerald-400' : selectedJob.interviewProbability && selectedJob.interviewProbability < 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {selectedJob.interviewProbability}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                      <div className={`h-full ${selectedJob.interviewProbability && selectedJob.interviewProbability >= 70 ? 'bg-emerald-500' : selectedJob.interviewProbability && selectedJob.interviewProbability < 30 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${selectedJob.interviewProbability}%` }}></div>
                    </div>
                  </Card>

                  <Card className="border-surfaceHighlight p-5">
                    <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest mb-4">Market Context</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted flex items-center gap-2"><Users className="w-4 h-4"/> Applicants</span>
                        <span className="font-mono font-bold">{selectedJob.applicantCount}</span>
                      </div>
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
                    </div>
                  </Card>
                </div>

                {/* Right Column: Deep Analysis & JD */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  
                  <Card className="border-purple-500/30 bg-purple-500/5 p-5">
                    <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-3">The "Why Not" Analyzer</h3>
                    <p className="text-lg text-slate-300 italic leading-relaxed">
                      "{selectedJob.atsFeedback}"
                    </p>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-emerald-500/20 p-5">
                      <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4"/> Verified Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skillsRequired
                          .filter(s => !selectedJob.missingSkills.includes(s))
                          .map((skill, i) => (
                            <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{skill}</Badge>
                          ))}
                        {selectedJob.skillsRequired.filter(s => !selectedJob.missingSkills.includes(s)).length === 0 && (
                          <span className="text-sm text-textMuted">No direct matches found.</span>
                        )}
                      </div>
                    </Card>

                    <Card className="border-rose-500/20 p-5">
                      <h3 className="text-sm font-mono text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4"/> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.missingSkills.map((skill, i) => (
                          <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/20">{skill}</Badge>
                        ))}
                        {selectedJob.missingSkills.length === 0 && (
                          <span className="text-sm text-textMuted">No missing skills identified!</span>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card className="flex-1 border-surfaceHighlight p-0 overflow-hidden flex flex-col min-h-[250px]">
                    <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/20 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-textMuted" />
                      <h3 className="text-sm font-mono text-textMuted uppercase tracking-widest">Raw Job Description (JD)</h3>
                    </div>
                    <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-background/50">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedJob.aboutJob || "No job description provided in the CSV."}
                      </p>
                    </div>
                  </Card>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
