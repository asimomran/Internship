import { useState } from "react";
import {
  BrandMark,
  CourseBadge,
  EmptyState,
  ProgressRing,
  SectionHeader,
} from "./ui";
import { minutesToLabel, withAlpha } from "../lib/api";

function ModuleCard({ module, accent, busy, onLogTime, onMarkComplete, onToggleVideo }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(null);

  const handleStartVideo = (video) => {
    setActiveVideo(video);
    setVideoStartTime(Date.now());
  };

  const handleCompleteVideo = (video) => {
    let minutes = 0;
    if (videoStartTime) {
      minutes = Math.max(1, Math.round((Date.now() - videoStartTime) / 60000));
    }
    setActiveVideo(null);
    setVideoStartTime(null);
    onToggleVideo(video.id, true, minutes);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    setVideoStartTime(null);
  };

  return (
    <div
      className="surface-card overflow-hidden"
      style={{
        borderColor: module.completed ? withAlpha(accent, "52") : undefined,
        background: module.completed
          ? `linear-gradient(180deg, ${withAlpha(accent, "20")}, rgba(8, 21, 30, 0.86))`
          : undefined,
      }}
    >
      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CourseBadge text={`Module ${module.sequenceOrder}`} accent={accent} />
              {module.completed && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  completed
                </span>
              )}
            </div>
            <h3 className="mt-4 text-2xl font-black text-white">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{module.summary}</p>
            <p className="mt-4 text-sm leading-7 text-slate-400">{module.content}</p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-300 lg:min-w-[220px]">
            <div className="flex items-center justify-between">
              <span>Estimated</span>
              <span>{module.estimatedMinutes} mins</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Tracked</span>
              <span>{minutesToLabel(module.timeSpentMinutes)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Status</span>
              <span>{module.completed ? "Done" : "In progress"}</span>
            </div>
          </div>
        </div>

        {/* Video List */}
        {module.videos && module.videos.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Module Content</h4>
            {module.videos.map((video) => (
              <div 
                key={video.id} 
                className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex flex-1 items-center gap-4">
                  <button
                    disabled={busy}
                    onClick={() => onToggleVideo(video.id, !video.completed)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={{
                      borderColor: video.completed ? accent : 'rgba(255,255,255,0.2)',
                      backgroundColor: video.completed ? accent : 'transparent',
                    }}
                  >
                    {video.completed && (
                      <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{video.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Video Lesson</p>
                  </div>
                </div>
                {!video.completed && activeVideo?.id !== video.id && video.videoUrl && (
                  <button 
                    onClick={() => handleStartVideo(video)}
                    className="ghost-button !py-1.5 !px-3 !text-xs !bg-slate-900/40"
                  >
                    Watch
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal/Inline */}
        {activeVideo && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-3">
              <div className="font-semibold text-white">{activeVideo.title}</div>
              <button onClick={handleCloseVideo} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={activeVideo.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex justify-end">
              <button
                className="action-button"
                disabled={busy}
                onClick={() => handleCompleteVideo(activeVideo)}
              >
                Finished Watching
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-white/10">
          <button
            className="ghost-button"
            disabled={busy}
            onClick={() => onLogTime(module.id, 15)}
          >
            +15 mins
          </button>
          <button
            className="ghost-button"
            disabled={busy}
            onClick={() => onLogTime(module.id, 30)}
          >
            +30 mins
          </button>
          {!module.videos || module.videos.length === 0 ? (
            <button
              className="action-button"
              disabled={busy || module.completed}
              onClick={() => onMarkComplete(module.id)}
            >
              {module.completed ? "Completed" : "Mark complete"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CourseDetail({
  user,
  data,
  loading,
  error,
  actionBusyId,
  onBack,
  onRefresh,
  onLogout,
  onLogTime,
  onMarkComplete,
  onToggleVideo,
}) {
  if (loading) {
    return (
      <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <EmptyState
            title="Loading course detail"
            description="Bringing in module progress, tracked time, and your next recommended step."
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <EmptyState
            title="Course detail unavailable"
            description={error || "This course could not be loaded right now."}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <button className="ghost-button" onClick={onBack}>
                  Back to dashboard
                </button>
                <button className="action-button" onClick={onRefresh}>
                  Retry
                </button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="ambient-orb left-[-6rem] top-10 h-80 w-80 bg-teal-400/18" aria-hidden="true" />
      <div
        className="ambient-orb bottom-[-4rem] right-[-2rem] h-[22rem] w-[22rem]"
        aria-hidden="true"
        style={{ background: withAlpha(data.heroAccent, "26") }}
      />

      <div className="mx-auto max-w-6xl">
        <header className="glass-panel px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <BrandMark />
              <div className="h-px w-full bg-white/10 sm:h-10 sm:w-px" />
              <div>
                <div className="eyebrow">Course detail</div>
                <div className="mt-1 text-lg font-bold text-white">{user?.fullName}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="ghost-button" onClick={onBack}>
                Back to dashboard
              </button>
              <button className="ghost-button" onClick={onRefresh}>
                Refresh
              </button>
              <button className="ghost-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <section className="glass-panel overflow-hidden px-6 py-8 sm:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <CourseBadge text={data.category} accent={data.heroAccent} />
                <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
                  {data.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base text-slate-300">{data.description}</p>

                <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
                  <div className="surface-card p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Instructor</div>
                    <div className="mt-2 text-lg font-bold text-white">{data.instructor}</div>
                  </div>
                  <div className="surface-card p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Difficulty</div>
                    <div className="mt-2 text-lg font-bold text-white">{data.level}</div>
                  </div>
                  <div className="surface-card p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Logged time</div>
                    <div className="mt-2 text-lg font-bold text-white">{minutesToLabel(data.totalMinutesSpent)}</div>
                  </div>
                </div>
              </div>

              <div className="surface-card flex flex-col items-center justify-center gap-6 p-6">
                <ProgressRing value={data.progressPercent} accent={data.heroAccent} />
                <div className="w-full space-y-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Completed modules</span>
                    <span>{data.completedModules}/{data.totalModules}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next module</span>
                    <span>{data.nextModule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Most time spent</span>
                    <span>{data.toughestModule}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Modules"
              title="Study path"
              description="Log time as you work through each module. The dashboard updates immediately after every action."
            />
            <div className="grid gap-4">
              {data.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  accent={data.heroAccent}
                  busy={actionBusyId === module.id}
                  onLogTime={onLogTime}
                  onMarkComplete={onMarkComplete}
                  onToggleVideo={onToggleVideo}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
