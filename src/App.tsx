import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import SplashLoader from "./components/SplashLoader";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import AnalysisPage from "./pages/AnalysisPage";

export default function App() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [user, setUser] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Monitor auth changes for auto-login
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthChecking(true);
      if (firebaseUser) {
        // Build local user object
        const localUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Career Practitioner"
        };
        setUser(localUser);

        // Fetch latest resume from Firestore automatically
        try {
          const resumesRef = collection(db, "resumes");
          const q = query(resumesRef, where("userId", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          const list: any[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });

          if (list.length > 0) {
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setResume(list[0]);
          }
        } catch (error) {
          console.error("Failed to restore latest resume:", error);
        }

        // Direct authenticated users to workspace
        setCurrentPage("dashboard");
      } else {
        setUser(null);
        setResume(null);
        setCurrentPage("landing");
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setResume(null);
      setCurrentPage("landing");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser({
      uid: loggedInUser.uid,
      email: loggedInUser.email,
      displayName: loggedInUser.displayName || loggedInUser.email?.split("@")[0] || "Career Practitioner"
    });
  };

  const handleResumeUploadSuccess = (uploadedResume: any) => {
    setResume(uploadedResume);
  };

  if (!splashComplete) {
    return <SplashLoader onComplete={() => setSplashComplete(true)} />;
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Synchronizing profile auth...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      {currentPage === "landing" && (
        <LandingPage onNavigate={setCurrentPage} user={user} />
      )}
      {currentPage === "login" && (
        <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === "signup" && (
        <SignupPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === "dashboard" && user && (
        <DashboardPage
          user={user}
          resume={resume}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          onUpdateUser={(updatedUser: any) => setUser(updatedUser)}
          onResetResume={() => setResume(null)}
        />
      )}
      {currentPage === "upload" && user && (
        <ResumeUploadPage
          userId={user.uid}
          onUploadSuccess={handleResumeUploadSuccess}
          onNavigate={setCurrentPage}
        />
      )}
      {currentPage === "analysis" && user && (
        <AnalysisPage user={user} resume={resume} onNavigate={setCurrentPage} />
      )}
    </div>
  );
}
