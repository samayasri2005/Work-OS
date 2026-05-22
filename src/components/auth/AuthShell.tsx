import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export const Field = ({
  label, name, type = "text", placeholder, autoComplete, required, rightLabel,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  rightLabel?: ReactNode;
}) => {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-white/70">{label}</span>
        {rightLabel}
      </div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  );
};

export const GoogleButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.5 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.7 3.2 1.2l2.2-2.1C16 5.5 14.2 4.7 12 4.7 7.9 4.7 4.6 8 4.6 12s3.3 7.3 7.4 7.3c4.3 0 7.1-3 7.1-7.2 0-.5-.1-.8-.1-1.1H12z" />
      </svg>
      {label}
    </button>
  );
};

export const AuthShell = ({
  title, subtitle, children,
}: { title: string; subtitle: string; children: ReactNode }) => {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-[#06060c] text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.25),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6">
        <header className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">WorkOS</span>
          </Link>
          <Link to="/" className="text-[12px] text-white/50 hover:text-white">← Back home</Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1.5 text-[13px] text-white/55">{subtitle}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
              {children}
            </div>
            <p className="mt-6 text-center text-[11px] text-white/30">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
