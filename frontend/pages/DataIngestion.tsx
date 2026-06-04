import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UploadCloud, CheckCircle, AlertCircle, FileUp, BrainCircuit, RefreshCw, Database, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { JobApplication, ResumeData } from '../types';
import { generateId } from '../lib/utils';
import { generateCareerInsights, analyzeJobMatches, parseResumeSemantically, generateResumeDNA } from '../lib/aiService';
import { extractSkillsFromText, normalizeSkill } from '../services/skillNormalization';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const DataIngestion: React.FC = () => {
  const { state, dispatch } = useData();
  const navigate = useNavigate();
  const [csvStatus, setCsvStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [resumeText, setResumeText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [isReplacingResume, setIsReplacingResume] = useState(false);
  const [schemaValidation, setSchemaValidation] = useState<{valid: boolean, missing: string[]}>({valid: false, missing: []});

  useEffect(() => {
    if (isReplacingResume && state.resume) {
      setResumeText(state.resume.rawText);
    }
  }, [isReplacingResume, state.resume]);

  const validateSchema = (headers: string[]) => {
    // Make validation more lenient based on the prompt's CSV schema
    const required = ['Title', 'Company'];
    const missing = required.filter(req => !headers.includes(req));
    setSchemaValidation({ valid: missing.length === 0, missing });
    return missing.length === 0;
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvStatus('parsing');
    setErrorMsg('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.meta.fields) throw new Error("No headers found in CSV.");
          
          if (!validateSchema(results.meta.fields)) {
            setCsvStatus('error');
            setErrorMsg(`Missing required columns: ${schemaValidation.missing.join(', ')}`);
            return;
          }

          const parsedJobs: JobApplication[] = results.data.map((row: any) => {
            const isReposted = row['Re-posted'] === 'TRUE' || row['Re-posted'] === 'Yes' || row['Re-posted'] === 'true';
            const applicantCount = parseInt(row['Applicant Count']) || 0;
            const isGhost = row['Ghost Job Warning'] === 'TRUE' || row['Ghost Job Warning'] === 'Yes' || (isReposted && applicantCount > 100);
            const salaryStr = row['Extracted Salary'] || '';
            const extractedSalary = parseInt(salaryStr.replace(/[^0-9]/g, '')) || 0;

            // Extract skills from About Job if Skills Required is empty
            let skillsReq = row['Skills required'] ? row['Skills required'].split(',').map((s: string) => s.trim()) : [];
            if (skillsReq.length === 0 && row['About Job']) {
               skillsReq = extractSkillsFromText(row['About Job']);
            }

            return {
              id: generateId(),
              jobId: row['Job ID'] || '',
              title: row['Title'] || 'Unknown Title',
              company: row['Company'] || 'Unknown Company',
              location: row['Work Location'] || '',
              workStyle: row['Work Style'] || '',
              aboutJob: row['About Job'] || '', 
              experienceRequired: row['Experience required'] || '',
              skillsRequired: skillsReq,
              hrName: row['HR Name'] || '',
              hrLink: row['HR Link'] || '',
              dateApplied: row['Date Applied'] || new Date().toISOString(),
              missingSkills: [], // Will be calculated internally
              matchScore: 0, // Will be calculated internally
              employmentType: row['Employment Type'] || '',
              applicantCount: applicantCount,
              reposted: isReposted,
              visa: row['Visa/Sponsorship'] || '',
              jobLevel: row['Job Level'] || '',
              extractedSalary: extractedSalary,
              ghostJobWarning: isGhost,
              status: 'Applied',
              aiAnalyzed: false
            };
          });

          dispatch({ type: 'SET_JOBS', payload: parsedJobs });
          setCsvStatus('success');
        } catch (err) {
          console.error(err);
          setCsvStatus('error');
          setErrorMsg('Failed to map CSV data. Check schema.');
        }
      },
      error: (error) => {
        console.error(error);
        setCsvStatus('error');
        setErrorMsg(error.message);
      }
    });
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfStatus('parsing');
    setErrorMsg('');
    
    try {
      const pdfjsLib = (window as any).pdfjsLib || (globalThis as any).pdfjsLib;
      if (!pdfjsLib) throw new Error("PDF library failed to load.");

      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: typedarray });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText);
      setPdfStatus('success');
    } catch (error: any) {
      console.error("Error parsing PDF:", error);
      setPdfStatus('error');
      setErrorMsg(error.message || 'Failed to parse PDF.');
    }
  };

  const handleAnalyze = async () => {
    if (!state.jobs.length) return;
    
    dispatch({ type: 'SET_ANALYZING', payload: true });
    let finalResumeData = state.resume;

    try {
      if (isReplacingResume || !state.resume) {
        if (!resumeText.trim()) {
          alert("Please provide resume text or upload a PDF.");
          dispatch({ type: 'SET_ANALYZING', payload: false });
          return;
        }
        setAnalysisProgress('Running Deep-Context Semantic Resume Parsing...');
        finalResumeData = await parseResumeSemantically(resumeText);
        dispatch({ type: 'SET_RESUME', payload: finalResumeData });
        setIsReplacingResume(false);
      }

      if (!finalResumeData) throw new Error("Resume data is missing.");

      setAnalysisProgress('Running Internal ATS Match Engine on applications...');
      
      // INTERNAL ATS CALCULATION (Phase 3.6)
      const resumeSkillsLower = finalResumeData.extractedSkills.map(s => s.toLowerCase());
      
      let updatedJobs = state.jobs.map(job => {
        // Calculate Missing Skills
        const missing: string[] = [];
        const matched: string[] = [];
        
        job.skillsRequired.forEach(reqSkill => {
           const normReq = normalizeSkill(reqSkill);
           if (normReq) {
               if (resumeSkillsLower.includes(normReq.toLowerCase())) {
                   matched.push(normReq);
               } else {
                   missing.push(normReq);
               }
           }
        });

        // Calculate ATS Match %
        const totalSkills = matched.length + missing.length;
        let atsMatch = totalSkills > 0 ? Math.round((matched.length / totalSkills) * 100) : 50; // Fallback if no skills found
        
        // Interview Probability Modifiers
        let intProb = atsMatch;
        const visaUpper = job.visa.toUpperCase();
        const levelUpper = job.jobLevel.toUpperCase();
        
        if (visaUpper.includes('NO SPONSORSHIP') || visaUpper === 'NO' || visaUpper.includes('NOT SPONSORED')) intProb -= 50;
        if ((levelUpper.includes('SENIOR') || levelUpper.includes('SR') || levelUpper.includes('LEAD')) && finalResumeData!.extractedExperience <= 2) intProb -= 20;
        if (job.ghostJobWarning) intProb -= 15;
        if (job.applicantCount > 100) intProb -= 10;
        
        intProb = Math.max(0, Math.min(100, intProb));

        // Offer Probability
        let offerProb = Math.round(intProb * 0.3); // Base 30% conversion from interview
        if (job.applicantCount > 200) offerProb -= 5;
        offerProb = Math.max(0, Math.min(100, offerProb));

        // Opportunity Score Formula
        const salaryScore = job.extractedSalary ? Math.min(100, (job.extractedSalary / 150000) * 100) : 50;
        const compScore = Math.max(0, 100 - (job.applicantCount / 5)); // 500 applicants = 0 score
        const sponsorScore = visaUpper.includes('NO') ? 0 : 100;
        
        let oppScore = (atsMatch * 0.25) + (intProb * 0.20) + (salaryScore * 0.15) + (atsMatch * 0.15) + (compScore * 0.10) + (50 * 0.10) + (sponsorScore * 0.05);
        oppScore = Math.max(0, Math.min(100, Math.round(oppScore)));

        // Classification
        let classification: JobApplication['opportunityClassification'] = 'Average';
        if (oppScore >= 85) classification = 'Elite Opportunity';
        else if (oppScore >= 75) classification = 'High Value';
        else if (oppScore >= 60) classification = 'Good Fit';
        else if (oppScore >= 40) classification = 'Average';
        else if (oppScore >= 25) classification = 'Low Yield';
        else classification = 'Avoid';

        // Recommended Action
        let action: JobApplication['recommendedAction'] = 'Monitor';
        if (oppScore >= 85) action = 'Apply Immediately';
        else if (oppScore >= 75) action = 'Contact Recruiter';
        else if (oppScore >= 60) action = 'Follow Up';
        else if (oppScore >= 40) action = 'Monitor';
        else if (oppScore >= 25) action = 'Ignore';
        else action = 'Archive';

        return { 
          ...job, 
          matchScore: atsMatch, 
          missingSkills: missing,
          matchedSkills: matched,
          interviewProbability: Math.round(intProb),
          offerProbability: offerProb,
          opportunityScore: oppScore,
          opportunityClassification: classification,
          recommendedAction: action,
          aiAnalyzed: false // Will be set to true if LLM analyzes it
        };
      });

      setAnalysisProgress('Running Deep LLM Analysis on Top Opportunities...');
      // Only run deep LLM analysis on top jobs to save tokens/time
      const topJobsToAnalyze = [...updatedJobs].sort((a,b) => (b.opportunityScore||0) - (a.opportunityScore||0)).slice(0, 5);
      const matchResults = await analyzeJobMatches(topJobsToAnalyze, finalResumeData);
      
      updatedJobs = updatedJobs.map(job => {
        const match = matchResults.find(m => m.id === job.id);
        if (match) {
           return {
               ...job,
               atsFeedback: match.feedback,
               whyThisJob: match.whyThisJob,
               whyNotThisJob: match.whyNotThisJob,
               executiveSummary: match.executiveSummary,
               hardRequirementsCoverage: match.hardRequirementsCoverage,
               preferredRequirementsCoverage: match.preferredRequirementsCoverage,
               aiAnalyzed: true
           }
        }
        return job;
      });

      dispatch({ type: 'SET_JOBS', payload: updatedJobs });

      setAnalysisProgress('Sequencing Resume DNA...');
      const resumeDNA = await generateResumeDNA(finalResumeData.rawText, updatedJobs);
      dispatch({ type: 'SET_RESUME_DNA', payload: resumeDNA });

      setAnalysisProgress('Generating executive career insights & ROI...');
      const insights = await generateCareerInsights(updatedJobs, finalResumeData);
      dispatch({ type: 'SET_INSIGHTS', payload: insights });
      
      setAnalysisProgress('');
      navigate('/'); // Redirect to Executive Briefing on success
    } catch (error: any) {
      console.error(error);
      alert("Failed to generate insights. Check API key and console.");
      setAnalysisProgress('');
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-textMain tracking-tighter neon-text">Data Ingestion Pipeline</h1>
        <p className="text-textMuted mt-2 text-lg">Upload application history and resume to initialize the intelligence engine.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card title="Application History (CSV)" subtitle="Export from LinkedIn Auto Apply Bot" className="h-full border-primary/20">
            <div className="mt-4 h-[calc(100%-4rem)] flex flex-col">
              <label 
                htmlFor="csv-upload"
                className={`flex-1 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                  ${csvStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-surfaceHighlight hover:border-primary/50 hover:bg-surfaceHighlight/30 bg-surface/50'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {csvStatus === 'success' ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle className="w-12 h-12 text-emerald-500 mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" /></motion.div>
                  ) : csvStatus === 'error' ? (
                    <AlertCircle className="w-12 h-12 text-danger mb-3" />
                  ) : (
                    <Database className="w-12 h-12 text-primary/50 mb-3" />
                  )}
                  <p className="mb-2 text-sm text-textMuted">
                    <span className="font-semibold text-textMain">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-textMuted font-mono">CSV schema required</p>
                </div>
                <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleCsvUpload} />
              </label>
              
              {csvStatus === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex justify-between items-center">
                  <span className="font-mono">Loaded {state.jobs.length} records.</span>
                  <Button variant="ghost" size="sm" onClick={() => { setCsvStatus('idle'); dispatch({ type: 'RESET_DATA' }); }}>Reset</Button>
                </motion.div>
              )}
              {csvStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card title="Resume Context" subtitle="Persistent Memory Storage" className="h-full border-purple-500/20">
            <div className="mt-4 h-[calc(100%-4rem)] flex flex-col">
              {state.resume && !isReplacingResume ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-emerald-500/30 bg-emerald-500/5 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)] pointer-events-none"></div>
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <h3 className="text-xl font-bold text-textMain tracking-tight">Active Resume Loaded</h3>
                  <p className="text-sm text-textMuted mb-6 text-center max-w-[80%]">
                    Your resume is securely stored in local memory and ready for ATS analysis.
                  </p>
                  <Button variant="outline" onClick={() => setIsReplacingResume(true)} className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400">
                    <RefreshCw className="w-4 h-4 mr-2" /> Update / Replace
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-full">
                  <label 
                    htmlFor="pdf-upload"
                    className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                      ${pdfStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-surfaceHighlight hover:border-purple-500/50 hover:bg-surfaceHighlight/30 bg-surface/50'}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      {pdfStatus === 'parsing' ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                      ) : pdfStatus === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                      ) : pdfStatus === 'error' ? (
                        <AlertCircle className="w-8 h-8 text-danger mb-2" />
                      ) : (
                        <FileUp className="w-8 h-8 text-purple-500/50 mb-2" />
                      )}
                      <p className="text-sm text-textMuted">
                        <span className="font-semibold text-textMain">Upload PDF Resume</span>
                      </p>
                    </div>
                    <input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
                  </label>
                  
                  <div className="flex-1 min-h-[120px]">
                    <textarea
                      className="w-full h-full bg-surface/50 border border-surfaceHighlight rounded-xl p-4 text-sm text-textMain focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono transition-all"
                      placeholder="Extracted text will appear here. You can also paste raw resume text directly..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </div>
                  
                  {isReplacingResume && state.resume && (
                    <Button variant="ghost" size="sm" onClick={() => setIsReplacingResume(false)} className="self-end text-textMuted">
                      Cancel Update
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* SCHEMA VALIDATION REPORT */}
      {schemaValidation.missing.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-rose-500">Schema Validation Failed</h3>
            </div>
            <p className="text-sm text-slate-300 mb-2">The uploaded CSV is missing required columns for deep intelligence analysis:</p>
            <div className="flex flex-wrap gap-2">
              {schemaValidation.missing.map((col, i) => (
                <Badge key={i} variant="danger">{col}</Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="flex flex-col items-end pt-6 border-t border-surfaceHighlight gap-3"
      >
        {state.isAnalyzing && (
          <div className="text-sm text-primary animate-pulse font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
            {analysisProgress}
          </div>
        )}
        <Button 
          size="lg" 
          onClick={handleAnalyze} 
          disabled={!state.jobs.length || state.isAnalyzing || (!state.resume && !resumeText.trim()) || schemaValidation.missing.length > 0}
          isLoading={state.isAnalyzing}
          className="w-full md:w-auto shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow text-lg px-8 h-14"
        >
          <BrainCircuit className="w-6 h-6 mr-3" />
          Initialize Intelligence Engine
        </Button>
      </motion.div>
    </div>
  );
};
