import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { generateOutreachMessage } from '../lib/aiService';
import { JobApplication } from '../types';
import { Send, Copy, Check, UserPlus, MessageSquareText, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Outreach: React.FC = () => {
  const { state } = useData();
  const { jobs, resume } = state;
  
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // CRM Logic Engine
  const { actionRequiredJobs, monitoringJobs } = useMemo(() => {
    const today = new Date();
    const jobsWithHR = jobs.filter(j => j.hrName);
    
    const actionRequired: JobApplication[] = [];
    const monitoring: JobApplication[] = [];

    jobsWithHR.forEach(job => {
      const appliedDate = new Date(job.dateApplied);
      // Fallback to today if date is invalid
      if (isNaN(appliedDate.getTime())) {
        monitoring.push(job);
        return;
      }
      
      const diffTime = Math.abs(today.getTime() - appliedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If older than 5 days and has HR Link/Name -> Action Required
      if (diffDays >= 5) {
        actionRequired.push(job);
      } else {
        monitoring.push(job);
      }
    });

    // Sort by match score descending
    return {
      actionRequiredJobs: actionRequired.sort((a, b) => b.matchScore - a.matchScore),
      monitoringJobs: monitoring.sort((a, b) => b.matchScore - a.matchScore)
    };
  }, [jobs]);

  const handleGenerate = async (type: 'connection' | 'followup') => {
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

  if (!jobs.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Send className="w-16 h-16 text-surfaceHighlight mb-4" />
        <h2 className="text-2xl font-bold text-textMain mb-2">CRM Offline</h2>
        <p className="text-textMuted max-w-md">
          Upload your application history to activate the Recruiter Action CRM.
        </p>
      </div>
    );
  }

  const JobCard = ({ job, isActionRequired }: { job: JobApplication, isActionRequired: boolean }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => {
        setSelectedJob(job);
        setGeneratedMessage('');
      }}
      className={`p-4 rounded-xl cursor-pointer transition-all border ${
        selectedJob?.id === job.id 
          ? 'bg-primary/10 border-primary/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-surface/80 border-surfaceHighlight hover:border-primary/30 hover:bg-surfaceHighlight/50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="pr-4">
          <div className="font-bold text-textMain truncate">{job.title}</div>
          <div className="text-sm text-textMuted truncate">{job.company}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-lg font-mono font-bold ${isActionRequired ? 'text-amber-400' : 'text-primary'}`}>
            {job.matchScore}%
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-surfaceHighlight/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-surfaceHighlight flex items-center justify-center text-xs font-bold text-textMain">
            {job.hrName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-textMuted truncate max-w-[100px]">{job.hrName}</span>
        </div>
        {isActionRequired && (
          <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> > 5 Days
          </Badge>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 h-full flex flex-col relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0"></div>
      
      <header className="mb-6 relative z-10">
        <h1 className="text-3xl font-bold text-textMain tracking-tight neon-text">Recruiter Action CRM</h1>
        <p className="text-textMuted mt-1">Automated follow-up funnel and generative AI outreach drafter.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Kanban Columns */}
        <div className="flex flex-col sm:flex-row gap-4 lg:w-1/2 h-full">
          
          {/* Column 1: Monitoring */}
          <Card className="flex-1 flex flex-col h-full overflow-hidden p-0 border-surfaceHighlight/50 bg-surface/30">
            <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/20 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-textMain flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Monitoring
                </h3>
                <p className="text-[10px] text-textMuted uppercase tracking-wider mt-1">Applied &lt; 5 Days Ago</p>
              </div>
              <Badge variant="outline">{monitoringJobs.length}</Badge>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {monitoringJobs.map(job => (
                  <JobCard key={job.id} job={job} isActionRequired={false} />
                ))}
              </AnimatePresence>
              {monitoringJobs.length === 0 && (
                <div className="p-4 text-center text-sm text-textMuted italic">No recent applications with HR contacts.</div>
              )}
            </div>
          </Card>

          {/* Column 2: Action Required */}
          <Card className="flex-1 flex flex-col h-full overflow-hidden p-0 border-amber-500/20 bg-amber-500/5">
            <div className="p-4 border-b border-amber-500/20 bg-amber-500/10 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Action Required
                </h3>
                <p className="text-[10px] text-amber-400/70 uppercase tracking-wider mt-1">Applied &ge; 5 Days Ago</p>
              </div>
              <Badge variant="warning">{actionRequiredJobs.length}</Badge>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {actionRequiredJobs.map(job => (
                  <JobCard key={job.id} job={job} isActionRequired={true} />
                ))}
              </AnimatePresence>
              {actionRequiredJobs.length === 0 && (
                <div className="p-4 text-center text-sm text-textMuted italic">Inbox zero. Great job!</div>
              )}
            </div>
          </Card>

        </div>

        {/* AI Drafter Panel */}
        <Card className="lg:w-1/2 flex flex-col h-full border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          {selectedJob ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full"
            >
              <div className="mb-6 pb-6 border-b border-surfaceHighlight">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-textMain tracking-tight">{selectedJob.company}</h2>
                    <p className="text-lg text-textMuted">{selectedJob.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-textMuted uppercase tracking-wider mb-1">ATS Match</div>
                    <div className="text-3xl font-mono font-bold text-primary">{selectedJob.matchScore}%</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-surfaceHighlight/50 px-3 py-1.5 rounded-lg border border-surfaceHighlight">
                    <span className="text-xs text-textMuted">Target:</span>
                    <span className="text-sm font-semibold text-textMain">{selectedJob.hrName}</span>
                    {selectedJob.hrLink && (
                      <a href={selectedJob.hrLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primaryHover ml-1">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-surfaceHighlight/50 px-3 py-1.5 rounded-lg border border-surfaceHighlight">
                    <span className="text-xs text-textMuted">Applied:</span>
                    <span className="text-sm font-mono text-textMain">{new Date(selectedJob.dateApplied).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <Button 
                  onClick={() => handleGenerate('connection')} 
                  isLoading={isGenerating}
                  className="flex-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Draft Connection Request
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleGenerate('followup')} 
                  isLoading={isGenerating}
                  className="flex-1 border border-surfaceHighlight"
                >
                  <MessageSquareText className="w-4 h-4 mr-2" /> Draft Follow-up
                </Button>
              </div>

              <div className="flex-1 flex flex-col min-h-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-primary">AI Generated Output</span>
                  {generatedMessage && (
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-textMuted hover:text-textMain">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                    </Button>
                  )}
                </div>
                <div className="flex-1 bg-background/50 border border-surfaceHighlight rounded-xl p-5 relative group overflow-y-auto custom-scrollbar">
                  {generatedMessage ? (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-textMain whitespace-pre-wrap font-mono text-sm leading-relaxed"
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
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-textMuted flex-col gap-4 opacity-50">
              <Send className="w-16 h-16" />
              <p className="text-lg">Select a target opportunity from the CRM to begin.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
