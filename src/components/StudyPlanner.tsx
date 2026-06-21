import React, { useState } from "react";
import { StudyPlannerResponse, StudentAnalysis, WeeklySchedule, StudyTask } from "../types";
import { Calendar, Clock, Sparkles, Sliders, ChevronRight, CheckSquare, Square, RefreshCcw, Award } from "lucide-react";

interface Props {
  analysis: StudentAnalysis | null;
  learningStyle: string | null;
  roadmapData: StudyPlannerResponse | null;
  onRoadmapGenerated: (roadmap: StudyPlannerResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlanner({
  analysis,
  learningStyle,
  roadmapData,
  onRoadmapGenerated,
  loading,
  setLoading
}: Props) {
  const [intensity, setIntensity] = useState<"Light" | "Medium" | "Hard">("Medium");
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const generatePlanner = async () => {
    if (!analysis) return;
    setLoading(true);

    const scoresMap = analysis.subjects.map(s => ({
      subject: s.subject,
      score: s.score
    }));

    try {
      const response = await fetch("/api/generate-roadmap-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: scoresMap,
          learningStyle: learningStyle || "Visual learner",
          intensity,
          examDates: (analysis.subjects || []).reduce((acc: Record<string, string>, s) => {
            acc[s.subject] = "2026-07-25";
            return acc;
          }, {})
        }),
      });
      const data = await response.json();
      onRoadmapGenerated(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (day: string, idx: number) => {
    const key = `${day}-${idx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div id="study-planner-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 heading-display">Study Planner Agent</h2>
            <p className="text-sm text-slate-500">Intelligent workload scheduling adapted to weak modules</p>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please run the <strong>Academic Analyzer Agent</strong> first to feed educational metrics into your adaptive scheduler.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Adaptive Constraints Config</span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">Style: {learningStyle || "Standard Visual"}</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded font-medium">Priority Focus: {analysis.weaknesses[0] || "Alert Areas"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Intensity:</label>
              <div className="flex bg-slate-200/60 p-1 rounded-xl">
                {(["Light", "Medium", "Hard"] as const).map(lev => (
                  <button
                    key={lev}
                    id={`intensity-set-${lev.toLowerCase()}`}
                    onClick={() => setIntensity(lev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      intensity === lev ? "bg-white text-violet-700 shadow" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {lev}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="generate-roadmap-btn"
              onClick={generatePlanner}
              disabled={loading}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {loading ? "Recomputing schedule..." : "Generate Custom Weekly Schedule"}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {roadmapData && (
            <div id="planner-schedule-views" className="space-y-6 animate-fade-in">
              {/* Custom Pomodoro matching style */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <span className="font-bold text-sm text-slate-800 heading-display">
                    Recommended Study Technique: {roadmapData.studyTechnique?.name}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focus ratio is set to <strong className="text-violet-800 font-mono">{roadmapData.studyTechnique?.ratio}</strong>. {roadmapData.studyTechnique?.instructions}
                </p>
              </div>

              {/* Subject roadmap phases */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Adaptive Roadmaps & Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmapData.roadmap?.map((phase, pIdx) => (
                    <div key={pIdx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-violet-600" />
                        <span className="font-bold text-sm text-slate-800">{phase.phase}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic">Target Metric: {phase.milestoneDescription}</p>
                      <ul className="space-y-1.5 pt-1">
                        {phase.actions?.map((act, aIdx) => (
                          <li key={aIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Calendar Slots List with checkboxes */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Your Weekly Study Timetable</h3>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                  {DAYS_OF_WEEK.map(day => {
                    const tasksForDay = roadmapData.schedule[day] || [];
                    return (
                      <div key={day} className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3 flex flex-col">
                        <span className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center">
                          <span>{day}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{tasksForDay.length} Slots</span>
                        </span>
                        
                        {tasksForDay.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic text-center py-4">No logged block cycles</span>
                        ) : (
                          <div className="space-y-2 flex-grow">
                            {tasksForDay.map((task, idx) => {
                              const uniqueKey = `${day}-${idx}`;
                              const isCompleted = completedTasks[uniqueKey];
                              return (
                                <div
                                  key={idx}
                                  id={`task-slot-${uniqueKey}`}
                                  className={`p-2.5 rounded-xl border text-left transition-all ${
                                    isCompleted
                                      ? "border-emerald-100 bg-emerald-50/40 opacity-70"
                                      : "border-slate-200/60 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-[10px] text-indigo-950 truncate max-w-[80px]">
                                      {task.subject}
                                    </span>
                                    <button
                                      id={`check-task-${uniqueKey}`}
                                      onClick={() => toggleTask(day, idx)}
                                      className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                                    >
                                      {isCompleted ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                    </button>
                                  </div>
                                  <p className={`text-[10px] text-slate-700 leading-tight mb-1.5 ${isCompleted ? 'line-through' : ''}`}>
                                    {task.topic}
                                  </p>
                                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                                    <span>{task.timeSlot}</span>
                                    <span>{task.duration}m</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
