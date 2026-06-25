import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ApiService } from "../services/api";
import {
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Search,
  Map,
  MessageSquare,
  Sparkles,
  Award,
  Database,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Send,
  HelpCircle,
  Briefcase,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Settings
} from "lucide-react";
import ProfileSettingsPage from "./ProfileSettingsPage";

interface CircularScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  duration?: number;
  showMaxScore?: boolean;
  suffix?: string;
}

export function CircularScoreGauge({
  score,
  maxScore = 100,
  size = 112,
  strokeWidth = 8,
  colorClass = "stroke-blue-500",
  duration = 1000,
  showMaxScore = true,
  suffix = ""
}: CircularScoreGaugeProps) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = score;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      setCurrentScore(Math.floor(easedProgress * (endValue - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentScore(endValue);
      }
    }

    requestAnimationFrame(animate);
  }, [score, duration]);

  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - currentScore / maxScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="stroke-white/5 fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          className={`${colorClass} fill-none`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-slate-100 font-sans">
          {currentScore}{suffix}
        </span>
        {showMaxScore && (
          <span className="text-[9px] text-slate-500 font-mono uppercase">
            / {maxScore}
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface CountUpTextProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUpText({ to, duration = 1000, prefix = "", suffix = "" }: CountUpTextProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = to;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      setValue(Math.floor(easedProgress * (endValue - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(endValue);
      }
    }

    requestAnimationFrame(animate);
  }, [to, duration]);

  return <>{prefix}{value}{suffix}</>;
}

interface DashboardPageProps {
  user: any;
  resume: any;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: any) => void;
  onResetResume: () => void;
}

export default function DashboardPage({ 
  user, 
  resume: initialResume, 
  onNavigate, 
  onLogout,
  onUpdateUser,
  onResetResume
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ats" | "jobs" | "roadmap" | "career-roadmap" | "interview" | "probability" | "settings">("overview");
  const [resume, setResume] = useState<any>(initialResume || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  // Resume Quality state
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null);
  const [analyzingQuality, setAnalyzingQuality] = useState(false);

  // ATS scanner state
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState<any>(null);
  const [scanningAts, setScanningAts] = useState(false);

  // Job matching state
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [matchingJobs, setMatchingJobs] = useState(false);

  // Skill gap analysis state
  const [targetCareerRole, setTargetCareerRole] = useState("");
  const [skillGapResult, setSkillGapResult] = useState<any>(null);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);

  // Interview state
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [interviewAnswers, setInterviewAnswers] = useState<any[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);

  // Hiring probability state
  const [probJobTitle, setProbJobTitle] = useState("");
  const [probCompany, setProbCompany] = useState("");
  const [hiringProbability, setHiringProbability] = useState<any>(null);
  const [predictingProb, setPredictingProb] = useState(false);

  // Recommended Opportunities (Cosine Similarity skill matching)
  const [recommendedOpps, setRecommendedOpps] = useState<any[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [calculatingOpps, setCalculatingOpps] = useState(false);
  const [allRawOpps, setAllRawOpps] = useState<any[]>([]);
  const [loadingRawOpps, setLoadingRawOpps] = useState(false);
  const [oppsViewMode, setOppsViewMode] = useState<"matched" | "all">("matched");

  // Career Path Roadmaps state
  const [careerRoadmaps, setCareerRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [targetPathInput, setTargetPathInput] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState<{ [roadmapId: string]: { [milestoneIdx: number]: boolean } }>(() => {
    try {
      const saved = localStorage.getItem("milestone_checks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchCareerRoadmaps = async () => {
    if (!user) return;
    setLoadingRoadmaps(true);
    try {
      const res = await ApiService.getCareerRoadmaps(user.uid);
      setCareerRoadmaps(res.roadmaps || []);
      if (res.roadmaps && res.roadmaps.length > 0) {
        setSelectedRoadmap(res.roadmaps[0]);
      }
    } catch (err: any) {
      console.error("Failed to load career roadmaps:", err);
    } finally {
      setLoadingRoadmaps(false);
    }
  };

  const handleGenerateCareerRoadmap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resume || !user) return;
    setGeneratingRoadmap(true);
    setError(null);
    try {
      const res = await ApiService.generateCareerRoadmap(
        resume.id,
        targetPathInput,
        user.uid
      );
      setCareerRoadmaps((prev) => [res, ...prev]);
      setSelectedRoadmap(res);
      setTargetPathInput("");
    } catch (err: any) {
      console.error("Failed to generate career path roadmap:", err);
      setError("Failed to generate career path roadmap: " + err.message);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const toggleMilestoneCheck = (roadmapId: string, idx: number) => {
    setCompletedMilestones((prev) => {
      const roadmapChecks = prev[roadmapId] || {};
      const updated = {
        ...prev,
        [roadmapId]: {
          ...roadmapChecks,
          [idx]: !roadmapChecks[idx]
        }
      };
      // Persist in localStorage for ease
      localStorage.setItem("milestone_checks", JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch initial profile resumes on mount
  useEffect(() => {
    // If we came with a freshly uploaded resume, trigger quality analysis automatically
    if (resume && !qualityAnalysis && !analyzingQuality) {
      triggerQualityAnalysis();
    }
    if (resume && user) {
      fetchRecommendedOpps();
      fetchRawOpps();
      fetchCareerRoadmaps();
    }
  }, [resume, user]);

  const fetchRawOpps = async () => {
    setLoadingRawOpps(true);
    try {
      const res = await ApiService.getAllOpportunities();
      setAllRawOpps(res.opportunities || []);
    } catch (err: any) {
      console.error("Failed to load raw opportunities database:", err);
    } finally {
      setLoadingRawOpps(false);
    }
  };

  const fetchRecommendedOpps = async () => {
    if (!user) return;
    setLoadingOpps(true);
    try {
      const res = await ApiService.getLatestOpportunities(user.uid);
      if (res && res.matches && res.matches.length > 0) {
        setRecommendedOpps(res.matches);
      } else if (resume) {
        // If empty, auto calculate once to provide instant delight
        await handleCalculateOpps();
      }
    } catch (err: any) {
      console.error("Failed to load recommended opportunities:", err);
    } finally {
      setLoadingOpps(false);
    }
  };

  const handleCalculateOpps = async () => {
    if (!resume || !user) return;
    setCalculatingOpps(true);
    setError(null);
    try {
      const res = await ApiService.matchOpportunities(resume.id, user.uid);
      setRecommendedOpps(res.matches || []);
    } catch (err: any) {
      console.error("Failed to calculate recommended opportunities:", err);
      setError("Failed to calculate recommended opportunities: " + err.message);
    } finally {
      setCalculatingOpps(false);
    }
  };

  const triggerQualityAnalysis = async () => {
    if (!resume) return;
    setAnalyzingQuality(true);
    setError(null);
    try {
      const res = await ApiService.analyzeQuality(resume.id, user.uid);
      setQualityAnalysis(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run quality analysis: " + err.message);
    } finally {
      setAnalyzingQuality(false);
    }
  };

  // ATS Match scan
  const handleAtsScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      setError("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please provide a target job description.");
      return;
    }
    setScanningAts(true);
    setError(null);
    setAtsResult(null);
    try {
      const res = await ApiService.getAtsScore(resume.id, jobDescription, user.uid);
      setAtsResult(res);
    } catch (err: any) {
      console.error(err);
      setError("ATS Scan failed: " + err.message);
    } finally {
      setScanningAts(false);
    }
  };

  // Job matching scan
  const handleJobMatching = async () => {
    if (!resume) return;
    setMatchingJobs(true);
    setError(null);
    try {
      const res = await ApiService.matchJobs(resume.id, user.uid);
      setJobMatches(res.matches || []);
    } catch (err: any) {
      console.error(err);
      setError("Job Matcher failed: " + err.message);
    } finally {
      setMatchingJobs(false);
    }
  };

  // Skill gap scan
  const handleSkillGapAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;
    if (!targetCareerRole.trim()) {
      setError("Please state your target career role.");
      return;
    }
    setAnalyzingGaps(true);
    setError(null);
    setSkillGapResult(null);
    try {
      const res = await ApiService.analyzeSkillGaps(resume.id, targetCareerRole, user.uid);
      setSkillGapResult(res);
    } catch (err: any) {
      console.error(err);
      setError("Skill Gap Analysis failed: " + err.message);
    } finally {
      setAnalyzingGaps(false);
    }
  };

  // Interview Questions load
  const handleStartInterview = async () => {
    if (!resume) return;
    setGeneratingQuestions(true);
    setError(null);
    setInterviewQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setCurrentEvaluation(null);
    setInterviewAnswers([]);
    try {
      const res = await ApiService.getInterviewQuestions(resume.id);
      setInterviewQuestions(res.questions || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate custom interview questions: " + err.message);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Interview evaluation submit
  const handleSubmitInterviewAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    const currentQuestion = interviewQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    setEvaluatingAnswer(true);
    setError(null);
    try {
      const evaluation = await ApiService.evaluateInterviewAnswer(
        currentQuestion.question,
        currentQuestion.expectedPoints,
        userAnswer
      );

      const updatedAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        userAnswer,
        ...evaluation
      };

      setInterviewAnswers((prev) => [...prev, updatedAnswer]);
      setCurrentEvaluation(updatedAnswer);
    } catch (err: any) {
      console.error(err);
      setError("Evaluation failed: " + err.message);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  // Next Interview Question
  const handleNextQuestion = () => {
    setUserAnswer("");
    setCurrentEvaluation(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Hiring Probability Predictor
  const handlePredictHiringProbability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;
    if (!probJobTitle.trim() || !probCompany.trim()) {
      setError("Please fill out both Job Title and target Company.");
      return;
    }
    setPredictingProb(true);
    setError(null);
    setHiringProbability(null);
    try {
      const res = await ApiService.predictHiringProbability(resume.id, probJobTitle, probCompany, user.uid);
      setHiringProbability(res);
    } catch (err: any) {
      console.error(err);
      setError("Hiring prediction failed: " + err.message);
    } finally {
      setPredictingProb(false);
    }
  };

  const getInterviewOverallScore = () => {
    if (interviewAnswers.length === 0) return 0;
    const sum = interviewAnswers.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / interviewAnswers.length);
  };

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      {/* Background glow spots */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Left Navigation Rail */}
      <aside className="w-full md:w-64 bg-white/[0.01] border-r border-white/10 backdrop-blur-2xl flex flex-col justify-between shrink-0 relative z-10">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="px-1.5 py-0.5 text-[8px] bg-white/10 border border-white/10 text-slate-300 rounded font-mono font-bold">
                AI
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white font-mono shadow-md">
              {user.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-slate-200">
                {user.displayName || "Career Professional"}
              </p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "overview"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Career Board</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("ats");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "ats"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ATS Optimiser</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("jobs");
                setError(null);
                if (resume && jobMatches.length === 0) {
                  handleJobMatching();
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "jobs"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Job Matcher</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("roadmap");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "roadmap"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Skill Gaps</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("career-roadmap");
                setError(null);
                if (resume && careerRoadmaps.length === 0) {
                  fetchCareerRoadmaps();
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "career-roadmap"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Career Roadmap</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("interview");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "interview"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Interview Lab</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("probability");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "probability"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Hiring Predictor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setError(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition duration-200 ${
                activeTab === "settings"
                  ? "bg-white/10 border border-white/15 text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wider uppercase text-slate-500 hover:text-white transition duration-200 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative">
        {/* Universal Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Settings page can be accessed regardless of resume presence */}
        {activeTab === "settings" ? (
          <ProfileSettingsPage
            user={user}
            onUpdateUser={onUpdateUser}
            onResetResume={onResetResume}
            onNavigateBack={() => setActiveTab("overview")}
          />
        ) : !resume ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl shadow-xl max-w-xl mx-auto my-12 relative z-10">
            <div className="p-4 bg-white/5 border border-white/10 text-blue-400 rounded-full mb-4">
              <FileText className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">No Active Resume Loaded</h2>
            <p className="text-sm text-slate-400 max-w-md mt-2 font-sans leading-relaxed">
              Before exploring multi-agent career tools, you must parse your current profile resume. Our algorithms will map out matching paths, learning roadmaps, and mock evaluation.
            </p>
            <button
              onClick={() => onNavigate("upload")}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-xs font-mono tracking-wider uppercase font-bold rounded-xl text-white shadow-xl shadow-blue-600/20 transition duration-200"
            >
              Parse Profile Resume
            </button>
          </div>
        ) : (
          /* ACTIVE TABS SCREEN PANEL */
          <div className="space-y-8 animate-fade-in relative z-10">
            {/* Overview dashboard */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Board header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center space-x-2 text-white">
                      <span>Career Board</span>
                      <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/10 text-slate-300 rounded font-mono font-medium lowercase">
                        online
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Resume parsed: <span className="font-mono text-slate-300 font-semibold">{resume.fileName}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate("upload")}
                    className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white rounded-xl transition duration-200"
                  >
                    Replace Resume
                  </button>
                </div>

                {/* Score & Extracted Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quality circle gauge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Resume Score
                        </h2>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-relaxed">
                        Evaluated by Cognitive Quality Agent based on formatting, depth, and syntax guidelines.
                      </p>
                    </div>

                    <div className="my-6 flex flex-col items-center justify-center">
                      {analyzingQuality ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Analyzing...
                          </span>
                        </div>
                      ) : qualityAnalysis ? (
                        <CircularScoreGauge score={qualityAnalysis.qualityScore} colorClass="stroke-blue-500" />
                      ) : (
                        <button
                          onClick={triggerQualityAnalysis}
                          className="px-4 py-2 bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-mono uppercase tracking-wider font-semibold rounded-xl"
                        >
                          Trigger Quality Review
                        </button>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500">Suggested Enhancements:</span>
                      <span className="text-slate-300 font-bold">
                        {qualityAnalysis?.improvements?.length || 0}
                      </span>
                    </div>
                  </motion.div>

                  {/* Summary & Core Profile */}
                  <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                        Synthesized Profile
                      </h2>
                      <h3 className="text-lg font-black text-slate-100">
                        {resume.parsedData?.name || "Career Professional"}
                      </h3>
                      {resume.parsedData?.summary ? (
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans line-clamp-4">
                          {resume.parsedData.summary}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500 italic font-sans">
                          No professional summary extracted. Click 'Trigger Quality Review' to analyze improvements.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                        Identified Tech Stack / Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                        {resume.parsedData?.skills && resume.parsedData.skills.length > 0 ? (
                          resume.parsedData.skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-slate-300"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-sans italic">
                            No structured skills extracted.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Work History & Suggestions Split Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quality Coach Feedback */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>AI Quality Analysis</span>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Real-time Evaluation
                      </span>
                    </div>

                    {qualityAnalysis ? (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        <div>
                          <h4 className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-2">
                            Critical Missing Skills
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {qualityAnalysis.missingSkills?.map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-red-950/20 border border-red-500/10 text-red-300 rounded text-[10px] font-mono"
                              >
                                {skill}
                              </span>
                            )) || <span className="text-xs text-slate-500 italic">None highlighted</span>}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-2">
                            Improvement Suggestions
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-300 font-sans">
                            {qualityAnalysis.improvements?.map((imp: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-0.5">&bull;</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-2">
                            Formatting Suggestions
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-300 font-sans">
                            {qualityAnalysis.formatting?.map((fmt: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-amber-400 mt-0.5">&bull;</span>
                                <span>{fmt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-slate-500 font-sans">
                          Complete quality evaluation to unlock deep roadmap checks.
                        </p>
                        <button
                          onClick={triggerQualityAnalysis}
                          className="mt-3 px-4 py-1.5 bg-white/10 border border-white/10 text-xs font-mono text-slate-300 rounded-lg hover:text-white"
                        >
                          Trigger Analysis
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Work Experience Timeline */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span>Work History Timeline</span>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Parsed Records
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {resume.parsedData?.experience && resume.parsedData.experience.length > 0 ? (
                        resume.parsedData.experience.map((exp: any, idx: number) => (
                          <div key={idx} className="relative pl-4 border-l border-white/10 pb-2">
                            <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-500/50 border border-[#020204] top-1.5 left-[-5px]" />
                            <div className="flex justify-between items-start text-xs">
                              <h4 className="font-bold text-slate-200">{exp.role}</h4>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {exp.duration}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold">{exp.company}</p>
                            <p className="text-[10px] text-slate-500 font-sans mt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 font-sans italic">No employment records parsed.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommended Opportunities Section with Live Database Explorer */}
                <div className="p-8 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-6">
                    <div>
                      <h2 className="text-lg font-black text-white flex items-center space-x-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        <span>Live Role Database & Recommendations</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-sans">
                        View raw live data stored in our <strong className="text-emerald-400 font-mono">Firestore</strong> database, or run cosine-similarity skill vector matching.
                      </p>
                    </div>

                    {/* Mode selector and Actions */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex space-x-1">
                        <button
                          onClick={() => setOppsViewMode("matched")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-200 flex items-center space-x-1.5 ${
                            oppsViewMode === "matched"
                              ? "bg-blue-600 text-white font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Matched (Cosine Similarity)</span>
                        </button>
                        <button
                          onClick={() => setOppsViewMode("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-200 flex items-center space-x-1.5 ${
                            oppsViewMode === "all"
                              ? "bg-emerald-600 text-white font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>All Real Jobs in DB</span>
                        </button>
                      </div>

                      {oppsViewMode === "matched" && (
                        <button
                          onClick={handleCalculateOpps}
                          disabled={calculatingOpps || loadingOpps}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition duration-200 shadow-lg shadow-blue-600/20 shrink-0 ml-auto lg:ml-0"
                        >
                          <RefreshCw className={`w-4 h-4 ${(calculatingOpps || loadingOpps) ? "animate-spin" : ""}`} />
                          <span>{calculatingOpps ? "Matching..." : "Recalculate Matches"}</span>
                        </button>
                      )}

                      {oppsViewMode === "all" && (
                        <button
                          onClick={fetchRawOpps}
                          disabled={loadingRawOpps}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition duration-200 shadow-lg shadow-emerald-600/20 shrink-0 ml-auto lg:ml-0"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingRawOpps ? "animate-spin" : ""}`} />
                          <span>{loadingRawOpps ? "Refreshing DB..." : "Refresh Database View"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {oppsViewMode === "matched" ? (
                    /* MATCHED RECOMMENDATIONS MODE */
                    calculatingOpps || loadingOpps ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <div className="text-center">
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Comparing Skill Vectors</span>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-sans">
                            Generating candidate-to-role intersection indices and calculating cosine similarity coefficients...
                          </p>
                        </div>
                      </div>
                    ) : recommendedOpps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedOpps.map((opp, idx) => (
                          <motion.div
                            key={opp.opportunityId || idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                            className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between space-y-5 transition duration-300 group"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                                  opp.matchScore >= 75
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : opp.matchScore >= 50
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  <CountUpText to={opp.matchScore} suffix="% Match Score" />
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 uppercase">
                                  Cosine Sim: {(opp.matchScore / 100).toFixed(2)}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-snug">
                                  {opp.title}
                                </h3>
                                <p className="text-xs text-blue-400 font-mono font-semibold mt-0.5">{opp.company}</p>
                              </div>

                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                                <span className="flex items-center space-x-1">
                                  <span className="text-slate-600">&bull;</span>
                                  <span>{opp.location}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <span className="text-slate-600">&bull;</span>
                                  <span>{opp.type}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <span className="text-slate-600">&bull;</span>
                                  <span>{opp.salary}</span>
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                                {opp.description}
                              </p>
                            </div>

                            <div className="space-y-3 border-t border-white/5 pt-4">
                              <div>
                                <h4 className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                  <span>Your Matching Skills ({opp.matchedSkills?.length || 0})</span>
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {opp.matchedSkills && opp.matchedSkills.length > 0 ? (
                                    opp.matchedSkills.slice(0, 5).map((skill: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-emerald-950/20 text-emerald-400 rounded text-[9px] font-mono border border-emerald-500/10"
                                      >
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] text-slate-500 italic">No exact skill overlap</span>
                                  )}
                                  {opp.matchedSkills?.length > 5 && (
                                    <span className="text-[9px] text-slate-500 font-mono self-center">
                                      +{opp.matchedSkills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                  <span>Missing Target Skills ({opp.missingSkills?.length || 0})</span>
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {opp.missingSkills && opp.missingSkills.length > 0 ? (
                                    opp.missingSkills.slice(0, 5).map((skill: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-red-950/20 text-red-300 rounded text-[9px] font-mono border border-red-500/10"
                                      >
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] text-emerald-400 italic">Fully aligned!</span>
                                  )}
                                  {opp.missingSkills?.length > 5 && (
                                    <span className="text-[9px] text-slate-500 font-mono self-center">
                                      +{opp.missingSkills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-slate-500 font-sans">
                          No skill-matched opportunities have been evaluated yet.
                        </p>
                        <button
                          onClick={handleCalculateOpps}
                          className="mt-3 px-4 py-1.5 bg-white/10 border border-white/10 text-xs font-mono text-slate-300 rounded-lg hover:text-white"
                        >
                          Calculate Cosine Matches
                        </button>
                      </div>
                    )
                  ) : (
                    /* RAW DATABASE EXPLORER MODE (REAL DATABASE DATA) */
                    loadingRawOpps ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="text-center">
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Reading Live Firestore</span>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-sans">
                            Establishing real-time query cursor and retrieving document schemas directly from the active collection...
                          </p>
                        </div>
                      </div>
                    ) : allRawOpps.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                            <Database className="w-4 h-4 text-emerald-400" />
                            <span>Database collection:</span>
                            <strong className="text-emerald-400">jobOpportunities</strong>
                            <span className="text-slate-600">|</span>
                            <span>Total live documents:</span>
                            <strong className="text-emerald-400">{allRawOpps.length}</strong>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded uppercase font-bold">
                            Live Connection Active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {allRawOpps.map((opp, idx) => (
                            <div
                              key={opp.id || idx}
                              className="p-6 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 rounded-2xl flex flex-col justify-between space-y-5 transition duration-300 group"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <span className="px-2.5 py-0.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold uppercase tracking-wide">
                                    Document ID: {opp.id?.substring(0, 8)}...
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {opp.type}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-snug">
                                    {opp.title}
                                  </h3>
                                  <p className="text-xs text-emerald-400 font-mono font-semibold mt-0.5">{opp.company}</p>
                                </div>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                                  <span className="flex items-center space-x-1">
                                    <span className="text-slate-600">&bull;</span>
                                    <span>{opp.location}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <span className="text-slate-600">&bull;</span>
                                    <span>{opp.salary}</span>
                                  </span>
                                </div>

                                <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                                  {opp.description}
                                </p>
                              </div>

                              <div className="space-y-2 border-t border-white/5 pt-4">
                                <h4 className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                                  <span>Stored Required Skills ({opp.skills?.length || 0})</span>
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {opp.skills && opp.skills.length > 0 ? (
                                    opp.skills.map((skill: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-white/5 text-slate-300 rounded text-[9px] font-mono border border-white/5 hover:border-emerald-500/20 hover:text-emerald-400 transition-colors"
                                      >
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] text-slate-500 italic">No skills specified</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-slate-500 font-sans">
                          The Firestore database collection is empty or could not be loaded.
                        </p>
                        <button
                          onClick={fetchRawOpps}
                          className="mt-3 px-4 py-1.5 bg-white/10 border border-white/10 text-xs font-mono text-slate-300 rounded-lg hover:text-white"
                        >
                          Refresh Database Connection
                        </button>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* ATS Scanner Tab */}
            {activeTab === "ats" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">ATS Scanner & Optimizer</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly simulate recruiter applicant filters and optimize keywords to maximize resume pass-through.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Job Description */}
                  <form onSubmit={handleAtsScan} className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between space-y-4 min-h-[400px]">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Target Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the target job description here to analyze matched and missing core keywords..."
                        rows={10}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-slate-300 font-sans leading-relaxed resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={scanningAts}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-white shadow-xl shadow-blue-600/20 transition duration-200"
                    >
                      {scanningAts ? "Scanning Keywords against ATS..." : "Analyze ATS Compatibility"}
                    </button>
                  </form>

                  {/* ATS Results Output */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-6 min-h-[400px] flex flex-col justify-between">
                    {scanningAts ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Recruiter Simulator active...
                        </span>
                      </div>
                    ) : atsResult ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6 flex-1 flex flex-col justify-between"
                      >
                        {/* Circle Score Header */}
                        <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                          <CircularScoreGauge score={atsResult.score} size={80} strokeWidth={6} colorClass="stroke-blue-500" />

                          <div>
                            <h3 className="text-sm font-bold text-slate-200">ATS Match Rating</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">
                              {atsResult.score >= 80
                                ? "Excellent! Your profile meets the core recruiter expectations."
                                : atsResult.score >= 60
                                ? "Moderate match. Focus on integrating the missing critical keywords listed."
                                : "Weak compatibility. Tailor your resume before submitting to prevent early rejection."}
                            </p>
                          </div>
                        </div>

                        {/* Extracted Details */}
                        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
                                Keywords Matched
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {atsResult.keywordsMatched?.map((word: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/10 text-emerald-400 rounded text-[9px] font-mono"
                                  >
                                    {word}
                                  </span>
                                )) || <span className="text-[10px] text-slate-500">None</span>}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-2">
                                Missing Keywords
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {atsResult.missingKeywords?.map((word: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-red-950/20 border border-red-500/10 text-red-400 rounded text-[9px] font-mono"
                                  >
                                    {word}
                                  </span>
                                )) || <span className="text-[10px] text-slate-500">None</span>}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1">
                              Actionable Suggestions
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                              {atsResult.suggestions?.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-1.5">
                                    <span className="text-blue-400 mt-0.5">&bull;</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <ClipboardList className="w-10 h-10 text-slate-600 mb-2" />
                        <h3 className="text-sm font-bold text-slate-400">Scan Results Pending</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
                          Input the target job description in the form to check matching indices and keyword density.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Job Matcher Tab */}
            {activeTab === "jobs" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Neural Job Matcher</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Our intelligence matchers examine your profile skills to recommend real roles and companies.
                    </p>
                  </div>
                  <button
                    onClick={handleJobMatching}
                    disabled={matchingJobs}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition duration-200"
                  >
                    {matchingJobs ? "Matching..." : "Refresh Job Matches"}
                  </button>
                </div>

                {matchingJobs ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Consulting market indices...
                    </span>
                  </div>
                ) : jobMatches.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {jobMatches.map((job, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                        className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between space-y-6 transition duration-300"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold rounded">
                              <CountUpText to={job.matchPercentage} suffix="% Match" />
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">
                              Rank #{idx + 1}
                            </span>
                          </div>

                          <h3 className="mt-4 text-base font-bold text-slate-200 leading-tight">
                            {job.role}
                          </h3>
                          <p className="text-xs text-blue-400 font-mono font-semibold">{job.company}</p>

                          <p className="mt-3 text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                            {job.description}
                          </p>
                        </div>

                        <div className="space-y-4 border-t border-white/5 pt-4">
                          <div>
                            <h4 className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5">
                              Leveraged Strengths
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {job.strengths?.map((str: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-emerald-950/20 text-emerald-400 rounded text-[9px] font-mono"
                                >
                                  {str}
                                </span>
                              )) || <span className="text-[9px] text-slate-500">None</span>}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1.5">
                              Unmet Requirements
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {job.missingRequirements?.map((req: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-red-950/20 text-red-400 rounded text-[9px] font-mono"
                                >
                                  {req}
                                </span>
                              )) || <span className="text-[9px] text-slate-500">None</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6">
                    <Briefcase className="w-8 h-8 text-slate-600 mb-2" />
                    <h3 className="text-sm font-bold text-slate-400">No Job Matches Cached</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
                      Trigger neural matching to inspect prospective companies and custom fit analysis.
                    </p>
                    <button
                      onClick={handleJobMatching}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition duration-200"
                    >
                      Trigger Neural Matcher
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Skill Gaps & Roadmap Tab */}
            {activeTab === "roadmap" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Skill Gap & Learning Roadmap</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    State your target career goal, and the system will design a visual learning path to bridge the tech skill gaps.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Goal Input form */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl h-fit space-y-4">
                    <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Configure Target Role
                    </h2>
                    <form onSubmit={handleSkillGapAnalysis} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                          Target Role Title
                        </label>
                        <input
                          type="text"
                          value={targetCareerRole}
                          onChange={(e) => setTargetCareerRole(e.target.value)}
                          placeholder="e.g. Senior Cloud Engineer, Lead Architect"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 text-slate-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={analyzingGaps}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl text-white transition duration-200"
                      >
                        {analyzingGaps ? "Synthesizing Roadmap..." : "Calculate Skill Gaps"}
                      </button>
                    </form>

                    {skillGapResult && (
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div>
                          <h4 className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5">
                            Possessed Skills
                          </h4>
                          <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                            {skillGapResult.currentSkills?.map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/10 text-emerald-400 rounded text-[9px] font-mono"
                              >
                                {skill}
                              </span>
                            )) || <span className="text-[10px] text-gray-500">None</span>}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1.5">
                            Core Skill Deficits
                          </h4>
                          <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                            {skillGapResult.missingSkills?.map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-red-950/20 border border-red-500/10 text-red-400 rounded text-[9px] font-mono"
                              >
                                {skill}
                              </span>
                            )) || <span className="text-[10px] text-slate-500">None</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Roadmap Timeline */}
                  <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Tailored Multi-Week Roadmap
                      </h3>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Timeline Sequence
                      </span>
                    </div>

                    {analyzingGaps ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-2">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Assembling educational plan...
                        </span>
                      </div>
                    ) : skillGapResult?.learningRoadmap && skillGapResult.learningRoadmap.length > 0 ? (
                      <div className="space-y-6">
                        {skillGapResult.learningRoadmap.map((step: any, idx: number) => (
                          <div key={idx} className="relative pl-8 border-l border-white/10 pb-2">
                            <div className="absolute w-6 h-6 rounded-full bg-blue-950 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center top-0.5 left-[-12px]">
                              {idx + 1}
                            </div>
                            <div className="flex justify-between items-start text-xs">
                              <h4 className="font-bold text-slate-200">{step.title}</h4>
                              <span className="text-[10px] font-mono text-blue-400 shrink-0 bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 rounded">
                                {step.duration}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                              {step.description}
                            </p>
                            {step.resources && step.resources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Resources:</span>
                                {step.resources.map((res: string, rIdx: number) => (
                                  <span
                                    key={rIdx}
                                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-300"
                                  >
                                    {res}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                        <BookOpen className="w-10 h-10 text-slate-600 mb-2" />
                        <h3 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">Plan Offline</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
                          State your career objectives in the sidebar configuration to build a personalized study roadmap.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Interview Lab Tab */}
            {activeTab === "interview" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AI Interview Simulator</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Conduct technical and behavioral interview simulations generated dynamically from your work history and profile skills.
                  </p>
                </div>

                {interviewQuestions.length === 0 ? (
                  <div className="p-8 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center text-center max-w-xl mx-auto my-6">
                    <MessageSquare className="w-12 h-12 text-blue-500/50 mb-4 animate-pulse" />
                    <h2 className="text-lg font-extrabold tracking-tight text-white">Initialize Simulation Session</h2>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                      Specialized AI interviewers will assemble 3 tailored interview questions targeting your parsed resume skills.
                    </p>
                    <button
                      onClick={handleStartInterview}
                      disabled={generatingQuestions}
                      className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-white shadow-xl shadow-blue-600/20 transition duration-200"
                    >
                      {generatingQuestions ? "Agents Preparing Questions..." : "Begin Mock Session"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Question panel */}
                    <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between space-y-6 min-h-[420px]">
                      {currentQuestionIndex < interviewQuestions.length ? (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="text-blue-400">
                                Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                              </span>
                              <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-bold text-[9px] text-purple-300">
                                {interviewQuestions[currentQuestionIndex].category}
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                              {interviewQuestions[currentQuestionIndex].question}
                            </h3>
                          </div>

                          <form onSubmit={handleSubmitInterviewAnswer} className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                                Your Response
                              </label>
                              <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your response here. Try to structure your answer using the STAR method (Situation, Task, Action, Result)..."
                                rows={6}
                                required
                                disabled={evaluatingAnswer || !!currentEvaluation}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500/50 text-slate-300 leading-relaxed font-sans resize-none"
                              />
                            </div>

                            {!currentEvaluation ? (
                              <button
                                type="submit"
                                disabled={evaluatingAnswer || !userAnswer.trim()}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-white shadow-xl shadow-blue-600/20 transition duration-200 flex items-center justify-center space-x-2"
                              >
                                {evaluatingAnswer ? (
                                  "Evaluation Agent assessing answer..."
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    <span>Submit Response</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="flex justify-between items-center gap-4">
                                {currentQuestionIndex + 1 < interviewQuestions.length ? (
                                  <button
                                    type="button"
                                    onClick={handleNextQuestion}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-slate-300 hover:text-white transition duration-200"
                                  >
                                    Next Question &rarr;
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Trigger complete state
                                      setCurrentQuestionIndex((prev) => prev + 1);
                                    }}
                                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-white transition duration-200"
                                  >
                                    View Session Report card
                                  </button>
                                )}
                              </div>
                            )}
                          </form>
                        </div>
                      ) : (
                        /* Complete report */
                        <div className="space-y-6 text-center py-6 flex-1 flex flex-col justify-center">
                          <div className="p-4 bg-emerald-950/20 border border-emerald-950/20 text-emerald-400 rounded-full w-fit mx-auto">
                            <ShieldCheck className="w-10 h-10" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-100">Session Completed</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              Your interview responses have been analyzed. Here is your overall session performance metric:
                            </p>
                          </div>

                          <div className="text-center my-4">
                            <span className="text-5xl font-black text-blue-400">
                              <CountUpText to={getInterviewOverallScore()} suffix="%" />
                            </span>
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mt-1">Average Evaluation Rating</span>
                          </div>

                          <button
                            onClick={handleStartInterview}
                            className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-slate-300 rounded-xl hover:text-white mx-auto transition duration-200"
                          >
                            Restart Mock Session
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Feedback report side panel */}
                    <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between min-h-[420px]">
                      {evaluatingAnswer ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Evaluating depth and vocabulary...
                          </span>
                        </div>
                      ) : currentEvaluation ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                              Agent Feedback Report
                            </h3>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 font-mono text-xs font-bold rounded">
                              <CountUpText to={currentEvaluation.score} suffix="% Score" />
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            <div>
                              <h4 className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1">
                                Evaluation Feedback
                              </h4>
                              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                {currentEvaluation.feedback}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5">
                                Addressed Expected Points
                              </h4>
                              <div className="space-y-1.5">
                                {currentEvaluation.expectedPointsMatched?.map((pt: string, i: number) => (
                                  <div key={i} className="flex items-center space-x-1.5 text-xs text-slate-300 font-sans">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span>{pt}</span>
                                  </div>
                                ))}
                                {(!currentEvaluation.expectedPointsMatched || currentEvaluation.expectedPointsMatched.length === 0) && (
                                  <span className="text-[10px] text-slate-500 italic">No expected metrics covered.</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1.5">
                                Enhancement Recommendations
                              </h4>
                              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                                {currentEvaluation.suggestions?.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-1.5">
                                    <span className="text-amber-400 mt-0.5">&bull;</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <HelpCircle className="w-10 h-10 text-slate-600 mb-2" />
                          <h3 className="text-sm font-bold text-slate-400">Response Analysis</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
                            Complete and submit your question response to display grading and constructive feedback.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Hiring Probability Predictor Tab */}
            {activeTab === "probability" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Hiring Predictor</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Calculate career metrics, predict the probability of success for specific roles, and highlight optimizations.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Job and Company config */}
                  <form onSubmit={handlePredictHiringProbability} className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl h-fit space-y-4">
                    <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Specify Application Details
                    </h2>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        value={probJobTitle}
                        onChange={(e) => setProbJobTitle(e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                        Target Company Name
                      </label>
                      <input
                        type="text"
                        value={probCompany}
                        onChange={(e) => setProbCompany(e.target.value)}
                        placeholder="e.g. Stripe, Netflix"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 text-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={predictingProb}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl text-white transition duration-200"
                    >
                      {predictingProb ? "Consulting Predictors..." : "Predict Hiring Odds"}
                    </button>
                  </form>

                  {/* Prob Result Output */}
                  <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl min-h-[400px] flex flex-col justify-between">
                    {predictingProb ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Analyzing profile strengths...
                        </span>
                      </div>
                    ) : hiringProbability ? (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        {/* Circle Score Header */}
                        <div className="flex items-center space-x-6 border-b border-white/5 pb-4">
                          <CircularScoreGauge score={hiringProbability.probabilityScore} size={96} strokeWidth={7} colorClass="stroke-purple-500" />

                          <div>
                            <h3 className="text-base font-bold text-slate-200">Hiring Probability</h3>
                            <p className="text-xs text-purple-400 font-mono mt-0.5 font-semibold">
                              {hiringProbability.jobTitle} &bull; {hiringProbability.company}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                              Probability model simulated based on background align, missing skills, and tech depth compared against target firm indices.
                            </p>
                          </div>
                        </div>

                        {/* Extracted Strengths & Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[220px] overflow-y-auto pr-1">
                          <div>
                            <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
                              Core Assets / Strengths
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                              {hiringProbability.strengths?.map((item: string, i: number) => (
                                <li key={i} className="flex items-start space-x-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-2">
                              Identified Gaps / Weaknesses
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                              {hiringProbability.weaknesses?.map((item: string, i: number) => (
                                <li key={i} className="flex items-start space-x-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Recommendation banner */}
                        {hiringProbability.suggestions && hiringProbability.suggestions.length > 0 && (
                          <div className="p-4 bg-blue-950/20 border border-blue-900/30 text-xs text-slate-300 rounded-xl leading-relaxed font-sans">
                            <span className="font-bold text-blue-400 block mb-1">Strategist Tips to Maximize Odds:</span>
                            <ul className="space-y-1 list-disc pl-4 text-slate-300">
                              {hiringProbability.suggestions.map((sug: string, i: number) => (
                                <li key={i}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Award className="w-10 h-10 text-slate-600 mb-2" />
                        <h3 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">Simulator Offline</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
                          Input your application details in the sidebar form to check predictive statistics and gap remedies.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
