import {
  ActivityChart,
  BrandMark,
  CourseBadge,
  EmptyState,
  InsightCard,
  MetricCard,
  SectionHeader,
} from "./ui";
import { minutesToLabel, percentageLabel, withAlpha } from "../lib/api";

function CourseCard({ course, onOpenCourse }) {
  return (
    <div
      className="surface-card overflow-hidden p-6"
      style={{
        boxShadow: `0 24px 54px ${withAlpha(course.heroAccent, "1c")}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <CourseBadge text={course.category} accent={course.heroAccent} />
          <h3 className="mt-4 text-2xl font-black text-white">{course.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{course.description}</p>
        </div>
        <div
          className="rounded-3xl border px-4 py-3 text-right"
          style={{
            background: withAlpha(course.heroAccent, "12"),
            borderColor: withAlpha(course.heroAccent, "36"),
          }}
        >
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Progress</div>
          <div className="mt-2 text-2xl font-black text-white">
            {percentageLabel(course.progressPercent)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Instructor</div>
          <div className="mt-2 font-semibold text-white">{course.instructor}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Modules</div>
          <div className="mt-2 font-semibold text-white">
            {course.completedModules}/{course.totalModules}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Time logged</div>
          <div className="mt-2 font-semibold text-white">{minutesToLabel(course.totalMinutesSpent)}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Next module</span>
          <span>{course.nextModule}</span>
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${course.progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          {course.level} • {course.durationHours} hours planned
        </div>
        <button className="action-button" onClick={() => onOpenCourse(course.id)}>
          Open course
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard({
  data,
  loading,
  error,
  onOpenCourse,
  onRefresh,
  onLogout,
}) {
  return (
    <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="ambient-orb left-0 top-12 h-80 w-80 bg-teal-400/20" aria-hidden="true" />
      <div
        className="ambient-orb bottom-[-4rem] right-[-3rem] h-[22rem] w-[22rem] bg-amber-300/24"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <header className="glass-panel px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <BrandMark />
              <div className="h-px w-full bg-white/10 sm:h-10 sm:w-px" />
              <div>
                <div className="eyebrow">Student dashboard</div>
                <div className="mt-1 text-lg font-bold text-white">{data?.user?.fullName ?? "Learner"}</div>
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
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="eyebrow">Learning pulse</div>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                  Keep your course progress moving with{" "}
                  <span className="text-gradient">module-level timing</span> and clear
                  next steps.
                </h1>
                <p className="mt-5 max-w-2xl text-base text-slate-300">{data?.headline}</p>
              </div>

              <div className="surface-card p-6">
                <div className="eyebrow">Focus snapshot</div>
                <div className="mt-4 text-3xl font-black text-white">
                  {data?.enrolledCourses?.[0]
                    ? percentageLabel(data.enrolledCourses[0].progressPercent)
                    : "0%"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  strongest active course completion
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Courses enrolled</span>
                    <span>{data?.enrolledCourses?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tracked this week</span>
                    <span>{minutesToLabel(data?.weeklyActivity?.reduce((sum, item) => sum + item.minutes, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading && (
            <EmptyState
              title="Loading your dashboard"
              description="Pulling course progress, weekly activity, and module timing from the backend."
            />
          )}

          {error && !loading && (
            <EmptyState
              title="Dashboard unavailable"
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

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <ActivityChart
                  title="Weekly study time"
                  subtitle="Every bar reflects the minutes logged into your modules over the last 7 days."
                  points={data.weeklyActivity}
                />

                <div className="space-y-4">
                  <SectionHeader
                    eyebrow="Insights"
                    title="Where your time goes"
                    description="These cards help you spot harder modules and stay focused on the next action."
                  />
                  {data.insights.map((insight) => (
                    <InsightCard key={insight.title} {...insight} />
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeader
                  eyebrow="My courses"
                  title="Continue learning"
                  description="Open any enrolled course to update module timing, complete lessons, and review the module breakdown."
                />
                <div className="grid gap-5 xl:grid-cols-2">
                  {data.enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onOpenCourse={onOpenCourse} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
