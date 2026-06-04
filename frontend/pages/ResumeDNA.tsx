import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { Fingerprint, ShieldAlert, CheckCircle2, XCircle, TrendingUp, Award, Briefcase, Database, Info, Zap, Target, Activity, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScoreExplanation } from '../types';

export const ResumeDNA: React.FC = () => {
  const { state } = useData();
  const { resumeDNA, resume } = state;
  const [activeExplanation, setActiveExplanation] = useState<ScoreExplanation | null>(null);

  const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b'];

  if (!resumeDNA || !resume) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-surfaceHighlight/50 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <Fingerprint className="w-10 h-10 text-purple-400 animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-textMain mb-3 neon-text tracking-tight">DNA NOT SEQUENCED</h2>
        <p className="text-textMuted max-w-md text-lg mb-6">
          Upload your resume and application history to generate your Resume DNA profile.
        </p>
        <Link to="/ingestion" className="px-6 py-3 bg-purple-500/10 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors font-mono text-sm uppercase tracking-widest">
          Sequence DNA
        </Link>
      </div>
    );
  }

  const radarData = resumeDNA.domains.map(d => ({
    domain: d.name,
    match: d.matchPercentage,
    fullMark: 100
  }));

  const pieData = resumeDNA.skillCategories.map(c => ({
    name: c.category,
    value: c.coverage
  }));

  const getScoreExplanation = (name: string) => {
    return resumeDNA.scoreExplanations?.find(e => e.scoreName.toLowerCase().includes(name.toLowerCase()));
  };

  const ScoreCard = ({ title, score, icon: Icon, colorClass, strokeColor, explanationName }: any) => {
    const explanation = getScoreExplanation(explanationName);
    
    return (
      <Card className={`p-6 border-${colorClass}/30 bg-gradient-to-br from-surface to-${colorClass}/5 shadow-[0_0_20px_rgba(var(--${colorClass}-rgb),0.1)] flex flex-col items-center justify-center text-center relative group`}>
        {explanation && (
          <button 
            className="absolute top-4 right-4 text-textMuted hover:text-textMain transition-colors"
            onClick={() => setActiveExplanation(explanation)}
          >
            <Info className="w-4 h-4" />
          </button>
        )}
        <div className={`text-xs text-${colorClass} font-mono tracking-widest mb-4 uppercase flex items-center gap-2`}>
          <Icon className="w-4 h-4" /> {title}
        </div>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surfaceHighlight" />
            <circle cx="64" cy="64" r="60" stroke={strokeColor} strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * score) / 100} className="transition-all duration-1000 ease-out" />
          </svg>
          <div className={`text-4xl font-bold text-textMain font-mono drop-shadow-[0_0_15px_${strokeColor}]`}>
            {score}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="flex justify-between items-end mb-8 relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-primary" /> Resume DNA
          </h1>
          <p className="text-textMuted mt-2 text-lg">Advanced Career Intelligence & Market Alignment Engine.</p>
        </motion.div>
      </header>

      {/* Top Scores with Explainability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <ScoreCard title="Resume Strength" score={resumeDNA.strengthScore} icon={Award} colorClass="primary" strokeColor="#06b6d4" explanationName="strength" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <ScoreCard title="ATS Readiness" score={resumeDNA.atsReadinessScore} icon={Database} colorClass="purple-500" strokeColor="#a855f7" explanationName="ats" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <ScoreCard title="Market Readiness" score={resumeDNA.marketReadinessScore} icon={TrendingUp} colorClass="emerald-500" strokeColor="#10b981" explanationName="market" />
        </motion.div>
      </div>

      {/* SECTION 5: AI INSIGHT PANEL */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="relative z-10">
        <Card className="border-primary/30 bg-gradient-to-br from-surface to-primary/5 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceHighlight pb-4">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Executive Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumeDNA.aiInsights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* SECTION 1: RESUME MARKET FIT ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card title="Resume Market Fit" subtitle="Best matching career paths based on your profile" className="h-[450px] border-emerald-500/20 flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4 space-y-3">
              <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Highest Probability Roles</h4>
              {resumeDNA.marketFit?.bestMatches.map((role, i) => (
                <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex justify-between items-center group hover:bg-emerald-500/10 transition-colors">
                  <div>
                    <div className="font-bold text-textMain">{role.role}</div>
                    <div className="text-xs text-textMuted mt-1">Market Demand: {role.marketDemand}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold text-emerald-400">{role.fitPercentage}%</div>
                    <div className="text-[10px] text-textMuted uppercase">Fit Score</div>
                  </div>
                </div>
              ))}
              
              <h4 className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-2 mt-6">Roles to Avoid (Low Fit)</h4>
              {resumeDNA.marketFit?.weakestMatches.map((role, i) => (
                <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg flex justify-between items-center group hover:bg-rose-500/10 transition-colors">
                  <div>
                    <div className="font-bold text-textMain">{role.role}</div>
                    <div className="text-xs text-textMuted mt-1">Market Demand: {role.marketDemand}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold text-rose-400">{role.fitPercentage}%</div>
                    <div className="text-[10px] text-textMuted uppercase">Fit Score</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* SECTION 4: RESUME VS MARKET ENGINE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card title="Resume vs Market" subtitle="Capability vs Actual Market Demand" className="h-[450px] border-purple-500/20">
            <div className="h-full w-full -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={resumeDNA.resumeVsMarket}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Your Profile" dataKey="resumeCoverage" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.4} />
                  <Radar name="Market Demand" dataKey="marketDemand" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* SECTION 2: RESUME GAP ANALYSIS ENGINE */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="relative z-10">
        <Card title="Resume Gap Analysis" subtitle="Skills repeatedly requested by the market but missing from your resume" className="border-amber-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <div className="lg:col-span-1 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumeDNA.gapAnalysis?.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="skill" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b' }} />
                  <Bar dataKey="frequency" name="Missing Frequency %" radius={[0, 4, 4, 0]} barSize={20}>
                    {resumeDNA.gapAnalysis?.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.priority === 'Critical' ? '#f43f5e' : entry.priority === 'High' ? '#f59e0b' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2 overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Missing Skill</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Est. ATS Gain</th>
                    <th className="px-4 py-3 rounded-tr-lg">Est. Interview Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceHighlight/30">
                  {resumeDNA.gapAnalysis?.slice(0, 6).map((gap, i) => (
                    <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-textMain">{gap.skill}</td>
                      <td className="px-4 py-3 text-textMuted font-mono">{gap.frequency}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={gap.priority === 'Critical' ? 'danger' : gap.priority === 'High' ? 'warning' : 'default'}>
                          {gap.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">+{gap.potentialAtsGain}%</td>
                      <td className="px-4 py-3 text-purple-400 font-mono">+{gap.potentialInterviewGain}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3: SKILL IMPORTANCE MATRIX */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
        <Card title="Skill Importance Matrix" subtitle="Ranking all skills by real market value" className="border-blue-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="category" dataKey="skill" name="Skill" stroke="#64748b" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis type="number" dataKey="demand" name="Demand %" stroke="#64748b" domain={[0, 100]} />
                  <ZAxis type="number" dataKey="demand" range={[100, 800]} name="Market Demand" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                  <Scatter name="Skills" data={resumeDNA.skillImportance?.slice(0, 10)} fill="#3b82f6" fillOpacity={0.7}>
                    {resumeDNA.skillImportance?.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.importance === 'Critical' ? '#f43f5e' : entry.importance === 'High' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Skill</th>
                    <th className="px-4 py-3">Demand</th>
                    <th className="px-4 py-3">Importance</th>
                    <th className="px-4 py-3">Salary Impact</th>
                    <th className="px-4 py-3 rounded-tr-lg">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceHighlight/30">
                  {resumeDNA.skillImportance?.slice(0, 8).map((skill, i) => (
                    <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-textMain">{skill.skill}</td>
                      <td className="px-4 py-3 text-textMuted font-mono">{skill.demand}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={skill.importance === 'Critical' ? 'danger' : skill.importance === 'High' ? 'warning' : 'success'}>
                          {skill.importance}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-textMuted">{skill.salaryImpact}</td>
                      <td className="px-4 py-3 text-textMuted">{skill.marketTrend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Score Explainability Modal */}
      <AnimatePresence>
        {activeExplanation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setActiveExplanation(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center bg-surfaceHighlight/20">
                <h2 className="text-2xl font-bold text-textMain tracking-tight flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" /> {activeExplanation.scoreName} Explanation
                </h2>
                <div className="text-3xl font-mono font-bold text-primary">{activeExplanation.score}</div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Positive Factors
                    </h4>
                    <ul className="space-y-2">
                      {activeExplanation.positiveFactors.map((f, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Negative Factors
                    </h4>
                    <ul className="space-y-2">
                      {activeExplanation.negativeFactors.map((f, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-rose-500 mt-1">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="text-xs font-mono text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Improvement Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {activeExplanation.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-4 border-t border-surfaceHighlight bg-surfaceHighlight/10 text-right">
                <button 
                  onClick={() => setActiveExplanation(null)}
                  className="px-4 py-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMain rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
