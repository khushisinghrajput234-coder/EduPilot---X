import React, { useState, useRef, useEffect } from "react";
import { StudentAnalysis, StudentProfile, CustomSubject } from "../types";
import { 
  Upload, FileText, AlertTriangle, ChartBar, Star, Award, 
  TrendingUp, Sparkles, CheckCircle, Plus, Trash2, Calendar, 
  Clock, Info, BookOpen, ChevronRight, Gauge, HelpCircle, Shuffle
} from "lucide-react";

interface Props {
  onAnalysisComplete: (analysis: StudentAnalysis) => void;
  analysis: StudentAnalysis | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
}

const SAMPLE_CSV = `Subject,Score,Attendance,ExamDate,LearningBehaviorScore
Mathematics,65,72%,2026-06-25,Focused but struggles with graph formulas
Science,58,74%,2026-06-28,Often distracted during lab activities
English,82,92%,2026-06-30,Superb reading speed and essay structures
History,70,80%,2026-07-02,Fair chronological memory, needs flashcards
Computer Science,91,95%,2026-07-05,Very eager to program, constructs logic quickly`;

// Pool of rich, specified random subjects with behavioral observations for suggestions
const SUGGESTED_SUBJECTS_POOL = [
  { name: "Quantum Mechanics", score: 68, attendance: 75, dateOffset: 12, behavior: "Inquisitive but struggles with wave-particle dual matrix derivations" },
  { name: "Macroeconomics", score: 82, attendance: 90, dateOffset: 15, behavior: "Strong comprehension of monetary policies & inflation graphs" },
  { name: "Organic Chemistry II", score: 55, attendance: 70, dateOffset: 8, behavior: "Struggles to map complex molecular bonding pathways visual structures" },
  { name: "Advanced Astrophysics", score: 92, attendance: 97, dateOffset: 25, behavior: "Exceptional speed resolving stellar evolution systems" },
  { name: "Cognitive Psychology", score: 74, attendance: 82, dateOffset: 14, behavior: "Understands modular brain structures well, needs flashcard retrieval" },
  { name: "Game Theory & Strategy", score: 60, attendance: 78, dateOffset: 18, behavior: "Needs extra simulation problems on Nash Equilibrium algorithms" },
  { name: "AI & Neural Networks", score: 88, attendance: 95, dateOffset: 5, behavior: "Extremely motivated with deep learning structures" },
  { name: "Medieval Philosophy", score: 71, attendance: 85, dateOffset: 20, behavior: "Enjoys scholastic debates, verbose writing prose" },
  { name: "Marine Ecology", score: 79, attendance: 88, dateOffset: 10, behavior: "Good understanding of food webs and biological niches" },
  { name: "Cellular Biochemistry", score: 63, attendance: 72, dateOffset: 9, behavior: "Struggles with ATP cycle formulas, missing lab lessons" },
  { name: "Creative Writing Workshop", score: 95, attendance: 100, dateOffset: 22, behavior: "Remarkable narrative rhythm and literary structure" },
  { name: "Venture Capital Finance", score: 80, attendance: 84, dateOffset: 16, behavior: "Understands startup cap table math, needs Excel practice" }
];

// High energy quick-chips list
const SUGGESTED_QUICK_CHIPS = [
  "Artificial Intelligence",
  "Biochemistry",
  "Macroeconomics",
  "Quantum Mechanics",
  "Creative Writing"
];

export default function PerformanceAnalyzer({
  onAnalysisComplete,
  analysis,
  loading,
  setLoading,
  profile,
  setProfile
}: Props) {
  const [csvText, setCsvText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Tab control: config (Configurator), granular (Subject Breakdown), ai_dossier (Summary Analysis Report), impact (Impact Dashboard), wellbeing (Wellbeing Dashboard)
  const [viewTab, setViewTab] = useState<"config" | "granular" | "ai_dossier" | "impact" | "wellbeing">("config");
  const [mode, setMode] = useState<"form" | "csv">("form");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Impact Dashboard States
  const [studyMultiplier, setStudyMultiplier] = useState<number>(1.2); 
  const [focusHoursPerDay, setFocusHoursPerDay] = useState<number>(3); 
  const [activeTechnique, setActiveTechnique] = useState<"feynman" | "pomodoro" | "spaced">("pomodoro");
  const [hasVisualOrganizers, setHasVisualOrganizers] = useState<boolean>(true);
  const [hasConfidenceMultiplier, setHasConfidenceMultiplier] = useState<boolean>(false);

  // Interactive Wellbeing Dashboard States
  const [sleepHours, setSleepHours] = useState<number>(7.5); 
  const [studyBreakMins, setStudyBreakMins] = useState<number>(15); 
  const [academicStress, setAcademicStress] = useState<number>(4); 
  const [dailyMood, setDailyMood] = useState<"focused" | "tired" | "inspired" | "overwhelmed">("focused");
  const [screenTimeGaze, setScreenTimeGaze] = useState<number>(5.5);

  // Dynamic Add Subject state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newScore, setNewScore] = useState(75);
  const [newAttendance, setNewAttendance] = useState(85);
  const [newExamDate, setNewExamDate] = useState("2026-07-10");
  const [newBehavior, setNewBehavior] = useState("");

  const activeSubjects = profile.subjects || [];
  
  // Selected subjective breakdown tab tracking
  const [selectedSubId, setSelectedSubId] = useState<string>("");

  // Automatically select the first subject on load if nothing is selected yet
  useEffect(() => {
    if (activeSubjects.length > 0 && !selectedSubId) {
      setSelectedSubId(activeSubjects[0].id);
    }
  }, [activeSubjects, selectedSubId]);

  // Adjust view tab to AI Dossier automatically when results arrive
  useEffect(() => {
    if (analysis) {
      setViewTab("ai_dossier");
    }
  }, [analysis]);

  const handleProfileChange = (key: keyof StudentProfile, value: any) => {
    setProfile({ ...profile, [key]: value });
  };

  const executeAnalysis = async (dataPayload: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze-academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPayload),
      });
      const data = await response.json();
      onAnalysisComplete(data);
    } catch (error) {
      console.error("Analysis failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis({ studentProfile: profile });
  };

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    executeAnalysis({ csvData: csvText, studentProfile: { name: profile.name, subjects: profile.subjects } });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setMode("csv");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  };

  const loadSampleCSV = () => {
    setCsvText(SAMPLE_CSV);
    setMode("csv");
  };

  // Preset chip selection trigger
  const handleQuickChipClick = (chipName: string) => {
    setNewSubjectName(chipName);
    const match = SUGGESTED_SUBJECTS_POOL.find(s => s.name.toLowerCase().includes(chipName.toLowerCase()));
    if (match) {
      setNewScore(match.score);
      setNewAttendance(match.attendance);
      setNewBehavior(match.behavior);
    }
  };

  // Suggest a fully random subject helper
  const handleGenerateRandomSubject = () => {
    const randomIndex = Math.floor(Math.random() * SUGGESTED_SUBJECTS_POOL.length);
    const preset = SUGGESTED_SUBJECTS_POOL[randomIndex];

    setNewSubjectName(preset.name);
    setNewScore(preset.score);
    setNewAttendance(preset.attendance);
    setNewBehavior(preset.behavior);

    // Dynamic date offset within next 30 days
    const tempDate = new Date("2026-06-20");
    tempDate.setDate(tempDate.getDate() + preset.dateOffset);
    setNewExamDate(tempDate.toISOString().split("T")[0]);
  };

  // Dynamic Subject Add / Edit handlers
  const addNewSubject = () => {
    if (!newSubjectName.trim()) return;
    
    const newSub: CustomSubject = {
      id: Date.now().toString(),
      subject: newSubjectName.trim(),
      score: Number(newScore),
      attendance: Number(newAttendance),
      examDate: newExamDate,
      behavior: newBehavior.trim() || "Attentive in class and learns fast"
    };

    const nextSubjects = [...activeSubjects, newSub];
    setProfile({
      ...profile,
      subjects: nextSubjects
    });

    // Auto-select the newly added subject as active
    setSelectedSubId(newSub.id);

    // Reset fields
    setNewSubjectName("");
    setNewScore(75);
    setNewAttendance(85);
    setNewBehavior("");
    setShowAddForm(false);
  };

  const deleteSubject = (id: string) => {
    const nextSubjects = activeSubjects.filter(sub => sub.id !== id);
    setProfile({
      ...profile,
      subjects: nextSubjects
    });
    if (selectedSubId === id && nextSubjects.length > 0) {
      setSelectedSubId(nextSubjects[0].id);
    }
  };

  const updateSubjectField = (id: string, field: keyof CustomSubject, value: any) => {
    setProfile({
      ...profile,
      subjects: activeSubjects.map(sub => 
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    });
  };

  // Date Countdown helpers
  const getDaysRemaining = (dateString: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const current = new Date("2026-06-20"); // Normalized current date from metadata
    const diffTime = target.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatExamDate = (dateString: string) => {
    if (!dateString) return "Not Scheduled";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(parts[1]) - 1;
    return `${parts[2]} ${months[monthIndex] || parts[1]}, ${parts[0]}`;
  };

  // Map active selection
  const currentSubId = activeSubjects.some(s => s.id === selectedSubId) 
    ? selectedSubId 
    : (activeSubjects[0]?.id || "");
  
  const currentSubjectObj = activeSubjects.find(s => s.id === currentSubId);

  // SVG Chart component
  const SvgSubjectChart = ({ score, attendance, subjectName }: { score: number, attendance: number, subjectName: string }) => {
    const mapY = (val: number) => 190 - (val * 1.5);
    
    const hScore = score * 1.5;
    const hAtt = attendance * 1.5;
    const hAvg = 70 * 1.5;
    
    // Maximized prospective capability
    const projectedMax = Math.min(100, Math.round(score + (100 - attendance) * 0.45));
    
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono font-black text-slate-300 uppercase tracking-widest">Growth Sim Engine</span>
        </div>
        
        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-6 font-display flex items-center gap-2">
          <ChartBar className="w-4 h-4 text-indigo-400" />
          <span>Metric Trajectory Model: Map & Potential Cap</span>
        </h4>
        
        <div className="relative">
          <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Horizontal Grid lines */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = mapY(level);
              return (
                <g key={level}>
                  <line x1="50" y1={y} x2="450" y2={y} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                  <text x="25" y={y + 4} className="text-[10px] font-mono fill-slate-500 font-black" textAnchor="end">{level}%</text>
                </g>
              );
            })}
            
            {/* Chart Axes */}
            <line x1="50" y1="190" x2="450" y2="190" stroke="#475569" strokeWidth="1.5" />
            
            {/* Bar 1: Score */}
            <rect
              x="100"
              y={mapY(score)}
              width="45"
              height={hScore}
              fill="url(#scoreGrad)"
              rx="6"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
            />
            <text x="122.5" y={mapY(score) - 8} className="text-[10.5px] font-mono font-black fill-indigo-300" textAnchor="middle">{score}%</text>
            
            {/* Bar 2: Attendance */}
            <rect
              x="195"
              y={mapY(attendance)}
              width="45"
              height={hAtt}
              fill="url(#attGrad)"
              rx="6"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
            />
            <text x="217.5" y={mapY(attendance) - 8} className="text-[10.5px] font-mono font-black fill-rose-300" textAnchor="middle">{attendance}%</text>
            
            {/* Bar 3: regional Class Average */}
            <rect
              x="290"
              y={mapY(70)}
              width="45"
              height={hAvg}
              fill="url(#avgGrad)"
              rx="6"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
            />
            <text x="312.5" y={mapY(70) - 8} className="text-[10.5px] font-mono font-black fill-slate-300" textAnchor="middle">70%</text>
            
            {/* Dotted path representing projected performance curve */}
            <path
              d={`M 122.5,${mapY(score)} C 217.5,${mapY(score + (100-attendance)*0.2)} 312.5,${mapY(projectedMax-4)} 390,${mapY(projectedMax)}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              filter="url(#glow-emerald)"
            />
            
            {/* Target projected final coordinate marker */}
            <circle cx="390" cy={mapY(projectedMax)} r="5.5" fill="#10b981" filter="url(#glow-emerald)" />
            <text x="398" y={mapY(projectedMax) + 4} className="text-[10px] font-mono font-extrabold fill-emerald-400">
              ⚡ Cap: {projectedMax}%
            </text>
            
            {/* Axis Label definitions */}
            <text x="122.5" y="210" className="text-[10px] font-black fill-slate-400" textAnchor="middle">Course Score</text>
            <text x="217.5" y="210" className="text-[10px] font-black fill-slate-400" textAnchor="middle">Attendance</text>
            <text x="312.5" y="210" className="text-[10px] font-black fill-slate-400" textAnchor="middle">Batch Bench</text>
            <text x="390" y="210" className="text-[10px] font-black fill-slate-400" textAnchor="middle">Optimum Potential</text>
          </svg>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-sm"></span> Score
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-sm"></span> Attendance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-slate-500 rounded-sm"></span> Region Avg
            </span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#10b981] rounded-full"></span> Predicted score Cap with 95% attendance presence
          </span>
        </div>
      </div>
    );
  };

  return (
    <div id="performance-analyzer-card" className="bg-[#0e162d]/90 rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 glow-card">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-2xl shadow-md border border-indigo-900/50">
            <ChartBar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white heading-display">Academic Performance Command</h2>
            <p className="text-xs text-slate-400 font-medium font-sans">Configure subjects, view visual models, and monitor milestones</p>
          </div>
        </div>
        
        {/* Dynamic Selector Modes */}
        {viewTab === "config" && (
          <div className="flex bg-[#080d19] p-1 rounded-xl border border-slate-800">
            <button
              id="analyzer-mode-form"
              type="button"
              onClick={() => setMode("form")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "form" ? "bg-indigo-650 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Form Profile
            </button>
            <button
              id="analyzer-mode-csv"
              type="button"
              onClick={() => setMode("csv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "csv" ? "bg-indigo-650 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Upload CSV
            </button>
          </div>
        )}
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto scroller-hidden pb-1">
        <button
          id="analyzer-tab-config"
          type="button"
          onClick={() => setViewTab("config")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all relative border-b-2 shrink-0 ${
            viewTab === "config"
              ? "text-indigo-400 border-indigo-400 font-black"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          ⚙️ Curriculum Configurator
        </button>
        <button
          id="analyzer-tab-granular"
          type="button"
          onClick={() => setViewTab("granular")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all relative border-b-2 shrink-0 ${
            viewTab === "granular"
              ? "text-indigo-400 border-indigo-400 font-black"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          🔍 Subject Deep-Dive
        </button>
        <button
          id="analyzer-tab-impact"
          type="button"
          onClick={() => setViewTab("impact")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all relative border-b-2 shrink-0 ${
            viewTab === "impact"
              ? "text-indigo-400 border-indigo-400 font-black"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          💡 Impact Multiplier
        </button>
        <button
          id="analyzer-tab-wellbeing"
          type="button"
          onClick={() => setViewTab("wellbeing")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all relative border-b-2 shrink-0 ${
            viewTab === "wellbeing"
              ? "text-indigo-400 border-indigo-400 font-black"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          🌱 Stress & Wellbeing
        </button>
        {analysis && (
          <button
            id="analyzer-tab-aidossier"
            type="button"
            onClick={() => setViewTab("ai_dossier")}
            className={`pb-3 px-4 text-xs font-extrabold transition-all relative border-b-2 shrink-0 ${
              viewTab === "ai_dossier"
                ? "text-indigo-400 border-indigo-400 font-black"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            🔬 AI Diagnostic Dossier
          </button>
        )}
      </div>

      {/* RENDER VIEW 1: CURRICULUM CONFIGURATOR */}
      {viewTab === "config" && (
        <div className="space-y-6">
          {mode === "form" ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Target Student Name</label>
                  <input
                    id="student-name-input"
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    placeholder="Ex. Alex Mercer"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50 text-xs text-slate-800 transition-all font-bold"
                  />
                </div>

                {/* Dynamic Subjects List */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Dynamic Student Curriculum ({activeSubjects.length})</span>
                    <button
                      id="add-custom-subject-toggle"
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Subject
                    </button>
                  </div>

                  {/* Add Custom Subject Drawer inside form */}
                  {showAddForm && (
                    <div id="add-subject-modal-panel" className="bg-slate-50/50 p-5 rounded-2xl border-2 border-dashed border-indigo-100 space-y-4 animate-fade-in">
                      
                      {/* Premium suggestions block as requested! */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">Academic Choice Recommendations</span>
                          <button
                            id="randomize-subject-values-btn"
                            type="button"
                            onClick={handleGenerateRandomSubject}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-100/50 px-2.5 py-1 rounded-lg"
                          >
                            <Shuffle className="w-3 h-3 text-indigo-500" />
                            🎲 Auto-Generate Random Subject Projections
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTED_QUICK_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleQuickChipClick(chip)}
                              className="text-[10px] bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 px-3 py-1 rounded-full transition-all font-bold shadow-2xs"
                            >
                              💡 {chip}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">💡 You can click suggestions to auto-fill or enter any random custom subject in the field below.</p>
                      </div>

                      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 uppercase">Subject Name</label>
                          <input
                            id="new-sub-name-input"
                            type="text"
                            required
                            placeholder="e.g. Astrophysics, Artificial Intelligence"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase">Score (0-100)</label>
                          <input
                            id="new-sub-score-input"
                            type="number"
                            min="0"
                            max="100"
                            value={newScore}
                            onChange={(e) => setNewScore(Number(e.target.value) || 0)}
                            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase">Attendance %</label>
                          <input
                            id="new-sub-attendance-input"
                            type="number"
                            min="0"
                            max="100"
                            value={newAttendance}
                            onChange={(e) => setNewAttendance(Number(e.target.value) || 0)}
                            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase">Examination Target Date</label>
                          <input
                            id="new-sub-examdate-input"
                            type="date"
                            value={newExamDate}
                            onChange={(e) => setNewExamDate(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase">Observations / Notes</label>
                          <input
                            id="new-sub-behavior-input"
                            type="text"
                            placeholder="Behavior observation notes, weak points..."
                            value={newBehavior}
                            onChange={(e) => setNewBehavior(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          id="save-new-subject-btn"
                          type="button"
                          onClick={addNewSubject}
                          disabled={!newSubjectName.trim()}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white text-xs font-black rounded-xl transition-all shadow-md"
                        >
                          Save Subject
                        </button>
                        <button
                          id="cancel-new-subject-btn"
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dynamic curriculum list rendering */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubjects.length === 0 ? (
                      <div className="md:col-span-2 text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <span className="text-xs text-slate-400 italic font-bold">No academic subjects configured. Click "Add Custom Subject" above!</span>
                      </div>
                    ) : (
                      activeSubjects.map((sub) => (
                        <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                          <div className="flex justify-between items-center pr-8">
                            <span className="text-xs font-black text-slate-900">📖 {sub.subject}</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Configured Match</span>
                          </div>

                          <button
                            title="Remove Subject"
                            type="button"
                            onClick={() => deleteSubject(sub.id)}
                            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">Score (0-100)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={sub.score}
                                onChange={(e) => updateSubjectField(sub.id, "score", parseInt(e.target.value) || 0)}
                                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">Attendance %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={sub.attendance}
                                onChange={(e) => updateSubjectField(sub.id, "attendance", parseInt(e.target.value) || 0)}
                                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">Exam Date / Target Deadline</label>
                              <input
                                type="date"
                                value={sub.examDate}
                                onChange={(e) => updateSubjectField(sub.id, "examDate", e.target.value)}
                                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">Weakness observation parameter</label>
                              <input
                                type="text"
                                value={sub.behavior}
                                onChange={(e) => updateSubjectField(sub.id, "behavior", e.target.value)}
                                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-bold focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  id="analyze-run-form"
                  type="submit"
                  disabled={loading || activeSubjects.length === 0}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  {loading ? "Analyzing parameters..." : "Execute Deep Academic Analysis"}
                  <Sparkles className="w-4 h-4 text-amber-200 fill-indigo-500" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCsvSubmit} className="space-y-6">
              <div
                id="csv-drag-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400">
                    <Upload className="w-6 h-6 text-indigo-500 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">Drag & drop student CSV records file here</p>
                    <p className="text-xs text-slate-400 mt-1">or click to browse local files (supports standard headers)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">CSV Raw Content</label>
                  <button
                    id="load-sample-csv"
                    type="button"
                    onClick={loadSampleCSV}
                    className="text-xs text-rose-650 font-black hover:underline"
                  >
                    Use Template Example
                  </button>
                </div>
                <textarea
                  id="csv-textarea-input"
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Subject,Score,Attendance,ExamDate,LearningBehaviorScore&#10;Mathematics,75,80%,2026-06-25,Inconsistent but clever"
                  className="w-full p-4 rounded-2xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-800 transition-all leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="analyze-run-csv"
                  type="submit"
                  disabled={loading || !csvText.trim()}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  {loading ? "Parsing CSV files..." : "Upload & Analyze Records"}
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* RENDER VIEW 2: SUBJECT-BY-SUBJECT DEEP-DIVE SUB-VIEW */}
      {viewTab === "granular" && (
        <div className="space-y-6 animate-fade-in">
          {activeSubjects.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <span className="text-xs text-slate-400 italic font-bold">
                Please add or configure at least one academic subject in the "Curriculum Configurator" first to run visual simulations.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sidebar Selector list of configured subjects */}
              <div className="lg:col-span-4 space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Configured Curriculum</span>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {activeSubjects.map((sub) => (
                    <button
                      key={sub.id}
                      id={`granular-sub-tab-${sub.id}`}
                      type="button"
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-center justify-between gap-3 shrink-0 ${
                        currentSubId === sub.id
                          ? "bg-indigo-600 text-white border-transparent shadow-md font-bold"
                          : "bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base shrink-0">📖</span>
                        <div className="truncate">
                          <p className="font-extrabold truncate leading-snug">{sub.subject}</p>
                          <p className={`text-[10px] font-mono leading-none mt-1 ${currentSubId === sub.id ? "text-indigo-200" : "text-slate-400"}`}>
                            Score: {sub.score}% | Att: {sub.attendance}%
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${currentSubId === sub.id ? "translate-x-0.5" : "text-slate-400"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Main detailed dashboard stats for the selected subject */}
              {currentSubjectObj ? (
                <div id="granular-subject-details-panel" className="lg:col-span-8 space-y-6">
                  
                  {/* Subject Name title block */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest">Active Curriculum Deep-Dive</span>
                      <h3 className="text-xl font-bold font-display leading-tight mt-1">{currentSubjectObj.subject}</h3>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                      Exam Target Date: {formatExamDate(currentSubjectObj.examDate)}
                    </span>
                  </div>

                  {/* Top Stats Metric blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Gauge 1: Current Score */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Score</span>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-100 shrink-0">
                          {currentSubjectObj.score}%
                        </div>
                        <div>
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-block leading-none ${
                            currentSubjectObj.score >= 82 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : currentSubjectObj.score >= 65 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {currentSubjectObj.score >= 82 ? "Excellent" : currentSubjectObj.score >= 65 ? "Sound Performance" : "Needs Urgent Focus"}
                          </span>
                          <span className="block text-[10px] text-slate-405 mt-1 font-mono">Passing Grade Benchmark: 50%</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauge 2: Attendance Tracking */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lectures Presence</span>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center font-bold text-sm border border-rose-100 shrink-0">
                          {currentSubjectObj.attendance}%
                        </div>
                        <div>
                          {currentSubjectObj.attendance < 80 ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-block">
                              ⚠️ Bottleneck Alert
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                              ✅ Good Standings
                            </span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1.5 leading-none">
                            Missed: {Math.max(0, Math.round((100 - currentSubjectObj.attendance) / 4))} periods
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gauge 3: Calendar Sheet Deadlines */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Next Deadline</span>
                      <div className="flex items-center gap-3">
                        <div className="w-11 bg-rose-600 text-white rounded-lg shadowoverflow-hidden text-center shrink-0 border border-rose-700">
                          <p className="text-[8px] uppercase py-0.5 bg-rose-700 tracking-wider">Exam</p>
                          <p className="font-mono text-sm font-black py-0.5">{getDaysRemaining(currentSubjectObj.examDate) ?? "??"}</p>
                        </div>
                        <div>
                          {(() => {
                            const days = getDaysRemaining(currentSubjectObj.examDate);
                            if (days === null) return <span className="text-slate-400 text-xs italic">Unspecified</span>;
                            if (days < 0) return <span className="text-slate-450 font-bold text-xs text-rose-600 flex items-center gap-1">Overdue / Completed</span>;
                            if (days === 0) return <span className="text-amber-600 font-bold text-xs flex items-center gap-1 animate-pulse">⏰ TODAY</span>;
                            if (days === 1) return <span className="text-amber-600 font-bold text-xs">Tomorrow</span>;
                            return <span className="text-indigo-600 font-extrabold text-xs">In {days} days countdown</span>;
                          })()}
                          <p className="text-[10px] text-slate-450 font-mono mt-0.5 leading-tight">
                            {currentSubjectObj.examDate}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Render the SVG Interactive Chart representation */}
                  <SvgSubjectChart 
                    score={currentSubjectObj.score} 
                    attendance={currentSubjectObj.attendance} 
                    subjectName={currentSubjectObj.subject} 
                  />

                  {/* AI Advisor Panel matching selected subject */}
                  <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Dynamic Academic Advisory Directives</h4>
                        <p className="text-[10px] text-slate-400 leading-none">Custom directives compiled based on parameters</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reported Weakness / Obs Parameter</span>
                        <p className="p-3 bg-white border border-slate-150 rounded-xl text-xs text-slate-700 mt-1 font-medium italic">
                          " {currentSubjectObj.behavior} "
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide block">Tactical Recommended Checklist</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 shadow-2xs">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Implement visual diagrams mappings in daily reviews</span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 shadow-2xs">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Ensure lecture attendance remains &gt; 80% dynamically</span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 shadow-2xs">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Take customized practice reps on active milestones</span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 shadow-2xs">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Leverage autonomous flashcards before examination deadline</span>
                          </div>
                        </div>
                      </div>

                      {analysis && (
                        <div className="border-t border-indigo-100/50 pt-3">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Analyzed AI Remarks</span>
                          {(() => {
                            const analyzedMatch = analysis.subjects.find(
                              s => s.subject.toLowerCase() === currentSubjectObj.subject.toLowerCase()
                            );
                            if (analyzedMatch) {
                              return (
                                <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                                  {analyzedMatch.analysis}
                                </p>
                              );
                            }
                            return (
                              <p className="text-xs text-slate-500 italic mt-0.5">
                                AI has reviewed alternate subjects. If you recently modified subjects, run "Execute Deep Academic Analysis" again to refresh specialized remarks.
                              </p>
                            );
                          })()}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              ) : (
                <div className="lg:col-span-8 text-center py-6">
                  <p className="text-xs text-slate-400">Select another subject to display.</p>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW 3: AI DIAGNOSTIC DOSSIER SUMMARY */}
      {viewTab === "ai_dossier" && analysis && (
        <div id="analyzer-main-results" className="mt-2 space-y-6 animate-fade-in text-slate-800">
          
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Student</span>
              <h3 className="text-lg font-bold text-slate-800 leading-none mt-1">{analysis.studentName}</h3>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Attendance Ratio</span>
                <p className="text-base font-bold text-slate-800">{analysis.attendancePercentage}%</p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold self-center ${
                analysis.overallAttendanceRating === "Excellent"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {analysis.overallAttendanceRating}
              </span>
            </div>
          </div>

          {/* Gamified milestone badge */}
          {analysis.gamifiedLevel && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-white rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    EduPilot Gamified Milestone: Level {analysis.gamifiedLevel.level} Student
                  </h4>
                  <p className="text-xs text-slate-500">
                    Earned Badge: <strong className="text-amber-700 font-semibold">{analysis.gamifiedLevel.badgeSuggested}</strong>
                  </p>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xl">
                {analysis.gamifiedLevel.points} EXP PTS
              </span>
            </div>
          )}

          {/* Specific weak and strong pillars visual section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span>Identified Core Strengths</span>
              </div>
              <ul className="space-y-2">
                {analysis.strengths?.map((strength, sIdx) => (
                  <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/40 rounded-2xl border border-rose-100 p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Weak Areas requiring Focus</span>
              </div>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((weakness, wIdx) => (
                  <li key={wIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subjects scores and attendance cards lists */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-mono text-slate-500">Subject Performance Matrix</label>
            <div className="grid grid-cols-1 gap-3">
              {analysis.subjects?.map((sub, keyIdx) => (
                <div key={keyIdx} className="bg-slate-55 border border-slate-100 hover:border-slate-200 transition-all p-4 rounded-2xl bg-slate-50/70">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-800">{sub.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Score:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sub.score >= 80 ? "bg-emerald-100 text-emerald-800" : sub.score >= 65 ? "bg-indigo-100 text-indigo-800" : "bg-rose-100 text-rose-800"
                      }`}>{sub.score}%</span>
                      <span className="text-xs text-slate-400">Attendance:</span>
                      <span className="text-xs font-semibold text-slate-600 font-mono">{sub.attendance}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{sub.analysis}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-100/60 rounded-2xl border border-slate-100 p-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span>Metrics & Attendance Correlation Analysis</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {analysis.attendanceCorrelation}
            </p>
          </div>
        </div>
      )}

      {/* RENDER VIEW 4: IMPACT DASHBOARD */}
      {viewTab === "impact" && (() => {
        const averageGoalScore = activeSubjects.length > 0
          ? Math.round(activeSubjects.reduce((sum, s) => sum + s.score, 0) / activeSubjects.length)
          : 70;

        const techniqueFactor = activeTechnique === "feynman" ? 1.4 : activeTechnique === "spaced" ? 1.3 : 1.15;
        const compoundEfficiency = Math.min(100, Math.round((focusHoursPerDay * studyMultiplier * (hasVisualOrganizers ? 1.25 : 1.0) * techniqueFactor) * 10));
        const estimatedExpYield = Math.round(240 + (focusHoursPerDay * 30) * studyMultiplier + (hasConfidenceMultiplier ? 50 : 0));
        const projectedScoreBoost = Math.round((focusHoursPerDay * 1.5) + (studyMultiplier * 5) + (hasVisualOrganizers ? 3.5 : 0) + (activeTechnique === "feynman" ? 4 : 2));
        const finalProjectedTermScore = Math.min(100, averageGoalScore + projectedScoreBoost);

        return (
          <div className="space-y-6 animate-fade-in text-slate-100 font-sans">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest">Interactive Simulator</span>
                <h3 className="text-xl font-bold font-display leading-tight mt-1">⚡ Academic Impact & Multiplier Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1">Calibrate study parameters to predict simulated term projections, GPA boosters, and target EXP yield</p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping inline-block"></span>
                Interactive Engine Active
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Inputs Controller */}
              <div className="lg:col-span-6 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Study Engine Calibrator</h4>
                </div>

                {/* Slider 1: Focus Hours */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Focus Hours Per Day</label>
                    <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">{focusHoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={focusHoursPerDay}
                    onChange={(e) => setFocusHoursPerDay(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer animate-pulse-slow"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1 hr (Bare Min)</span>
                    <span>5 hrs (Aggressive)</span>
                    <span>10 hrs (Ultimate Elite)</span>
                  </div>
                </div>

                {/* Slider 2: Study Intentionality Multiplier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Active Recall Focus Multiplier</label>
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">{studyMultiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={studyMultiplier}
                    onChange={(e) => setStudyMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1.0x (Passive reading)</span>
                    <span>1.5x (Active recall)</span>
                    <span>2.0x (Hyper focus sprint)</span>
                  </div>
                </div>

                {/* Learning & Revision Techniques */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Active Learning Methodology</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "pomodoro", name: "Pomodoro Loop", factor: "1.15x", desc: "25m sprints", icon: "⏱️" },
                      { key: "spaced", name: "Spaced Retrieval", factor: "1.30x", desc: "Interval tests", icon: "🗓️" },
                      { key: "feynman", name: "Feynman Trick", factor: "1.40x", desc: "Teach concepts", icon: "🧠" }
                    ].map((tech) => (
                      <button
                        key={tech.key}
                        onClick={() => setActiveTechnique(tech.key as any)}
                        type="button"
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          activeTechnique === tech.key
                            ? "border-indigo-500 bg-indigo-950/40 shadow-xs text-white"
                            : "border-slate-800 bg-[#080d19]/60 text-slate-400 hover:border-slate-705"
                        }`}
                      >
                        <span className="text-sm block">{tech.icon}</span>
                        <p className="text-[11px] font-black mt-1">{tech.name}</p>
                        <p className="text-[9px] text-slate-505 mt-0.5">{tech.desc}</p>
                        <span className="text-[8px] font-mono mt-1 inline-block bg-indigo-950 text-indigo-400 px-1 py-0.5 rounded font-black">{tech.factor}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Aesthetic Optimization Hacks</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2 bg-[#080d19]/50 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                      <input
                        type="checkbox"
                        checked={hasVisualOrganizers}
                        onChange={(e) => setHasVisualOrganizers(e.target.checked)}
                        className="rounded accent-indigo-500 border-slate-800 bg-[#0a0f1d] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Inject Mind-Maps & Interactive Diagrams (+25% yield)</p>
                        <p className="text-[9.5px] text-slate-500">Helps visually synthesize hard equations and relationships</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-[#080d19]/50 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                      <input
                        type="checkbox"
                        checked={hasConfidenceMultiplier}
                        onChange={(e) => setHasConfidenceMultiplier(e.target.checked)}
                        className="rounded accent-indigo-500 border-slate-800 bg-[#0a0f1d] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Simulate Mentorship Confidence Multiplier (+50 bonus EXP)</p>
                        <p className="text-[9.5px] text-slate-500">Improves test performance and mitigates exam anxiety</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Simulation Outputs and Graph */}
              <div className="lg:col-span-6 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <div className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Simulation Projections</h4>
                  </div>

                  {/* Circular Dial / Progress representation inside responsive SVG */}
                  <div className="bg-[#080d19]/80 rounded-2xl p-4 border border-slate-800/60 flex items-center justify-around gap-4 flex-wrap">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#101827" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#6366f1"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - compoundEfficiency / 100)}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="text-center z-10">
                        <span className="text-xl font-black text-white block leading-none">{compoundEfficiency}%</span>
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider mt-1">Study Effort</span>
                      </div>
                    </div>

                    <div className="space-y-3 shrink-0">
                      <div>
                        <p className="text-[10px] text-slate-550 uppercase font-mono tracking-wider">Simulated exp velocity</p>
                        <p className="text-2xl font-black text-amber-400 flex items-center gap-1">
                          {estimatedExpYield} <span className="text-xs text-amber-500 font-bold">EXP / week</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-550 uppercase font-mono tracking-wider">Term score boost potential</p>
                        <p className="text-xl font-black text-emerald-400">
                          +{projectedScoreBoost}% Grade Point
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Curricular Projected GPA Target */}
                  <div className="bg-[#0c1328] p-4 rounded-xl border border-indigo-950/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Projected Term Score Indicator</span>
                      <span className="font-mono text-emerald-400 font-black">{finalProjectedTermScore}% / 100%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${finalProjectedTermScore}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5 font-sans">
                      Based on configured raw average ({averageGoalScore}%) combined with calibrated boost modifiers, the student is on track to earn a predicted **Level Up**.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-[10.5px] text-slate-400 italic font-mono flex items-start gap-2.5 leading-relaxed">
                  <span>💡</span>
                  <span>
                    <strong>Impact Recommendation:</strong> Your active learning methodology ({activeTechnique === "feynman" ? "Feynman Technique" : activeTechnique === "spaced" ? "Spaced Retrieval" : "Pomodoro Cycle"}) is highly resilient! Using visual organizers delivers excellent comprehension returns across your added subjects.
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER VIEW 5: WELLBEING DASHBOARD */}
      {viewTab === "wellbeing" && (() => {
        const burnoutMitigationRating = Math.max(10, Math.min(100, Math.round((sleepHours * 8.5) + (studyBreakMins * 1.2) - (academicStress * 5.5) - (screenTimeGaze * 3))));
        const dailyCognitiveCapacity = Math.max(10, Math.min(100, Math.round((sleepHours / 8) * 100 - (screenTimeGaze * 4) + (studyBreakMins * 0.5))));
        
        const stressZoneId = academicStress >= 7
          ? { label: "Severe Stress Strain - Risk of Burnout!", color: "text-rose-400 bg-rose-950/40 border-rose-900/50 fill-rose-955" }
          : academicStress >= 4
          ? { label: "Moderate student pressure - Balanced work advised", color: "text-amber-400 bg-amber-950/30 border-amber-900/40 fill-amber-955" }
          : { label: "Optimal Flow - Sound focus capability", color: "text-emerald-400 bg-emerald-950/30 border-emerald-900/40 fill-emerald-955" };

        const sleepTag = sleepHours >= 8.0
          ? "Exceptional restorative rest"
          : sleepHours >= 6.5
          ? "Marginal safety threshold"
          : "Severe cognitive fatigue risk! Needs immediate sleep.";

        return (
          <div className="space-y-6 animate-fade-in text-slate-100 font-sans">
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest">Self-Care Tracker</span>
                <h3 className="text-xl font-bold font-display leading-tight mt-1">🌱 Student School Wellbeing & Stress Command</h3>
                <p className="text-xs text-slate-400 mt-1">Calibrate lifestyle metrics, sleep intervals, stress indicators, and balance cognitive workloads</p>
              </div>
              <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-mono">
                🧠 Dynamic Biofeedback Active
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Lifestyle inputs */}
              <div className="lg:col-span-6 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-1.5 bg-rose-950 text-rose-400 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Bio-Mental Inputs</h4>
                </div>

                {/* Sleep Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Daily Sleep Duration</label>
                    <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">{sleepHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>4 hrs (Cognitive Crisis)</span>
                    <span>7.5 hrs (Minimal Safety)</span>
                    <span>10 hrs (Ultimate Rest)</span>
                  </div>
                </div>

                {/* Stress intensity metric */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Subjective Academic Pressure Level</label>
                    <span className="text-xs font-mono font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/40">{academicStress} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={academicStress}
                    onChange={(e) => setAcademicStress(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1 (Completely Chill)</span>
                    <span>5 (Manageable Push)</span>
                    <span>10 (Overwhelming strain)</span>
                  </div>
                </div>

                {/* Break Interval Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Periodic Study Breaks Duration</label>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-950/40">{studyBreakMins} mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="5"
                    value={studyBreakMins}
                    onChange={(e) => setStudyBreakMins(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 mins (No Break)</span>
                    <span>15 mins (Standard)</span>
                    <span>45 mins (Extended Recovery)</span>
                  </div>
                </div>

                {/* Emotional Focus Profile Cards */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Active Daily Cognitive Mood</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "focused", emoji: "🎯", label: "Focused" },
                      { key: "tired", emoji: "😴", label: "Fatigued" },
                      { key: "inspired", emoji: "✨", label: "Inspired" },
                      { key: "overwhelmed", emoji: "🤯", label: "Strained" }
                    ].map((mObj) => (
                      <button
                        key={mObj.key}
                        onClick={() => setDailyMood(mObj.key as any)}
                        type="button"
                        className={`p-2 rounded-xl border text-center transition-all ${
                          dailyMood === mObj.key
                            ? "border-rose-500 bg-rose-950/40 text-white"
                            : "border-slate-800 bg-[#080d19]/60 text-slate-400 hover:border-slate-805"
                        }`}
                      >
                        <span className="text-xl block">{mObj.emoji}</span>
                        <p className="text-[10px] font-bold mt-1">{mObj.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gaze fatigue screen hours */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Daily Screen-Time Exposure</label>
                    <span className="text-xs font-mono font-black text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">{screenTimeGaze} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="14.0"
                    step="0.5"
                    value={screenTimeGaze}
                    onChange={(e) => setScreenTimeGaze(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1 hr (Low Exposure)</span>
                    <span>6 hrs (Average)</span>
                    <span>14 hrs (Extreme Gaze Fatigue)</span>
                  </div>
                </div>
              </div>

              {/* Biofeedback Projections Summary */}
              <div className="lg:col-span-6 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <div className="p-1.5 bg-rose-950 text-rose-400 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Wellbeing Indicators</h4>
                  </div>

                  {/* Active stress warnings tag */}
                  <div className={`p-4 rounded-xl border text-[11px] font-bold flex items-center gap-2.5 leading-snug transition-all ${stressZoneId.color}`}>
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Simulated stress condition</p>
                      <p className="mt-0.5">{stressZoneId.label}</p>
                    </div>
                  </div>

                  {/* Sleep recovery report */}
                  <div className="p-4 bg-[#080d19]/80 rounded-xl border border-slate-800/60 text-xs text-slate-305 space-y-1.5 font-mono">
                    <p className="text-[9px] font-black uppercase text-slate-500 font-sans tracking-wide">Sleep Quotient evaluation</p>
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block border border-slate-600"></span>
                      {sleepTag} (Recorded {sleepHours} hrs)
                    </p>
                  </div>

                  {/* Burnout Mitigation progress bar */}
                  <div className="bg-[#0c1328] p-4 rounded-xl border border-indigo-950/60 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Burnout Safety Score Rating</span>
                      <span className={`font-mono font-black ${burnoutMitigationRating >= 70 ? 'text-emerald-400' : burnoutMitigationRating >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {burnoutMitigationRating}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-350 ${
                          burnoutMitigationRating >= 70 ? 'bg-emerald-500' : burnoutMitigationRating >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${burnoutMitigationRating}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-bold text-slate-300">Estimated Daily Cognitive Reserve</span>
                      <span className="font-mono text-sky-400 font-bold">{dailyCognitiveCapacity}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all duration-350"
                        style={{ width: `${dailyCognitiveCapacity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/10 rounded-xl border border-emerald-900/30 text-[10.5px] text-slate-400 italic font-mono flex items-start gap-2.5 leading-relaxed">
                  <span>💡</span>
                  <span>
                    <strong>Clinician Self-Care Recommendation:</strong> To minimize cognitive strain, secure at least 7.5 hours of sleep. Take regular {studyBreakMins} minute recovery breaks during strenuous study cycles. Reduce screen-time gaze exposure to avoid cerebral overload.
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
