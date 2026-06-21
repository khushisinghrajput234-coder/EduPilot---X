import React, { useState } from "react";
import { MentorAdvice, StudentAnalysis } from "../types";
import { MessageSquare, ExternalLink, Sparkles, BookOpen, Smile, Bookmark, Users, HeartHandshake } from "lucide-react";

interface Props {
  analysis: StudentAnalysis | null;
  learningStyle: string | null;
  adviceData: MentorAdvice | null;
  onAdviceLoaded: (data: MentorAdvice) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function MentorAdvisor({
  analysis,
  learningStyle,
  adviceData,
  onAdviceLoaded,
  loading,
  setLoading
}: Props) {
  const [showPeerRoom, setShowPeerRoom] = useState(false);
  const [peerMessages, setPeerMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "Sarah (Math partner)", text: "Hey! Who wants to review the algebraic coordinates tonight at 6 PM?", time: "08:12 AM" },
    { sender: "Marcus (Computer Sci)", text: "I completed the recursion loop exercises. If anyone got stuck on function boundaries let me know!", time: "08:45 AM" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  const triggerAdvice = async () => {
    if (!analysis) return;
    setLoading(true);

    try {
      const response = await fetch("/api/mentor-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: analysis.subjects.map(s => ({ subject: s.subject, score: s.score })),
          learningStyle: learningStyle || "Visual learner",
          overallScore: analysis.attendancePercentage
        }),
      });
      const data = await response.json();
      onAdviceLoaded(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const postPeerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setPeerMessages([
      ...peerMessages,
      { sender: "You (Student)", text: newMsg.trim(), time: "Just now" }
    ]);
    setNewMsg("");
  };

  return (
    <div id="mentor-advisor-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 heading-display">EduPilot Mentor & Peer Advisor</h2>
            <p className="text-sm text-slate-500">Resource referrals and joint micro-collaboration loops</p>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please run the <strong>Academic Analyzer Agent</strong> first to get custom mentor feedback and materials.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">Supportive Mentoring Guidance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unlock specialized learning tactics curated by your Academic Mentor based on your attendance correlation metrics and weaknesses.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <button
                id="toggle-peer-study"
                onClick={() => setShowPeerRoom(!showPeerRoom)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  showPeerRoom
                    ? "bg-sky-600 text-white shadow-sm"
                    : "border border-sky-200 text-sky-700 hover:bg-sky-50"
                }`}
              >
                {showPeerRoom ? "Hide Peer Study Rooms" : "Open Peer Study Circle"}
              </button>

              <button
                id="request-advice-btn"
                onClick={triggerAdvice}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                {loading ? "Aligning guides..." : "Request Mentoring Feedback"}
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              </button>
            </div>
          </div>

          {/* Peer Room Section */}
          {showPeerRoom && (
            <div id="peer-study-circle" className="border border-sky-100 bg-sky-50/20 rounded-2xl p-4 md:p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded-full">ACTIVE STUDY CABIN #402</span>
                <span className="text-[10px] text-slate-400">3 peers online currently</span>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto bg-white/80 p-3 rounded-xl border border-sky-100">
                {peerMessages.map((msg, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-indigo-950">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100 leading-normal">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={postPeerMessage} className="flex gap-2">
                <input
                  id="peer-msg-placeholder-input"
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Ask a question or offer a flashcard swap..."
                  className="flex-1 px-3 py-2 border border-slate-200 focus:outline-none focus:border-sky-500 rounded-xl bg-white text-xs font-medium text-slate-800"
                />
                <button
                  id="send-peer-msg-btn"
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Post
                </button>
              </form>
            </div>
          )}

          {adviceData && (
            <div id="mentor-advice-details" className="space-y-6 animate-fade-in">
              {/* Message */}
              <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 relative overflow-hidden flex gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full h-fit shrink-0">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Message from your EduPilot Mentor</h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{adviceData.mentorMessage}"</p>
                </div>
              </div>

              {/* Study techniques */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Custom Mastery Techniques</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adviceData.studyHacks?.map((hack, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 hover:border-slate-200 transition-all p-4 rounded-xl shadow-sm space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-sky-500 fill-sky-200" />
                        {hack.name}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{hack.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links and guides */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Curated Reference Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adviceData.curatedResources?.map((res, idx) => (
                    <div key={idx} className="bg-slate-50 hover:bg-slate-50/80 transition-all p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                            {res.type}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 leading-snug">{res.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{res.notes}</p>
                      </div>

                      <a
                        id={`resource-link-${idx}`}
                        href={res.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors self-start"
                      >
                        Access resource documentation
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
