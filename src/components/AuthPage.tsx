import React, { useState } from "react";
import { Mail, Lock, User, Calendar, GraduationCap, ArrowRight, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import AntigravityBackground from "./AntigravityBackground";

interface AuthProps {
  onAuthSuccess: (userData: { name: string; email: string; dateOfBirth: string }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Default credentials for instant login experience
  const DEFAULT_STUDENT = {
    name: "Alex Mercer",
    email: "khushisinghrajput234@gmail.com",
    dateOfBirth: "2005-04-12",
    password: "password123"
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all credentials.");
      return;
    }

    // Check localStorage users first
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const foundUser = registeredUsers.find(
      (u: any) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );

    // Fallback support for default student Alex Mercer
    if (loginEmail.toLowerCase() === DEFAULT_STUDENT.email.toLowerCase() && loginPassword === DEFAULT_STUDENT.password) {
      setSuccess("Welcome back, Alex!");
      setTimeout(() => {
        onAuthSuccess({
          name: DEFAULT_STUDENT.name,
          email: DEFAULT_STUDENT.email,
          dateOfBirth: DEFAULT_STUDENT.dateOfBirth
        });
      }, 800);
      return;
    }

    if (foundUser) {
      setSuccess(`Welcome back, ${foundUser.name}!`);
      setTimeout(() => {
        onAuthSuccess({
          name: foundUser.name,
          email: foundUser.email,
          dateOfBirth: foundUser.dateOfBirth
        });
      }, 800);
    } else {
      setError("Invalid email or password combination. Try alex's credential or register a new one.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !dob || !password) {
      setError("Please enter your name, email, date of birth, and password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const alreadyExists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (alreadyExists || email.toLowerCase() === DEFAULT_STUDENT.email.toLowerCase()) {
      setError("A student account with this email address already exists.");
      return;
    }

    // Save newly registered user info
    const newUser = { name, email, dateOfBirth: dob, password };
    registeredUsers.push(newUser);
    localStorage.setItem("registered_users", JSON.stringify(registeredUsers));

    setSuccess("Student registered successfully! Loading your personal academy space...");
    setTimeout(() => {
      onAuthSuccess({ name, email, dateOfBirth: dob });
    }, 1000);
  };

  const handleLoadDemo = () => {
    setLoginEmail(DEFAULT_STUDENT.email);
    setLoginPassword(DEFAULT_STUDENT.password);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Modern interactive particle background similar to Google's Antigravity */}
      <AntigravityBackground />

      <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-indigo-100/40">
        
        {/* Product Logo / Welcome */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:rotate-6 active:scale-95 transition-all duration-300">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">EduPilot X</h1>
            <p className="text-xs text-slate-550">Autonomous Multi-Agent Student Advisor Console</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
          <button
            id="auth-toggle-login"
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isLogin ? "bg-white text-indigo-700 shadow-sm scale-[1.02]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
          <button
            id="auth-toggle-register"
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              !isLogin ? "bg-white text-indigo-700 shadow-sm scale-[1.02]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Student
          </button>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div id="auth-error-alert" className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-medium text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div id="auth-success-alert" className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-600 animate-pulse">
            {success}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Student Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="alex@edupilot.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password-input"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
                <button
                  id="toggle-login-password-btn"
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
            >
              Authenticate & Enter Sandbox
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Helper */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <button
                id="load-demo-credentials-btn"
                type="button"
                onClick={handleLoadDemo}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 px-3 py-1.5 rounded-full"
              >
                ⚡ Use Sandbox Student Account (Alex Mercer)
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Academic Student Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Contact Student Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="register-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Date of Birth</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  id="register-dob-input"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Account Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-password-input"
                  type={showRegisterPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose secure password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
                <button
                  id="toggle-register-password-btn"
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-confirmpassword-input"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat selected password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-xs text-slate-800"
                />
                <button
                  id="toggle-confirm-password-btn"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
            >
              Register & Begin Journey
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
