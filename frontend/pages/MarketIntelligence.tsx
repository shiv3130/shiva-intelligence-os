import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Treemap, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import { LineChart, Database, Briefcase, MapPin, DollarSign, Users, ShieldAlert, Zap, ArrowRight, Globe, GraduationCap, Clock, Target, Layers, BookOpen, Award, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { normalizeSkill, extractSkillsFromText, getSkillCategory } from '../services/skillNormalization';

export const MarketIntelligence: React.FC = () => {
  const { state } = useData();
  const { jobs, insights, resumeDNA } = state;

  const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b', '#ec4899', '#14b8a6'];

  // --- DATA PROCESSING WITH NORMALIZATION ---
  const marketStats = useMemo(() => {
    if (!jobs.length) return null;

    const totalJobs = jobs.length;
    const uniqueCompanies = new Set(jobs.map(j => j.company)).size;
    const uniqueTitles = new Set(jobs.map(j => j.title)).size;
    
    let totalMatch = 0;
    let totalApplicants = 0;
    let totalSalary = 0;
    let salaryCount = 0;
    let visaCount = 0;
    let ghostCount = 0;

    const skillCounts = new Map<string, number>();
    const missingSkillCounts = new Map<string, number>();
    const titleCounts = new Map<string, { count: number, match: number, salary: number, applicants: number }>();
    const locationCounts = new Map<string, number>();
    const expCounts = new Map<string, number>();
    const eduCounts = new Map<string, number>();
    const workStyleCounts = new Map<string, number>();
    
    const jobSkillsList: string[][] = [];

    jobs.forEach(j => {
      totalMatch += j.matchScore;
      totalApplicants += j.applicantCount;
      if (j.extractedSalary) {
        totalSalary += j.extractedSalary;
        salaryCount++;
      }
      if (j.visa && !j.visa.toUpperCase().includes('NO')) visaCount++;
      if (j.ghostJobWarning) ghostCount++;

      const jobSkills = new Set<string>();
      
      j.skillsRequired.forEach(s => {
        const norm = normalizeSkill(s);
        if (norm) jobSkills.add(norm);
      });
      
      if (j.aboutJob) {
        const extracted = extractSkillsFromText(j.aboutJob);
        extracted.forEach(s => jobSkills.add(s));
      }

      jobSkills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
      
      jobSkillsList.push(Array.from(jobSkills));

      j.missingSkills.forEach(s => {
        const norm = normalizeSkill(s);
        if (norm) missingSkillCounts.set(norm, (missingSkillCounts.get(norm) || 0) + 1);
      });

      const title = j.title.trim();
      if (title) {
        const tData = titleCounts.get(title) || { count: 0, match: 0, salary: 0, applicants: 0 };
        tData.count++;
        tData.match += j.matchScore;
        tData.applicants += j.applicantCount;
        if (j.extractedSalary) tData.salary += j.extractedSalary;
        titleCounts.set(title, tData);
      }

      const loc = j.location.trim() || 'Remote';
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);

      const exp = j.experienceRequired.trim() || 'Not Specified';
      expCounts.set(exp, (expCounts.get(exp) || 0) + 1);

      const edu = j.educationRequired?.trim() || 'Not Specified';
      eduCounts.set(edu, (eduCounts.get(edu) || 0) + 1);

      const ws = j.workStyle.trim() || 'Unknown';
      workStyleCounts.set(ws, (workStyleCounts.get(ws) || 0) + 1);
    });

    const topSkills = Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ 
        skill, 
        demand: Math.round((count / totalJobs) * 100), 
        count,
        category: getSkillCategory(skill)
      }))
      .sort((a, b) => b.count - a.count);

    const topMissingSkills = Array.from(missingSkillCounts.entries())
      .map(([skill, count]) => ({ 
        skill, 
        frequency: Math.round((count / totalJobs) * 100), 
        count 
      }))
      .sort((a, b) => b.count - a.count);

    const topTitles = Array.from(titleCounts.entries())
      .map(([title, data]) => ({
        title,
        demand: Math.round((data.count / totalJobs) * 100),
        avgMatch: Math.round(data.match / data.count),
        avgSalary: data.salary > 0 ? Math.round(data.salary / data.count) : 0,
        avgApplicants: Math.round(data.applicants / data.count)
      }))
      .sort((a, b) => b.demand - a.demand);

    const formatPie = (map: Map<string, number>) => Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const coOccurrence = new Map<string, number>();
    jobSkillsList.forEach(skills => {
      for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
          const pair = [skills[i], skills[j]].sort().join('|');
          coOccurrence.set(pair, (coOccurrence.get(pair) || 0) + 1);
        }
      }
    });

    const topPairs = Array.from(coOccurrence.entries())
      .map(([pair, count]) => {
        const [source, target] = pair.split('|');
        return { source, target, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    const stackCounts = new Map<string, number>();
    jobSkillsList.forEach(skills => {
      if (skills.length >= 3) {
        const sortedStack = skills
          .sort((a, b) => (skillCounts.get(b) || 0) - (skillCounts.get(a) || 0))
          .slice(0, 4)
          .join(' + ');
        stackCounts.set(sortedStack, (stackCounts.get(sortedStack) || 0) + 1);
      }
    });
    const topStacks = Array.from(stackCounts.entries())
      .map(([stack, count]) => ({ stack, frequency: Math.round((count / totalJobs) * 100) }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      totalJobs,
      uniqueCompanies,
      uniqueTitles,
      uniqueSkills: skillCounts.size,
      avgMatch: Math.round(totalMatch / totalJobs),
      avgApplicants: Math.round(totalApplicants / totalJobs),
      avgSalary: salaryCount > 0 ? Math.round(totalSalary / salaryCount) : 0,
      visaRate: Math.round((visaCount / totalJobs) * 100),
      ghostRate: Math.round((ghostCount / totalJobs) * 100),
      topSkills,
      topMissingSkills,
      topTitles,
      topPairs,
      topStacks,
      locations: formatPie(locationCounts),
      experience: formatPie(expCounts),
      education: formatPie(eduCounts),
      workStyles: formatPie(workStyleCounts)
    };
  }, [jobs]);

  // --- PRESCRIPTIVE INTELLIGENCE ENGINE ---
  const prescriptiveData = useMemo(() => {
    if (!marketStats || !insights) return null;

    const currentAts = resumeDNA?.atsReadinessScore || 72;
    const currentInt = insights.interviewProbability || 18;
    const currentHealth = insights.careerHealthScore || 65;

    // 1. Recommended Actions & Gaps
    const actions = marketStats.topMissingSkills.slice(0, 10).map(s => {
      const atsGain = Math.ceil(s.frequency / 6);
      const intGain = Math.ceil(atsGain * 0.65);
      const salaryGain = Math.round((s.frequency / 100) * 8000);
      const roi = Math.min(99, Math.round(s.frequency * 0.8 + atsGain * 1.5));
      const priority = roi > 85 ? 'Critical' : roi > 70 ? 'High' : 'Medium';
      const learningTime = ['Docker', 'Kubernetes', 'Azure', 'AWS', 'GCP'].includes(s.skill) ? '4 Weeks' : '2-3 Weeks';

      return {
        skill: s.skill,
        frequency: s.frequency,
        atsGain,
        intGain,
        salaryGain,
        roi,
        priority,
        learningTime
      };
    });

    // 2. Skill Value Rankings
    const skillValues = marketStats.topSkills.slice(0, 50).map(s => {
      const salaryImpact = s.demand > 50 ? 'Very High' : s.demand > 30 ? 'High' : 'Medium';
      const interviewImpact = s.demand > 60 ? 'Critical' : s.demand > 40 ? 'High' : 'Medium';
      const roi = Math.min(99, Math.round(s.demand * 1.2));
      return {
        skill: s.skill,
        demand: s.demand,
        salaryImpact,
        interviewImpact,
        marketGrowth: 'Growing',
        roi
      };
    });

    // 3. Career Simulator
    const simulators = [];
    if (actions.length >= 2) {
      simulators.push({
        scenario: `If you learn ${actions[0].skill}`,
        currentAts, newAts: Math.min(100, currentAts + actions[0].atsGain),
        currentInt, newInt: Math.min(100, currentInt + actions[0].intGain),
        currentHealth, newHealth: Math.min(100, currentHealth + Math.ceil(actions[0].roi / 10))
      });
      simulators.push({
        scenario: `If you learn ${actions[1].skill}`,
        currentAts, newAts: Math.min(100, currentAts + actions[1].atsGain),
        currentInt, newInt: Math.min(100, currentInt + actions[1].intGain),
        currentHealth, newHealth: Math.min(100, currentHealth + Math.ceil(actions[1].roi / 10))
      });
      simulators.push({
        scenario: `If you learn ${actions[0].skill} + ${actions[1].skill}`,
        currentAts, newAts: Math.min(100, currentAts + actions[0].atsGain + actions[1].atsGain),
        currentInt, newInt: Math.min(100, currentInt + actions[0].intGain + actions[1].intGain),
        currentHealth, newHealth: Math.min(100, currentHealth + Math.ceil((actions[0].roi + actions[1].roi) / 10))
      });
    }

    // 4. Executive Insights
    const dynamicInsights = [
      `The largest weakness in your profile is ${resumeDNA?.weaknesses[0]?.title || 'Cloud Technologies'}.`,
      `${actions[0]?.skill || 'A key skill'} appears in ${actions[0]?.frequency || 0}% of analyzed opportunities.`,
      `Adding ${actions[0]?.skill || 'this skill'} could improve ATS performance by approximately ${actions[0]?.atsGain || 0}%.`,
      `Adding ${actions[0]?.skill || 'Skill A'} and ${actions[1]?.skill || 'Skill B'} would improve competitiveness more than any other combination.`,
      `Highest ROI learning path: ${actions[0]?.skill || 'A'} → ${actions[1]?.skill || 'B'} → ${actions[2]?.skill || 'C'}`
    ];

    return { actions, skillValues, simulators, dynamicInsights };
  }, [marketStats, insights, resumeDNA]);

  // Treemap Data
  const treemapData = useMemo(() => {
    if (!marketStats) return [];
    const categoryMap = new Map<string, any[]>();
    marketStats.topSkills.slice(0, 30).forEach(s => {
      const cat = s.category;
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push({ name: s.skill, size: s.count, demand: s.demand });
    });
    return Array.from(categoryMap.entries()).map(([name, children]) => ({ name, children }));
  }, [marketStats]);

  // Network Graph Data
  const { nodes, edges } = useMemo(() => {
    if (!marketStats) return { nodes: [], edges: [] };
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const addedNodes = new Set<string>();

    marketStats.topPairs.forEach((pair, i) => {
      if (!addedNodes.has(pair.source)) {
        newNodes.push({
          id: pair.source,
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          data: { label: pair.source },
          style: { background: '#1e293b', color: '#06b6d4', border: `1px solid ${COLORS[newNodes.length % COLORS.length]}`, borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold' }
        });
        addedNodes.add(pair.source);
      }
      if (!addedNodes.has(pair.target)) {
        newNodes.push({
          id: pair.target,
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          data: { label: pair.target },
          style: { background: '#1e293b', color: '#10b981', border: `1px solid ${COLORS[newNodes.length % COLORS.length]}`, borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold' }
        });
        addedNodes.add(pair.target);
      }
      newEdges.push({
        id: `e-${pair.source}-${pair.target}`,
        source: pair.source,
        target: pair.target,
        animated: pair.count > (marketStats.totalJobs * 0.2),
        style: { stroke: '#334155', strokeWidth: Math.max(1, pair.count / 10) }
      });
    });
    return { nodes: newNodes, edges: newEdges };
  }, [marketStats]);

  if (!jobs.length || !marketStats || !prescriptiveData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-surfaceHighlight/50 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <LineChart className="w-10 h-10 text-primary animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-textMain mb-3 neon-text tracking-tight">MARKET DATA OFFLINE</h2>
        <p className="text-textMuted max-w-md text-lg mb-6">
          Upload your application history to generate Market Intelligence.
        </p>
        <Link to="/ingestion" className="px-6 py-3 bg-primary/10 border border-primary/50 text-primary rounded-lg hover:bg-primary/20 transition-colors font-mono text-sm uppercase tracking-widest">
          Initialize Pipeline
        </Link>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className={`p-4 border-${colorClass}/20 bg-${colorClass}/5 flex items-center gap-4`}>
      <div className={`p-3 rounded-lg bg-${colorClass}/10 text-${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[10px] text-textMuted font-mono uppercase tracking-widest">{title}</div>
        <div className="text-xl font-bold text-textMain font-mono">{value}</div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto relative custom-scrollbar">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>
      
      <header className="flex justify-between items-end mb-8 relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text flex items-center gap-3">
            <LineChart className="w-8 h-8 text-primary" /> Market Intelligence
          </h1>
          <p className="text-textMuted mt-2 text-lg">Prescriptive Career Decision Intelligence System.</p>
        </motion.div>
      </header>

      {/* SECTION 1: MARKET ACTION CENTER */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative z-10">
        <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> Recommended Next Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prescriptiveData.actions.slice(0, 3).map((action, i) => (
            <Card key={i} className="border-primary/30 bg-gradient-to-br from-surface to-primary/5 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-textMuted uppercase tracking-widest mb-1">Learn</div>
                  <h3 className="text-xl font-bold text-textMain">{action.skill}</h3>
                </div>
                <Badge variant={action.priority === 'Critical' ? 'danger' : action.priority === 'High' ? 'warning' : 'default'}>
                  {action.priority}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surfaceHighlight/30 p-2 rounded border border-surfaceHighlight/50">
                  <div className="text-[10px] text-textMuted uppercase">ATS Gain</div>
                  <div className="text-emerald-400 font-mono font-bold">+{action.atsGain}%</div>
                </div>
                <div className="bg-surfaceHighlight/30 p-2 rounded border border-surfaceHighlight/50">
                  <div className="text-[10px] text-textMuted uppercase">Int. Gain</div>
                  <div className="text-purple-400 font-mono font-bold">+{action.intGain}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* SECTION 6: CAREER IMPROVEMENT SIMULATOR */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative z-10">
        <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2 mt-8">
          <Activity className="w-4 h-4" /> Career Improvement Simulator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prescriptiveData.simulators.map((sim, i) => (
            <Card key={i} className="border-purple-500/20 bg-purple-500/5">
              <h3 className="text-sm font-bold text-textMain mb-4">{sim.scenario}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textMuted">ATS Score</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{sim.currentAts}</span>
                    <ArrowRight className="w-3 h-3 text-textMuted" />
                    <span className="text-emerald-400 font-bold">{sim.newAts}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textMuted">Interview Prob</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{sim.currentInt}%</span>
                    <ArrowRight className="w-3 h-3 text-textMuted" />
                    <span className="text-purple-400 font-bold">{sim.newInt}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textMuted">Career Health</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{sim.currentHealth}</span>
                    <ArrowRight className="w-3 h-3 text-textMuted" />
                    <span className="text-primary font-bold">{sim.newHealth}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* SECTION 7: EXECUTIVE MARKET INSIGHTS */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative z-10 mt-8">
        <Card className="border-primary/30 bg-gradient-to-br from-surface to-primary/5">
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceHighlight pb-4">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Executive Market Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptiveData.dynamicInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surfaceHighlight/30 rounded-lg border border-surfaceHighlight/50">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: MARKET GAPS INTELLIGENCE */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="relative z-10 mt-8">
        <Card title="Market Gaps Intelligence" subtitle="Top missing skills across all applications with projected impact" className="border-rose-500/20">
          <div className="overflow-x-auto mt-4 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Missing Skill</th>
                  <th className="px-4 py-3">Missing In</th>
                  <th className="px-4 py-3">ATS Gain</th>
                  <th className="px-4 py-3">Interview Gain</th>
                  <th className="px-4 py-3">Salary Impact</th>
                  <th className="px-4 py-3">ROI</th>
                  <th className="px-4 py-3 rounded-tr-lg">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight/30">
                {prescriptiveData.actions.map((gap, i) => (
                  <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-textMain">{gap.skill}</td>
                    <td className="px-4 py-3 text-textMuted font-mono">{gap.frequency}%</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">+{gap.atsGain}%</td>
                    <td className="px-4 py-3 text-purple-400 font-mono">+{gap.intGain}%</td>
                    <td className="px-4 py-3 text-amber-400 font-mono">+£{gap.salaryGain.toLocaleString()}</td>
                    <td className="px-4 py-3 text-primary font-mono font-bold">{gap.roi}</td>
                    <td className="px-4 py-3">
                      <Badge variant={gap.priority === 'Critical' ? 'danger' : gap.priority === 'High' ? 'warning' : 'default'}>
                        {gap.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 5: WHAT SHOULD I LEARN NEXT? */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10 mt-8">
        <Card title="Highest ROI Skills" subtitle="What you should learn next for maximum career impact" className="border-emerald-500/20 bg-emerald-500/5">
          <div className="overflow-x-auto mt-4 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Skill</th>
                  <th className="px-4 py-3">Demand</th>
                  <th className="px-4 py-3">Learning Time</th>
                  <th className="px-4 py-3">ATS Gain</th>
                  <th className="px-4 py-3">Interview Gain</th>
                  <th className="px-4 py-3">Salary Gain</th>
                  <th className="px-4 py-3 rounded-tr-lg">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight/30">
                {prescriptiveData.actions.slice(0, 5).map((roi, i) => (
                  <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                    <td className="px-4 py-4 font-bold text-textMain">{roi.skill}</td>
                    <td className="px-4 py-4 text-textMuted font-mono">{roi.frequency}%</td>
                    <td className="px-4 py-4 text-textMuted">{roi.learningTime}</td>
                    <td className="px-4 py-4 text-emerald-400 font-mono">+{roi.atsGain}%</td>
                    <td className="px-4 py-4 text-purple-400 font-mono">+{roi.intGain}%</td>
                    <td className="px-4 py-4 text-amber-400 font-mono">+£{roi.salaryGain.toLocaleString()}</td>
                    <td className="px-4 py-4 text-primary font-mono font-bold">{roi.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3 & 4: SKILL VALUE RANKING & MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mt-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card title="Skill Value Ranking" subtitle="Rank all skills by real market value" className="h-[450px] border-blue-500/20">
            <div className="overflow-x-auto mt-4 custom-scrollbar h-[350px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Skill</th>
                    <th className="px-4 py-3">Demand</th>
                    <th className="px-4 py-3">Salary Impact</th>
                    <th className="px-4 py-3">Int. Impact</th>
                    <th className="px-4 py-3 rounded-tr-lg">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceHighlight/30">
                  {prescriptiveData.skillValues.slice(0, 15).map((skill, i) => (
                    <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-textMain">{skill.skill}</td>
                      <td className="px-4 py-3 text-textMuted font-mono">{skill.demand}%</td>
                      <td className="px-4 py-3 text-textMuted">{skill.salaryImpact}</td>
                      <td className="px-4 py-3 text-textMuted">{skill.interviewImpact}</td>
                      <td className="px-4 py-3 text-primary font-mono font-bold">{skill.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card title="Skill Value Matrix" subtitle="Demand vs ROI (Bubble size = Demand)" className="h-[450px] border-blue-500/20">
            <div className="h-full w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="demand" name="Demand" unit="%" stroke="#64748b" domain={[0, 100]} />
                  <YAxis type="number" dataKey="roi" name="ROI" stroke="#64748b" domain={[0, 100]} />
                  <ZAxis type="number" dataKey="demand" range={[50, 400]} name="Market Demand" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                  <Scatter name="Skills" data={prescriptiveData.skillValues.slice(0, 30)} fill="#3b82f6" fillOpacity={0.6}>
                    {prescriptiveData.skillValues.slice(0, 30).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.roi > 80 ? '#10b981' : entry.roi > 50 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* EXISTING VISUALIZATIONS (Overview, Treemap, Network, etc.) */}
      <div className="mt-12 pt-8 border-t border-surfaceHighlight/50 relative z-10">
        <h2 className="text-2xl font-bold text-textMain tracking-tight mb-6">Raw Market Data & Demographics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-primary/20 bg-primary/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary"><Database className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-textMuted font-mono uppercase tracking-widest">Jobs Analyzed</div><div className="text-xl font-bold text-textMain font-mono">{marketStats.totalJobs}</div></div>
          </Card>
          <Card className="p-4 border-purple-500/20 bg-purple-500/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500"><Briefcase className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-textMuted font-mono uppercase tracking-widest">Unique Companies</div><div className="text-xl font-bold text-textMain font-mono">{marketStats.uniqueCompanies}</div></div>
          </Card>
          <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500"><Zap className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-textMuted font-mono uppercase tracking-widest">Normalized Skills</div><div className="text-xl font-bold text-textMain font-mono">{marketStats.uniqueSkills}</div></div>
          </Card>
          <Card className="p-4 border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500"><DollarSign className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-textMuted font-mono uppercase tracking-widest">Avg Salary</div><div className="text-xl font-bold text-textMain font-mono">£{marketStats.avgSalary.toLocaleString()}</div></div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Top 25 Most Requested Skills" subtitle="Normalized across all job descriptions" className="h-[450px] border-emerald-500/20">
            <div className="h-full w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketStats.topSkills.slice(0, 15)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="skill" type="category" stroke="#94a3b8" fontSize={10} width={120} />
                  <Tooltip cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} />
                  <Bar dataKey="demand" name="Demand %" radius={[0, 4, 4, 0]} barSize={15}>
                    {marketStats.topSkills.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Market Demand Treemap" subtitle="Categorized skill distribution" className="h-[450px] border-blue-500/20">
            <div className="h-full w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  stroke="#0f172a"
                  fill="#3b82f6"
                  content={<CustomTreemapContent colors={COLORS} />}
                >
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Skill Co-occurrence Graph" subtitle="Network graph of technologies frequently requested together" className="h-[500px] border-primary/20 p-0 overflow-hidden flex flex-col mb-6">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-textMain tracking-tight">Skill Co-occurrence Graph</h3>
            <p className="text-sm text-textMuted mt-1">Network graph of technologies frequently requested together</p>
          </div>
          <div className="flex-1 w-full relative mt-4">
            {nodes.length > 0 && (
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                fitView
                className="bg-background/50"
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1e293b" gap={16} />
                <Controls className="bg-surface border-surfaceHighlight fill-textMain" />
              </ReactFlow>
            )}
          </div>
        </Card>

        <Card title="Job Title Intelligence" subtitle="Ranking of roles based on your pipeline" className="border-surfaceHighlight mb-6">
          <div className="overflow-x-auto mt-4 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-textMuted uppercase tracking-widest bg-surfaceHighlight/30">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Role Title</th>
                  <th className="px-4 py-3">Market Demand</th>
                  <th className="px-4 py-3">Avg Match Score</th>
                  <th className="px-4 py-3">Avg Salary</th>
                  <th className="px-4 py-3 rounded-tr-lg">Avg Competition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight/30">
                {marketStats.topTitles.slice(0, 10).map((title, i) => (
                  <tr key={i} className="hover:bg-surfaceHighlight/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-textMain">{title.title}</td>
                    <td className="px-4 py-3 text-primary font-mono">{title.demand}%</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{title.avgMatch}%</td>
                    <td className="px-4 py-3 text-amber-400 font-mono">£{title.avgSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-rose-400 font-mono">{title.avgApplicants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Location Intelligence" className="h-[350px] border-surfaceHighlight flex flex-col">
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marketStats.locations.slice(0, 5)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {marketStats.locations.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {marketStats.locations.slice(0, 3).map((l, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 truncate"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[i]}}></div><span className="truncate">{l.name}</span></span>
                  <span className="font-mono text-textMuted">{l.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Experience Demand" className="h-[350px] border-surfaceHighlight flex flex-col">
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marketStats.experience.slice(0, 5)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {marketStats.experience.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {marketStats.experience.slice(0, 3).map((e, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 truncate"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[(i+2)%COLORS.length]}}></div><span className="truncate">{e.name}</span></span>
                  <span className="font-mono text-textMuted">{e.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Education Demand" className="h-[350px] border-surfaceHighlight flex flex-col">
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marketStats.education.slice(0, 5)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {marketStats.education.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {marketStats.education.slice(0, 3).map((e, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 truncate"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[(i+4)%COLORS.length]}}></div><span className="truncate">{e.name}</span></span>
                  <span className="font-mono text-textMuted">{e.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

// Custom Treemap Content
const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, colors, name, demand } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : 'none',
          stroke: '#0f172a',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 2 && width > 60 && height > 40 ? (
        <>
          <text x={x + width / 2} y={y + height / 2 - 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10} fontFamily="monospace">
            {demand}%
          </text>
        </>
      ) : depth === 1 && width > 50 && height > 30 ? (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold" opacity={0.3}>
          {name}
        </text>
      ) : null}
    </g>
  );
};
