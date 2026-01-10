/**
 * QueryQuill - Hash-Based SPA
 */

// --- STATE MANAGEMENT ---
const loadState = () => {
    try {
        const saved = localStorage.getItem('queryquill_state');
        return saved ? JSON.parse(saved) : { user: null, gamification: { level: 3, xp: 450, streak: 5 } };
    } catch (e) {
        console.error("Could not load state", e);
        return { user: null, gamification: { level: 1, xp: 0, streak: 0 } };
    }
};

let state = loadState();

const saveState = () => {
    localStorage.setItem('queryquill_state', JSON.stringify(state));
};

// --- ROUTER ---
const routes = {
    '#login': renderLogin,
    '#signup': renderSignup,
    '#dashboard': renderDashboard,
    '#workspace': renderWorkspace,
    '#practice': renderPractice,
    '#flashcards': renderFlashcards,
    '#progress': renderProgress,
    '#leaderboard': renderLeaderboard,
    '#settings': renderSettings,
    '#about': renderAbout
};

function router() {
    let hash = window.location.hash || '#login';

    // Auth Guard
    if (!state.user && hash !== '#signup') {
        hash = '#login';
    } else if (state.user && (hash === '#login' || hash === '#signup')) {
        hash = '#dashboard';
    }

    const renderFn = routes[hash] || routes['#login'];
    const app = document.getElementById('app');
    
    if (state.user) {
        // Logged In Layout
        app.innerHTML = `
            <div class="mobile-header">
                <div class="brand" style="margin:0; font-size:1.2rem;">
                    <ion-icon name="book"></ion-icon> QueryQuill
                </div>
                <button class="mobile-nav-toggle" onclick="toggleSidebar()">
                    <ion-icon name="menu-outline"></ion-icon>
                </button>
            </div>
            
            <div class="app-shell">
                ${renderSidebar(hash)}
                <main class="main-content fade-in">
                    ${renderFn()}
                </main>
            </div>
            
            <div id="sidebar-overlay" onclick="toggleSidebar(false)" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:95; display:none;"></div>
        `;
    } else {
        // Logged Out Layout
        app.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem;" class="fade-in">
                ${renderFn()}
            </div>
        `;
    }
}

// --- VIEW COMPONENTS ---

function renderSidebar(currentHash) {
    const links = [
        { icon: 'grid-outline', text: 'Dashboard', href: '#dashboard' },
        { icon: 'document-text-outline', text: 'Workspace', href: '#workspace' },
        { icon: 'create-outline', text: 'Practice', href: '#practice' },
        { icon: 'albums-outline', text: 'Flashcards', href: '#flashcards' },
        { icon: 'stats-chart-outline', text: 'Progress', href: '#progress' },
        { icon: 'trophy-outline', text: 'Leaderboard', href: '#leaderboard' },
        { icon: 'settings-outline', text: 'Settings', href: '#settings' },
        { icon: 'information-circle-outline', text: 'About', href: '#about' },
    ];

    return `
        <aside class="sidebar" id="sidebar">
            <div class="brand">
                <ion-icon name="book"></ion-icon>
                <span>QueryQuill</span>
            </div>
            
            <nav class="nav-menu">
                ${links.map(link => `
                    <a href="${link.href}" onclick="toggleSidebar(false)" 
                       class="nav-item ${currentHash === link.href ? 'active' : ''}">
                        <ion-icon name="${link.icon}"></ion-icon> ${link.text}
                    </a>
                `).join('')}
            </nav>

            <div class="user-mini">
                <div style="width: 35px; height: 35px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${state.user.name[0]}
                </div>
                <div>
                    <div style="font-size: 0.9rem; font-weight: 600;">${state.user.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${state.user.role}</div>
                </div>
            </div>
        </aside>
    `;
}

function renderLogin() {
    return `
        <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="color: var(--primary); font-size: 2rem; margin-bottom: 0.5rem;">QueryQuill</h1>
                <p class="text-muted">Login to your workspace</p>
            </div>
            <form onsubmit="handleAuth(event)">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" value="user@demo.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" value="password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Log In</button>
            </form>
            <p style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem;">
                No account? <a href="#signup" style="color: var(--primary);">Sign up</a>
            </p>
        </div>
    `;
}

function renderSignup() {
    return `
        <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="font-size: 2rem;">Create Account</h1>
                <p class="text-muted">Join the learning community</p>
            </div>
            <form onsubmit="handleAuth(event, true)">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" id="signup-name" class="form-input" required placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label class="form-label">Role</label>
                    <select id="signup-role" class="form-input">
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Sign Up</button>
            </form>
            <p style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem;">
                Already have an account? <a href="#login" style="color: var(--primary);">Log In</a>
            </p>
        </div>
    `;
}

function renderDashboard() {
    return `
        <header class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <p class="text-muted">Welcome back, ${state.user.name}.</p>
        </header>

        <div class="grid grid-4" style="margin-bottom: 2rem;">
            <div class="card">
                <div class="text-muted" style="font-size: 0.9rem;">Level</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${state.gamification.level}</div>
            </div>
            <div class="card">
                <div class="text-muted" style="font-size: 0.9rem;">Streak</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--accent);">${state.gamification.streak} <span style="font-size:1rem">days</span></div>
            </div>
            <div class="card">
                <div class="text-muted" style="font-size: 0.9rem;">XP Earned</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary);">${state.gamification.xp}</div>
            </div>
            <div class="card">
                <div class="text-muted" style="font-size: 0.9rem;">Badges</div>
                <div style="font-size: 2rem; font-weight: 700;">4</div>
            </div>
        </div>

        <h3>Quick Actions</h3>
        <div class="grid grid-3" style="margin-top: 1rem;">
            <a href="#workspace" class="card" style="text-align: center; padding: 2rem; display:block;">
                <ion-icon name="cloud-upload-outline" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></ion-icon>
                <h4>Upload Document</h4>
            </a>
            <a href="#practice" class="card" style="text-align: center; padding: 2rem; display:block;">
                <ion-icon name="create-outline" style="font-size: 3rem; color: var(--secondary); margin-bottom: 1rem;"></ion-icon>
                <h4>Start Practice</h4>
            </a>
            <a href="#flashcards" class="card" style="text-align: center; padding: 2rem; display:block;">
                <ion-icon name="albums-outline" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;"></ion-icon>
                <h4>Flashcards</h4>
            </a>
        </div>
    `;
}

function renderWorkspace() {
    return `
        <header class="page-header">
            <h1 class="page-title">Document Workspace</h1>
            <p class="text-muted">Upload notes to generate AI summaries.</p>
        </header>
        <div class="grid grid-2">
            <div class="card" style="height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed var(--border);">
                <ion-icon name="document-text-outline" style="font-size: 4rem; color: var(--text-muted);"></ion-icon>
                <h3 style="margin-top: 1rem;">Drop PDF here</h3>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="alert('File uploaded (Simulated)')">Select File</button>
            </div>
            <div class="card" style="height: 400px; display: flex; align-items: center; justify-content: center;">
                <p class="text-muted">AI output will appear here.</p>
            </div>
        </div>
    `;
}

function renderPractice() {
    return `
        <header class="page-header">
            <h1 class="page-title">Practice Zone</h1>
            <p class="text-muted">Biology - Cell Structure</p>
        </header>
        <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
                <span class="badge badge-primary">Q3 / 10</span>
                <span>Time: 04:20</span>
            </div>
            <h3 style="margin-bottom: 2rem;">Which organelle produces ATP?</h3>
            <div class="grid grid-1">
                <button class="btn btn-outline" style="justify-content: flex-start;" onclick="this.style.borderColor='red'">A. Nucleus</button>
                <button class="btn btn-outline" style="justify-content: flex-start;" onclick="this.style.borderColor='var(--secondary)'; this.style.color='var(--secondary)'">B. Mitochondria</button>
                <button class="btn btn-outline" style="justify-content: flex-start;" onclick="this.style.borderColor='red'">C. Ribosome</button>
            </div>
            <div style="margin-top: 2rem; text-align: right;">
                <button class="btn btn-primary">Next <ion-icon name="arrow-forward"></ion-icon></button>
            </div>
        </div>
    `;
}

function renderFlashcards() {
    return `
        <header class="page-header">
            <h1 class="page-title">Flashcards</h1>
        </header>
        <div style="display: flex; justify-content: center; margin-top: 3rem;">
            <div class="flashcard-container" onclick="this.querySelector('.flashcard-inner').classList.toggle('flipped')" style="width: 100%; max-width: 400px;">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <h3 style="color: var(--primary);">Photosynthesis</h3>
                        <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">Tap to reveal definition</p>
                    </div>
                    <div class="flashcard-back">
                        <p style="line-height: 1.6;">The process by which green plants use sunlight to synthesize nutrients.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProgress() {
    return `
        <header class="page-header"><h1 class="page-title">Progress</h1></header>
        <div class="card">
            <h3>Subject Mastery</h3>
            <div style="margin-top: 1rem;">Biology: <div style="height:10px; background:#333; border-radius:5px; margin-top:5px;"><div style="width:85%; height:100%; background:var(--secondary); border-radius:5px;"></div></div></div>
            <div style="margin-top: 1rem;">History: <div style="height:10px; background:#333; border-radius:5px; margin-top:5px;"><div style="width:40%; height:100%; background:var(--accent); border-radius:5px;"></div></div></div>
        </div>
    `;
}

function renderLeaderboard() {
    return `
        <header class="page-header"><h1 class="page-title">Leaderboard</h1></header>
        <div class="card">
            <table style="width: 100%; text-align: left;">
                <tr><th style="padding:1rem;">Rank</th><th>User</th><th>XP</th></tr>
                <tr><td style="padding:1rem;">#1</td><td>Sarah</td><td>14,500</td></tr>
                <tr><td style="padding:1rem;">#2</td><td>Mike</td><td>12,200</td></tr>
                <tr><td style="padding:1rem;">#3</td><td>You</td><td>${state.gamification.xp}</td></tr>
            </table>
        </div>
    `;
}

function renderSettings() {
    return `
        <header class="page-header"><h1 class="page-title">Settings</h1></header>
        <div class="card">
            <div class="form-group" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>User Role</strong><br>
                    <span class="text-muted">Current: ${state.user.role}</span>
                </div>
                <button class="btn btn-outline" onclick="toggleRole()">Switch Role</button>
            </div>
            <div style="margin-top: 2rem;">
                <button class="btn btn-outline" style="border-color:var(--danger); color:var(--danger);" onclick="logout()">Logout & Reset</button>
            </div>
        </div>
    `;
}

function renderAbout() {
    return `<div class="card" style="text-align:center; padding: 4rem;"><h1>QueryQuill</h1><p class="text-muted">A Smart Study Workspace.</p></div>`;
}

// --- ACTIONS & HANDLERS ---

window.handleAuth = (e, isSignup = false) => {
    e.preventDefault();
    const name = isSignup ? document.getElementById('signup-name').value : 'Demo User';
    const role = isSignup ? document.getElementById('signup-role').value : 'student';
    
    state.user = { name: name, role: role };
    saveState();
    window.location.hash = '#dashboard';
};

window.logout = () => {
    localStorage.removeItem('queryquill_state');
    state.user = null;
    window.location.hash = '#login';
};

window.toggleRole = () => {
    state.user.role = state.user.role === 'student' ? 'teacher' : 'student';
    saveState();
    router();
    alert(`Switched to ${state.user.role} mode`);
};

window.toggleSidebar = (forceOpen) => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    if (forceOpen === false) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
    } else {
        sidebar.classList.toggle('open');
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    }
};

window.addEventListener('load', () => {
    router();
});

window.addEventListener('hashchange', router);