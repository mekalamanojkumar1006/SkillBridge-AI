export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: any;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  duration: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ParsedResumeData {
  name: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  content: string;
  parsedData?: ParsedResumeData;
  createdAt: any;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  userId: string;
  qualityScore: number;
  missingSkills: string[];
  improvements: string[];
  formatting: string[];
  createdAt: any;
}

export interface ATSScore {
  id: string;
  resumeId: string;
  userId: string;
  score: number;
  keywordsMatched: string[];
  missingKeywords: string[];
  suggestions: string[];
  createdAt: any;
}

export interface JobMatchDetail {
  role: string;
  company: string;
  matchPercentage: number;
  missingRequirements: string[];
  strengths: string[];
  description: string;
}

export interface JobMatch {
  id: string;
  resumeId: string;
  userId: string;
  matches: JobMatchDetail[];
  createdAt: any;
}

export interface RoadmapStep {
  title: string;
  duration: string;
  description: string;
  resources: string[];
}

export interface SkillGap {
  id: string;
  resumeId: string;
  userId: string;
  currentSkills: string[];
  missingSkills: string[];
  learningRoadmap: RoadmapStep[];
  createdAt: any;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  expectedPoints: string[];
}

export interface UserAnswerFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number;
  feedback: string;
  expectedPointsMatched: string[];
  suggestions: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: UserAnswerFeedback[];
  status: 'not_started' | 'active' | 'completed';
  score?: number;
  overallFeedback?: string;
  createdAt: any;
}

export interface HiringProbability {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  probabilityScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  createdAt: any;
}

export interface MilestonePracticalProject {
  title: string;
  description: string;
}

export interface CareerMilestone {
  milestoneTitle: string;
  duration: string;
  learningObjectives: string[];
  recommendedResources: string[];
  practicalProject: MilestonePracticalProject;
  verificationChecklist: string[];
}

export interface IndustryOutlook {
  growth: string;
  salaryRange: string;
  popularity: string;
}

export interface CareerPathRoadmapData {
  targetPath: string;
  pitch: string;
  industryOutlook: IndustryOutlook;
  skillsToAcquire: {
    core: string[];
    advanced: string[];
    emerging: string[];
  };
  skillsAlreadyPossessed: string[];
  milestones: CareerMilestone[];
}

export interface CareerPathRoadmap {
  id: string;
  userId: string;
  resumeId: string;
  roadmapData: CareerPathRoadmapData;
  createdAt: any;
}

