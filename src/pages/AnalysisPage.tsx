import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { Sparkles, FileText, ArrowRight, BrainCircuit, CheckCircle2, ChevronRight, Check, X, Target, Send, RefreshCw } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalysisPageProps {
  user: any;
  resume: any;
  onNavigate: (page: string) => void;
}

export default function AnalysisPage({ user, resume, onNavigate }: AnalysisPageProps) {
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ATS scoring states
  const [atsScoreData, setAtsScoreData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [calculatingAts, setCalculatingAts] = useState<boolean>(false);
  const [fetchingAts, setFetchingAts] = useState<boolean>(false);
  const [atsError, setAtsError] = useState<string | null>(null);

  useEffect(() => {
    if (resume) {
      triggerInitialQualityAnalysis();
    }
    if (resume && user) {
      fetchLatestAtsScore();
    }
  }, [resume, user]);

  const fetchLatestAtsScore = async () => {
    if (!resume || !user) return;
    setFetchingAts(true);
    setAtsError(null);
    try {
      const atsRef = collection(db, "atsScores");
      const q = query(
        atsRef,
        where("resumeId", "==", resume.id),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const scoresList: any[] = [];
      querySnapshot.forEach((doc) => {
        scoresList.push({ id: doc.id, ...doc.data() });
      });

      if (scoresList.length > 0) {
        // Sort by createdAt descending in memory
        scoresList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAtsScoreData(scoresList[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch latest ATS score:", err);
    } finally {
      setFetchingAts(false);
    }
  };

  const handleCalculateAts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || !resume || !user) return;

    setCalculatingAts(true);
    setAtsError(null);
    try {
      const result = await ApiService.getAtsScore(resume.id, jobDescription, user.uid);
      setAtsScoreData(result);
    } catch (err: any) {
      console.error(err);
      setAtsError(err.message || "Failed to calculate ATS score. Please try again.");
    } finally {
      setCalculatingAts(false);
    }
  };

  const handleResetAts = () => {
    setAtsScoreData(null);
    setJobDescription("");
    setAtsError(null);
  };

  const triggerInitialQualityAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.analyzeQuality(resume.id, user.uid);
      setQualityAnalysis(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run initial cognitive quality scan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#020204] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <FileText className="w-12 h-12 text-slate-600 mb-2 animate-bounce relative z-10" />
        <h2 className="text-xl font-bold text-slate-200 relative z-10">No Resume Uploaded</h2>
        <button
          onClick={() => onNavigate("upload")}
          className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 rounded-xl text-xs font-mono uppercase tracking-wider relative z-10 text-white font-bold"
        >
          Upload Resume
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/5 border border-white/10 text-purple-400 rounded-2xl">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Resume Synthesis Complete</h1>
              <p className="text-xs text-slate-400 mt-1">
                Cognitive parser successfully completed analysis on: <span className="font-mono text-slate-300">{resume.fileName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("dashboard")}
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 text-white"
          >
            <span>Proceed to Workspace Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Synthesis Profile Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quality Analysis side card */}
          <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Initial Quality Score
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Assessed based on experience depth, syntax readability, formatting, and high-demand skill align.
              </p>
            </div>

            <div className="my-4 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scoring...</span>
                </div>
              ) : qualityAnalysis ? (
                <div className="relative flex items-center justify-center w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-white/5 fill-none"
                      strokeWidth="6"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-blue-500 fill-none transition-all duration-1000"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - qualityAnalysis.qualityScore / 100)
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-100">{qualityAnalysis.qualityScore}</span>
                    <span className="text-[9px] text-slate-500 font-mono">/ 100</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={triggerInitialQualityAnalysis}
                  className="px-4 py-2 bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-mono uppercase tracking-wider rounded-lg"
                >
                  Trigger Scan
                </button>
              )}
            </div>

            {qualityAnalysis && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1.5">
                    Critical Gaps Detected
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {qualityAnalysis.missingSkills?.slice(0, 4).map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-red-950/20 text-red-300 rounded text-[9px] font-mono border border-red-500/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Parsed content list */}
          <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-6">
            <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-white/5 pb-3">
              Extracted Profile Records
            </h2>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
                <p className="text-sm font-bold text-slate-200">{resume.parsedData?.name || "Not found"}</p>
              </div>

              {resume.parsedData?.summary && (
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Professional Summary</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{resume.parsedData.summary}</p>
                </div>
              )}

              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">Parsed Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {resume.parsedData?.skills?.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {resume.parsedData?.experience && resume.parsedData.experience.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Employment History</span>
                  <div className="space-y-3">
                    {resume.parsedData.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="border-l border-white/10 pl-3">
                        <p className="text-xs font-bold text-slate-200">{exp.role} at <span className="text-blue-400">{exp.company}</span></p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.parsedData?.education && resume.parsedData.education.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Educational History</span>
                  <div className="space-y-2">
                    {resume.parsedData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l border-white/10 pl-3">
                        <p className="text-xs font-bold text-slate-200">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{edu.institution} &bull; {edu.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ATS score match evaluation section */}
        <div className="p-8 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-6">
          {calculatingAts ? (
            <div className="h-72 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Consulting ATS Indices</span>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Performing keyword alignment, semantic validation, and computing index density...
                </p>
              </div>
            </div>
          ) : atsScoreData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gauge Chart Column */}
              <div className="flex flex-col items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-2xl relative min-h-[300px]">
                <div className="text-center w-full pb-2 border-b border-white/5">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span>Keyword Compatibility</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calculated alignment against target role guidelines</p>
                </div>

                {/* Responsive Recharts Gauge */}
                <div className="relative w-full h-44 flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
                          <stop offset="100%" stopColor="#7c3aed" /> {/* violet-600 */}
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: "Score", value: atsScoreData.score },
                          { name: "Remaining", value: 100 - atsScoreData.score }
                        ]}
                        cx="50%"
                        cy="85%"
                        innerRadius={65}
                        outerRadius={85}
                        startAngle={180}
                        endAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="url(#gaugeGradient)" />
                        <Cell fill="rgba(255, 255, 255, 0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-[20%] flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{atsScoreData.score}%</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">ATS Match Index</span>
                  </div>
                </div>

                <div className="text-center space-y-3 w-full mt-2">
                  <p className="text-xs text-slate-400 leading-relaxed px-4">
                    {atsScoreData.score >= 80 
                      ? "Excellent alignment! Your resume has high keyword density for this role."
                      : atsScoreData.score >= 60
                      ? "Good alignment, but some high-priority keywords are missing."
                      : "Low alignment. Consider updating your resume to include the missing terms below."
                    }
                  </p>
                  <button
                    onClick={handleResetAts}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl text-slate-300 hover:text-white transition duration-200"
                  >
                    Compare Another Role
                  </button>
                </div>
              </div>

              {/* Keywords and suggestions Column */}
              <div className="space-y-6">
                {/* Matched Keywords */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Matched Keywords ({atsScoreData.keywordsMatched?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {atsScoreData.keywordsMatched?.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-mono"
                      >
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span>{kw}</span>
                      </span>
                    )) || <span className="text-xs text-slate-500 italic">None matched</span>}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">
                    Missing Target Keywords ({atsScoreData.missingKeywords?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {atsScoreData.missingKeywords?.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-red-950/20 border border-red-500/10 text-red-400 rounded-lg text-[10px] font-mono"
                      >
                        <X className="w-3 h-3 flex-shrink-0" />
                        <span>{kw}</span>
                      </span>
                    )) || <span className="text-xs text-slate-500 italic">None missing</span>}
                  </div>
                </div>

                {/* Actionable Suggestions */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                    ATS Optimization Action plan
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                    {atsScoreData.suggestions?.slice(0, 3).map((sug: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-0.5">&bull;</span>
                        <span>{sug}</span>
                      </li>
                    )) || <span className="text-xs text-slate-500 italic">No recommendations needed</span>}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Input Side */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>ATS Match Optimizer</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Paste a target job description to evaluate keyword density, identify critical tech gaps, and calculate your compatibility index.
                  </p>
                </div>
                <form onSubmit={handleCalculateAts} className="space-y-4">
                  <div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description details here (e.g., qualifications, requirements, responsibilities)..."
                      rows={6}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500/50 text-slate-300 leading-relaxed font-sans resize-none placeholder-slate-600"
                    />
                  </div>
                  {atsError && (
                    <p className="text-[11px] text-red-400 font-sans leading-relaxed">{atsError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={calculatingAts || !jobDescription.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-xs font-mono uppercase tracking-wider font-bold rounded-xl text-white shadow-xl shadow-blue-600/20 transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Run ATS Match Evaluation</span>
                  </button>
                </form>
              </div>

              {/* Information / Instruction Side */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col justify-center space-y-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  How ATS Evaluation Works
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold mt-0.5">01</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">Semantic Extraction</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        The AI engine extracts high-priority skills, frameworks, and tools required by the employer.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-bold mt-0.5">02</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">Gap & Density Analysis</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Your parsed resume content is scanned for exact and synonym matches, identifying missing terms.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold mt-0.5">03</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">Gauge Scoring & Advice</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Get a tailored percentage score along with exact keywords to inject into your resume sections.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality improvements suggestions card */}
        {qualityAnalysis && (
          <div className="p-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Recommended Enhancements to Implement</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">Content Adjustments</span>
                <ul className="space-y-2 text-xs text-slate-300 font-sans">
                  {qualityAnalysis.improvements?.slice(0, 3).map((imp: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-0.5">&bull;</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Formatting Optimizations</span>
                <ul className="space-y-2 text-xs text-slate-300 font-sans">
                  {qualityAnalysis.formatting?.slice(0, 3).map((fmt: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-400 mt-0.5">&bull;</span>
                      <span>{fmt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

