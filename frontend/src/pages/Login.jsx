import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, sessionAPI } from "../api";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../hooks/useAuth";

function Field({ label, id, type = "text", placeholder, value, onChange, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete={type === "password" ? "current-password" : id}
        className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700
                   focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30
                   placeholder-slate-600 text-sm transition-colors"
      />
      {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-700/60" />
      <span className="text-xs font-mono text-slate-500 tracking-wider">OR</span>
      <div className="flex-1 h-px bg-slate-700/60" />
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ username: "", email: "", password: "" });
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();
  const { loginWithEmail, signUpWithEmail } = useAuth();

  // No premature redirect here. 
  // GoogleLoginButton or handlePostAuth will navigate AFTER setting the JWT token.

  const handlePostAuth = async (token) => {
  localStorage.setItem("token", token);

  try {
    const me = await authAPI.me();

    if (me.data.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    try {
      await sessionAPI.start();
    } catch (sessionErr) {
      console.log("Session start skipped/failed:", sessionErr.response?.data || sessionErr.message);
    }

    navigate("/dashboard", { replace: true });
  } catch (err) {
    localStorage.removeItem("token");
    setError("Login successful but user profile could not be loaded.");
  }
  };


  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(signInForm.email, signInForm.password);
      window.location.href = "/dashboard";
    } catch (err) {
      // Error is handled and exposed by context, so we just set loading false
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (signUpForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(signUpForm.email, signUpForm.password, signUpForm.username);
      setVerificationSent(true);
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setVerificationSent(false);
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 justify-center">
            <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
              ◎
            </span>
            <span className="font-mono font-bold text-white text-xl tracking-wide">TrustOS</span>
          </span>
          <p className="mt-2 text-sm text-slate-400">Identity Trust Platform</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => switchTab("signin")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === "signin"
                  ? "text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => switchTab("signup")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === "signup"
                  ? "text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-7">
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div>
                  <p className="text-base font-semibold text-white">Welcome back</p>
                  <p className="text-sm text-slate-400 mt-0.5">Sign in to start a monitored session.</p>
                </div>

                <ErrorBanner message={error} />

                <Field
                  label="Email"
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                />

                <Field
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-bold py-3 rounded-lg text-sm transition-colors shadow-[0_0_16px_rgba(34,211,238,.25)]"
                >
                  {loading ? "Signing in…" : "Sign in →"}
                </button>

                <Divider />
                <GoogleLoginButton />

                <p className="text-center text-xs text-slate-500">
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {tab === "signup" && !verificationSent && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div>
                  <p className="text-base font-semibold text-white">Create account</p>
                  <p className="text-sm text-slate-400 mt-0.5">Sessions are monitored from first login.</p>
                </div>

                <ErrorBanner message={error} />

                <Field
                  label="Username"
                  id="reg-username"
                  placeholder="choose_a_username"
                  value={signUpForm.username}
                  onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
                />

                <Field
                  label="Email"
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                />

                <Field
                  label="Password"
                  id="reg-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  hint="Use a strong password for your banking identity."
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-bold py-3 rounded-lg text-sm transition-colors shadow-[0_0_16px_rgba(34,211,238,.25)]"
                >
                  {loading ? "Creating account…" : "Create account →"}
                </button>

                <Divider />
                <GoogleLoginButton />

                <p className="text-center text-xs text-slate-500">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signin")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
            
            {tab === "signup" && verificationSent && (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mb-2">
                  ✓
                </div>
                <p className="text-lg font-semibold text-white">Check your email</p>
                <p className="text-sm text-slate-400 max-w-[240px]">
                  We've sent a verification link to <strong>{signUpForm.email}</strong>. Please verify your email before signing in.
                </p>
                <button
                  onClick={() => switchTab("signin")}
                  className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg text-sm transition-colors border border-slate-700"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4 font-mono">
          All sessions are continuously monitored for anomalies.
        </p>
      </div>
    </div>
  );
}