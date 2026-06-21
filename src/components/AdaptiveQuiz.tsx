import React, { useState } from "react";
import { AdaptiveQuizResponse, QuizQuestion } from "../types";
import { CheckCircle, AlertTriangle, HelpCircle, Trophy, RefreshCcw, Sparkles, ChevronRight } from "lucide-react";

interface Props {
  subjects: string[];
  learningStyle: string | null;
  onPointsAwarded: (points: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function AdaptiveQuiz({
  subjects,
  learningStyle,
  onPointsAwarded,
  loading,
  setLoading
}: Props) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [quizData, setQuizData] = useState<AdaptiveQuizResponse | null>(null);
  
  // Active playing states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    setQuizData(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setCorrectCount(0);
    setQuizFinished(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          difficulty,
          learningStyle: learningStyle || "Visual"
        })
      });
      const data = await response.json();
      setQuizData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: number, oIdx: number) => {
    if (submittedAnswers[qId]) return; // locked
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: oIdx
    }));
  };

  const submitQuestion = (question: QuizQuestion) => {
    const selectedIdx = selectedAnswers[question.id];
    if (selectedIdx === undefined) return;

    setSubmittedAnswers(prev => ({
      ...prev,
      [question.id]: true
    }));

    const isCorrect = selectedIdx === question.correctOptionIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const advanceQuestion = () => {
    if (!quizData) return;
    if (currentIdx < quizData.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
      // Give points: let's say 20 points per correct answer!
      const points = correctCount * 20;
      onPointsAwarded(points);
    }
  };

  const restartQuizSelection = () => {
    setQuizData(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setCorrectCount(0);
    setQuizFinished(false);
  };

  const defaultSubjects = subjects.length > 0 ? subjects : ["Mathematics", "Science", "English", "History", "Computer Science"];

  return (
    <div id="adaptive-quiz-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 heading-display">Adaptive Quiz Agent</h2>
          <p className="text-sm text-slate-500">Practice questions built dynamically matching your capability thresholds</p>
        </div>
      </div>

      {!quizData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Target Subject</label>
              <select
                id="quiz-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 text-sm font-medium text-slate-700"
              >
                <option value="">-- Choose Subject --</option>
                {defaultSubjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Adaptive Difficulty</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(["Easy", "Medium", "Hard"] as const).map(diff => (
                  <button
                    key={diff}
                    id={`quiz-diff-${diff.toLowerCase()}`}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      difficulty === diff ? "bg-white text-amber-700 shadow" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              id="start-quiz-btn"
              onClick={startQuiz}
              disabled={loading || !selectedSubject}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-sm font-semibold rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? "Generating Quiz Questions..." : "Request Adaptive Quiz Session"}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!quizFinished ? (
            <div>
              {/* Process indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
                <span>{selectedSubject} Quiz — Round {currentIdx + 1} of {quizData.questions.length}</span>
                <span>Tier: {difficulty}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / quizData.questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question visualizer */}
              {(() => {
                const question = quizData.questions[currentIdx];
                const selectedIdx = selectedAnswers[question.id];
                const isSubmitted = submittedAnswers[question.id];
                return (
                  <div id={`question-block-${question.id}`} className="space-y-6">
                    <h3 className="text-base font-bold text-slate-800 leading-snug">
                      {question.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {question.options.map((opt, oIdx) => {
                        const isSelected = selectedIdx === oIdx;
                        const isCorrect = oIdx === question.correctOptionIndex;
                        let optionStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";

                        if (isSubmitted) {
                          if (isCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                          } else if (isSelected) {
                            optionStyle = "border-rose-400 bg-rose-50 text-rose-950";
                          } else {
                            optionStyle = "border-slate-100 bg-slate-50 opacity-40 text-slate-400";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-amber-500 bg-amber-50/50 text-amber-950 font-semibold shadow-sm";
                        }

                        return (
                          <button
                            key={oIdx}
                            id={`opt-btn-${question.id}-${oIdx}`}
                            onClick={() => handleSelectOption(question.id, oIdx)}
                            disabled={isSubmitted}
                            className={`w-full text-left p-4 rounded-2xl border text-sm transition-all focus:outline-none flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {isSubmitted && isSelected && !isCorrect && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation */}
                    {isSubmitted && (
                      <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-slate-600 leading-relaxed space-y-1">
                        <strong className="text-amber-800 block">EduPilot Explanation Accent:</strong>
                        <p>{question.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      {!isSubmitted ? (
                        <button
                          id={`submit-q-${question.id}`}
                          onClick={() => submitQuestion(question)}
                          disabled={selectedIdx === undefined}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                          Lock Answer & Verify
                        </button>
                      ) : (
                        <button
                          id="advance-q-btn"
                          onClick={advanceQuestion}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                        >
                          {currentIdx < quizData.questions.length - 1 ? "Next Question" : "View Final Score Summary"}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div id="quiz-finished-summary" className="text-center py-6 space-y-6">
              <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 heading-display">Quiz Complete!</h3>
                <p className="text-sm text-slate-500 mt-1">Excellent commitment to deliberate practice.</p>
              </div>

              <div className="max-w-xs mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-around">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</span>
                  <p className="text-xl font-bold text-slate-800">
                    {Math.round((correctCount / quizData.questions.length) * 100)}%
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Earned Exp</span>
                  <p className="text-xl font-bold text-amber-600 font-mono">+{correctCount * 20} PTS</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic max-w-sm mx-auto leading-relaxed">
                Your performance stats have been registered by the Mentor Agent. We have added these points to your profile avatar level tracker!
              </p>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  id="quiz-play-again"
                  onClick={restartQuizSelection}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Start New Practice Session
                </button>
                <button
                  id="quiz-back-home"
                  onClick={restartQuizSelection}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                >
                  Choose Subject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
