import React, { useState, useRef } from "react";
import { ApiService } from "../services/api";
import { Upload, FileText, ArrowRight, Clipboard, AlertCircle, Sparkles } from "lucide-react";

interface ResumeUploadPageProps {
  userId: string;
  onUploadSuccess: (resume: any) => void;
  onNavigate: (page: string) => void;
}

export default function ResumeUploadPage({ userId, onUploadSuccess, onNavigate }: ResumeUploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [usePasteMode, setUsePasteMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== "text/plain" && !selectedFile.name.endsWith(".txt") && !selectedFile.name.endsWith(".pdf")) {
      setError("Only plain text (.txt) and PDF (.pdf) files are supported for instant parsing.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let contentToUpload = "";
    let nameToUpload = "resume.txt";

    if (usePasteMode) {
      if (!pastedText.trim()) {
        setError("Please paste your resume text before submitting.");
        return;
      }
      contentToUpload = pastedText;
      nameToUpload = "pasted_resume.txt";
    } else {
      if (!file) {
        setError("Please select a file or paste your resume text.");
        return;
      }
      setLoading(true);
      nameToUpload = file.name;

      try {
        // Read text file content
        contentToUpload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || "");
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadProgress(progress);
          if (progress >= 100) clearInterval(interval);
        }, 150);
      } catch (err: any) {
        setLoading(false);
        setError("Failed to read the selected file: " + err.message);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await ApiService.uploadResume(userId, nameToUpload, contentToUpload);
      onUploadSuccess(result);
      onNavigate("analysis");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze resume. Please ensure the file contains legible plain text.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation header */}
      <div className="absolute top-6 left-6 flex items-center space-x-4">
        <button
          onClick={() => onNavigate("dashboard")}
          className="text-xs font-mono text-slate-400 hover:text-white transition duration-200"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 relative shadow-2xl z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <Upload className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Upload Your Resume</h1>
            <p className="text-xs text-slate-400 mt-0.5">Let our cognitive agents extract, map, and assess your career matrix.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Option Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => {
              setUsePasteMode(false);
              setError(null);
            }}
            className={`pb-3 text-xs sm:text-sm font-mono uppercase tracking-wider font-bold border-b-2 px-4 transition duration-200 ${
              !usePasteMode ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            File Upload (.txt / .pdf)
          </button>
          <button
            onClick={() => {
              setUsePasteMode(true);
              setError(null);
            }}
            className={`pb-3 text-xs sm:text-sm font-mono uppercase tracking-wider font-bold border-b-2 px-4 transition duration-200 ${
              usePasteMode ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Paste Text Profile
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {!usePasteMode ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                  isDragActive
                    ? "border-blue-500 bg-blue-950/10"
                    : file
                    ? "border-emerald-500/50 bg-emerald-950/5"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                }`}
                onClick={handleBrowseClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept=".txt,.pdf"
                  className="hidden"
                />

                {file ? (
                  <>
                    <div className="p-4 bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 rounded-full mb-3">
                      <FileText className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 block max-w-md truncate">{file.name}</span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-white/5 border border-white/10 text-slate-400 rounded-full mb-3">
                      <Upload className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">
                      Drag & drop your resume file here
                    </span>
                    <span className="text-xs text-slate-500 mt-1 font-mono">
                      Supports Plain Text (.txt) or PDF (.pdf) format
                    </span>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-slate-300 font-semibold rounded-lg transition duration-200"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Paste Plain Text Resume
              </label>
              <div className="relative">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your complete resume details here, including Name, Skills, Work Experience, Education history, and contact information..."
                  rows={8}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-slate-200 font-sans leading-relaxed resize-y"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setPastedText(text);
                    } catch {
                      setError("Clipboard permission denied. Please paste manually.");
                    }
                  }}
                  className="absolute bottom-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-400 hover:text-white transition duration-200 flex items-center space-x-1 text-[10px] font-mono"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Paste Clipboard</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="w-full bg-white/10 h-[3px] rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  Agents synthesizing profile...
                </span>
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Initialize AI Resume Synthesis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
