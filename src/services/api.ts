export class ApiService {
  private static getBaseUrl() {
    // In our container sandbox, port 3000 is directly reverse-proxied
    return "";
  }

  static async registerUser(uid: string, email: string, displayName?: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email, displayName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to register profile");
    }
    return res.json();
  }

  static async loginUser(uid: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to retrieve user profile");
    }
    return res.json();
  }

  static async getProfile(uid: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/auth/me?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load user profile");
    }
    return res.json();
  }

  static async uploadResume(userId: string, fileName: string, content: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/resumes/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fileName, content })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to parse and upload resume");
    }
    return res.json();
  }

  static async analyzeQuality(resumeId: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/analysis/quality/${resumeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Quality analysis failed");
    }
    return res.json();
  }

  static async getAtsScore(resumeId: string, jobDescription: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/analysis/ats-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, jobDescription, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "ATS evaluation failed");
    }
    return res.json();
  }

  static async matchJobs(resumeId: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/jobs/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Job matching failed");
    }
    return res.json();
  }

  static async getTopMatches(userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/jobs/top-matches?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to retrieve top job matches");
    }
    return res.json();
  }

  static async analyzeSkillGaps(resumeId: string, targetRole: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/skills/gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, targetRole, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Skill gap analysis failed");
    }
    return res.json();
  }

  static async getLearningRoadmap(assessmentId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/skills/learning-roadmap/${assessmentId}`, {
      method: "POST"
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load learning roadmap");
    }
    return res.json();
  }

  static async getCareerRoadmaps(userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/career-roadmap/all?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load career roadmaps");
    }
    return res.json();
  }

  static async generateCareerRoadmap(resumeId: string, targetPath: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/career-roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, targetPath, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate career path roadmap");
    }
    return res.json();
  }

  static async getInterviewQuestions(resumeId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/interview/questions?resumeId=${encodeURIComponent(resumeId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate interview questions");
    }
    return res.json();
  }

  static async evaluateInterviewAnswer(questionText: string, expectedPoints: string[], userAnswer: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText, expectedPoints, userAnswer })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to evaluate interview answer");
    }
    return res.json();
  }

  static async predictHiringProbability(resumeId: string, jobTitle: string, company: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/hiring/probability/${resumeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, company, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Hiring probability prediction failed");
    }
    return res.json();
  }

  static async matchOpportunities(resumeId: string, userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/opportunities/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Opportunities matching failed");
    }
    return res.json();
  }

  static async getLatestOpportunities(userId: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/opportunities/latest?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to retrieve recommended opportunities");
    }
    return res.json();
  }

  static async getAllOpportunities() {
    const res = await fetch(`${this.getBaseUrl()}/api/opportunities/all`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to retrieve raw opportunities database");
    }
    return res.json();
  }

  static async getPlatformStats() {
    const res = await fetch(`${this.getBaseUrl()}/api/stats`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to retrieve platform statistics");
    }
    return res.json();
  }

  static async updateProfile(uid: string, displayName: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/profile/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, displayName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update profile");
    }
    return res.json();
  }

  static async resetResumeData(uid: string) {
    const res = await fetch(`${this.getBaseUrl()}/api/profile/reset-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to reset resume data");
    }
    return res.json();
  }
}
