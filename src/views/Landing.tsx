import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, FolderKanban, CheckSquare, Calendar, FileText, Link2, KeyRound, ArrowRight, Activity } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background soft color panels */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Work OS
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition"
              >
                Go to App
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          The Unified Work Operating System for Teams
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Execute Together
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
          Unify your tasks, calendars, markdown documents, bookmark manager, external credentials, and project workspace tracking under a single, highly refined platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 group"
          >
            {user ? "Open Dashboard" : "Access Workspace"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Feature Matrix Grid */}
        <div className="mt-24 md:mt-32 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* Projects */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Project Workspaces</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Plan and coordinate complex projects. Track tasks with customizable pipelines, team assignments, and boards.
            </p>
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Todo List</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Track daily deliverables and set priority states. Filter, search, and manage individual schedules.
            </p>
          </div>

          {/* Calendar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Unified Calendar</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              See deadlines, scheduling reminders, and meetings in a single integrated, beautiful, visual calendar view.
            </p>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Rich Notes & Vault</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Create extensive documentation, capture quick thoughts, and draft project logs using full formatting and tags.
            </p>
          </div>

          {/* Links */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Quick Bookmark Hub</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Catalog references, resources, tools, and links. Search, filter, and open frequently used resources in seconds.
            </p>
          </div>

          {/* Accounts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Accounts Integrations</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Secure integration mappings. Store external configuration contexts securely linked directly to your active workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-850 bg-slate-900 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Personal Command Center. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            <span>Secure Enterprise Workspace Execution</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
