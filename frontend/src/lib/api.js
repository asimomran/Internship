export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api";

export const STORAGE_KEY = "coursetrack-session";

export const DEMO_ACCOUNTS = [
  {
    label: "Admin demo",
    hint: "Analytics and course management",
    email: "admin@learnflow.com",
    password: "admin123",
  },
  {
    label: "Student demo",
    hint: "Course progress and module tracking",
    email: "student@coursetrack.com",
    password: "Student@123",
  },
];

export function parseRoute(hashValue) {
  const hash = hashValue || "#/";
  if (hash.startsWith("#/course/")) {
    const courseId = Number(hash.split("/")[2]);
    return Number.isFinite(courseId) ? { type: "course", courseId } : { type: "auth" };
  }
  if (hash === "#/dashboard") {
    return { type: "dashboard" };
  }
  if (hash === "#/admin") {
    return { type: "admin" };
  }
  return { type: "auth" };
}

export function navigate(path) {
  window.location.hash = path;
}

export async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function minutesToLabel(totalMinutes) {
  const minutes = Number(totalMinutes ?? 0);
  if (!minutes) {
    return "0 mins";
  }
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  return `${(minutes / 60).toFixed(1)} hrs`;
}

export function percentageLabel(value) {
  return `${Math.round(Number(value ?? 0))}%`;
}

export function withAlpha(color, alpha = "24") {
  if (typeof color === "string" && color.startsWith("#") && color.length === 7) {
    return `${color}${alpha}`;
  }
  return color;
}

export function createInitialCourseForm() {
  return {
    title: "",
    category: "Backend",
    level: "Intermediate",
    instructor: "",
    durationHours: 12,
    heroAccent: "#14b8a6",
    description: "",
    modulesDraft: [
      "Course kickoff | 30 | Introduce the learning goals and project scope. | Walk through the stack, workflow, and expected outcomes.",
      "Core implementation | 60 | Build the most important feature set first. | Ship the key screens, endpoints, and happy-path experience.",
      "Reporting and polish | 45 | Add analytics and cleanup for the final experience. | Review edge cases, charts, progress tracking, and final QA.",
    ].join("\n"),
  };
}

export function parseModulesDraft(draft) {
  const lines = draft
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Add at least one module line before creating a course.");
  }

  return lines.map((line, index) => {
    const [title, minutesRaw, summary, ...contentParts] = line.split("|").map((part) => part.trim());
    const estimatedMinutes = Number(minutesRaw);
    const content = contentParts.join(" | ");

    if (!title || !summary || !content || !Number.isFinite(estimatedMinutes)) {
      throw new Error(
        "Each module line must follow: Title | Minutes | Summary | Content",
      );
    }

    return {
      sequenceOrder: index + 1,
      title,
      summary,
      content,
      estimatedMinutes,
    };
  });
}
