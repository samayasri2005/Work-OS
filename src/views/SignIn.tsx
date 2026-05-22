import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Github } from "lucide-react";
import { AuthShell, GoogleButton, Field } from "@/components/auth/AuthShell";
import { auth, firebaseSetupMessage, isFirebaseConfigured } from "@/lib/firebase";
import { GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError(firebaseSetupMessage);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError(firebaseSetupMessage);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError(firebaseSetupMessage);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = new FormData(e.currentTarget);
      const email = data.get("email") as string;
      const password = data.get("password") as string;
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your operational workspace."
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400 leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <Field label="Email" name="email" type="email" placeholder="you@workos.dev" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          rightLabel={<Link to="#" className="text-[11px] text-white/50 hover:text-white">Forgot?</Link>}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white py-2.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/30">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton label="Continue with Google" onClick={handleGoogleSignIn} disabled={loading} />
      
      <button 
        onClick={handleGithubSignIn}
        disabled={loading}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60 animate-none"
      >
        <Github className="h-4 w-4" /> Continue with GitHub
      </button>

      <p className="mt-6 text-center text-[13px] text-white/50">
        New to WorkOS? <Link to="/signup" className="text-white hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
