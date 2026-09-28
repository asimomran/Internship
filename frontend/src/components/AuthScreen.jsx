import { BrandMark } from "./ui";
import { DEMO_ACCOUNTS } from "../lib/api";

export default function AuthScreen({
  mode,
  form,
  busy,
  error,
  onModeChange,
  onFieldChange,
  onSubmit,
  onUseDemo,
}) {
  return (
    <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="ambient-orb left-[-8rem] top-8 h-72 w-72 bg-teal-400/22"
        aria-hidden="true"
      />
      <div
        className="ambient-orb bottom-[-4rem] right-[-2rem] h-80 w-80 bg-amber-300/24"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-panel relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <BrandMark />

            <div className="mt-12 max-w-2xl">
              <div className="eyebrow">CourseTrack Platform</div>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] text-white sm:text-6xl">
                Measure every module, every hour, and every milestone in one{" "}
                <span className="text-gradient">learning control center</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300">
                Built for Java full stack projects with React, Tailwind, Spring Boot,
                and PostgreSQL. Students get guided progress tracking. Admins get
                dashboards, course visibility, and time-based analytics.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="surface-card p-5">
                <div className="eyebrow">Student view</div>
                <div className="mt-3 text-2xl font-black text-white">Module timing</div>
                <p className="mt-2 text-sm text-slate-400">
                  Track completion percentage, time spent, and your hardest topics.
                </p>
              </div>
              <div className="surface-card p-5">
                <div className="eyebrow">Admin view</div>
                <div className="mt-3 text-2xl font-black text-white">Course analytics</div>
                <p className="mt-2 text-sm text-slate-400">
                  Monitor enrollments, bottleneck modules, and weekly engagement.
                </p>
              </div>
              <div className="surface-card p-5">
                <div className="eyebrow">Built stack</div>
                <div className="mt-3 text-2xl font-black text-white">Java full stack</div>
                <p className="mt-2 text-sm text-slate-400">
                  React, Tailwind, Spring Boot, JWT authentication, and PostgreSQL.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex gap-2 rounded-full border border-white/10 bg-slate-950/40 p-1">
              <button
                type="button"
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "signin"
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
                onClick={() => onModeChange("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
                onClick={() => onModeChange("signup")}
              >
                Register
              </button>
            </div>

            <div className="mt-8">
              <div className="eyebrow">{mode === "signin" ? "Welcome back" : "Create account"}</div>
              <h2 className="mt-2 text-3xl font-black text-white">
                {mode === "signin" ? "Open your workspace" : "Launch your learner profile"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === "signin"
                  ? "Use one of the demo accounts or sign in with a registered account."
                  : "New users are auto-enrolled into starter courses so the dashboard is ready immediately."}
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full name
                  </label>
                  <input
                    className="field-shell"
                    name="fullName"
                    value={form.fullName}
                    onChange={onFieldChange}
                    placeholder="Priya Sharma"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  className="field-shell"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onFieldChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  className="field-shell"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onFieldChange}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              <button type="submit" className="action-button w-full" disabled={busy}>
                {busy
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Enter CourseTrack"
                    : "Create account"}
              </button>
            </form>

            <div className="mt-8">
              <div className="eyebrow">Demo access</div>
              <div className="mt-4 grid gap-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.label}
                    type="button"
                    className="surface-card w-full p-4 text-left"
                    onClick={() => onUseDemo(account)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-white">{account.label}</div>
                        <div className="mt-1 text-sm text-slate-400">{account.hint}</div>
                      </div>
                      <div className="ghost-button px-3 py-2 text-xs">Use demo</div>
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {account.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
