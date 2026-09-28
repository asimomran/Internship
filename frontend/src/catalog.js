import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await api.get('/api/courses');
        const courses = response.data;
        renderCatalog(courses);
    } catch (error) {
        console.error('Error loading catalog:', error);
    }
});

function renderCatalog(courses) {
    const container = document.getElementById('catalog-list');
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 italic text-lg">No courses available at the moment. Check back later!</div>';
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="group bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm relative overflow-hidden hover:border-indigo-500/50 transition-all transform hover:-translate-y-1">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div class="flex items-start justify-between mb-4">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    ${course.title.substring(0, 2).toUpperCase()}
                </div>
                <span class="text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">${course.category}</span>
            </div>

            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">${course.title}</h3>
            <p class="text-sm text-slate-400 mb-6 line-clamp-3">${course.description}</p>
            
            <div class="flex items-center justify-between mt-auto">
                <div class="flex flex-col">
                    <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Instructor</span>
                    <span class="text-sm text-slate-300">${course.instructor || 'Staff'}</span>
                </div>
                <button onclick="window.location.href='/course.html?id=${course.id}'" class="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-all">
                    View Course
                </button>
            </div>
        </div>
    `).join('');
}
