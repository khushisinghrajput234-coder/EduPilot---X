import React, { useState } from "react";
import { ShieldAlert, Terminal, Lock, Key, CheckSquare, EyeOff, ShieldCheck } from "lucide-react";

interface AuditLogEntry {
  timestamp: string;
  service: string;
  action: string;
  status: string;
  actor: string;
  severity: "low" | "medium" | "high";
}

export default function SecurityConsole({ currentUserEmail }: { currentUserEmail: string }) {
  const [role, setRole] = useState<"Student" | "Teacher" | "Admin">("Student");
  const [enablePiiMasking, setEnablePiiMasking] = useState(true);

  // Simulated audit logging of student record queries or MCP tools
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    { timestamp: "2026-06-20 08:55:01", service: "Student Records MCP", action: "Query Educational CSV Metrics", status: "AUTHORIZED", actor: "EduPilot Analyzer Agent", severity: "low" },
    { timestamp: "2026-06-20 08:55:12", service: "Learning Resources MCP", action: "Search Science/Calculus links", status: "AUTHORIZED", actor: "EduPilot Resource Agent", severity: "low" },
    { timestamp: "2026-06-20 08:55:18", service: "Calendar MCP", action: "Sync Upcoming Math Exams date", status: "AUTHORIZED", actor: "EduPilot Study Planner Agent", severity: "low" },
    { timestamp: "2026-06-20 08:58:34", service: "Report Generation MCP", action: "Build PDF progress summary metrics", status: "AUTHORIZED", actor: "EduPilot Mentor Agent", severity: "medium" },
    { timestamp: "2026-06-20 09:00:22", service: "Model Access API", action: "Prompt Injection Attack Defended", status: "BLOCKED", actor: "External Intruder", severity: "high" }
  ]);

  const addCustomLog = (service: string, action: string, actor: string = "Simulator") => {
    const fresh: AuditLogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      service,
      action,
      status: "AUTHORIZED",
      actor,
      severity: "low"
    };
    setLogs([fresh, ...logs]);
  };

  const getSeverityBadge = (sev: "low" | "medium" | "high") => {
    switch (sev) {
      case "high": return "bg-rose-100 text-rose-800 border-rose-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-teal-50 text-teal-800 border-teal-100";
    }
  };

  return (
    <div id="security-console-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 heading-display">Federated MCP & Security Guard</h2>
            <p className="text-sm text-slate-500">Examine role permissions, active logs, and data security vectors</p>
          </div>
        </div>

        {/* Role-Based Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Simulator Role:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["Student", "Teacher", "Admin"] as const).map(r => (
              <button
                key={r}
                id={`role-toggle-${r.toLowerCase()}`}
                onClick={() => {
                  setRole(r);
                  addCustomLog("Role Sync Panel", `Switched viewer workspace into ${r} role`, "Operator UI");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === r ? "bg-white text-indigo-700 shadow" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Guard features highlights */}
        <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Role-Based Access Controls</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Your clearance level is <strong className="text-indigo-800 uppercase">{role}</strong>. 
            {role === "Student" && " You can ONLY read and query your private evaluation data."}
            {role === "Teacher" && " Teachers can see analytics of assigned classes as telemetry."}
            {role === "Admin" && " Full access granted for audit log maintenance & keys setup."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>PII & Safety Masking</span>
            </div>
            <button 
              id="toggle-pii-mask"
              onClick={() => {
                setEnablePiiMasking(!enablePiiMasking);
                addCustomLog("Security Engine", `${enablePiiMasking ? 'Disabled' : 'Enabled'} PII address/phone regex masking`, "User Console");
              }}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Toggle
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Active User: <strong className="font-mono text-slate-800">
              {enablePiiMasking ? `${currentUserEmail.substring(0, 3)}****@****.com` : currentUserEmail}
            </strong>. 
            All other personally identifiable traces are scrubbed automatically before parsing.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Prompt Injection Defense</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Safety rules & backend schemas (firebase / env) are locked down. The system automatically ignores custom attempt blocks to manipulate system variables.
          </p>
        </div>
      </div>

      {/* Audit Log list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Audit Logs</span>
          <button
            id="clear-logs-btn"
            onClick={() => setLogs([])}
            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
          >
            Clear Log Frame
          </button>
        </div>
        
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] space-y-2 max-h-56 overflow-y-auto">
          {logs.map((lg, i) => (
            <div key={i} className="flex justify-between items-start gap-4 border-b border-slate-800/80 pb-2 last:border-b-0">
              <span className="text-slate-500 shrink-0">{lg.timestamp}</span>
              <div className="flex-1">
                <span className="text-emerald-400 font-bold">[{lg.service}] </span>
                <span className="text-slate-300">{lg.action}</span>
                <span className="text-slate-500 block text-[9px] mt-0.5">Executor: {lg.actor} ({role} perspective)</span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className={`text-[8px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider ${getSeverityBadge(lg.severity)}`}>
                  {lg.severity}
                </span>
                <span className={lg.status === "BLOCKED" ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                  {lg.status}
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-[10px]">No logs generated in current turn.</div>
          )}
        </div>
      </div>
    </div>
  );
}
