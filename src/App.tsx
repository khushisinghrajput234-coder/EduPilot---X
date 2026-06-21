import React, { useState } from "react";
import { StudentProfile, StudentAnalysis, LearningStyle, StudyPlannerResponse, MentorAdvice, CareerGuidanceResponse } from "./types";
import PerformanceAnalyzer from "./components/PerformanceAnalyzer";
import LearningStylePanel from "./components/LearningStylePanel";
import StudyPlanner from "./components/StudyPlanner";
import AdaptiveQuiz from "./components/AdaptiveQuiz";
import MentorAdvisor from "./components/MentorAdvisor";
import CareerNavigator from "./components/CareerNavigator";
import Leaderboard from "./components/Leaderboard";
import SecurityConsole from "./components/SecurityConsole";
import AuthPage from "./components/AuthPage";
import { ShieldCheck, GraduationCap, Flame, Target, Star, BrainCircuit, Sparkles, Award, LogOut, User } from "lucide-react";

export default function App() {
  // Session authentication state
  const [currentUser, setCurrentUser] = useState<{name: string; email: string; dateOfBirth: string} | null>(() => {
    const saved = localStorage.getItem("active_student_session");
    return saved ? JSON.parse(saved) : null;
  });

  const getInitialProfileForUser = (userName: string, userEmail?: string, userDob?: string) => {
    const savedSubjects = localStorage.getItem(`profile_subjects_${userEmail || 'guest'}`);
    const initialSubjects = savedSubjects ? JSON.parse(savedSubjects) : [
      { id: "1", subject: "Mathematics", score: 62, attendance: 72, examDate: "2026-06-25", behavior: "Struggles with graphs but learns visual guides highly quickly" },
      { id: "2", subject: "Science", score: 58, attendance: 75, examDate: "2026-06-28", behavior: "Needs immediate lab demonstration maps" },
      { id: "3", subject: "English", score: 85, attendance: 95, examDate: "2026-06-30", behavior: "Fabulous textual speed" },
      { id: "4", subject: "History", score: 70, attendance: 80, examDate: "2026-07-02", behavior: "Good historical structures memory" },
      { id: "5", subject: "Computer Science", score: 90, attendance: 90, examDate: "2026-07-05", behavior: "Quick concept grabber, highly motivated" }
    ];

    return {
      name: userName,
      email: userEmail,
      dateOfBirth: userDob,
      subjects: initialSubjects,
      mathScore: 62, mathAttendance: 72, mathExamDate: "2026-06-25", mathBehavior: "Struggles with graphs but learns visual guides highly quickly",
      scienceScore: 58, scienceAttendance: 75, scienceExamDate: "2026-06-28", scienceBehavior: "Needs immediate lab demonstration maps",
      englishScore: 85, englishAttendance: 95, englishExamDate: "2026-06-30", englishBehavior: "Fabulous textual speed",
      historyScore: 70, historyAttendance: 80, historyExamDate: "2026-07-02", historyBehavior: "Good historical structures memory",
      csScore: 90, csAttendance: 90, csExamDate: "2026-07-05", csBehavior: "Quick concept grabber, highly motivated"
    };
  };

  // Profiles
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const savedSession = localStorage.getItem("active_student_session");
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      const savedSubjects = localStorage.getItem(`profile_subjects_${parsed.email}`);
      const initialSubjects = savedSubjects ? JSON.parse(savedSubjects) : [
        { id: "1", subject: "Mathematics", score: 62, attendance: 72, examDate: "2026-06-25", behavior: "Struggles with graphs but learns visual guides highly quickly" },
        { id: "2", subject: "Science", score: 58, attendance: 75, examDate: "2026-06-28", behavior: "Needs immediate lab demonstration maps" },
        { id: "3", subject: "English", score: 85, attendance: 95, examDate: "2026-06-30", behavior: "Fabulous textual speed" },
        { id: "4", subject: "History", score: 70, attendance: 80, examDate: "2026-07-02", behavior: "Good historical structures memory" },
        { id: "5", subject: "Computer Science", score: 90, attendance: 90, examDate: "2026-07-05", behavior: "Quick concept grabber, highly motivated" }
      ];
      return {
        name: parsed.name,
        email: parsed.email,
        dateOfBirth: parsed.dateOfBirth,
        subjects: initialSubjects,
        mathScore: 62, mathAttendance: 72, mathExamDate: "2026-06-25", mathBehavior: "Struggles with graphs but learns visual guides highly quickly",
        scienceScore: 58, scienceAttendance: 75, scienceExamDate: "2026-06-28", scienceBehavior: "Needs immediate lab demonstration maps",
        englishScore: 85, englishAttendance: 95, englishExamDate: "2026-06-30", englishBehavior: "Fabulous textual speed",
        historyScore: 70, historyAttendance: 80, historyExamDate: "2026-07-02", historyBehavior: "Good historical structures memory",
        csScore: 90, csAttendance: 90, csExamDate: "2026-07-05", csBehavior: "Quick concept grabber, highly motivated"
      };
    }
    return {
      name: "Alex Mercer",
      email: "khushisinghrajput234@gmail.com",
      dateOfBirth: "2005-04-12",
      subjects: [
        { id: "1", subject: "Mathematics", score: 62, attendance: 72, examDate: "2026-06-25", behavior: "Struggles with graphs but learns visual guides highly quickly" },
        { id: "2", subject: "Science", score: 58, attendance: 75, examDate: "2026-06-28", behavior: "Needs immediate lab demonstration maps" },
        { id: "3", subject: "English", score: 85, attendance: 95, examDate: "2026-06-30", behavior: "Fabulous textual speed" },
        { id: "4", subject: "History", score: 70, attendance: 80, examDate: "2026-07-02", behavior: "Good historical structures memory" },
        { id: "5", subject: "Computer Science", score: 90, attendance: 90, examDate: "2026-07-05", behavior: "Quick concept grabber, highly motivated" }
      ],
      mathScore: 62, mathAttendance: 72, mathExamDate: "2026-06-25", mathBehavior: "Struggles with graphs but learns visual guides highly quickly",
      scienceScore: 58, scienceAttendance: 75, scienceExamDate: "2026-06-28", scienceBehavior: "Needs immediate lab demonstration maps",
      englishScore: 85, englishAttendance: 95, englishExamDate: "2026-06-30", englishBehavior: "Fabulous textual speed",
      historyScore: 70, historyAttendance: 80, historyExamDate: "2026-07-02", historyBehavior: "Good historical structures memory",
      csScore: 90, csAttendance: 90, csExamDate: "2026-07-05", csBehavior: "Quick concept grabber, highly motivated"
    };
  });

  const handleSetProfile = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile.email) {
      localStorage.setItem(`profile_subjects_${updatedProfile.email}`, JSON.stringify(updatedProfile.subjects || []));
    }
  };

  const handleAuthSuccess = (userData: { name: string; email: string; dateOfBirth: string }) => {
    setCurrentUser(userData);
    localStorage.setItem("active_student_session", JSON.stringify(userData));
    const nextProfile = getInitialProfileForUser(userData.name, userData.email, userData.dateOfBirth);
    setProfile(nextProfile);
    setAnalysis(null);
    setLearningStyle(null);
    setStudyPlan(null);
    setMentorAdvice(null);
    setCareerGuidance(null);
    setActiveStep(1);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("active_student_session");
    setAnalysis(null);
    setLearningStyle(null);
    setStudyPlan(null);
    setMentorAdvice(null);
    setCareerGuidance(null);
  };

  // Agent response states
  const [analysis, setAnalysis] = useState<StudentAnalysis | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlannerResponse | null>(null);
  const [mentorAdvice, setMentorAdvice] = useState<MentorAdvice | null>(null);
  const [careerGuidance, setCareerGuidance] = useState<CareerGuidanceResponse | null>(null);

  // Dynamic EXP scores
  const [points, setPoints] = useState(240);

  // Load state tracking
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [styleLoading, setStyleLoading] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [careerLoading, setCareerLoading] = useState(false);

  // Current selected step
  const [activeStep, setActiveStep] = useState<number>(1);

  const handlePointsAwarded = (pts: number) => {
    setPoints(prev => prev + pts);
  };

  // Safe wrapping average calculator based on actual active subjects
  const subjectsPool = profile.subjects || [];
  const averageGoalScore = analysis
    ? Math.round(analysis.subjects.reduce((sum, s) => sum + s.score, 0) / (analysis.subjects.length || 1))
    : Math.round(subjectsPool.reduce((sum, s) => sum + s.score, 0) / (subjectsPool.length || 1));

  const level = Math.floor(points / 200) + 1;
  const currentLevelProgress = ((points % 200) / 200) * 100;

  // Render Auth page if no user session is present
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#070b14] pb-16 text-slate-100 animate-fade-in font-sans">
      {/* Dynamic Scoreboard Header Section */}
      <header id="edu-navbar" className="bg-[#0b1224]/85 border-b border-slate-800/80 sticky top-0 z-50 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md cursor-pointer hover:rotate-6 transition-all duration-300 glow-indigo">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
                EduPilot X
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full font-bold">Autonomous Multi-Agent</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Elevating academic potential through intelligent adaptation</p>
            </div>
          </div>

          {/* User profile details & Logout controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Logged Active Student</span>
              <span id="header-user-display" className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 justify-end">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                {currentUser.name}
              </span>
              {currentUser.dateOfBirth && (
                <span className="text-[9px] text-slate-500">DoB: {currentUser.dateOfBirth}</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Academic Level</span>
                <span className="text-xs font-black text-slate-100 heading-display">Level {level} Elite Scholar</span>
              </div>
              <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden relative border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentLevelProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-900/50 shadow-xs">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-950/30 animate-pulse" />
                <span className="font-mono text-xs font-black text-amber-400">{points} <span className="text-[9px] text-amber-500 font-bold">EXP</span></span>
              </div>
              
              {/* Logout Button */}
              <button
                id="header-logout-btn"
                title="Authenticate & Exit"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all border border-transparent hover:border-rose-900/50"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Stepwise Navigation Pipeline for 8 steps */}
        <div id="agent-roadmap-stepper" className="bg-[#0e162d]/90 rounded-3xl border border-slate-800 shadow-xl p-4 glow-card">
          <span className="block text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-3 px-2">Autonomous Student Pipeline Navigation</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { idx: 1, label: "Step 1: Academic Analysis", done: !!analysis },
              { idx: 2, label: "Step 2: Learning Style", done: !!learningStyle },
              { idx: 3, label: "Step 3: Study Roadmaps", done: !!studyPlan },
              { idx: 4, label: "Step 4: Practice Quizzes", done: true },
              { idx: 5, label: "Step 5: Resource & Tips", done: !!mentorAdvice },
              { idx: 6, label: "Step 6: Career Pathways", done: !!careerGuidance },
              { idx: 7, label: "Step 7: Class Leaderboard", done: true },
              { idx: 8, label: "Step 8: Security & Audit", done: true }
            ].map((st) => (
              <button
                key={st.idx}
                id={`stepper-tab-${st.idx}`}
                onClick={() => setActiveStep(st.idx)}
                className={`py-3 px-3 rounded-2xl text-left border text-xs transition-all relative overflow-hidden ${
                  activeStep === st.idx
                    ? "border-indigo-500 bg-indigo-950/50 text-white font-extrabold shadow-sm glow-indigo"
                    : st.done
                    ? "border-slate-800 bg-[#090d19]/60 text-slate-300 font-medium"
                    : "border-slate-900/60 bg-[#080c16]/50 hover:border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-mono font-bold ${activeStep === st.idx ? 'text-indigo-400' : 'text-slate-500'}`}>0{st.idx}</span>
                  {st.done && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block glow-emerald"></span>
                  )}
                </div>
                <span className="truncate block font-semibold text-[11px]">{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display cards mapping target Active Tab */}
        <div id="dynamic-workflow-panel" className="space-y-8">
          
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <PerformanceAnalyzer
                profile={profile}
                setProfile={handleSetProfile}
                analysis={analysis}
                onAnalysisComplete={setAnalysis}
                loading={analyzerLoading}
                setLoading={setAnalyzerLoading}
              />
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <LearningStylePanel
                detectedStyle={learningStyle}
                onStyleDetected={setLearningStyle}
                loading={styleLoading}
                setLoading={setStyleLoading}
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <StudyPlanner
                analysis={analysis}
                learningStyle={learningStyle?.primaryStyle || null}
                roadmapData={studyPlan}
                onRoadmapGenerated={setStudyPlan}
                loading={plannerLoading}
                setLoading={setPlannerLoading}
              />
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <AdaptiveQuiz
                subjects={analysis ? analysis.subjects.map(s => s.subject) : subjectsPool.map(s => s.subject)}
                learningStyle={learningStyle?.primaryStyle || null}
                onPointsAwarded={handlePointsAwarded}
                loading={quizLoading}
                setLoading={setQuizLoading}
              />
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <MentorAdvisor
                analysis={analysis}
                learningStyle={learningStyle?.primaryStyle || null}
                adviceData={mentorAdvice}
                onAdviceLoaded={setMentorAdvice}
                loading={mentorLoading}
                setLoading={setMentorLoading}
              />
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <CareerNavigator
                analysis={analysis}
                learningStyle={learningStyle?.primaryStyle || null}
                careerData={careerGuidance}
                onCareerLoaded={setCareerGuidance}
                loading={careerLoading}
                setLoading={setCareerLoading}
              />
            </div>
          )}

          {activeStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <Leaderboard
                currentStudentEXP={points}
                currentStudentName={profile.name}
              />
            </div>
          )}

          {activeStep === 8 && (
            <div className="space-y-6 animate-fade-in">
              <SecurityConsole
                currentUserEmail={currentUser.email}
              />
            </div>
          )}

        </div>

        {/* Global Action Plans Dashboard */}
        <div id="academic-roadmap-summary" className="bg-[#0e162d]/90 rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 glow-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-2xl border border-indigo-900/50">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white heading-display">EduPilot X Target Action Deck</h2>
              <p className="text-sm text-slate-400">Continuous progression checklist compiled across all agents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Performance Pillar summary */}
            <div className="bg-[#080d19]/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Performance Summary</span>
              <div>
                <span className="text-2xl font-black text-indigo-400 heading-display">{averageGoalScore}%</span>
                <span className="text-xs text-slate-400 block mt-0.5">Average student raw scores indicator</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis ? `Telemetry analysis shows ${currentUser.name} has custom parameters analyzed. Follow visual notes to optimize performance.` : `Configure subjects in Academic Analysis and click "Execute Deep Academic Analysis" to generate real-time metrics.`}
              </p>
            </div>

            {/* Weak spot tracker */}
            <div className="bg-[#080d19]/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Critical Weak Spots</span>
              <ul className="space-y-2">
                {analysis ? (
                  analysis.weaknesses.map((weak, wIdx) => (
                    <li key={wIdx} className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0 glow-rose"></span>
                      <span className="truncate">{weak}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="text-xs text-slate-500 italic">No diagnostic results computed yet.</li>
                    {subjectsPool.slice(0, 3).map((sub, sIdx) => (
                      <li key={sIdx} className="text-xs text-slate-400">
                        {sub.subject}: scored {sub.score}% (Presence: {sub.attendance}%)
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>

            {/* Action Roadmap */}
            <div className="bg-[#080d19]/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tactical Target Action Plan</span>
              <div className="space-y-2">
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Attend scheduled lessons consistently (&gt;85%).</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Utilize customized visual hacks & diagrams on weak formulas.</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Take at least 2 adaptive practice repetitions weekly to level up.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 text-center border-t border-slate-800/80 pt-8 max-w-7xl mx-auto px-4 text-xs text-slate-500">
        <p>&copy; 2026 EduPilot X Sandbox. Registered under active profile: {currentUser.email}. All rights reserved.</p>
      </footer>
    </div>
  );
}
