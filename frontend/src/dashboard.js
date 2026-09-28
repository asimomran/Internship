import Chart from 'chart.js/auto';
import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const activityCanvas = document.getElementById('activityChart');
  const skillsCanvas = document.getElementById('skillsChart');
  if (!activityCanvas || !skillsCanvas) return;

  // Handle Logout
  const logoutBtn = document.querySelector('a[href="/index.html"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    });
  }

  // Initialize UI with user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    document.getElementById('welcome-message').textContent = `Welcome back, ${user.email.split('@')[0]}! 👋`;
  }

    try {
    const response = await api.get('/api/dashboard/student');
    const { stats, weeklyActivity, enrolledCourses: initialCourses } = response.data;
    
    // Requirement 5: Fetch absolute progress from dedicated backend endpoint
    const progressRes = await api.get(`/api/progress/user/courses-progress/${user.id}`);
    const enrolledCourses = progressRes.data;

    // 1. Render Activity Chart (Line)
    const activityLabels = weeklyActivity.map(p => p.label);
    const activityValues = weeklyActivity.map(p => p.minutes / 60);
    renderActivityChart(activityCanvas, activityLabels, activityValues);

    // 2. Render Skills Chart (Doughnut)
    const categoryCounts = enrolledCourses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {});
    renderSkillsChart(skillsCanvas, Object.keys(categoryCounts), Object.values(categoryCounts));

    // 3. Update Stats Widgets
    const enrolledCard = stats.find(s => s.label === 'Enrolled Courses');
    const completedCard = stats.find(s => s.label === 'Completed Courses');
    const hoursCard = stats.find(s => s.label === 'Learning Hours');

    if (enrolledCard) document.getElementById('count-enrolled').textContent = enrolledCard.value;
    if (completedCard) document.getElementById('count-completed').textContent = completedCard.value;
    if (hoursCard) {
      const hoursVal = hoursCard.value.replace('h', '');
      document.getElementById('count-hours').innerHTML = `${hoursVal} <span class="text-xs text-slate-500 font-normal">hrs</span>`;
    }

    // 4. Render Enrolled Courses List
    const enrolledListEl = document.getElementById('enrolled-courses-list');
    const completedListEl = document.getElementById('completed-courses-list');
    const completedSec = document.getElementById('completed-section');

    const inProgress = enrolledCourses.filter(c => c.progressPercent < 100);
    const completed = enrolledCourses.filter(c => c.progressPercent === 100);

    if (inProgress.length === 0) {
        enrolledListEl.innerHTML = '<div class="col-span-full py-8 text-center text-slate-500 italic">No courses in progress. Visit the catalog to get started!</div>';
    } else {
        enrolledListEl.innerHTML = inProgress.map(course => renderCourseCard(course)).join('');
    }

    if (completed.length > 0) {
        completedSec.classList.remove('hidden');
        completedListEl.innerHTML = completed.map(course => renderCourseCard(course, true)).join('');
    } else {
        completedSec.classList.add('hidden');
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});

function renderCourseCard(course, isComplete = false) {
    return `
        <div class="group relative bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 transition-all cursor-pointer hover:border-indigo-500/30" onclick="window.location.href='/course.html?id=${course.id}'">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="font-bold text-white group-hover:text-indigo-400 transition-colors mb-1">${course.title}</h4>
              <span class="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 ${isComplete ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'} rounded border">${course.category}</span>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
                <span class="text-xs font-mono ${isComplete ? 'text-emerald-400' : 'text-slate-500'}">${isComplete ? 'Done' : course.progressPercent + '%'}</span>
                ${isComplete ? '<span class="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-white rounded font-bold uppercase tracking-wider">Completed</span>' : ''}
            </div>

          </div>
          <div class="w-full bg-slate-900 rounded-full h-1">
            <div class="${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'} h-1 rounded-full transition-all" style="width: ${course.progressPercent}%"></div>
          </div>
        </div>
    `;
}

function renderActivityChart(canvas, labels, data) {
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#6366f1',
        backgroundColor: gradient,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#22d3ee',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
      }
    }
  });
}

function renderSkillsChart(canvas, labels, data) {
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#22d3ee', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', boxWidth: 12, padding: 15, font: { size: 11 } }
                }
            }
        }
    });
}
