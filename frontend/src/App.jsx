import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AuthScreen from "./components/AuthScreen";
import CourseDetail from "./components/CourseDetail";
import StudentDashboard from "./components/StudentDashboard";
import {
  STORAGE_KEY,
  createInitialCourseForm,
  navigate,
  parseModulesDraft,
  parseRoute,
  request,
} from "./lib/api";

const initialAuthForm = {
  fullName: "",
  email: "student@coursetrack.com",
  password: "Student@123",
};

function normalizeSession(saved, user) {
  return {
    token: saved.token,
    user: user ?? saved.user,
  };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute(window.location.hash));
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(null);

  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [courseDetail, setCourseDetail] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);


  const [createCourseForm, setCreateCourseForm] = useState(createInitialCourseForm);
  const [createCourseError, setCreateCourseError] = useState("");
  const [createCourseBusy, setCreateCourseBusy] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setBooting(false);
        return;
      }

      try {
        const saved = JSON.parse(raw);
        const user = await request("/auth/me", {}, saved.token);
        const nextSession = normalizeSession(saved, user);
        setSession(nextSession);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      } finally {
        setBooting(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (booting) {
      return;
    }

    if (!session) {
      if (route.type !== "auth") {
        navigate("#/");
      }
      return;
    }

    if (session.user.role === "ADMIN" && route.type !== "admin") {
      navigate("#/admin");
      return;
    }

    if (session.user.role === "USER" && route.type === "auth") {
      navigate("#/dashboard");
    }
  }, [booting, route.type, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.user.role === "ADMIN") {
      loadAdminDashboard(session);
      return;
    }

    if (session.user.role === "USER") {
      loadStudentDashboard(session);
    }
  }, [session]);

  useEffect(() => {
    if (!session || session.user.role !== "USER") {
      setCourseDetail(null);
      setCourseError("");
      return;
    }

    if (route.type === "course") {
      loadCourse(route.courseId, session);
    } else {
      setCourseDetail(null);
      setCourseError("");
    }
  }, [route, session]);

  async function loadStudentDashboard(currentSession = session) {
    if (!currentSession) {
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const payload = await request("/dashboard/student", {}, currentSession.token);
      setStudentDashboard(payload);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function loadAdminDashboard(currentSession = session) {
    if (!currentSession) {
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const payload = await request("/dashboard/admin", {}, currentSession.token);
      setAdminDashboard(payload);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function loadCourse(courseId, currentSession = session) {
    if (!currentSession) {
      return;
    }

    setCourseLoading(true);
    setCourseError("");

    try {
      const payload = await request(`/courses/${courseId}`, {}, currentSession.token);
      setCourseDetail(payload);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setCourseError(error.message);
    } finally {
      setCourseLoading(false);
    }
  }

  function persistSession(nextSession) {
    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStudentDashboard(null);
    setAdminDashboard(null);
    setCourseDetail(null);
    setDashboardError("");
    setCourseError("");
    setAuthError("");
    navigate("#/");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");

    const payload =
      authMode === "signin"
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : {
            fullName: authForm.fullName,
            email: authForm.email,
            password: authForm.password,
          };

    try {
      const response = await request(
        authMode === "signin" ? "/auth/signin" : "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      persistSession(response);
      if (response.user.role === "ADMIN") {
        navigate("#/admin");
      } else {
        navigate("#/dashboard");
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function handleAuthFieldChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleUseDemo(account) {
    setAuthMode("signin");
    setAuthError("");
    setAuthForm({
      fullName: "",
      email: account.email,
      password: account.password,
    });
  }

  function handleCreateCourseFieldChange(event) {
    const { name, value } = event.target;
    setCreateCourseForm((current) => ({
      ...current,
      [name]: name === "durationHours" ? Number(value) : value,
    }));
  }

  async function handleCreateCourse(event) {
    event.preventDefault();
    if (!session) {
      return;
    }

    setCreateCourseBusy(true);
    setCreateCourseError("");

    try {
      const modules = parseModulesDraft(createCourseForm.modulesDraft);
      await request(
        "/courses",
        {
          method: "POST",
          body: JSON.stringify({
            title: createCourseForm.title,
            category: createCourseForm.category,
            level: createCourseForm.level,
            instructor: createCourseForm.instructor,
            durationHours: Number(createCourseForm.durationHours),
            heroAccent: createCourseForm.heroAccent,
            description: createCourseForm.description,
            modules,
          }),
        },
        session.token,
      );

      setCreateCourseForm(createInitialCourseForm());
      await loadAdminDashboard(session);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setCreateCourseError(error.message);
    } finally {
      setCreateCourseBusy(false);
    }
  }

  async function handleLogTime(moduleId, minutes) {
    if (!session || !route.courseId) {
      return;
    }

    setActionBusyId(moduleId);
    setCourseError("");

    try {
      await request(
        `/progress/modules/${moduleId}`,
        {
          method: "POST",
          body: JSON.stringify({ timeSpentMinutes: minutes }),
        },
        session.token,
      );

      await Promise.all([
        loadCourse(route.courseId, session),
        loadStudentDashboard(session),
      ]);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setCourseError(error.message);
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleMarkComplete(moduleId) {
    if (!session || !route.courseId) {
      return;
    }

    setActionBusyId(moduleId);
    setCourseError("");

    try {
      await request(
        `/progress/modules/${moduleId}`,
        {
          method: "POST",
          body: JSON.stringify({ completed: true }),
        },
        session.token,
      );

      await Promise.all([
        loadCourse(route.courseId, session),
        loadStudentDashboard(session),
      ]);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setCourseError(error.message);
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleToggleVideo(videoId, completed) {
    if (!session || !route.courseId) {
      return;
    }

    setActionBusyId(`video-${videoId}`);
    setCourseError("");

    try {
      await request(
        `/progress/videos/${videoId}?completed=${completed}`,
        {
          method: "POST",
        },
        session.token,
      );

      await Promise.all([
        loadCourse(route.courseId, session),
        loadStudentDashboard(session),
      ]);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setCourseError(error.message);
    } finally {
      setActionBusyId(null);
    }
  }

  if (booting) {
    return (
      <div className="app-frame flex items-center justify-center px-6 py-12">
        <div className="glass-panel max-w-lg px-8 py-10 text-center">
          <div className="eyebrow">CourseTrack</div>
          <h1 className="mt-4 text-4xl font-black text-white">Preparing your workspace</h1>
          <p className="mt-4 text-sm text-slate-400">
            Restoring the last session and loading the dashboard configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!session || route.type === "auth") {
    return (
      <AuthScreen
        mode={authMode}
        form={authForm}
        busy={authBusy}
        error={authError}
        onModeChange={setAuthMode}
        onFieldChange={handleAuthFieldChange}
        onSubmit={handleAuthSubmit}
        onUseDemo={handleUseDemo}
      />
    );
  }

  if (session.user.role === "ADMIN") {
    return (
      <AdminDashboard
        data={adminDashboard}
        loading={dashboardLoading}
        error={dashboardError}
        form={createCourseForm}
        createError={createCourseError}
        createBusy={createCourseBusy}
        onFieldChange={handleCreateCourseFieldChange}
        onCreateCourse={handleCreateCourse}
        onRefresh={() => loadAdminDashboard(session)}
        onLogout={logout}
      />
    );
  }

  if (route.type === "course") {
    return (
      <CourseDetail
        user={session.user}
        data={courseDetail}
        loading={courseLoading}
        error={courseError}
        actionBusyId={actionBusyId}
        onBack={() => navigate("#/dashboard")}
        onRefresh={() => loadCourse(route.courseId, session)}
        onLogout={logout}
        onLogTime={handleLogTime}
        onMarkComplete={handleMarkComplete}
        onToggleVideo={handleToggleVideo}
      />
    );
  }

  return (
    <StudentDashboard
      data={studentDashboard}
      loading={dashboardLoading}
      error={dashboardError}
      onOpenCourse={(courseId) => navigate(`#/course/${courseId}`)}
      onRefresh={() => loadStudentDashboard(session)}
      onLogout={logout}
    />
  );
}
