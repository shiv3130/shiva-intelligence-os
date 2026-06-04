import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AlertOctagon, TrendingUp, Zap, ShieldAlert, BrainCircuit, Database } from 'lucide-react';

export const Intelligence: React.FC = () => {
  const { state } = useData();
  const { insights, jobs, resume } = state;

  // Deep CSV Analytics
  const dataDimensions = useMemo(() => {
    if (!jobs.length) return null;

    const workStyleCount: Record<string, number> = {};
    const jobLevelCount: Record<string, number> = {};
    const visaCount: Record<string, number> = {};

    jobs.forEach(job => {
      const ws = job.workStyle || 'Unknown';
      const jl = job.jobLevel || 'Unknown';
      const v = job.visa || 'Unknown';

      workStyleCount[ws] = (workStyleCount[ws] || 0) + 1;
      jobLevelCount[jl] = (jobLevelCount[jl] || 0) + 1;
      visaCount[v] = (visaCount[v] || 0) + 1;
    });

    const formatData = (obj: Record<string, number>) => 
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      workStyle: formatData(workStyleCount),
      jobLevel: formatData(jobLevelCount),
      visa: formatData(visaCount)
    };
  }, [jobs]);

  const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b'];

  if (!insights) {
    return (
      <div className="h-full flex items-center justify-center text-textMuted">
        No intelligence data available. Run analysis in Data Ingestion.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-textMain tracking-tight neon-text">Intelligence & Diagnostics</h1>
        <p className="text-textMuted mt-1">Deep analysis of application failures and market gaps.</p>
      </header>

      {/* Semantic Profile Extraction */}
      {resume?.semanticSkills && (
        <Card title="Semantic Profile Extraction" subtitle="Deep-context entities parsed from your resume" className="border-purple-500/30 bg-purple-500/5">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-textMain">Extracted Domains</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.domains?.map((domain, i) => (
                  <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {domain}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <span className="text-sm text-textMuted">Total Verified Experience: </span>
                <span className="font-mono font-bold text-textMain">{resume.extractedExperience} Years</span>
              </div>
            </div>
            <div className="flex-[2]">
              <h4 className="font-semibold text-textMain mb-3 text-sm">Verified Skills & Tools</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {resume.semanticSkills.map((skill, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-surfaceHighlight/50 border border-surfaceHighlight text-xs">
                    <span className="text-textMain truncate pr-2" title={skill.name}>{skill.name}</span>
                    <span className="text-primary font-mono">{skill.years}y</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Analysis */}
        <Card title="Failure Analysis" className="border-danger/30 bg-danger/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-danger/20 rounded text-danger">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-danger">Why are you failing?</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300">
            <p>{insights.failureAnalysis}</p>
          </div>
        </Card>

        {/* Market Trends */}
        <Card title="Market Demand Engine" className="border-primary/30 bg-primary/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-primary/20 rounded text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary">Current Market Reality</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300">
            <p>{insights.marketTrends}</p>
          </div>
        </Card>
      </div>

      {/* Deep CSV Data Dimensions */}
      {dataDimensions && (
        <Card title="Market Data Dimensions" subtitle="Aggregated insights from raw CSV columns" className="border-surfaceHighlight">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            
            <div className="flex flex-col items-center">
              <h4 className="text-xs font-mono text-textMuted uppercase tracking-widest mb-2">Work Style</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataDimensions.workStyle} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {dataDimensions.workStyle.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1 mt-2">
                {dataDimensions.workStyle.slice(0,3).map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>{d.name}</span>
                    <span className="font-mono text-textMuted">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="text-xs font-mono text-textMuted uppercase tracking-widest mb-2">Job Level</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataDimensions.jobLevel} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {dataDimensions.jobLevel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1 mt-2">
                {dataDimensions.jobLevel.slice(0,3).map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[(i+2)%COLORS.length]}}></div>{d.name}</span>
                    <span className="font-mono text-textMuted">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="text-xs font-mono text-textMuted uppercase tracking-widest mb-2">Visa / Sponsorship</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataDimensions.visa} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {dataDimensions.visa.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1 mt-2">
                {dataDimensions.visa.slice(0,3).map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 truncate max-w-[120px]" title={d.name}><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[(i+4)%COLORS.length]}}></div>{d.name}</span>
                    <span className="font-mono text-textMuted">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* Skill Gap & ROI Optimizer */}
      {insights.skillRoi && insights.skillRoi.length > 0 && (
        <Card title="Skill Gap & ROI Optimizer" subtitle="Priority Learning Roadmap based on pipeline data" className="border-emerald-500/30 bg-emerald-500/5">
          <div className="p-5 bg-surfaceHighlight/50 border border-emerald-500/30 rounded-lg mb-6 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
            <h4 className="text-lg text-textMain font-medium flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top Recommendation
            </h4>
            <p className="text-slate-300 text-lg leading-relaxed">
              Learning <span className="font-bold text-emerald-400 px-1 bg-emerald-500/10 rounded">{insights.skillRoi[0].skill}</span> will qualify you for <span className="font-bold text-emerald-400">{insights.skillRoi[0].jobCount}</span> more jobs in your pipeline, increasing your average accessible salary by <span className="font-bold text-emerald-400">£{insights.skillRoi[0].salaryBoost.toLocaleString()}</span>.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-textMuted uppercase bg-surfaceHighlight/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Skill</th>
                  <th className="px-4 py-3">Jobs Unlocked</th>
                  <th className="px-4 py-3 rounded-tr-lg">Expected Salary Boost</th>
                </tr>
              </thead>
              <tbody>
                {insights.skillRoi.slice(1, 6).map((roi, i) => (
                  <tr key={i} className="border-b border-surfaceHighlight hover:bg-surfaceHighlight/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-textMain">{roi.skill}</td>
                    <td className="px-4 py-3 text-textMuted font-mono">{roi.jobCount}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">+£{roi.salaryBoost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ghost Job Warning Table */}
      <Card title="Ghost Job Detection" subtitle="Applications flagged as highly likely to be fake or inactive">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-textMuted uppercase bg-surfaceHighlight/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Risk Factor</th>
              </tr>
            </thead>
            <tbody>
              {jobs.filter(j => j.ghostJobWarning).slice(0, 10).map((job, i) => (
                <tr key={i} className="border-b border-surfaceHighlight hover:bg-surfaceHighlight/30">
                  <td className="px-4 py-3 font-medium text-textMain">{job.company}</td>
                  <td className="px-4 py-3 text-textMuted">{job.title}</td>
                  <td className="px-4 py-3 text-textMuted font-mono">{job.applicantCount}</td>
                  <td className="px-4 py-3 text-textMuted">{job.reposted ? 'Reposted' : 'New'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="danger" className="flex w-fit items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> High
                    </Badge>
                  </td>
                </tr>
              ))}
              {jobs.filter(j => j.ghostJobWarning).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-textMuted">No ghost jobs detected in recent history.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
