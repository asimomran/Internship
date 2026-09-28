import {
  ActivityChart,
  BrandMark,
  EmptyState,
  MetricCard,
  SectionHeader,
} from "./ui";
import { minutesToLabel } from "../lib/api";

function CoursePerformanceCard({ item }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">{item.category}</div>
          <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
          {item.averageProgress}% avg
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Enrollments</div>
          <div className="mt-2 text-lg font-bold text-white">{item.enrollmentCount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Modules</div>
          <div className="mt-2 text-lg font-bold text-white">{item.moduleCount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Total time</div>
          <div className="mt-2 text-lg font-bold text-white">
            {minutesToLabel(item.totalMinutesSpent)}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-amber-200/10 bg-amber-100/5 px-4 py-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Bottleneck module</div>
        <div className="mt-2 text-base font-semibold text-white">{item.bottleneckModule}</div>
      </div>
    </div>
  );
}

function LearnerRow({ learner }) {
  return (
    <div className="surface-card flex items-center justify-between gap-4 p-4">
      <div>
        <div className="text-base font-bold text-white">{learner.fullName}</div>
        <div className="mt-1 text-sm text-slate-400">{learner.email}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black text-white">{minutesToLabel(learner.minutesSpent)}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
          {learner.completedModules} modules done • {learner.activeCourses} active
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  data,
  loading,
  error,
  form,
  createError,
  createBusy,
  onFieldChange,
  onCreateCourse,
  onRefresh,
  onLogout,
}) {
  return (
    <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="ambient-orb left-[-5rem] top-16 h-72 w-72 bg-sky-400/22" aria-hidden="true" />
      <div
        className="ambient-orb bottom-[-3rem] right-[-2rem] h-[22rem] w-[22rem] bg-amber-300/28"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <header className="glass-panel px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <BrandMark />
              <div className="h-px w-full bg-white/10 sm:h-10 sm:w-px" />
              <div>
                <div className="eyebrow">Admin dashboard</div>
                <div className="mt-1 text-lg font-bold text-white">{data?.user?.fullName ?? "Admin"}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="ghost-button" onClick={onRefresh}>
                Refresh data
              </button>
              <button className="ghost-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <section className="glass-panel overflow-hidden px-6 py-8 sm:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="eyebrow">Operations cockpit</div>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                  See which courses convert, which modules slow learners down, and where{" "}
                  <span className="text-gradient">engagement spikes</span>.
                </h1>
                <p className="mt-5 max-w-2xl text-base text-slate-300">{data?.headline}</p>
              </div>
              <div className="surface-card p-6">
                <div className="eyebrow">Fast overview</div>
                <div className="mt-4 text-3xl font-black text-white">
                  {data?.coursePerformance?.length ?? 0} courses tracked
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Use the analytics below to spot growth opportunities and create new course outlines directly from the admin workspace.
                </p>
              </div>
            </div>
          </section>

          {loading && (
            <EmptyState
              title="Loading admin analytics"
              description="Pulling engagement trends, course performance, and learner spotlights from the backend."
            />
          )}

          {error && !loading && (
            <EmptyState
              title="Admin dashboard unavailable"
              description={error}
              action={
                <button className="action-button" onClick={onRefresh}>
                  Retry
                </button>
              }
            />
          )}

          {!loading && !error && data && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data.stats.map((item) => (
                  <MetricCard key={item.label} item={item} />
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <ActivityChart
                  title="Weekly engagement"
                  subtitle="A full-platform view of minutes logged across all student study sessions."
                  points={data.weeklyEngagement}
                />

                <div className="space-y-4">
                  <SectionHeader
                    eyebrow="Learner spotlight"
                    title="Top active students"
                    description="Learners with the strongest recent time investment across active enrollments."
                  />
                  {data.learnerSpotlights.map((learner) => (
                    <LearnerRow key={learner.email} learner={learner} />
                  ))}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <div className="space-y-5">
                  <SectionHeader
                    eyebrow="Course performance"
                    title="Catalog analytics"
                    description="Average progress, enrollment count, and the module that currently consumes the most attention."
                  />
                  <div className="grid gap-4">
                    {data.coursePerformance.map((item) => (
                      <CoursePerformanceCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <SectionHeader
                    eyebrow="Create course"
                    title="Publish a new course outline"
                    description="Enter one module per line using: Title | Minutes | Summary | Content"
                  />

                  <form className="mt-6 space-y-4" onSubmit={onCreateCourse}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        className="field-shell"
                        name="title"
                        value={form.title}
                        onChange={onFieldChange}
                        placeholder="Course title"
                        required
                      />
                      <input
                        className="field-shell"
                        name="instructor"
                        value={form.instructor}
                        onChange={onFieldChange}
                        placeholder="Instructor"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <input
                        className="field-shell"
                        name="category"
                        value={form.category}
                        onChange={onFieldChange}
                        placeholder="Category"
                        required
                      />
                      <input
                        className="field-shell"
                        name="level"
                        value={form.level}
                        onChange={onFieldChange}
                        placeholder="Level"
                        required
                      />
                      <input
                        className="field-shell"
                        name="durationHours"
                        type="number"
                        min="1"
                        value={form.durationHours}
                        onChange={onFieldChange}
                        placeholder="Duration hours"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                      <textarea
                        className="field-shell min-h-[120px]"
                        name="description"
                        value={form.description}
                        onChange={onFieldChange}
                        placeholder="Short course description"
                        required
                      />
                      <label className="surface-card flex flex-col items-center justify-center gap-3 p-4 text-center text-sm text-slate-300">
                        Accent color
                        <input
                          className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent"
                          name="heroAccent"
                          type="color"
                          value={form.heroAccent}
                          onChange={onFieldChange}
                        />
                      </label>
                    </div>

                    <textarea
                      className="field-shell min-h-[240px]"
                      name="modulesDraft"
                      value={form.modulesDraft}
                      onChange={onFieldChange}
                      required
                    />

                    {createError && (
                      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                        {createError}
                      </div>
                    )}

                    <button className="action-button w-full" type="submit" disabled={createBusy}>
                      {createBusy ? "Creating course..." : "Create course"}
                    </button>
                  </form>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
