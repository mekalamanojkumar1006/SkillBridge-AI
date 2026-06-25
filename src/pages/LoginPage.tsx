import React, { useState } from "react";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ApiService } from "../services/api";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Shield } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Sync user profile on the backend
      const profileRes = await ApiService.loginUser(user.uid).catch(async () => {
        // If profile doesn't exist, register it
        return ApiService.registerUser(user.uid, user.email || "", user.displayName || "");
      });

      onLoginSuccess(user);
      onNavigate("dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password combination.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email & Password sign-in is not enabled in the Firebase Console. Please go to your Firebase Console -> Authentication -> Sign-in Method tab and enable 'Email/Password'.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      // Sign in anonymously for simple trial usage in sandbox
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Register anonymous user profile
      const email = `demo_${user.uid.slice(0, 8)}@skillbridge.ai`;
      await ApiService.registerUser(user.uid, email, "Demo Practitioner");

      onLoginSuccess({
        ...user,
        email,
        displayName: "Demo Practitioner"
      });
      onNavigate("dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Anonymous sign-in is not enabled in the Firebase Console. Please go to your Firebase Console -> Authentication -> Sign-in Method tab and enable 'Anonymous'.");
      } else {
        setError("Failed to start demo session: " + err.message);
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 flex flex-col justify-center relative px-6 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Nav back button */}
      <button
        onClick={() => onNavigate("landing")}
        className="absolute top-6 left-6 flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Main</span>
      </button>

      <div className="w-full max-w-md mx-auto relative bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md shadow-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SkillBridge
            </span>
            <span className="px-1.5 py-0.5 text-[9px] bg-white/10 border border-white/10 text-slate-300 rounded font-mono font-bold">
              AI
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mt-3">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Log in to continue analyzing your resume and skill metrics
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading || demoLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-slate-200"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading || demoLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 rounded-xl font-bold text-sm text-white transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="absolute px-3 bg-[#020204] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Alternative Trial
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading || demoLoading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition duration-200 flex items-center justify-center space-x-2"
        >
          {demoLoading ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Starting demo...</span>
            </span>
          ) : (
            <>
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Instant Demo Playroom</span>
            </>
          )}
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          New to SkillBridge?{" "}
          <button
            onClick={() => onNavigate("signup")}
            className="text-blue-400 hover:underline font-semibold"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
}
