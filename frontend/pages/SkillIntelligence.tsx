import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, BrainCircuit, Code2, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export const SkillIntelligence: React.FC = () => {
  const { state } = useData();
  const { insights, resume } = state;

  if (!insights || !insights.skillRoi || insights.skillRoi.length === 0) {
    return <div className="p-8 text-textMuted">No skill intelligence available. Please run analysis.</div>;
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0"></div>
      
      <header className="mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-textMain tracking-tight neon-text">Skill Intelligence Center</h1>
        <p className="text-textMuted mt-1">Data-driven upskilling strategy based on your specific pipeline.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* ROI Optimizer */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-2">
          <Card title="Skill Gap & ROI Optimizer" subtitle="Priority Learning Roadmap" className="h-full border-emerald-500/30 bg-emerald-500/5">
            <div className="p-5 bg-surfaceHighlight/30 border border-emerald-500/30 rounded-xl mb-6 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
              <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" /> Top Recommendation
              </h4>
              <p className="text-slate-300 text-lg leading-relaxed font-light">
                Learning <span className="font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">{insights.skillRoi[0].skill}</span> will qualify you for <span className="font-bold text-emerald-400 font-mono">{insights.skillRoi[0].jobCount}</span> more jobs in your pipeline, increasing your average accessible salary by <span className="font-bold text-emerald-400 font-mono">£{insights.skillRoi[0].salaryBoost.toLocaleString()}</span>.
              </p>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Skill</th>
                    <th className="px-4 py-3">Jobs Unlocked</th>
                    <th className="px-4 py-3 rounded-tr-lg">Expected Salary Boost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceHighlight/30">
                  {insights.skillRoi.map((roi, i) => (
                    <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                      <td className="px-4 py-4 font-bold text-textMain">{roi.skill}</td>
                      <td className="px-4 py-4 text-textMuted font-mono">{roi.jobCount}</td>
                      <td className="px-4 py-4 text-emerald-400 font-mono">+£{roi.salaryBoost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Current Profile */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
          <Card title="Verified Profile" subtitle="Semantic Extraction" className="border-purple-500/20 bg-purple-500/5">
            <div className="mb-4">
              <div className="text-[10px] text-textMuted font-mono uppercase tracking-widest mb-2">Domains</div>
              <div className="flex flex-wrap gap-2">
                {resume?.domains?.map((d, i) => (
                  <Badge key={i} className="bg-purple-500/10 text-purple-300 border-purple-500/30">{d}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-textMuted font-mono uppercase tracking-widest mb-2">Top Skills</div>
              <div className="space-y-2">
                {resume?.semanticSkills?.slice(0, 8).map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 bg-surfaceHighlight/30 rounded border border-surfaceHighlight/50">
                    <span className="text-textMain">{s.name}</span>
                    <span className="text-primary font-mono text-xs">{s.years}y</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="ATS Blockers" subtitle="Skills causing highest rejection rate" className="border-rose-500/20">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.topMissingSkills} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="skill" type="category" hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f43f5e', color: '#f8fafc' }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                    {insights.topMissingSkills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact > 80 ? '#f43f5e' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center px-6 pt-12 pb-6">
               {insights.topMissingSkills.map((s, i) => (
                 <div key={i} className="flex justify-between items-center h-[20px] mb-[4px] z-10">
                   <span className="text-xs font-bold text-white drop-shadow-md pl-2">{s.skill}</span>
                   <span className="text-xs font-mono text-white drop-shadow-md pr-2">{s.impact}%</span>
                 </div>
               ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};
