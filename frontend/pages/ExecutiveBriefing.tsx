import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Activity, Target, Zap, Crosshair, ShieldAlert, Database, ArrowUpRight, Briefcase, Users, Code2, FileText, CheckCircle2, AlertTriangle, TrendingUp, Clock, ArrowRight, Compass, Map, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const ExecutiveBriefing: React.FC = () => {
  const { state } = useData();
  const { jobs, insights, resumeDNA } = state;
  const [activeSimulator, setActiveSimulator] = useState<number | null>(null);

  if (!jobs.length || !insights) {
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
        <p className="text-textMuted max-w-md text-lg mb-6">
          SHIVA requires data ingestion to initialize the intelligence engine.
        </p>
        <Link to="/ingestion" className="px-6 py-3 bg-primary/10 border border-primary/50 text-primary rounded-lg hover:bg-primary/20 transition-colors font-mono text-sm uppercase tracking-widest">
          Initialize Pipeline
        </Link>
      </div>
    );
  }

  const getMissionIcon = (type: string) => {
    switch(type) {
      case 'Recruiter': return <Users className="w-4 h-4 text-purple-400" />;
      case 'Skill': return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'Application': return <Briefcase className="w-4 h-4 text-blue-400" />;
      default: return <Target className="w-4 h-4 text-primary" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'High': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Low': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-textMuted border-surfaceHighlight bg-surfaceHighlight/30';
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="flex justify-between items-end mb-8 relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" /> Career Copilot
          </h1>
          <p className="text-textMuted mt-2 text-lg">Your autonomous AI career strategist.</p>
        </motion.div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-textMuted font-mono text-xs tracking-widest">SYS.STATUS: <span className="text-emerald-400">ONLINE</span></p>
        </div>
      </header>

      {/* ROW 1: MASTER GAUGES & DAILY DIRECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Master Gauges */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-1 flex flex-col gap-4">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-surface to-primary/5 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-primary font-mono tracking-widest mb-4 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4" /> Career Health
            </div>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-surfaceHighlight" />
                <circle cx="80" cy="80" r="70" stroke="#06b6d4" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * insights.careerHealthScore) / 100} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="text-5xl font-bold text-textMain font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                {insights.careerHealthScore}
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-purple-500/30 bg-purple-500/5 text-center">
              <div className="text-[10px] text-purple-400 font-mono tracking-widest mb-1 uppercase">Int. Prob</div>
              <div className="text-3xl font-bold text-textMain font-mono">{insights.interviewProbability}%</div>
            </Card>
            <Card className="p-4 border-emerald-500/30 bg-emerald-500/5 text-center">
              <div className="text-[10px] text-emerald-400 font-mono tracking-widest mb-1 uppercase">Offer Prob</div>
              <div className="text-3xl font-bold text-textMain font-mono">{insights.offerProbability}%</div>
            </Card>
          </div>
        </motion.div>

        {/* AI Daily Directive Engine */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full border-amber-500/30 bg-gradient-to-br from-surface to-amber-500/5 p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-amber-400 tracking-tight uppercase text-sm">Today's Mission Briefing</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                {insights.dailyMissions?.map((mission, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surfaceHighlight/30 border border-surfaceHighlight/50 rounded-lg hover:border-amber-500/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surfaceHighlight rounded-md group-hover:bg-amber-500/10 transition-colors">
                        {getMissionIcon(mission.type)}
                      </div>
                      <span className="font-medium text-textMain">{mission.title}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      {mission.expectedGain}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-amber-500/20 flex justify-between items-center">
                <div className="text-sm text-textMuted uppercase tracking-widest font-mono">Total Projected Improvement</div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-textMuted uppercase">Interview Prob</div>
                    <div className="text-lg font-bold text-purple-400 font-mono">+38%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-textMuted uppercase">Career Health</div>
                    <div className="text-lg font-bold text-primary font-mono">+14%</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ROW 2: CAREER GPS & BOTTLENECKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card title="Career GPS" subtitle="Visual roadmap to your target state" className="h-full border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between mt-8 px-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-surfaceHighlight border-2 border-surfaceHighlight flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-textMuted" />
                </div>
                <div className="text-xs text-textMuted uppercase tracking-widest mb-1">Current State</div>
                <div className="font-bold text-textMain">Candidate</div>
              </div>
              
              <div className="flex-1 flex items-center justify-center px-4 relative">
                <div className="h-1 w-full bg-surfaceHighlight rounded-full relative">
                  <div className="absolute top-0 left-0 h-full bg-blue-500 w-1/3"></div>
                </div>
                <div className="absolute top-[-30px] bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-1 rounded uppercase tracking-widest">
                  In Progress
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs text-blue-400 uppercase tracking-widest mb-1">Target State</div>
                <div className="font-bold text-textMain">{insights.highestOpportunityJob || 'Target Role'}</div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-surfaceHighlight">
              <h4 className="text-xs font-mono text-textMuted uppercase tracking-widest mb-4">Critical Gaps to Bridge</h4>
              <div className="flex flex-wrap gap-2">
                {insights.skillRoi?.slice(0, 5).map((roi, i) => (
                  <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/30 px-3 py-1.5">
                    {roi.skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
          <Card title="Career Bottlenecks" subtitle="Primary blockers identified" className="h-full border-rose-500/20">
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <div className="text-[10px] text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> Interview Blocker</div>
                <div className="text-sm text-slate-300">{insights.bottlenecks?.interview || 'Lack of production deployment examples'}</div>
              </div>
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <div className="text-[10px] text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> Skill Gap</div>
                <div className="text-sm text-slate-300">{insights.bottlenecks?.skill || 'Cloud infrastructure'}</div>
              </div>
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <div className="text-[10px] text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> ATS Weakness</div>
                <div className="text-sm text-slate-300">{insights.bottlenecks?.ats || 'Missing exact keyword matches for modern frameworks'}</div>
              </div>
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <div className="text-[10px] text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> Recruiter Weakness</div>
                <div className="text-sm text-slate-300">{insights.bottlenecks?.recruiter || 'Low response rate due to generic outreach'}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ROW 3: SKILL ROI & CAREER SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Skill ROI Engine */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card title="Skill ROI Engine" subtitle="Highest return on investment learning paths" className="h-[450px] border-emerald-500/20 flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4 space-y-3">
              {insights.skillRoi?.slice(0, 5).map((roi, i) => (
                <div key={i} className="p-4 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl hover:border-emerald-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-textMain text-lg group-hover:text-emerald-400 transition-colors">{roi.skill}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge className={`text-[10px] py-0 ${roi.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                          {roi.priority}
                        </Badge>
                        <span className="text-xs text-textMuted flex items-center gap-1"><Clock className="w-3 h-3"/> {roi.learningTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-emerald-400">{roi.roiScore}</div>
                      <div className="text-[10px] text-textMuted uppercase tracking-widest">ROI Score</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surfaceHighlight/50">
                    <div className="text-center">
                      <div className="text-[10px] text-textMuted uppercase">ATS Gain</div>
                      <div className="text-sm font-bold text-primary font-mono">+{roi.atsGain}%</div>
                    </div>
                    <div className="text-center border-l border-r border-surfaceHighlight/50">
                      <div className="text-[10px] text-textMuted uppercase">Int. Gain</div>
                      <div className="text-sm font-bold text-purple-400 font-mono">+{roi.intGain}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-textMuted uppercase">Salary Gain</div>
                      <div className="text-sm font-bold text-amber-400 font-mono">+£{roi.salaryBoost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Career Simulator */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card title="Career Simulator" subtitle="Test 'What If' scenarios to project outcomes" className="h-[450px] border-purple-500/20 flex flex-col">
            <div className="flex-1 flex flex-col justify-center gap-4 mt-4">
              {insights.skillRoi?.slice(0, 3).map((roi, i) => {
                const isActive = activeSimulator === i;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveSimulator(isActive ? null : i)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isActive ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-surfaceHighlight/30 border-surfaceHighlight hover:border-purple-500/30'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-textMain">What if I learn {roi.skill}?</h4>
                      <ArrowUpRight className={`w-5 h-5 transition-transform ${isActive ? 'text-purple-400 rotate-45' : 'text-textMuted'}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-2 border-t border-purple-500/20 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-textMuted">ATS Score</span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-slate-400">{resumeDNA?.atsReadinessScore || 72}</span>
                                <ArrowRight className="w-3 h-3 text-purple-400" />
                                <span className="text-emerald-400 font-bold">{Math.min(100, (resumeDNA?.atsReadinessScore || 72) + roi.atsGain)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-textMuted">Interview Prob</span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-slate-400">{insights.interviewProbability}%</span>
                                <ArrowRight className="w-3 h-3 text-purple-400" />
                                <span className="text-purple-400 font-bold">{Math.min(100, insights.interviewProbability + roi.intGain)}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-textMuted">Career Health</span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-slate-400">{insights.careerHealthScore}</span>
                                <ArrowRight className="w-3 h-3 text-purple-400" />
                                <span className="text-primary font-bold">{Math.min(100, insights.careerHealthScore + Math.ceil(roi.roiScore/10))}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ROW 4: FORECAST & RISKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Interview Forecast Engine */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="lg:col-span-2">
          <Card title="Interview Forecast Engine" subtitle="Predictive pipeline modeling" className="h-full border-blue-500/20">
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-surfaceHighlight/30 rounded-xl border border-surfaceHighlight">
                <div className="text-xs text-textMuted uppercase tracking-widest mb-2">30 Days</div>
                <div className="text-3xl font-bold text-textMain font-mono mb-1">{insights.careerForecast?.interviews30}</div>
                <div className="text-[10px] text-primary uppercase">Expected Interviews</div>
                <div className="mt-4 pt-4 border-t border-surfaceHighlight/50">
                  <div className="text-xl font-bold text-emerald-400 font-mono mb-1">{insights.careerForecast?.offers30}</div>
                  <div className="text-[10px] text-textMuted uppercase">Expected Offers</div>
                </div>
              </div>
              <div className="text-center p-4 bg-surfaceHighlight/30 rounded-xl border border-surfaceHighlight">
                <div className="text-xs text-textMuted uppercase tracking-widest mb-2">60 Days</div>
                <div className="text-3xl font-bold text-textMain font-mono mb-1">{insights.careerForecast?.interviews60}</div>
                <div className="text-[10px] text-primary uppercase">Expected Interviews</div>
                <div className="mt-4 pt-4 border-t border-surfaceHighlight/50">
                  <div className="text-xl font-bold text-emerald-400 font-mono mb-1">{insights.careerForecast?.offers60}</div>
                  <div className="text-[10px] text-textMuted uppercase">Expected Offers</div>
                </div>
              </div>
              <div className="text-center p-4 bg-surfaceHighlight/30 rounded-xl border border-surfaceHighlight">
                <div className="text-xs text-textMuted uppercase tracking-widest mb-2">90 Days</div>
                <div className="text-3xl font-bold text-textMain font-mono mb-1">{insights.careerForecast?.interviews90}</div>
                <div className="text-[10px] text-primary uppercase">Expected Interviews</div>
                <div className="mt-4 pt-4 border-t border-surfaceHighlight/50">
                  <div className="text-xl font-bold text-emerald-400 font-mono mb-1">{insights.careerForecast?.offers90}</div>
                  <div className="text-[10px] text-textMuted uppercase">Expected Offers</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex justify-between items-center">
              <div className="text-sm text-textMuted">Career Trajectory Forecast:</div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">{insights.careerForecast?.trajectory3m}</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">{insights.careerForecast?.trajectory6m}</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="text-emerald-400 font-bold">{insights.careerForecast?.trajectory12m}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Career Risk Engine */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="lg:col-span-1">
          <Card title="Career Risk Engine" subtitle="Critical warnings and vulnerabilities" className="h-full border-rose-500/20">
            <div className="space-y-3 mt-4">
              {insights.careerRisks?.map((risk, i) => (
                <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${getRiskColor(risk.level)}`}>
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1">{risk.level} RISK: {risk.category}</div>
                    <div className="text-sm opacity-90">{risk.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ROW 5: EXECUTIVE INSIGHT ENGINE */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="relative z-10">
        <Card className="border-primary/30 bg-gradient-to-br from-surface to-primary/5">
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceHighlight pb-4">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Executive Insight Engine</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.executiveInsights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

    </div>
  );
};
