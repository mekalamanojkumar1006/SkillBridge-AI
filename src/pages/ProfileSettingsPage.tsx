import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Link2, 
  Unlink, 
  RefreshCw, 
  UserCheck, 
  Key, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { auth } from "../lib/firebase";
import { 
  updateProfile, 
  EmailAuthProvider, 
  linkWithCredential,
  GoogleAuthProvider,
  linkWithPopup,
  unlink
} from "firebase/auth";
import { ApiService } from "../services/api";

interface ProfileSettingsPageProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  onResetResume: () => void;
  onNavigateBack: () => void;
}

export default function ProfileSettingsPage({ 
  user, 
  onUpdateUser, 
  onResetResume, 
  onNavigateBack 
}: ProfileSettingsPageProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Link Account States (for converting anonymous to permanent)
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Providers list
  const [providers, setProviders] = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Reset data states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setProviders(currentUser.providerData);
      setIsAnonymous(currentUser.isAnonymous);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileError("Display name cannot be empty.");
      return;
    }

    setLoadingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Update Firebase Auth Profile
        await updateProfile(currentUser, { displayName: displayName.trim() });
        
        // 2. Sync to Firestore backend
        await ApiService.updateProfile(currentUser.uid, displayName.trim());

        // 3. Update parent React App state
        onUpdateUser({
          ...user,
          displayName: displayName.trim()
        });

        setProfileSuccess(true);
      } else {
        throw new Error("No active authenticated session found.");
      }
    } catch (err: any) {
      console.error(err);
      setProfileError(err.message || "Failed to update profile details.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim() || !linkPassword.trim()) {
      setLinkError("Please provide both email and a strong password.");
      return;
    }
    if (linkPassword.length < 6) {
      setLinkError("Password must be at least 6 characters.");
      return;
    }

    setLinking(true);
    setLinkError(null);
    setLinkSuccess(false);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const credential = EmailAuthProvider.credential(linkEmail.trim(), linkPassword.trim());
        await linkWithCredential(currentUser, credential);
        
        // Re-sync with database to ensure email is saved in Firestore
        await ApiService.updateProfile(currentUser.uid, currentUser.displayName || displayName || linkEmail.split("@")[0]);
        
        // Refresh local UI states
        setIsAnonymous(currentUser.isAnonymous);
        setProviders(currentUser.providerData);
        onUpdateUser({
          ...user,
          email: currentUser.email,
          displayName: currentUser.displayName || displayName
        });

        setLinkSuccess(true);
        setLinkEmail("");
        setLinkPassword("");
      } else {
        throw new Error("No active session to link.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setLinkError("Email & Password authentication is not enabled in the Firebase Console. Please ask the developer to enable it.");
      } else {
        setLinkError(err.message || "Failed to link credentials. The email may already be in use.");
      }
    } finally {
      setLinking(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkError(null);
    setLinkSuccess(false);
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      
      setProviders(currentUser.providerData);
      setIsAnonymous(currentUser.isAnonymous);
      
      onUpdateUser({
        ...user,
        displayName: currentUser.displayName || user.displayName
      });
      setLinkSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        setLinkError("Authentication popup was blocked or closed. Please allow popups or try again in a new tab.");
      } else {
        setLinkError(err.message || "Failed to link Google account.");
      }
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    if (providers.length <= 1 && !isAnonymous) {
      setLinkError("You cannot unlink your only login provider.");
      return;
    }

    if (!window.confirm(`Are you sure you want to disconnect ${providerId}?`)) {
      return;
    }

    setLinkError(null);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await unlink(currentUser, providerId);
        setProviders(currentUser.providerData);
        setLinkSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setLinkError(err.message || "Failed to unlink provider.");
    }
  };

  const handleResetData = async () => {
    if (confirmText !== "DELETE ALL") {
      setResetError("Please type 'DELETE ALL' exactly to confirm reset.");
      return;
    }

    setResetting(true);
    setResetError(null);

    try {
      // Call backend to purge Firestore docs
      await ApiService.resetResumeData(user.uid);
      
      setResetSuccess(true);
      setShowResetConfirm(false);
      setConfirmText("");
      
      // Notify parent app to clear local resume state
      onResetResume();
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || "Failed to purge account database.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 pb-24 text-slate-100">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Profile Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage credentials, link logins, and control personal database records</p>
          </div>
        </div>
        <span className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 text-slate-400 rounded-lg font-mono">
          SECURE CREDENTIALS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Instructions & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-blue-400 font-bold">Aesthetic Identity</h2>
            <div className="flex flex-col items-center justify-center p-6 bg-white/[0.01] border border-white/5 rounded-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white font-mono shadow-xl mb-4 border border-white/20">
                {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() || "U"}
              </div>
              <p className="text-base font-bold text-slate-200 text-center truncate w-full">{displayName || "Anonymous Professional"}</p>
              <p className="text-[10px] font-mono text-slate-500 text-center mt-1 truncate w-full">{user?.email || "Anonymous Guest Account"}</p>
            </div>
            
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>Your workspace is secured with End-to-End Firebase Identity controls.</p>
              <p>Changes made here are instantly synchronized across your career profile, optimization tools, and AI assessors.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Settings Actions */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section 1: Display Details */}
          <section className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">Personal Details</h3>
                <p className="text-[11px] text-slate-500">Update how you appear across resumes and interview modules</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#050608] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition duration-200"
                  placeholder="Enter your professional name"
                />
              </div>

              {profileError && (
                <div className="flex items-center space-x-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center space-x-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Identity synchronized and saved successfully!</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-xl transition duration-200 flex items-center space-x-2"
                >
                  {loadingProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Section 2: Manage Linked Credentials / Conversion */}
          <section className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Linked Accounts</h3>
                  <p className="text-[11px] text-slate-500">Link authentication channels to protect and access career metadata</p>
                </div>
              </div>
              {isAnonymous && (
                <span className="px-2 py-0.5 text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded font-mono uppercase font-bold">
                  Guest Mode
                </span>
              )}
            </div>

            {/* If the account is anonymous, prompt them to convert/link to a standard account */}
            {isAnonymous ? (
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-4">
                <div className="flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-400">Save Your Progress Permanently!</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You are using a guest session. Register your email and password now to convert this session into a lifetime account. Your resumes, Ats assessments, and roadmap steps will automatically move to your new account.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLinkEmailPassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Register Email</label>
                    <input
                      type="email"
                      required
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      className="w-full bg-[#050608] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                      placeholder="name@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Setup Password</label>
                    <input
                      type="password"
                      required
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      className="w-full bg-[#050608] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  {linkError && (
                    <div className="col-span-1 sm:col-span-2 flex items-center space-x-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{linkError}</span>
                    </div>
                  )}

                  {linkSuccess && (
                    <div className="col-span-1 sm:col-span-2 flex items-center space-x-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Account upgraded and linked successfully! Use these credentials to log in next time.</span>
                    </div>
                  )}

                  <div className="col-span-1 sm:col-span-2 flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={linking}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition duration-200 flex items-center space-x-2"
                    >
                      {linking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Converting Account...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5" />
                          <span>Link Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 leading-relaxed">
                  You are signed in via password credential authentication. Your account data is secured with absolute multi-tenant database rules.
                </div>
                
                {/* List Providers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Email & Password Auth</p>
                        <p className="text-[10px] text-slate-500 font-mono">{user?.email}</p>
                      </div>
                    </div>
                    <span className="flex items-center space-x-1.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Linked</span>
                    </span>
                  </div>

                  {providers.some((p) => p.providerId === "google.com") ? (
                    <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.619 4.5 1.8l2.4-2.4C17.2 1.5 14.85.9 12.24.9c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.753 0 9.76-4.043 9.76-9.9 0-.6-.06-1.17-.16-1.715h-9.6z"/>
                        </svg>
                        <div>
                          <p className="text-xs font-bold text-slate-200">Google Account</p>
                          <p className="text-[10px] text-slate-500 font-mono">Linked social sign-in channel</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnlinkProvider("google.com")}
                        className="flex items-center space-x-1 text-[10px] text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-2.5 py-1 rounded-full transition duration-200"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl border-dashed">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.619 4.5 1.8l2.4-2.4C17.2 1.5 14.85.9 12.24.9c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.753 0 9.76-4.043 9.76-9.9 0-.6-.06-1.17-.16-1.715h-9.6z"/>
                        </svg>
                        <div>
                          <p className="text-xs font-bold text-slate-400">Google Account</p>
                          <p className="text-[10px] text-slate-600">Connect Google for quick one-click login</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLinkGoogle}
                        className="flex items-center space-x-1 text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 px-2.5 py-1 rounded-full transition duration-200"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Connect</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Reset Resume Data (Dangerous Action) */}
          <section className="bg-red-500/[0.01] border border-red-500/20 p-6 rounded-2xl space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">Reset Workspace Data</h3>
                <p className="text-[11px] text-slate-500">Purge and clean your uploaded resumes, analyses, and learning models</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <p>Purging your data will permanently delete:</p>
              <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-1">
                <li>Your uploaded resume file and its parsed structured data representation</li>
                <li>AI career rating score assessments and suggested improvements</li>
                <li>ATS profile optimization matches and learning suggestions</li>
                <li>Simulated interview performance score histories</li>
                <li>Your customized roadmap steps and career match recommendations</li>
              </ul>
              <p className="text-red-500 font-semibold pt-1">This operation is destructive and completely irreversible.</p>
            </div>

            {resetSuccess && (
              <div className="flex items-center space-x-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All workspace data purged successfully. Dashboard reset complete.</span>
              </div>
            )}

            {!showResetConfirm ? (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl transition duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Workspace Data</span>
                </button>
              </div>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-4">
                <div className="flex items-start space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-400">Extreme Warning: Final Deletion</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      To confirm deletion of your active resume profile, ATS ratings, and roadmaps, type <span className="font-bold text-white font-mono bg-white/10 px-1 py-0.5 rounded">DELETE ALL</span> in the field below.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full bg-[#050608] border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-200 placeholder-slate-700 focus:outline-none focus:border-red-500 transition font-mono uppercase font-semibold"
                    placeholder="Type DELETE ALL to purge"
                  />

                  {resetError && (
                    <div className="text-red-400 text-xs mt-1">
                      {resetError}
                    </div>
                  )}

                  <div className="flex space-x-3 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetConfirm(false);
                        setConfirmText("");
                        setResetError(null);
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={confirmText !== "DELETE ALL" || resetting}
                      onClick={handleResetData}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-xl transition duration-200 flex items-center space-x-1.5"
                    >
                      {resetting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Purging...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>Confirm Permanent Deletion</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
