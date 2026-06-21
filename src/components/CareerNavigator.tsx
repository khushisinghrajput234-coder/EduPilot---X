import React, { useState } from "react";
import { CareerGuidanceResponse, StudentAnalysis, CareerMatch } from "../types";
import { Compass, Briefcase, ChevronRight, Sparkles, CheckSquare, Target } from "lucide-react";

interface Props {
  analysis: StudentAnalysis | null;
  learningStyle: string | null;
  careerData: CareerGuidanceResponse | null;
  onCareerLoaded: (data: CareerGuidanceResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function CareerNavigator({
  analysis,
  learningStyle,
  careerData,
  onCareerLoaded,
  loading,
  setLoading
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const fetchCareers = async () => {
    if (!analysis) return;
    setLoading(true);

    try {
      const response = await fetch("/api/career-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: analysis.subjects.map(s => ({ subject: s.subject, score: s.score })),
          learningStyle: learningStyle || "Visual learner",
          strengths: analysis.strengths
        }),
      });
      const data = await response.json();
      onCareerLoaded(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="career-navigator-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 heading-display">Career Navigator Agent</h2>
            <p className="text-sm text-slate-500">Discover future paths fitting your unique academic telemetry</p>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please run the <strong>Academic Analyzer Agent</strong> first to feed educational metrics to the career planning engine.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Matches mathematical aptitude, CS affinity, and verbal structures from your profile with industry-standard benchmarks.
              </p>
            </div>
            <button
              id="get-guidance-btn"
              onClick={fetchCareers}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {loading ? "Mapping pathways..." : "Compile Career Options"}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {careerData && (
            <div id="career-matches-list" className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {careerData.careers?.map((career, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={idx}
                      id={`career-card-${idx}`}
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all text-left flex flex-col justify-between ${
                        isExpanded
                          ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/20 shadow-md"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-800 leading-snug">{career.title}</h3>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono px-2 py-1 rounded shrink-0">
                            {career.suitabilityScore}% MATCH
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {career.whyItFits}
                        </p>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-4 animate-fade-in text-xs">
                          {/* Required skills */}
                          <div>
                            <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block mb-1.5">Primary Target Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                              {career.requiredSkills?.map((skill, sIdx) => (
                                <span key={sIdx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Path */}
                          <div>
                            <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block mb-1.5">High Academic Route</span>
                            <p className="text-slate-600 leading-normal">{career.academicPath}</p>
                          </div>

                          {/* Actions */}
                          <div>
                            <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block mb-1.5">Action Plan — Next Steps</span>
                            <div className="space-y-1.5">
                              {career.immediateActionSteps?.map((act, aIdx) => (
                                <div key={aIdx} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-200/40">
                                  <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="text-slate-600 text-[10px] leading-snug">{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!isExpanded && (
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end mt-4">
                          <span>View academic breakdown</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
