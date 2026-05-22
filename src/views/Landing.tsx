import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight, Command, Rocket, KeyRound, Terminal, Lock, BookOpen, Layers,
  Github, Sun, Moon, Boxes, Cloud, Server, Database, Shield, Zap, Search,
  ChevronRight, Folder, GitBranch, Globe, Activity, Check, Cpu,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-3");
          }
        });
      },
      { threshold: 0.08 },
    );
    els.forEach((el) => {
      el.classList.add("opacity-0", "translate-y-3", "transition-all", "duration-700", "ease-out");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
};

const Grid = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
  />
);

const Glow = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.25),transparent)]" />
    <div className="absolute top-[20%] -left-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent)]" />
    <div className="absolute top-[10%] -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),transparent)]" />
  </div>
);

const Nav = () => {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a12]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_24px_-6px_rgba(139,92,246,0.7)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">WorkOS</span>
          <span className="ml-2 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/60">beta</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#palette" className="hover:text-white">Command</a>
          <a href="#workspace" className="hover:text-white">Workspace</a>
          <a href="#why" className="hover:text-white">Why WorkOS</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/70 hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90"
            >
              Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link to="/signin" className="hidden rounded-md px-3 py-1.5 text-sm text-white/80 hover:text-white sm:block">Sign in</Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const ProductMock = () => {
  const [showK, setShowK] = useState(true);
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0b15] shadow-2xl">
        <div className="flex h-8 items-center gap-1.5 border-b border-white/10 bg-[#0a0a12] px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="ml-3 flex items-center gap-1.5 text-[11px] text-white/40">
            <Folder className="h-3 w-3" /> workos / workspace
          </div>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-white/40">
            <Activity className="h-3 w-3 text-emerald-400" /> live
          </div>
        </div>
        <div className="grid grid-cols-[160px_1fr]">
          <aside className="border-r border-white/10 bg-[#08080f] p-3 text-[11px] text-white/60">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Workspace</div>
            {[
              { i: Boxes, l: "Projects", n: 12 },
              { i: Rocket, l: "Deployments", n: 38 },
              { i: Terminal, l: "Commands", n: 24 },
              { i: KeyRound, l: "Accounts", n: 7 },
              { i: Lock, l: "Secrets", n: 31 },
              { i: BookOpen, l: "Resources" },
            ].map(({ i: Ic, l, n }) => (
              <div key={l} className={`flex items-center justify-between rounded-md px-2 py-1.5 ${l === "Projects" ? "bg-white/5 text-white" : "hover:bg-white/[0.03]"}`}>
                <span className="flex items-center gap-2"><Ic className="h-3.5 w-3.5" />{l}</span>
                {n && <span className="text-[10px] text-white/30">{n}</span>}
              </div>
            ))}
          </aside>
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/40">Projects</div>
                <div className="text-sm font-medium text-white">Active workspace</div>
              </div>
              <button onClick={() => setShowK((s) => !s)} className="flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/60 hover:bg-white/5">
                <Search className="h-3 w-3" /> Search <kbd className="ml-1 rounded bg-white/10 px-1 text-[10px]">⌘K</kbd>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { n: "atlas-api", b: "main", s: "deployed", c: "emerald" },
                { n: "ledger-web", b: "feat/auth", s: "building", c: "amber" },
                { n: "pulse-edge", b: "main", s: "deployed", c: "emerald" },
                { n: "vault-cli", b: "v2.1", s: "queued", c: "sky" },
              ].map((p) => (
                <div key={p.n} className="rounded-md border border-white/10 bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] text-white">
                      <GitBranch className="h-3 w-3 text-white/40" />{p.n}
                    </div>
                    <span className={`h-1.5 w-1.5 rounded-full bg-${p.c}-400`} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
                    <span>{p.b}</span><span>{p.s}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-white/10 bg-[#08080f] p-2.5">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-white/30">Recent deploys</div>
              {[
                { t: "atlas-api", e: "prod", d: "2m" },
                { t: "pulse-edge", e: "preview", d: "11m" },
                { t: "ledger-web", e: "staging", d: "1h" },
              ].map((r) => (
                <div key={r.t + r.d} className="flex items-center justify-between border-t border-white/5 py-1 text-[11px] text-white/60 first:border-0">
                  <span className="flex items-center gap-2"><Globe className="h-3 w-3 text-white/30" />{r.t}.workos.app</span>
                  <span className="flex items-center gap-2"><span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">{r.e}</span>{r.d} ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showK && (
          <div className="absolute left-1/2 top-[58%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0b0b15]/95 p-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-2 py-2">
              <Command className="h-3.5 w-3.5 text-white/50" />
              <input
                readOnly
                value="deploy atlas-api to production"
                className="w-full bg-transparent text-[12px] text-white outline-none"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">ESC</kbd>
            </div>
            <div className="py-1 text-[12px]">
              {[
                { i: Rocket, l: "Deploy atlas-api → production", h: "↵" },
                { i: Terminal, l: "Run: pnpm build && pnpm release", h: "⌘R" },
                { i: KeyRound, l: "Switch account: vercel-personal", h: "" },
                { i: Folder, l: "Open project: pulse-edge", h: "" },
              ].map(({ i: Ic, l, h }, idx) => (
                <div key={l} className={`flex items-center justify-between rounded-md px-2 py-1.5 ${idx === 0 ? "bg-indigo-500/15 text-white" : "text-white/70"}`}>
                  <span className="flex items-center gap-2"><Ic className="h-3.5 w-3.5 text-white/50" />{l}</span>
                  {h && <span className="text-[10px] text-white/40">{h}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div data-reveal className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]">
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-indigo-300">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    <p className="mt-1 text-[13px] leading-relaxed text-white/60">{desc}</p>
  </div>
);

export default function Landing() {
  useReveal();
  const { user } = useAuth();

  return (
    <div className="dark min-h-screen bg-[#06060c] text-white antialiased">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Grid />
        <Glow />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div data-reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              v1.0 — operational workspace for developers
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Development
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">Operations Center</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60">
              Manage projects, deployments, accounts, commands, environments, and operational context — all in one workspace built for developers.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/signin" className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
                    Sign In
                  </Link>
                </>
              )}
              <div className="ml-2 hidden items-center gap-1.5 text-[12px] text-white/40 sm:flex">
                Press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">⌘</kbd>
                <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">K</kbd> anywhere
              </div>
            </div>
          </div>
          <div data-reveal>
            <ProductMock />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-5 text-[12px] text-white/50">
          {[
            { i: Boxes, l: "Projects" },
            { i: Rocket, l: "Deployments" },
            { i: Terminal, l: "Commands" },
            { i: KeyRound, l: "Accounts" },
            { i: Lock, l: "Secrets" },
            { i: Server, l: "Resources" },
          ].map(({ i: Ic, l }) => (
            <div key={l} className="flex items-center gap-2"><Ic className="h-3.5 w-3.5" /> {l}</div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <div data-reveal className="mb-12 max-w-2xl">
          <div className="text-[11px] uppercase tracking-wider text-indigo-300/80">Core modules</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you operate, in one place.</h2>
          <p className="mt-3 text-[15px] text-white/60">Purpose-built primitives for the way developers actually ship — not another task tracker.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Rocket} title="Deployment Management" desc="Track every deployed URL, environment, and rollout state across projects." />
          <FeatureCard icon={KeyRound} title="Account Management" desc="Wrangle multiple Firebase, Lovable, Vercel, and GCP accounts in one registry." />
          <FeatureCard icon={Terminal} title="Command Center" desc="Store reusable commands and scripts. Copy and run with a single keystroke." />
          <FeatureCard icon={Lock} title="Secrets & Env" desc="Manage API keys and environment variables per project and environment." />
          <FeatureCard icon={BookOpen} title="Resources Hub" desc="Architecture notes, docs, setup guides — context that travels with the project." />
          <FeatureCard icon={Layers} title="Project Workspace" desc="Every project is a dedicated operational workspace with full context." />
        </div>
      </section>

      {/* Command palette showcase */}
      <section id="palette" className="relative overflow-hidden border-y border-white/10 bg-[#08080f]">
        <Grid />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div data-reveal>
            <div className="text-[11px] uppercase tracking-wider text-indigo-300/80">Command Palette</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Move at the speed of <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-base">⌘K</kbd>
            </h2>
            <p className="mt-3 max-w-lg text-[15px] text-white/60">One palette to search, navigate, copy commands, switch accounts, and trigger deployments. No menus. No mouse. Just intent.</p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              {["Instant fuzzy search across everything","Quick navigation between projects and modules","Copy commands and run scripts in one keystroke","Switch accounts and environments without context loss"].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-indigo-300" />{t}</li>
              ))}
            </ul>
          </div>
          <div data-reveal className="relative">
            <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-transparent blur-2xl" />
            <div className="relative rounded-xl border border-white/10 bg-[#0b0b15] p-2 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <Search className="h-4 w-4 text-white/40" />
                <span className="text-sm text-white/80">deploy</span>
                <span className="h-4 w-px animate-pulse bg-white/60" />
                <kbd className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">ESC</kbd>
              </div>
              <div className="py-1">
                {[
                  { g: "Actions", items: [
                    { i: Rocket, l: "Deploy atlas-api → production", k: "↵" },
                    { i: Rocket, l: "Deploy pulse-edge → preview" },
                  ]},
                  { g: "Commands", items: [
                    { i: Terminal, l: "pnpm build && pnpm release", k: "⌘R" },
                    { i: Terminal, l: "supabase db push --linked" },
                  ]},
                  { g: "Navigate", items: [
                    { i: Folder, l: "Open project: ledger-web" },
                    { i: KeyRound, l: "Account: vercel-personal" },
                  ]},
                ].map((grp) => (
                  <div key={grp.g}>
                    <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wider text-white/30">{grp.g}</div>
                    {grp.items.map((it, i) => (
                      <div key={it.l} className={`mx-1 flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] ${grp.g === "Actions" && i === 0 ? "bg-indigo-500/15 text-white" : "text-white/75 hover:bg-white/5"}`}>
                        <span className="flex items-center gap-2"><it.i className="h-3.5 w-3.5 text-white/50" />{it.l}</span>
                        {it.k && <span className="text-[10px] text-white/40">{it.k}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace showcase */}
      <section id="workspace" className="mx-auto max-w-7xl px-6 py-24">
        <div data-reveal className="mb-10 max-w-2xl">
          <div className="text-[11px] uppercase tracking-wider text-indigo-300/80">Project Workspace</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Mission control for every project.</h2>
          <p className="mt-3 text-[15px] text-white/60">Deployments, accounts, commands, env vars, services — every operational primitive in a single dense view.</p>
        </div>
        <div data-reveal className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0b15] shadow-2xl">
          <div className="grid grid-cols-12 divide-x divide-white/10">
            <div className="col-span-12 border-b border-white/10 p-4 lg:col-span-12">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                  <Cpu className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">atlas-api</div>
                  <div className="text-[11px] text-white/40">Operational • production</div>
                </div>
                <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">healthy</span>
                <div className="ml-auto flex gap-1 text-[11px] text-white/50">
                  {["Overview","Deployments","Commands","Env","Accounts","Services","Docs"].map((t, i) => (
                    <span key={t} className={`rounded-md px-2 py-1 ${i === 1 ? "bg-white/10 text-white" : "hover:bg-white/5"}`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-12 p-4 lg:col-span-7">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Deployments</div>
              <div className="overflow-hidden rounded-md border border-white/10">
                <div className="grid grid-cols-[1fr_90px_90px_70px] gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] uppercase tracking-wider text-white/40">
                  <span>URL</span><span>Env</span><span>Status</span><span>Time</span>
                </div>
                {[
                  { u: "atlas-api.workos.app", e: "prod", s: "Ready", t: "2m" },
                  { u: "atlas-api-preview-7e1.workos.app", e: "preview", s: "Ready", t: "14m" },
                  { u: "atlas-api-staging.workos.app", e: "staging", s: "Building", t: "now" },
                  { u: "atlas-api-pr-241.workos.app", e: "preview", s: "Ready", t: "1h" },
                ].map((d) => (
                  <div key={d.u} className="grid grid-cols-[1fr_90px_90px_70px] gap-2 border-t border-white/5 px-3 py-2 text-[12px] text-white/75 first:border-0">
                    <span className="flex items-center gap-2 truncate"><Globe className="h-3 w-3 text-white/30" />{d.u}</span>
                    <span className="text-white/50">{d.e}</span>
                    <span className={d.s === "Building" ? "text-amber-300" : "text-emerald-300"}>{d.s}</span>
                    <span className="text-white/40">{d.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-12 p-4 lg:col-span-5">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Commands</div>
              <div className="space-y-1.5">
                {[
                  "pnpm dev",
                  "pnpm build && pnpm release",
                  "supabase db push --linked",
                  "vercel env pull .env.local",
                ].map((c) => (
                  <div key={c} className="flex items-center justify-between rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 font-mono text-[12px] text-white/80">
                    <span className="truncate"><span className="text-indigo-300">$</span> {c}</span>
                    <button className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/60 hover:bg-white/5">copy</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-white/10 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30">Accounts</div>
                  <div className="mt-1 text-[12px] text-white/75">vercel-personal · firebase-prod</div>
                </div>
                <div className="rounded-md border border-white/10 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30">Env</div>
                  <div className="mt-1 text-[12px] text-white/75">12 keys · 3 environments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="relative overflow-hidden border-y border-white/10 bg-[#08080f]">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-24 lg:grid-cols-2">
          <div data-reveal>
            <div className="text-[11px] uppercase tracking-wider text-indigo-300/80">Why WorkOS</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Not another productivity app.</h2>
            <p className="mt-3 max-w-lg text-[15px] text-white/60">
              Built specifically for developers managing multiple projects, accounts, deployments, and infrastructure. The operational layer your tools forgot.
            </p>
          </div>
          <div data-reveal className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { i: Shield, t: "Operational, not decorative", d: "Designed for real workflows, not screenshots." },
              { i: Database, t: "Context that compounds", d: "Every project accumulates the knowledge to ship faster." },
              { i: Cloud, t: "Multi-account aware", d: "Stop guessing which account deployed what." },
              { i: Zap, t: "Keyboard-native", d: "Every action one shortcut away." },
            ].map(({ i: Ic, t, d }) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <Ic className="h-4 w-4 text-indigo-300" />
                <div className="mt-2 text-sm font-semibold text-white">{t}</div>
                <div className="mt-1 text-[13px] text-white/60">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Glow />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 data-reveal className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Centralize Your <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Development Workflow</span>
          </h2>
          <p data-reveal className="mx-auto mt-4 max-w-xl text-[15px] text-white/60">
            Stop juggling tabs, accounts, and lost commands. Bring it all into one operational workspace.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/signin" className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
                  Explore Workspace <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#06060c]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[12px] text-white/50">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white/80">WorkOS</span>
            <span className="text-white/30">— operational workspace for developers</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white"><Github className="inline h-3.5 w-3.5" /> GitHub</a>
            <a href="#" className="hover:text-white">Docs</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
