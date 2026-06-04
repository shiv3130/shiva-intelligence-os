export interface JobApplication {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  workStyle: string;
  aboutJob: string;
  experienceRequired: string;
  skillsRequired: string[];
  hrName: string;
  hrLink?: string;
  dateApplied: string;
  missingSkills: string[];
  matchScore: number; // Now calculated internally
  employmentType: string;
  applicantCount: number;
  ghostJobWarning: boolean;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';
  
  // Market Intelligence Fields
  reposted: boolean;
  visa: string;
  jobLevel: string;
  extractedSalary?: number;
  educationRequired?: string;
  
  // AI Enhanced Fields
  aiAnalyzed?: boolean;
  atsFeedback?: string;
  interviewProbability?: number; // Now calculated internally
  opportunityScore?: number; // Now calculated internally
  
  // Phase 3 Opportunity Intelligence Fields
  offerProbability?: number;
  opportunityClassification?: 'Elite Opportunity' | 'High Value' | 'Good Fit' | 'Average' | 'Low Yield' | 'Avoid';
  recommendedAction?: 'Apply Immediately' | 'Contact Recruiter' | 'Follow Up' | 'Monitor' | 'Ignore' | 'Archive';
  whyThisJob?: string[];
  whyNotThisJob?: string[];
  
  // Phase 3.6 Deep ATS Fields
  matchedSkills?: string[];
  hardRequirementsCoverage?: number;
  preferredRequirementsCoverage?: number;
  executiveSummary?: string;
  
  // Phase 3.7 JD Intelligence Fields
  jdQualityScore?: 'High' | 'Medium' | 'Low';
  atsConfidenceScore?: number;
  explicitRequirements?: string[];
  inferredRequirements?: { skill: string; confidence: number }[];
  potentialMissingSkills?: string[];
}

export interface SemanticSkill {
  name: string;
  years: number;
  domain: string;
}

export interface ResumeData {
  rawText: string;
  extractedSkills: string[];
  semanticSkills?: SemanticSkill[];
  extractedExperience: number;
  domains?: string[];
}

export interface MarketFitRole {
  role: string;
  fitPercentage: number;
  marketDemand: number;
  opportunityScore: number;
}

export interface GapAnalysisSkill {
  skill: string;
  frequency: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  potentialAtsGain: number;
  potentialInterviewGain: number;
}

export interface SkillImportance {
  skill: string;
  demand: number;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  salaryImpact: 'High' | 'Medium' | 'Low';
  interviewImpact: 'High' | 'Medium' | 'Low';
  marketTrend: 'Growing' | 'Stable' | 'Declining';
}

export interface ResumeVsMarketCategory {
  category: string;
  resumeCoverage: number;
  marketDemand: number;
  gap: number;
  status: string;
}

export interface ScoreExplanation {
  scoreName: string;
  score: number;
  positiveFactors: string[];
  negativeFactors: string[];
  recommendations: string[];
}

export interface ResumeDNA {
  strengthScore: number;
  atsReadinessScore: number;
  marketReadinessScore: number;
  domains: { name: string; matchPercentage: number }[];
  skillCategories: { category: string; skills: string[]; coverage: number }[];
  weaknesses: { title: string; explanation: string }[];
  strengths: { title: string; evidence: string }[];
  summary: {
    strongestRoles: string[];
    weakestAreas: string[];
    highestImpactImprovement: {
      skill: string;
      expectedAtsGain: number;
      expectedInterviewGain: number;
    };
  };
  
  // Phase 1.5 Advanced Intelligence Layers
  marketFit: {
    bestMatches: MarketFitRole[];
    weakestMatches: MarketFitRole[];
  };
  gapAnalysis: GapAnalysisSkill[];
  skillImportance: SkillImportance[];
  resumeVsMarket: ResumeVsMarketCategory[];
  aiInsights: string[];
  scoreExplanations: ScoreExplanation[];
}

export interface SkillROI {
  skill: string;
  jobCount: number;
  salaryBoost: number;
  atsGain: number;
  intGain: number;
  difficulty: 'Low' | 'Medium' | 'High';
  learningTime: string;
  roiScore: number;
  priority: 'Critical' | 'High Impact' | 'Quick Win' | 'Long-Term';
}

export interface DailyMission {
  id: string;
  title: string;
  expectedGain: string;
  type: 'Recruiter' | 'Skill' | 'Application' | 'Portfolio';
}

export interface CareerForecast {
  interviews30: number;
  interviews60: number;
  interviews90: number;
  offers30: number;
  offers60: number;
  offers90: number;
  trajectory3m: string;
  trajectory6m: string;
  trajectory12m: string;
}

export interface CareerRisk {
  category: string;
  level: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface AIInsights {
  executiveBriefing: string;
  careerHealthScore: number;
  interviewProbability: number;
  offerProbability: number;
  highestOpportunityJob: string;
  highestPriorityRecruiter: string;
  highestOpportunityCompany: string;
  recommendedAction: string;
  expectedAtsImprovement: number;
  expectedInterviewIncrease: number;
  topMissingSkills: { skill: string; impact: number }[];
  marketTrends: string;
  failureAnalysis: string;
  skillRoi?: SkillROI[];
  
  // Phase 2 Market Intelligence Fields
  marketInsights?: string[];
  marketOpportunityReport?: string;
  
  // Phase 3.5 Career Commander Fields
  dailyMissions?: DailyMission[];
  careerForecast?: CareerForecast;
  careerRisks?: CareerRisk[];
  executiveInsights?: string[];
  
  // Phase 5 Career Copilot Fields
  learningRoadmap?: {
    plan30: string[];
    plan60: string[];
    plan90: string[];
  };
  applicationStrategy?: {
    pursue: string[];
    avoid: string[];
    expand: string[];
  };
  bottlenecks?: {
    interview: string;
    skill: string;
    ats: string;
    recruiter: string;
  };
}

export interface ContactStrategyStep {
  step: number;
  action: string;
  timing: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

export interface RecruiterProfile {
  id: string;
  name: string;
  company: string;
  role: string;
  link?: string;
  priorityScore: number;
  responseProbability: number;
  responseLevel: 'High' | 'Medium' | 'Low';
  relationshipScore: number;
  contactStatus: 'Not Contacted' | 'Contacted' | 'Responded' | 'Interviewing';
  bestContactDate: string;
  suggestedAction: string;
  associatedJobs: JobApplication[];
  
  // Phase 4.5 Fields
  isIdentified: boolean;
  recommendedContactRole?: string;
  whyContact: string;
  expectedImpact: string;
  networkingRoiScore: number;
  contactStrategy: ContactStrategyStep[];
}

export interface AppState {
  jobs: JobApplication[];
  resume: ResumeData | null;
  resumeDNA: ResumeDNA | null;
  insights: AIInsights | null;
  isAnalyzing: boolean;
  lastUpdated: string | null;
}

export type Action =
  | { type: 'SET_JOBS'; payload: JobApplication[] }
  | { type: 'SET_RESUME'; payload: ResumeData }
  | { type: 'SET_RESUME_DNA'; payload: ResumeDNA }
  | { type: 'SET_INSIGHTS'; payload: AIInsights }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'RESET_DATA' };
