import React, { useState } from "react";
import { LearningStyle } from "../types";
import { Brain, Sparkles, AlertCircle, Smile, BookOpen, Music, Users, Hammer, CheckCircle2 } from "lucide-react";

interface Props {
  onStyleDetected: (style: LearningStyle) => void;
  detectedStyle: LearningStyle | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "When explaining a complex academic topic to a friend, what is your go-to method?",
    options: [
      { text: "Drawing quick diagrams, maps, or sketches", scoreValue: "Visual" },
      { text: "Explaining it verbally with analogies or sounds", scoreValue: "Auditory" },
      { text: "Writing bulleted summaries or notes lists", scoreValue: "Reading/Writing" },
      { text: "Using hands-on items or role-playing the flow", scoreValue: "Kinesthetic" }
    ]
  },
  {
    id: 2,
    question: "You are preparing for an important upcoming science or code exam. How do you study?",
    options: [
      { text: "Color-coding mind maps and reading charts", scoreValue: "Visual" },
      { text: "Listening to study recordings or reading out loud", scoreValue: "Auditory" },
      { text: "Drafting summary sheets and answering written questions", scoreValue: "Reading/Writing" },
      { text: "Building models, debugging systems, or moving around", scoreValue: "Kinesthetic" }
    ]
  },
  {
    id: 3,
    question: "When you encounter a word or formula you don't recognize, what do you usually do?",
    options: [
      { text: "Look closely at its design, symbols, or spelling", scoreValue: "Visual" },
      { text: "Say it out loud and listen to its pronunciation", scoreValue: "Auditory" },
      { text: "Write it down repeatedly and search its dictionary definition", scoreValue: "Reading/Writing" },
      { text: "Use physical typing, context puzzles, or trace its letters", scoreValue: "Kinesthetic" }
    ]
  },
  {
    id: 4,
    question: "In what sort of class or workspace do you find yourself most engaged and focused?",
    options: [
      { text: "Classes with slide presentations, graphs, and live sketch boards", scoreValue: "Visual" },
      { text: "Socratic dialogs, verbal lectures, and open peer discussions", scoreValue: "Auditory" },
      { text: "Reading chapters quietly and writing critical essays", scoreValue: "Reading/Writing" },
      { text: "Lab experiments, design building, or field trips", scoreValue: "Kinesthetic" }
    ]
  }
];

export default function LearningStylePanel({ onStyleDetected, detectedStyle, loading, setLoading }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelectOption = (scoreValue: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentIdx].id]: scoreValue });
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const answersList = QUESTIONS.map(q => ({
      questionNo: q.id,
      selectedChoice: answers[q.id] || "Visual"
    }));

    try {
      const response = await fetch("/api/detect-learning-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersList }),
      });
      const data = await response.json();
      onStyleDetected(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIdx(0);
    // Let's clear in the parent by sending null to style state if parent supports it, but preserving history is good too
  };

  return (
    <div id="learning-style-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 heading-display">Learning Style Detection Agent</h2>
          <p className="text-sm text-slate-500">Uncover your custom sensory channels to accelerate comprehension</p>
        </div>
      </div>

      {!detectedStyle ? (
        <div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          <div className="mb-6">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Scenario {currentIdx + 1} of {QUESTIONS.length}
            </span>
            <h3 className="text-lg font-semibold text-slate-800 mt-1 mb-6 leading-snug">
              {QUESTIONS[currentIdx].question}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {QUESTIONS[currentIdx].options.map((opt, oIdx) => {
                const isSelected = answers[QUESTIONS[currentIdx].id] === opt.scoreValue;
                return (
                  <button
                    key={oIdx}
                    id={`ls-opt-${currentIdx}-${oIdx}`}
                    onClick={() => handleSelectOption(opt.scoreValue)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 capitalize">
                      {opt.scoreValue} Approach
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 border-t border-slate-100 pt-6">
            <button
              id="ls-back-btn"
              onClick={handleBack}
              disabled={currentIdx === 0}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentIdx === QUESTIONS.length - 1 && answers[QUESTIONS[currentIdx].id] ? (
              <button
                id="ls-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white font-medium text-sm rounded-2xl shadow-md flex items-center gap-2"
              >
                {loading ? "Analyzing sensory layers..." : "Analyze Learning Profile"}
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </button>
            ) : (
              <span className="text-xs text-slate-400">Select an option to advance</span>
            )}
          </div>
        </div>
      ) : (
        <div id="ls-style-results" className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                PRIMARY STYLE: {detectedStyle.primaryStyle.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-indigo-600 font-semibold">{detectedStyle.customMotto}</span>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed">
              {detectedStyle.tactileCharacteristics}
            </p>
          </div>

          {/* Ratios Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Your Cognitive Style Ratios</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Visual
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">{detectedStyle.visualRatio || 50}%</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${detectedStyle.visualRatio || 50}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Auditory
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">{detectedStyle.auditoryRatio || 25}%</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${detectedStyle.auditoryRatio || 25}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span> Read / Write
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">{detectedStyle.readingWritingRatio || 15}%</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${detectedStyle.readingWritingRatio || 15}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Kinesthetic
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">{detectedStyle.kinestheticRatio || 10}%</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${detectedStyle.kinestheticRatio || 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Hacks */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tactical Action Learning Hacks</h4>
            <div className="space-y-2">
              {detectedStyle.learningHacks?.map((hack, k) => (
                <div key={k} className="flex gap-2.5 items-start p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 leading-relaxed">{hack}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              id="ls-retake-btn"
              onClick={handleRetake}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              Reset Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
