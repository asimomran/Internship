import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  if (!courseId) {
    window.location.href = '/dashboard.html';
    return;
  }

  try {
    // 1. Fetch Course Details (backend now checks enrollment and returns data)
    // If not enrolled, this might return 403 Forbidden
    const courseResponse = await api.get(`/api/courses/${courseId}`);
    const course = courseResponse.data;

    // In this app, if the call succeeds, the student is either admin or enrolled
    // If we want a separate check, we can use the dashboard data (but that's already verified)
    const isEnrolled = true; 
    const userProgress = course.modules.map(m => ({ 
        moduleId: m.id, 
        completed: m.completed,
        timeSpentMinutes: m.timeSpentMinutes
    }));

    updateCourseUI(course, isEnrolled, userProgress);
    renderModules(course.modules || [], userProgress, isEnrolled);

  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert("You are not enrolled in this course yet.");
      window.location.href = '/dashboard.html';
    } else {
      console.error('Error loading course details:', error);
    }
  }
});

function updateCourseUI(course, isEnrolled, progress) {
  document.getElementById('course-initials').textContent = course.title.substring(0, 2).toUpperCase();
  document.getElementById('course-title').textContent = course.title;
  document.getElementById('course-description').textContent = course.description;
  document.getElementById('course-category').textContent = 'Skill Path';
  document.getElementById('course-duration').textContent = `${(course.modules?.length || 0) * 30}m total`;

  const btn = document.getElementById('enroll-resume-btn');
  const progressContainer = document.getElementById('progress-container');

  if (isEnrolled) {
    btn.textContent = 'Resume Learning';
    progressContainer.classList.remove('hidden');
    
    // Requirement 1: Use backend-calculated progress based on videos
    const percent = course.progressPercent || 0;
    
    document.getElementById('course-progress-text').textContent = `${percent}%`;
    document.getElementById('course-progress-bar').style.width = `${percent}%`;


    btn.onclick = () => {
        if (course.modules?.length > 0) {
            window.location.href = `/module.html?courseId=${course.id}&moduleId=${course.modules[0].id}`;
        }
    };
  } else {
    btn.textContent = 'Enroll Now';
    btn.classList.add('bg-indigo-600', 'text-white');
    btn.classList.remove('bg-white', 'text-slate-950');
    
    btn.onclick = async () => {
      try {
        await api.post(`/api/enroll/${course.id}`);
        alert('Successfully enrolled!');
        window.location.reload();
      } catch (error) {
        alert('Enrollment failed.');
      }
    };
  }
}

function renderModules(modules, progress, isEnrolled) {
  const container = document.getElementById('module-list-container');
  // Clear old static content but keep header
  const title = container.querySelector('h2');
  container.innerHTML = '';
  container.appendChild(title);

  if (modules.length === 0) {
    container.innerHTML += '<p class="text-slate-500 italic">No modules available yet.</p>';
    return;
  }

  modules.forEach((module, index) => {
    const modProgress = progress.find(p => p.module?.id === module.id);
    const isCompleted = modProgress?.completed;
    
    const item = document.createElement(isEnrolled ? 'a' : 'div');
    if (isEnrolled) {
        item.href = `/module.html?courseId=${course.id}&moduleId=${module.id}`;
        item.className = `block bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 backdrop-blur-sm transition-all group`;
    } else {
        item.className = `block bg-slate-900/20 border border-slate-800/50 rounded-2xl p-5 opacity-75 cursor-not-allowed`;
    }

    item.innerHTML = `
      <div class="flex items-center gap-5">
        <div class="h-12 w-12 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'} flex items-center justify-center flex-shrink-0 border border-slate-700 group-hover:scale-110 transition-transform">
          ${isCompleted ? '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'}
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">${index + 1}. ${module.title}</h3>
          <p class="text-slate-400 text-sm mt-1">${module.description || 'No description provided.'}</p>
        </div>
        <div class="text-sm font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-500'} flex flex-col items-end">
          <span>${isCompleted ? 'Completed' : 'Locked'}</span>
          <span class="text-xs text-slate-600">30 mins</span>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}
