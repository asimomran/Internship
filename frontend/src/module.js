import api from './api.js';

let secondsSpent = 0;
let moduleId = null;
let courseId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    moduleId = urlParams.get('moduleId');
    courseId = urlParams.get('courseId');

    if (!moduleId) {
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        const courseRes = await api.get(`/api/courses/${courseId}`);
        const course = courseRes.data;
        const module = course.modules.find(m => m.id === parseInt(moduleId));

        if (!module) {
            alert("Module not found or you are not enrolled.");
            window.location.href = '/dashboard.html';
            return;
        }

        const backLink = document.getElementById('back-link');
        if (backLink) backLink.href = `/course.html?id=${courseId}`;

        document.getElementById('module-title').textContent = module.title;
        document.getElementById('course-name').textContent = course.title;
        document.getElementById('module-description-text').innerHTML = `
            <p class="leading-relaxed mb-4">${module.summary || 'No summary available.'}</p>
        `;

        renderVideos(module.videos);
        if (module.videos.length > 0) {
            playVideo(module.videos[0]);
        }

        updateModuleCompleteUI(module.completed);
        startTimer();
        setupCompleteButton();

        // Initial progress load
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
           updateCourseProgressUI(user.id, courseId);
        }


    } catch (error) {
        console.error('Error loading module:', error);
        alert("Failed to load module content. Redirecting...");
        window.location.href = '/dashboard.html';
    }
});

function renderVideos(videos) {
    const list = document.getElementById('video-list');
    if (!list) return;

    list.innerHTML = videos.map(v => `
        <div class="video-item p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 transition-all cursor-pointer group flex items-center justify-between" data-id="${v.id}">
            <div class="flex items-center gap-3 overflow-hidden" onclick="playVideoById(${v.id})">
                <div class="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <svg class="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                </div>
                <h4 class="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">${v.title}</h4>
            </div>
            <button onclick="toggleVideo(${v.id}, ${!v.completed})" class="flex-shrink-0 ml-2 h-6 w-6 rounded-md border ${v.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 text-slate-500'} flex items-center justify-center hover:scale-110 transition-all">
                ${v.completed ? '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
            </button>

        </div>
    `).join('');
    
    // Save videos to window for easy access
    window.currentModuleVideos = videos;
}

window.playVideoById = (id) => {
    const video = window.currentModuleVideos.find(v => v.id === id);
    if (video) playVideo(video);
};

function playVideo(video) {
    const player = document.getElementById('video-player');
    if (player) {
        player.src = video.videoUrl;
    }
    // Highlight active video
    document.querySelectorAll('.video-item').forEach(el => {
        el.classList.remove('border-indigo-500/50', 'bg-indigo-500/5');
        if (el.dataset.id == video.id) {
            el.classList.add('border-indigo-500/50', 'bg-indigo-500/5');
        }
    });
}

window.toggleVideo = async (videoId, completed) => {
    if (!completed) return; // The specific API requested is for completion

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    try {
        // Requirement 3: Use specific POST /progress/complete API
        await api.post('/api/progress/complete', {
            userId: user.id,
            courseId: parseInt(courseId),
            moduleId: parseInt(moduleId),
            videoId: videoId
        });

        // Requirement 5: Recalculate and update UI in real-time
        const progressRes = await api.get(`/api/progress/${user.id}/${courseId}`);
        const { totalVideos, completedVideos, progressPercentage } = progressRes.data;

        // Requirement 9: Logging for debugging
        console.log(`[Progress Sync] Course ID: ${courseId}`);
        console.log(`- Total Videos: ${totalVideos}`);
        console.log(`- Completed Videos: ${completedVideos}`);
        console.log(`- Progress: ${progressPercentage}%`);

        // Fetch refreshed module data to update the checklist
        const courseRes = await api.get(`/api/courses/${courseId}`);
        const updatedModule = courseRes.data.modules.find(m => m.id === parseInt(moduleId));
        
        if (updatedModule) {
            renderVideos(updatedModule.videos);
            updateModuleCompleteUI(updatedModule.completed);
        }

        // Update Course Progress UI in real-time
        updateCourseProgressUI(user.id, courseId);
        
    } catch (err) {
        console.error('Failed to update progress:', err);
    }
};

async function updateCourseProgressUI(userId, courseId) {
    try {
        const progressRes = await api.get(`/api/progress/${userId}/${courseId}`);
        const { progressPercentage } = progressRes.data;
        
        const percentEl = document.getElementById('course-progress-percent');
        const fillEl = document.getElementById('course-progress-fill');
        
        if (percentEl) percentEl.textContent = `${progressPercentage}%`;
        if (fillEl) fillEl.style.width = `${progressPercentage}%`;
    } catch (err) {
        console.error('Failed to fetch course progress for UI:', err);
    }
}


function updateModuleCompleteUI(isComplete) {
    const btn = document.getElementById('complete-btn');
    if (isComplete) {
        btn.innerHTML = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Completed`;
        btn.classList.add('bg-emerald-500', 'from-emerald-500', 'to-emerald-400');
        btn.classList.remove('bg-gradient-to-r', 'from-indigo-500', 'to-cyan-500');
        btn.disabled = true;
    }
}

function startTimer() {
    const timerElement = document.getElementById('time-tracker');
    setInterval(() => {
        secondsSpent++;
        if (timerElement) {
            const m = Math.floor(secondsSpent / 60).toString().padStart(2, '0');
            const s = (secondsSpent % 60).toString().padStart(2, '0');
            timerElement.innerText = `${m}:${s}`;
        }

        if (secondsSpent % 60 === 0) {
            syncSession();
        }
    }, 1000);
}

async function syncSession() {
    try {
        await api.post(`/api/sessions/${moduleId}`, { minutes: 1 });
        await api.post(`/api/progress/modules/${moduleId}`, { timeSpentMinutes: 1 }); 
    } catch (err) {
        console.error('Heartbeat sync failed:', err);
    }
}

function setupCompleteButton() {
    const btn = document.getElementById('complete-btn');
    btn.addEventListener('click', async () => {
        try {
            await api.post(`/api/progress/modules/${moduleId}`, { completed: true });
            updateModuleCompleteUI(true);
            alert('Module marked as complete!');
        } catch (err) {
            console.error('Failed to mark as complete:', err);
            alert('Failed to mark as complete.');
        }
    });
}
