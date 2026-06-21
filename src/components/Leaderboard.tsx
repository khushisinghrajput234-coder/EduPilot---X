import React, { useState } from "react";
import { User, Trophy, Flame, Search, Medal, ShieldAlert, Users, GraduationCap } from "lucide-react";

interface ClassroomStudent {
  rank: number;
  name: string;
  level: number;
  exp: number;
  badge: string;
  isCurrentUser?: boolean;
  avatarSeed: string;
  activePath: string;
}

export default function Leaderboard({ currentStudentEXP, currentStudentName }: { currentStudentEXP: number, currentStudentName: string }) {
  const currentStudentLevel = Math.floor(currentStudentEXP / 200) + 1;
  
  const [filter, setFilter] = useState("");
  const [selectedClass, setSelectedClass] = useState("Informatics A");

  // Simulated peer classmates in the same Informatics A classroom
  const defaultClassmates: ClassroomStudent[] = [
    { rank: 1, name: "Marcus Reynolds", level: 5, exp: 940, badge: "Loop Mastermind", avatarSeed: "marcus", activePath: "Autonomous Software Architect" },
    { rank: 2, name: "Sarah Jenkins", level: 4, exp: 780, badge: "STEM Alchemist", avatarSeed: "sarah", activePath: "Data Informatics Scientist" },
    { rank: 3, name: currentStudentName || "Alex Mercer", level: currentStudentLevel, exp: currentStudentEXP, badge: "Logical Alchemist", isCurrentUser: true, avatarSeed: "alex", activePath: "Software Core Engineer" },
    { rank: 4, name: "Chloe Henderson", level: 3, exp: 510, badge: "Triton Designer", avatarSeed: "chloe", activePath: "Visual STEM UX Designer" },
    { rank: 5, name: "Brandon Vance", level: 3, exp: 460, badge: "System Pathfinder", avatarSeed: "brandon", activePath: "Network Operations planner" },
    { rank: 6, name: "Aria Sterling", level: 2, exp: 380, badge: "Grammar Scribe", avatarSeed: "aria", activePath: "Communications Architect" },
    { rank: 7, name: "Justin Pratt", level: 2, exp: 290, badge: "Retrieval Pro", avatarSeed: "justin", activePath: "Resource Analyst" }
  ];

  // Dynamically re-sort based on current student's shifting real-time score!
  const sortedClassmates = [...defaultClassmates]
    .map(student => {
      if (student.isCurrentUser) {
        return { ...student, exp: currentStudentEXP, level: currentStudentLevel };
      }
      return student;
    })
    .sort((a, b) => b.exp - a.exp)
    .map((student, index) => ({ ...student, rank: index + 1 }));

  const filteredStudents = sortedClassmates.filter(st => 
    st.name.toLowerCase().includes(filter.toLowerCase()) || 
    st.badge.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div id="classroom-leaderboard-card" className="bg-[#0e162d]/90 rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 glow-card transition-all text-slate-100">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/40 text-amber-505 rounded-2xl border border-amber-900/30">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white heading-display">Global Classroom Leaderboard</h2>
            <p className="text-xs text-slate-400 font-sans">Visualize collaborative peer standings and milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase font-mono">Classroom:</span>
          <select 
            id="leaderboard-class-select"
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-[#080d19] border border-slate-805 rounded-xl px-3 py-1.5 font-bold text-slate-200 focus:outline-none focus:border-indigo-550"
          >
            <option value="Informatics A">Informatics A (Your Cabin)</option>
            <option value="Advanced Calculus 101">Advanced Calculus 101</option>
            <option value="Physics Mechanics II">Physics Mechanics II</option>
          </select>
        </div>
      </div>

      <div className="flex bg-[#080d19] border border-slate-800/60 rounded-2xl items-center px-4 py-2 gap-3 focus-within:border-indigo-500/40 transition-all">
        <Search className="w-4 h-4 text-slate-450 shrink-0" />
        <input 
          id="leaderboard-search-input"
          type="text" 
          placeholder="Filter classmates or badge titles..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent border-none text-xs focus:outline-none text-slate-200 w-full placeholder-slate-500 font-sans font-bold"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#080d19]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0b1224] border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              <th className="py-3.5 px-4 text-center">Rank</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Earned Class Badge</th>
              <th className="py-3.5 px-4">Target Career Focus</th>
              <th className="py-3.5 px-4 text-right">Academic EXP Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs">
            {filteredStudents.map((st) => {
              const rankIcon = st.rank === 1 ? "🥇" : st.rank === 2 ? "🥈" : st.rank === 3 ? "🥉" : `${st.rank}.`;
              return (
                <tr 
                  key={st.name} 
                  id={`classmate-rank-row-${st.rank}`}
                  className={`transition-colors ${st.isCurrentUser ? 'bg-indigo-950/40 hover:bg-indigo-950/60 font-medium' : 'hover:bg-slate-900/30'}`}
                >
                  <td className="py-4 px-4 text-center font-bold text-slate-300 text-sm">
                    {rankIcon}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        st.isCurrentUser ? 'bg-indigo-600 text-white font-black' : 'bg-slate-820 border border-slate-800 text-slate-300'
                      }`}>
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-slate-105 block font-bold">
                          {st.name} {st.isCurrentUser && <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded-full ml-1">You</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">Level {st.level} Scholar</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-amber-950/40 text-amber-400 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-amber-900/30">
                      {st.badge}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 italic max-w-[200px] truncate">
                    {st.activePath}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-100">
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                      <span>{st.exp} PTS</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-10">
            <span className="text-xs text-slate-550 italic">No classmates found matching criteria.</span>
          </div>
        )}
      </div>
    </div>
  );
}
