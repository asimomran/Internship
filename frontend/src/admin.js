import Chart from 'chart.js/auto';
import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Handle Logout
    const logoutBtn = document.querySelector('a[href="/index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        const response = await api.get('/api/dashboard/admin');
        const { stats, coursePerformance } = response.data;

        // Update Stats
        const statsValueEls = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-4 .text-2xl.font-bold');
        if (statsValueEls.length >= 4) {
            statsValueEls[0].textContent = stats.find(s => s.label === 'Learners')?.value || '0';
            statsValueEls[1].textContent = stats.find(s => s.label === 'Courses')?.value || '0';
            statsValueEls[2].textContent = stats.find(s => s.label === 'Modules')?.value || '0';
            statsValueEls[3].textContent = stats.find(s => s.label === 'Completion Rate')?.value || '0%';
        }

        // Render Admin Charts
        renderAdminCharts(coursePerformance);

        // Update Courses Table
        renderCoursesTable(coursePerformance);

    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }

    // Modal Logic
    const modal = document.getElementById('create-course-modal');
    const openBtn = document.querySelector('button.bg-gradient-to-r.from-purple-500');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('create-course-form');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // Handle Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const courseData = {
                title: document.getElementById('course-title-input').value,
                category: document.getElementById('course-category-input').value,
                description: document.getElementById('course-description-input').value,
                instructor: document.getElementById('course-instructor-input').value,
                heroAccent: document.getElementById('course-accent-input').value,
                level: 'Beginner', // Default
                durationHours: 1, // Default
                modules: [{
                    sequenceOrder: 1,
                    title: document.getElementById('module-title-input').value,
                    summary: document.getElementById('module-summary-input').value,
                    content: document.getElementById('module-content-input').value,
                    estimatedMinutes: 30
                }]
            };

            try {
                await api.post('/api/courses', courseData);
                alert('Course published successfully!');
                modal.classList.add('hidden');
                window.location.reload();
            } catch (error) {
                console.error('Failed to create course:', error);
                alert('Failed to publish course. Please check all fields.');
            }
        });
    }
});

function renderAdminCharts(courses) {
    const perfCanvas = document.getElementById('adminPerformanceChart');
    const catCanvas = document.getElementById('adminCategoryChart');
    if (!perfCanvas || !catCanvas) return;

    // 1. Performance Bar Chart (Avg Progress)
    const labels = courses.map(c => c.title);
    const progressData = courses.map(c => c.averageProgress);
    
    new Chart(perfCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Progress %',
                data: progressData,
                backgroundColor: 'rgba(168, 85, 247, 0.6)',
                borderColor: '#a855f7',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                y: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { size: 11 } } }
            }
        }
    });

    // 2. Category Share Doughnut
    const categories = [...new Set(courses.map(c => c.category))];
    const catTotals = categories.map(cat => courses.filter(c => c.category === cat).reduce((sum, c) => sum + c.enrollmentCount, 0));

    new Chart(catCanvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: catTotals,
                backgroundColor: ['#a855f7', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

function renderCoursesTable(courses) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500 italic">No courses created yet.</td></tr>';
        return;
    }

    tbody.innerHTML = courses.map(course => `
        <tr class="hover:bg-slate-800/30 transition-colors">
            <td class="px-6 py-4 font-medium text-white flex items-center gap-3">
                <div class="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    ${course.title.substring(0, 2).toUpperCase()}
                </div>
                ${course.title}
            </td>
            <td class="px-6 py-4">${course.category}</td>
            <td class="px-6 py-4">${course.moduleCount}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="flex-1 w-16 bg-slate-800 rounded-full h-1.5">
                        <div class="bg-purple-500 h-1.5 rounded-full" style="width: ${course.averageProgress}%"></div>
                    </div>
                    <span class="text-xs text-slate-500">${course.averageProgress}%</span>
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-purple-400 transition-colors mr-3" onclick="window.location.href='/course.html?id=${course.id}'">View</button>
                <button class="text-slate-400 hover:text-red-400 transition-colors">Delete</button>
            </td>
        </tr>
    `).join('');
}
