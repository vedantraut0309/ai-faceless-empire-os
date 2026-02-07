/**
 * AI Faceless Empire OS - Core Logic
 */

// --- GLOBAL STATE ---
let currentTab = 'dashboard';
let scene, camera, renderer, particles, grid, gridMaterial;
let searchQuery = '';
let activeFilters = {
    platform: 'All',
    competition: 'All',
    monetization: 'All',
    minRpm: 0
};

// --- TOOL DIRECTORY STATE ---
let toolSearchQuery = '';
let activeToolCategory = 'All';
let selectedTool = null;
let toolHistory = JSON.parse(localStorage.getItem('empire-tool-history')) || [];
let toolStats = JSON.parse(localStorage.getItem('empire-tool-stats')) || {
    usedToday: 0,
    totalOutputs: toolHistory.length,
    mostUsed: 'None'
};

// --- GLOBAL SETTINGS STATE ---
let empireSettings = JSON.parse(localStorage.getItem('empire-settings')) || {
    accentColor: 'purple',
    depthMotion: true,
    reducedLatency: false,
    username: 'Empire_Architect_01',
    email: 'architect@faceless.os'
};

const AI_TOOLS_DATA = [
    {
        id: 'chatgpt',
        name: 'ChatGPT-4o',
        icon: '💬',
        category: 'Script / Text AI',
        status: 'Active',
        desc: 'Advanced reasoning and script architecture for long-form content.',
        prompt: 'e.g. Write a viral script about money mindset...'
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        icon: '🎙️',
        category: 'Voice / Audio AI',
        status: 'Active',
        desc: 'Industry-leading voice cloning and neural speech synthesis.',
        prompt: 'e.g. Generate a male motivational voiceover with deep bass...'
    },
    {
        id: 'heygen',
        name: 'HeyGen',
        icon: '👤',
        category: 'Video AI',
        status: 'Beta',
        desc: 'AI avatar generation and video lip-syncing for talking head videos.',
        prompt: 'e.g. Create an AI avatar explaining Bitcoin trends...'
    },
    {
        id: 'midjourney',
        name: 'Midjourney v6',
        icon: '🎨',
        category: 'Image AI',
        status: 'Active',
        desc: 'High-fidelity cinematic image generation for thumbnails and b-roll.',
        prompt: 'e.g. Cinematic high-performance command center, 8k...'
    },
    {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        icon: '🌀',
        category: 'Image AI',
        status: 'Active',
        desc: 'Open-source image model with advanced control and in-painting.',
        prompt: 'e.g. Realistic 3D render of a futuristic empire office...'
    },
    {
        id: 'capcut-ai',
        name: 'CapCut AI',
        icon: '✂️',
        category: 'Video AI',
        status: 'Active',
        desc: 'Intelligent video editing tools and auto-reframe for short-form.',
        prompt: 'e.g. Auto-edit my footage into a high-retention short...'
    },
    {
        id: 'whisper',
        name: 'Whisper AI',
        icon: '📝',
        category: 'Subtitle / Caption AI',
        status: 'Active',
        desc: 'Sub-second precision speech-to-text and translation engine.',
        prompt: 'e.g. Transcribe and add captions to my 60s video...'
    },
    {
        id: 'zapier-ai',
        name: 'Zapier Automation',
        icon: '⚡',
        category: 'Automation AI',
        status: 'Active',
        desc: 'Connect your content workflow with 5000+ app integrations.',
        prompt: 'e.g. Post my video to all socials when it drops...'
    },
    {
        id: 'custom-ai',
        name: 'Custom AI Tool',
        icon: '🛠️',
        category: 'Automation AI',
        status: 'Beta',
        desc: 'Build your own neural routing and custom API connections.',
        prompt: 'e.g. Route my inputs to a custom LLM endpoint...'
    }
];

const NICHE_DATA = [
    {
        id: 1,
        name: 'AI Storytelling',
        platforms: ['YouTube', 'TikTok'],
        rpm: 18,
        competition: 'Medium',
        views: '1.2M',
        monetization: 'Adsense + Affiliate',
        icon: '🤖',
        keywords: [
            { term: 'AI horror stories', vol: '45K', diff: 'Med' },
            { term: 'AI generated myths', vol: '12K', diff: 'Low' },
            { term: 'AI animation tutorials', vol: '88K', diff: 'High' }
        ],
        ideas: [
            { hook: 'I used AI to write a horror movie...', angle: 'Shocking results', cta: 'Subscribe for part 2' },
            { hook: 'The secret history of AI...', angle: 'Educational/Documentary', cta: 'Download the prompt' }
        ]
    },
    {
        id: 2,
        name: 'Luxury Lifestyle',
        platforms: ['Instagram', 'YouTube'],
        rpm: 25,
        competition: 'High',
        views: '850K',
        monetization: 'Sponsorships',
        icon: '💎',
        keywords: [
            { term: 'luxury watch reviews', vol: '120K', diff: 'High' },
            { term: 'mansion tour faceless', vol: '60K', diff: 'Med' },
            { term: 'quiet luxury aesthetics', vol: '200K', diff: 'High' }
        ],
        ideas: [
            { hook: 'Inside the $100M yacht...', angle: 'Visual eye-candy', cta: 'Check link in bio' }
        ]
    },
    {
        id: 3,
        name: 'Space Science',
        platforms: ['YouTube'],
        rpm: 12,
        competition: 'Low',
        views: '3.4M',
        monetization: 'Adsense',
        icon: '🚀',
        keywords: [
            { term: 'james webb telescope updates', vol: '500K', diff: 'Med' },
            { term: 'black hole visualization', vol: '1M', diff: 'High' },
            { term: 'mars base concept', vol: '30K', diff: 'Low' }
        ],
        ideas: [
            { hook: 'NASA just found something terrifying...', angle: 'Mystery/Urgency', cta: 'Watch till the end' }
        ]
    },
    {
        id: 4,
        name: 'Motivation AI',
        platforms: ['TikTok', 'Instagram', 'YouTube'],
        rpm: 8,
        competition: 'Extreme',
        views: '5.2M',
        monetization: 'Digital Products',
        icon: '🔥',
        keywords: [
            { term: 'stoicism for men', vol: '300K', diff: 'High' },
            { term: 'morning routine discipline', vol: '150K', diff: 'Med' },
            { term: 'success mindset quotes', vol: '800K', diff: 'Extreme' }
        ],
        ideas: [
            { hook: 'You are wasting your potential...', angle: 'Hard truth', cta: 'Join the empire' }
        ]
    },
    {
        id: 5,
        name: 'True Crime AI',
        platforms: ['YouTube', 'TikTok'],
        rpm: 20,
        competition: 'Medium',
        views: '1.8M',
        monetization: 'Sponsorships',
        icon: '🕵️',
        keywords: [
            { term: 'unsolved mysteries AI', vol: '90K', diff: 'Med' },
            { term: 'missing persons case file', vol: '40K', diff: 'Low' },
            { term: 'true crime animation', vol: '250K', diff: 'High' }
        ],
        ideas: [
            { hook: 'The case the FBI couldn\'t solve...', angle: 'In-depth analysis', cta: 'Follow for cold cases' }
        ]
    },
    {
        id: 6,
        name: 'Mindset / Stoicism',
        platforms: ['YouTube', 'Instagram'],
        rpm: 10,
        competition: 'High',
        views: '900K',
        monetization: 'Digital Products',
        icon: '🧘',
        keywords: [
            { term: 'marcus aurelius quotes', vol: '180K', diff: 'Med' },
            { term: 'how to be emotionless', vol: '40K', diff: 'Low' },
            { term: 'stoic daily habits', vol: '95K', diff: 'High' }
        ],
        ideas: [
            { hook: '7 Stoic secrets for peace...', angle: 'Self-help/Philosophy', cta: 'Get the free ebook' }
        ]
    },
    {
        id: 7,
        name: 'Finance / Crypto',
        platforms: ['YouTube', 'TikTok'],
        rpm: 45,
        competition: 'High',
        views: '400K',
        monetization: 'Affiliate + Ads',
        icon: '💰',
        keywords: [
            { term: 'bitcoin price prediction', vol: '1.2M', diff: 'Extreme' },
            { term: 'best stocks for 2026', vol: '80K', diff: 'High' },
            { term: 'how to save $10k fast', vol: '300K', diff: 'Med' }
        ],
        ideas: [
            { hook: 'The crash is coming...', angle: 'Urgent Finance', cta: 'Sign up for newsletter' }
        ]
    }
];

// --- PERFORMANCE TRACKER STATE ---
let trackerState = {
    platforms: ['YouTube', 'Instagram', 'TikTok'],
    dateRange: '7', // 7, 30, 90
    search: '',
    sortBy: 'views',
    sortDir: 'desc'
};

const TRACKER_DATA = [
    { id: 1, title: 'How to Build an AI Empire', platform: 'YouTube', views: 52400, likes: 4200, comments: 340, shares: 1200, ctr: '8.4%', revenue: 245.50, duration: '58s', watchTime: '42s' },
    { id: 2, title: 'Luxury Aesthetic Routine', platform: 'Instagram', views: 89000, likes: 12500, comments: 890, shares: 4500, ctr: '12.1%', revenue: 0, duration: '15s', watchTime: '13s' },
    { id: 3, title: '3 Tips for Viral Growth', platform: 'TikTok', views: 145000, likes: 22000, comments: 1400, shares: 8900, ctr: '15.4%', revenue: 45.20, duration: '30s', watchTime: '28s' },
    { id: 4, title: 'The Future of Faceless', platform: 'YouTube', views: 12400, likes: 980, comments: 120, shares: 450, ctr: '4.2%', revenue: 58.90, duration: '60s', watchTime: '35s' },
    { id: 5, title: 'Morning Hustle Motivation', platform: 'Instagram', views: 45000, likes: 5600, comments: 230, shares: 1200, ctr: '7.8%', revenue: 0, duration: '12s', watchTime: '10s' },
    { id: 6, title: 'Stoic Mindset Secret', platform: 'TikTok', views: 234000, likes: 45000, comments: 3200, shares: 15400, ctr: '18.2%', revenue: 82.40, duration: '45s', watchTime: '40s' },
    { id: 7, title: 'Automation is Freedom', platform: 'YouTube', views: 8400, likes: 560, comments: 45, shares: 180, ctr: '3.1%', revenue: 32.10, duration: '45s', watchTime: '20s' }
];

// --- REVENUE MANAGER STATE ---
let revenueState = {
    dateRange: '30',
    sourceFilter: 'All',
    search: '',
    sortBy: 'date',
    sortDir: 'desc',
    editingId: null
};

const DEFAULT_REVENUE = [
    { id: 1, date: '2026-02-05', title: 'YouTube AdSense - Feb Payout', platform: 'YouTube', source: 'Ads', amount: 1240.50, status: 'Paid', notes: 'Monthly ad revenue from main channel.' },
    { id: 2, date: '2026-02-04', title: 'Amazon Affiliate - Tech Stack', platform: 'YouTube', source: 'Affiliate', amount: 450.20, status: 'Paid', notes: 'Earnings from "My Tech Stack 2026" video.' },
    { id: 3, date: '2026-02-03', title: 'Sponsorship: NordVPN', platform: 'YouTube', source: 'Sponsorship', amount: 2500.00, status: 'Pending', notes: 'Q1 campaign payment pending.' },
    { id: 4, date: '2026-02-02', title: 'Digital Course: Empire Scaling', platform: 'Web', source: 'Digital Products', amount: 890.00, status: 'Paid', notes: 'Course sales from new cohort.' },
    { id: 5, date: '2026-02-01', title: 'TikTok Creator Fund', platform: 'TikTok', source: 'Ads', amount: 125.40, status: 'Paid', notes: 'Creator fund distribution for Jan.' },
    { id: 6, date: '2026-01-28', title: 'Sponsorship: Skillshare', platform: 'Instagram', source: 'Sponsorship', amount: 1200.00, status: 'Paid', notes: 'IG Story promotion payout.' },
    { id: 7, date: '2026-01-25', title: 'E-book: 100 Script Hooks', platform: 'Web', source: 'Digital Products', amount: 340.00, status: 'Paid', notes: 'passive sales from Gumroad.' }
];

let REVENUE_DATA = JSON.parse(localStorage.getItem('empire-revenue')) || DEFAULT_REVENUE;

// --- INITIALIZATION ---
// --- UX UTILITIES ---

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item glass-morphism p-4 rounded-2xl border border-white/10 flex items-center gap-4 min-w-[280px] shadow-2xl backdrop-blur-2xl`;

    let icon = '🔔';
    let accent = 'accent-dynamic';
    if (type === 'success') { icon = '✅'; accent = 'green-500'; }
    if (type === 'error') { icon = '❌'; accent = 'red-500'; }
    if (type === 'warning') { icon = '⚠️'; accent = 'yellow-500'; }

    toast.innerHTML = `
        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">${icon}</div>
        <div class="flex-1">
            <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">${type.toUpperCase()} PROTOCOL</p>
            <p class="text-[11px] font-bold text-white/90 leading-tight">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 600);
    }, 4000);
}

function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('active');
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.remove('active');
    localStorage.setItem('empire-onboarded', 'true');
    showToast('NEURAL INTERFACE FULLY SYNCHRONIZED', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initDate();
    initMagnetic();
    // Dashboard only loads after "Enter"

    // Resize handler
    window.addEventListener('resize', onWindowResize);
});

// --- NAVIGATION TRANSITION ---
function enterEmpire() {
    applySettings(); // Apply settings immediately
    const landing = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');

    gsap.to(landing, {
        opacity: 0,
        y: -100,
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
            landing.style.display = 'none';
            mainApp.classList.remove('opacity-0', 'pointer-events-none');
            mainApp.classList.add('opacity-100');
            gsap.to(mainApp, { scale: 1, duration: 1, ease: 'power2.out' });

            renderContent('dashboard');
            initNeuralCore();

            // First-time user detection
            if (!localStorage.getItem('empire-onboarded')) {
                setTimeout(showWelcomeModal, 800);
            } else {
                showToast('WELCOME BACK, COMMANDER', 'info');
            }
        }
    });

    // Animate Three.js Camera to "Enter"
    gsap.to(camera.position, {
        z: 1.5,
        duration: 2,
        ease: 'power2.inOut'
    });
}

// --- BRIEFING TRANSITIONS ---
function openBriefing() {
    const briefing = document.getElementById('briefing-overlay');
    briefing.classList.remove('opacity-0', 'pointer-events-none');

    gsap.fromTo(briefing.querySelector('.glass-morphism'),
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }
    );

    // Subtle camera shift
    gsap.to(camera.position, { z: 4, duration: 2, ease: 'power2.out' });
}

function closeBriefing() {
    const briefing = document.getElementById('briefing-overlay');

    gsap.to(briefing.querySelector('.glass-morphism'), {
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
            briefing.classList.add('opacity-0', 'pointer-events-none');
            gsap.to(camera.position, { z: 5, duration: 1.5, ease: 'power2.inOut' });
        }
    });
}

// --- THREE.JS NEURAL GRID ---
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Grid Material
    const gridDivisions = empireSettings.reducedLatency ? 20 : 50;
    const gridGeometry = new THREE.PlaneGeometry(20, 20, gridDivisions, gridDivisions);
    gridMaterial = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });

    grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -1;
    scene.add(grid);

    // Particles (Floating Neural Nodes)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = empireSettings.reducedLatency ? 200 : 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.008,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 5;
    camera.position.y = 0.5;

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Dynamic Colors based on empireSettings.accentColor
        const themeColor = {
            purple: 0xa855f7,
            cyan: 0x06b6d4,
            blue: 0x3b82f6,
            green: 0x22c55e
        }[empireSettings.accentColor] || 0xa855f7;

        gridMaterial.color.lerp(new THREE.Color(themeColor), 0.05);
        particles.material.color.lerp(new THREE.Color(themeColor), 0.05);

        // Wave movement on grid
        const positions = grid.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = Math.sin(x * 0.5 + time) * 0.2 + Math.cos(y * 0.5 + time) * 0.2;
        }
        grid.geometry.attributes.position.needsUpdate = true;

        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- UTILS ---
function initDate() {
    const dateEl = document.getElementById('current-date');
    const options = { month: 'long', day: '2-digit', year: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
}

// --- TAB SWITCHING LOGIC ---
function switchTab(tabId) {
    currentTab = tabId;

    // Update UI Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });

    const contentArea = document.getElementById('content-area');

    // Fade out transition
    gsap.to(contentArea, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
            renderContent(tabId);

            // Staggered 3D Entry for Cards
            const cards = contentArea.querySelectorAll('.glass-card');
            gsap.fromTo(cards,
                { opacity: 0, y: 30, rotateX: -15, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'expo.out'
                }
            );

            gsap.to(contentArea, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    });
}

// --- RENDER CONTENT ---
function renderContent(tabId) {
    const contentArea = document.getElementById('content-area');

    switch (tabId) {
        case 'dashboard':
            contentArea.innerHTML = renderDashboard();
            initCharts();
            initNeuralCore();
            break;
        case 'niche':
            contentArea.innerHTML = renderNicheResearch();
            break;
        case 'script':
            contentArea.innerHTML = renderScriptFactory();
            break;
        case 'directory':
            contentArea.innerHTML = renderDirectory();
            break;
        case 'tracker':
            contentArea.innerHTML = renderTracker();
            initTrackerCharts();
            break;
        case 'revenue':
            contentArea.innerHTML = renderRevenue();
            setTimeout(initRevenueCharts, 100);
            break;
        case 'settings':
            contentArea.innerHTML = renderSettings();
            initSettingsListeners();
            break;
        default:
            contentArea.innerHTML = `<div class="flex items-center justify-center h-full"><h2 class="text-3xl font-bold opacity-20">COMING SOON</h2></div>`;
    }

    // Apply 3D Parallax to all .glass-card elements
    applyCardParallax();
}

// --- MODULE RENDERS (MOCK) ---

function renderDashboard() {
    return `
        <div class="space-y-8 animate-in relative">
            <div class="scan-line"></div>
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-4xl font-extrabold tracking-tight italic">SYSTEM <span class="text-accent-dynamic text-glow-accent uppercase tracking-tighter">Mainframe</span></h2>
                    <p class="text-white/40 mt-1">Real-time empire synchronization active.</p>
                </div>
                <div class="flex items-center gap-6">
                    <!-- 3D Core Container -->
                    <div class="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl border-accent-dynamic/30">
                        <canvas id="neural-core-canvas" width="60" height="60"></canvas>
                        <div>
                            <p class="text-[10px] text-accent-dynamic font-bold tracking-widest">NEURAL CORE</p>
                            <p class="text-[10px] text-white/30 font-mono">ACTIVE // 98.4%</p>
                        </div>
                    </div>

                    <div class="glass-card px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                        <span class="text-xs font-mono font-bold">API STATUS: OPTIMAL</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${renderStatCard('Total Views', '1.2M', '+12.5%', 'accent-dynamic')}
                ${renderStatCard('Total Subs', '45.2K', '+5.2%', 'accent-dynamic')}
                ${renderStatCard('Revenue', '$12,450', '+22.1%', 'accent-dynamic')}
                ${renderStatCard('Avg CTR', '8.4%', '-1.2%', 'white')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 glass-card p-6 rounded-3xl h-[400px]">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold">Growth Velocity</h3>
                        <select class="bg-white/5 border border-white/10 rounded-lg text-xs p-2">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div class="relative h-[300px]">
                        <canvas id="main-chart"></canvas>
                    </div>
                </div>
                <div class="glass-card p-6 rounded-3xl h-[400px]">
                    <h3 class="text-lg font-bold mb-6">Device Distribution</h3>
                    <div class="relative h-[300px] flex items-center justify-center">
                        <canvas id="device-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStatCard(label, val, trend, colorClass) {
    const isUp = trend.startsWith('+');
    return `
        <div class="glass-card p-6 rounded-3xl group cursor-pointer hover:scale-[1.02] transition-all">
            <p class="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">${label}</p>
            <div class="flex items-end justify-between">
                <h3 class="text-3xl font-extrabold group-hover:text-${colorClass} transition-colors">${val}</h3>
                <span class="${isUp ? 'text-green-400' : 'text-red-400'} text-xs font-mono font-bold">${trend}</span>
            </div>
            <div class="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-${colorClass || 'accent-purple'}" style="width: 70%"></div>
            </div>
        </div>
    `;
}

// --- MODULE RENDERS ---

function renderNicheResearch() {
    const filteredNiches = filterNiches();
    const stats = calculateNicheStats(filteredNiches);

    return `
        <div class="space-y-8 animate-in relative pb-20">
            <!-- Top Stats Bar -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                ${renderNicheStat('Total Found', stats.count, 'accent-dynamic')}
                ${renderNicheStat('Avg RPM', '$' + stats.avgRpm, 'accent-dynamic')}
                ${renderNicheStat('Top Platform', stats.topPlatform, 'accent-dynamic')}
                ${renderNicheStat('Best Niche', stats.bestNiche, 'white')}
            </div>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Filter Panel (Left) -->
                <aside class="w-full lg:w-72 space-y-6">
                    <div class="glass-card p-6 rounded-[2rem] border-t border-l border-white/10 sticky top-24">
                        <h3 class="text-sm font-black tracking-widest uppercase mb-6 text-white/50">Neural Filters</h3>
                        
                        <div class="space-y-6">
                            <!-- Search -->
                            <div>
                                <label class="block text-[10px] text-white/40 uppercase mb-2">Keyword Query</label>
                                <input type="text" placeholder="Search matrix..." oninput="updateSearch(this.value)" value="${searchQuery}" 
                                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent-cyan transition-all">
                            </div>

                            <!-- Platform -->
                            <div>
                                <label class="block text-[10px] text-white/40 uppercase mb-2">Platform Node</label>
                                <select onchange="updateFilter('platform', this.value)" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                                    <option value="All" ${activeFilters.platform === 'All' ? 'selected' : ''}>All Platforms</option>
                                    <option value="YouTube" ${activeFilters.platform === 'YouTube' ? 'selected' : ''}>YouTube (Main)</option>
                                    <option value="TikTok" ${activeFilters.platform === 'TikTok' ? 'selected' : ''}>TikTok Pulse</option>
                                    <option value="Instagram" ${activeFilters.platform === 'Instagram' ? 'selected' : ''}>Insta Reels</option>
                                </select>
                            </div>

                            <!-- RPM Range -->
                            <div>
                                <label class="block text-[10px] text-white/40 uppercase mb-2">Min RPM: $${activeFilters.minRpm}</label>
                                <input type="range" min="0" max="50" step="5" value="${activeFilters.minRpm}" 
                                    oninput="updateFilter('minRpm', this.value)" class="w-full accent-accent-cyan">
                            </div>

                            <!-- Competition -->
                            <div>
                                <label class="block text-[10px] text-white/40 uppercase mb-2">Entry Barrier</label>
                                <div class="flex flex-wrap gap-2">
                                    ${['All', 'Low', 'Medium', 'High'].map(d => `
                                        <button onclick="updateFilter('competition', '${d}')" 
                                            class="px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${activeFilters.competition === d ? 'bg-white text-dark border-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}">
                                            ${d.toUpperCase()}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <button onclick="resetNicheFilters()" class="w-full py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all">RESET FILTERS</button>
                        </div>
                    </div>
                </aside>

                <!-- Niche Results Grid -->
                <div class="flex-1">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        ${filteredNiches.length > 0 ? filteredNiches.map(n => renderNicheCard(n)).join('') : `
                            <div class="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed border-white/10">
                                <p class="text-white/20 font-mono">NO NICHE MATCHES FOUND IN CURRENT MATRIX</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Container (Hidden by default) -->
        <div id="niche-modal" class="fixed inset-0 z-[150] bg-dark/80 backdrop-blur-md flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-500">
            <div class="max-w-2xl w-full glass-morphism p-10 rounded-[3rem] relative border-accent-cyan/30">
                <button onclick="closeNicheModal()" class="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div id="modal-content"></div>
            </div>
        </div>
    `;
}

function renderNicheStat(label, val, col) {
    return `
        <div class="glass-card p-6 rounded-2xl border-l border-white/10">
            <p class="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1">${label}</p>
            <h4 class="text-2xl font-black text-${col}">${val}</h4>
        </div>
    `;
}

function renderNicheCard(n) {
    const isFav = isFavorite(n.id);
    return `
        <div class="glass-card p-6 rounded-[2.5rem] flex flex-col group hover:border-accent-cyan/40 transition-all">
            <div class="flex items-center justify-between mb-4">
                <span class="text-3xl">${n.icon}</span>
                <button onclick="toggleFavorite(${n.id})" class="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-white/30'}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            
            <h3 class="text-xl font-bold mb-2 group-hover:text-accent-cyan transition-colors">${n.name}</h3>
            
            <div class="flex gap-2 mb-4">
                ${n.platforms.map(p => `<span class="px-2 py-0.5 rounded-md bg-${p === 'YouTube' ? 'red' : p === 'TikTok' ? 'cyan' : 'purple'}-500/10 text-${p === 'YouTube' ? 'red' : p === 'TikTok' ? 'cyan' : 'purple'}-500 text-[8px] font-bold uppercase border border-${p === 'YouTube' ? 'red' : p === 'TikTok' ? 'cyan' : 'purple'}-500/20">${p}</span>`).join('')}
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-6">
                <div>
                    <p class="text-[9px] text-white/30 font-bold uppercase">Est. RPM</p>
                    <p class="text-lg font-black text-accent-cyan">$${n.rpm}</p>
                </div>
                <div>
                    <p class="text-[9px] text-white/30 font-bold uppercase">Competition</p>
                    <p class="text-sm font-bold ${n.competition === 'Low' ? 'text-green-400' : 'text-red-400'}">${n.competition}</p>
                </div>
            </div>

            <div class="mt-auto space-y-3">
                <button onclick="openKeywords(${n.id})" class="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all uppercase tracking-tighter">View Keywords</button>
                <button onclick="openIdeas(${n.id})" class="w-full py-2 rounded-xl bg-accent-purple/20 border border-accent-purple/30 text-[10px] font-bold text-accent-purple hover:bg-accent-purple hover:text-white transition-all uppercase tracking-tighter">Video Ideas</button>
            </div>
        </div>
    `;
}

// --- NICHE LOGIC ---

function filterNiches() {
    return NICHE_DATA.filter(n => {
        const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = activeFilters.platform === 'All' || n.platforms.includes(activeFilters.platform);
        const matchesComp = activeFilters.competition === 'All' || n.competition === activeFilters.competition;
        const matchesRpm = n.rpm >= activeFilters.minRpm;
        return matchesSearch && matchesPlatform && matchesComp && matchesRpm;
    });
}

function calculateNicheStats(niches) {
    if (niches.length === 0) return { count: 0, avgRpm: 0, topPlatform: 'N/A', bestNiche: 'N/A' };

    const count = niches.length;
    const avgRpm = Math.round(niches.reduce((sum, n) => sum + n.rpm, 0) / count);
    const bestNiche = niches.sort((a, b) => b.rpm - a.rpm)[0].name;

    // Simple platform counter
    const platformCounts = {};
    niches.forEach(n => n.platforms.forEach(p => platformCounts[p] = (platformCounts[p] || 0) + 1));
    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0][0];

    return { count, avgRpm, topPlatform, bestNiche };
}

function updateFilter(key, val) {
    activeFilters[key] = key === 'minRpm' ? parseInt(val) : val;
    renderContent('niche');
}

function updateSearch(val) {
    searchQuery = val;
    renderContent('niche');
}

function resetNicheFilters() {
    searchQuery = '';
    activeFilters = { platform: 'All', competition: 'All', monetization: 'All', minRpm: 0 };
    renderContent('niche');
}

// --- MODALS & EXTRAS ---

function openKeywords(id) {
    const niche = NICHE_DATA.find(n => n.id === id);
    const modal = document.getElementById('niche-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center gap-4 mb-8">
                <span class="text-4xl">${niche.icon}</span>
                <div>
                    <h2 class="text-3xl font-black italic">${niche.name} <span class="text-accent-cyan">Data</span></h2>
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.2em]">Neural Keyword Matrix Extraction</p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
                ${niche.keywords.map(k => `
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-accent-cyan/50 transition-all">
                        <span class="font-bold text-lg">${k.term}</span>
                        <div class="flex items-center gap-6">
                            <div class="text-right">
                                <p class="text-[9px] text-white/40 uppercase">Volume</p>
                                <p class="text-xs font-mono font-bold">${k.vol}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] text-white/40 uppercase">Difficulty</p>
                                <span class="text-[10px] font-black ${k.diff === 'Low' ? 'text-green-400' : 'text-red-400'}">${k.diff}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button onclick="copyKeywords('${niche.keywords.map(k => k.term).join(', ')}')" class="w-full mt-6 bg-accent-cyan text-dark py-4 rounded-2xl font-bold tracking-tight hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all uppercase">Copy All Keywords</button>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function openIdeas(id) {
    const niche = NICHE_DATA.find(n => n.id === id);
    const modal = document.getElementById('niche-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-3xl font-black italic mb-8">${niche.name} <span class="text-accent-dynamic text-glow-accent">Blueprints</span></h2>
            <div class="space-y-6">
                ${niche.ideas.map(i => `
                    <div class="glass-card p-6 rounded-3xl border-l-4 border-accent-dynamic bg-accent-dynamic/5">
                        <p class="text-[10px] text-accent-dynamic font-bold uppercase mb-2">Hook Structure</p>
                        <p class="text-lg font-bold italic mb-4">"${i.hook}"</p>
                        <div class="flex items-center justify-between pt-4 border-t border-white/5">
                            <div>
                                <p class="text-[9px] text-white/40 uppercase">Angle</p>
                                <p class="text-xs font-bold">${i.angle}</p>
                            </div>
                            <button onclick="copyText('${i.hook}')" class="text-xs text-accent-dynamic font-bold hover:underline">Copy Hook</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeNicheModal() {
    const modal = document.getElementById('niche-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}

function toggleFavorite(id) {
    let favs = JSON.parse(localStorage.getItem('empire-favs') || '[]');
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
    } else {
        favs.push(id);
        // Add glow effect or toast (simple alert for now)
    }
    localStorage.setItem('empire-favs', JSON.stringify(favs));
    renderContent('niche');
}

function isFavorite(id) {
    const favs = JSON.parse(localStorage.getItem('empire-favs') || '[]');
    return favs.includes(id);
}

function copyKeywords(text) {
    navigator.clipboard.writeText(text);
    alert('KEYWORDS COPIED TO EMPIRE STORAGE');
}

function copyText(text) {
    navigator.clipboard.writeText(text);
    alert('IDEA COPIED');
}

function renderScriptFactory() {
    return `
        <div class="space-y-8 animate-in">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-4xl font-extrabold tracking-tight">Financial <span class="text-accent-dynamic text-glow-accent">Forge</span></h2>
                    <p class="text-white/40 mt-1">Yield tracking and monetization audit.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="glass-card p-8 rounded-3xl">
                        <label class="block text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Topic / Hook Idea</label>
                        <textarea id="script-topic" placeholder="e.g. Why most people fail at AI..." class="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-dynamic transition-all mb-6 resize-none"></textarea>
                        
                        <div class="flex gap-4">
                            <button onclick="generateScriptStructure()" class="flex-1 bg-gradient-to-r from-accent-purple to-accent-blue py-4 rounded-2xl font-bold tracking-tight hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">GENERATE STRUCTURE</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        ${renderScriptStat('OPTIMIZED FOR', 'YT Shorts')}
                        ${renderScriptStat('STYLE', 'Informational')}
                    </div>
                </div>

                <div id="script-output" class="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center border-dashed border-white/10">
                    <div class="text-center opacity-30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p class="font-mono text-sm">AWAITING INPUT PARAMETERS...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderScriptStat(label, val) {
    return `
        <div class="p-3 bg-white/5 border-l-2 border-accent-dynamic rounded-xl text-center">
            <p class="text-[8px] text-white/30 uppercase font-bold">${label}</p>
            <p class="text-sm font-black text-accent-dynamic">${val}</p>
        </div>
    `;
}

function renderDirectory() {
    const filteredTools = filterTools();
    const categories = ['All', 'Script / Text AI', 'Voice / Audio AI', 'Image AI', 'Video AI', 'Subtitle / Caption AI', 'Automation AI'];

    return `
        <div class="space-y-8 animate-in relative pb-20">
            <!-- Header & Global Search -->
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 class="text-4xl font-extrabold tracking-tight italic">AI TOOL <span class="text-accent-dynamic text-glow-accent uppercase tracking-tighter">Directory</span></h2>
                    <p class="text-white/40 mt-1 uppercase text-[10px] tracking-widest font-mono text-glow-accent">One command center. All neural nodes active.</p>
                </div>
                <div class="w-full md:w-96 glass-card px-6 py-4 rounded-2xl flex items-center gap-4 border-white/10 group focus-within:border-accent-dynamic/50 transition-all shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/20 group-focus-within:text-accent-dynamic transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Ask anything or find a tool..." oninput="updateToolSearch(this.value)" value="${toolSearchQuery}" 
                        class="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-white/20">
                </div>
            </div>

            <!-- Global Stats Bar -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${renderDirectoryStat('Tools Used Today', toolStats.usedToday, 'accent-dynamic')}
                ${renderDirectoryStat('Outputs Generated', toolStats.totalOutputs, 'accent-dynamic')}
                ${renderDirectoryStat('Most Used Node', toolStats.mostUsed, 'accent-dynamic')}
            </div>

            <div class="flex flex-col xl:flex-row gap-8">
                <!-- Main Grid Section -->
                <div class="flex-1 space-y-8">
                    <!-- Category Bar -->
                    <div class="flex flex-wrap gap-2">
                        ${categories.map(cat => `
                            <button onclick="updateToolCategory('${cat}')" 
                                class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeToolCategory === cat ? 'bg-accent-blue text-white border-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}">
                                ${cat}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Tool Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${filteredTools.length > 0 ? filteredTools.map(t => renderToolCard(t)).join('') : `
                            <div class="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed border-white/10">
                                <p class="text-white/20 font-mono tracking-widest">NO NEURAL NODES MATCHED YOUR QUERY</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- History & Saved Sidebar -->
                <aside class="w-full xl:w-96 space-y-6">
                    <div class="glass-card p-8 rounded-[3rem] border-white/10 sticky top-24 min-h-[600px] flex flex-col">
                        <h3 class="text-xs font-black tracking-widest uppercase mb-8 text-white/60 flex items-center justify-between">
                            Neural History
                            <span class="text-[8px] bg-white/5 px-2 py-1 rounded text-white/30">LATEST_SYNC</span>
                        </h3>
                        
                        <div class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[500px]">
                            ${toolHistory.length > 0 ? toolHistory.slice(0, 10).map(h => `
                                <div class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group" onclick="loadHistoryItem(${h.id})">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-[9px] font-bold text-accent-blue uppercase tracking-tighter">${h.toolName}</span>
                                        <span class="text-[8px] text-white/20 font-mono">${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p class="text-[11px] text-white/60 line-clamp-1 italic">"${h.query}"</p>
                                </div>
                            `).join('') : `
                                <div class="h-40 flex items-center justify-center opacity-20">
                                    <p class="text-[10px] uppercase tracking-widest text-center">History matrix empty</p>
                                </div>
                            `}
                        </div>

                        <button onclick="clearToolHistory()" class="mt-8 pt-6 border-t border-white/5 text-[9px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest text-center w-full">Purge History Matrix</button>
                    </div>
                </aside>
            </div>
        </div>

        <!-- AI Command Modal -->
        <div id="tool-modal" class="fixed inset-0 z-[150] bg-dark/90 backdrop-blur-3xl flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-700">
            <div class="max-w-4xl w-full glass-morphism p-12 rounded-[5rem] relative border-accent-blue/20 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                <!-- Radial glow -->
                <div class="absolute -top-24 -left-24 w-96 h-96 bg-accent-blue/10 blur-[150px] -z-10"></div>
                
                <button onclick="closeToolModal()" class="absolute top-12 right-12 text-white/20 hover:text-white hover:rotate-90 transition-all duration-500 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div id="tool-modal-content" class="relative z-10 transition-all duration-500"></div>
            </div>
        </div>
    `;
}

function renderDirectoryStat(label, val, col) {
    return `
        <div class="glass-card p-6 rounded-[2.5rem] border-white/5 border-t border-l">
            <p class="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">${label}</p>
            <h4 class="text-3xl font-black text-${col} tracking-tighter">${val}</h4>
        </div>
    `;
}

function renderToolCard(t) {
    return `
        <div class="glass-card p-10 rounded-[3rem] flex flex-col group hover:border-accent-dynamic/40 transition-all cursor-pointer border-t border-l border-white/5 overflow-hidden relative shadow-2xl" onclick="openToolModal('${t.id}')">
            <!-- Animated background glow -->
            <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-dynamic/5 rounded-full blur-[40px] group-hover:bg-accent-dynamic/10 transition-all duration-700"></div>
            
            <div class="flex items-center justify-between mb-8 relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-accent-dynamic/10 group-hover:border-accent-dynamic/30 transition-all duration-500 shadow-lg">${t.icon}</div>
                <div class="flex flex-col items-end">
                    <span class="text-[8px] font-black px-2 py-1 rounded bg-white/5 border border-white/10 text-white/30 uppercase tracking-[0.2em] mb-2">${t.status}</span>
                    <div class="flex gap-1">
                         <div class="w-1.5 h-1.5 bg-accent-dynamic rounded-full animate-pulse"></div>
                         <div class="w-1.5 h-1.5 bg-accent-dynamic/30 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                         <div class="w-1.5 h-1.5 bg-accent-dynamic/10 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
            
            <h3 class="text-2xl font-black mb-1 group-hover:text-accent-dynamic transition-colors tracking-tight italic">${t.name}</h3>
            <p class="text-[9px] text-accent-dynamic font-black uppercase mb-6 tracking-[0.2em] opacity-60">${t.category}</p>
            <p class="text-white/50 text-xs mb-10 leading-relaxed font-medium relative z-10">${t.desc}</p>

            <button class="mt-auto w-full py-5 rounded-[1.5rem] bg-white/5 border border-white/10 group-hover:bg-accent-dynamic group-hover:text-white group-hover:border-accent-dynamic transition-all text-[10px] font-black uppercase tracking-[0.4em] shadow-lg">Use Tool</button>
        </div>
    `;
}

// --- TOOL DIRECTORY LOGIC ---

function filterTools() {
    return AI_TOOLS_DATA.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(toolSearchQuery.toLowerCase());
        const matchesCategory = activeToolCategory === 'All' || t.category === activeToolCategory;
        return matchesSearch && matchesCategory;
    });
}

function updateToolSearch(val) {
    toolSearchQuery = val;
    renderContent('directory');
}

function updateToolCategory(cat) {
    activeToolCategory = cat;
    renderContent('directory');
}

// --- TOOL MODAL & EXECUTION PRO ---

function openToolModal(toolId) {
    selectedTool = AI_TOOLS_DATA.find(t => t.id === toolId);
    if (!selectedTool) return;

    const modal = document.getElementById('tool-modal');
    const content = document.getElementById('tool-modal-content');

    content.innerHTML = `
        <div class="space-y-12 animate-in relative">
            <!-- Modal Header -->
            <div class="flex items-center gap-8 pb-8 border-b border-white/5 relative z-10">
                <div class="w-24 h-24 rounded-[3rem] bg-accent-dynamic/10 border border-accent-dynamic/30 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:scale-110 transition-transform duration-500">${selectedTool.icon}</div>
                <div>
                    <h2 class="text-5xl font-black italic tracking-tighter mb-2 underline decoration-accent-dynamic decoration-4 underline-offset-8">${selectedTool.name} <span class="text-white">Mainframe</span></h2>
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">Category: ${selectedTool.category} // Status: Optimal</p>
                </div>
            </div>

            <!-- Command Input Zone -->
            <div id="ai-input-zone" class="space-y-6 relative z-10">
                <div class="group">
                    <label class="block text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-4 flex items-center gap-2 group-focus-within:text-accent-dynamic transition-colors">
                        <span class="w-2 h-2 bg-accent-dynamic rounded-full"></span>
                        Neural Command Node
                    </label>
                    <textarea id="ai-command-input" placeholder="${selectedTool.prompt}" 
                        class="w-full h-48 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 text-xl focus:outline-none focus:border-accent-dynamic transition-all resize-none font-medium placeholder:opacity-20 shadow-inner backdrop-blur-sm"></textarea>
                </div>
                
                <button id="run-ai-btn" onclick="executeAICommand()" class="w-full bg-accent-dynamic text-white py-6 rounded-3xl font-black tracking-[0.5em] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all uppercase text-sm transform hover:-translate-y-1 active:scale-95 shadow-2xl">Initiate Protocol</button>
            </div>

            <!-- Output Zone -->
            <div id="ai-output-zone" class="hidden space-y-8 relative z-10">
                <div>
                    <label class="block text-[10px] text-accent-dynamic font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <div class="w-2 h-2 bg-accent-dynamic rounded-full animate-ping"></div>
                        Generated Output Buffer
                    </label>
                    <div id="ai-output-content" class="bg-white/5 border border-white/10 rounded-[3rem] p-10 font-medium text-white/90 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar relative group backdrop-blur-md">
                        <!-- Content injected here -->
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 pt-4">
                    <button onclick="copyOutput()" class="flex-1 bg-white text-dark py-5 rounded-2xl font-black tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all uppercase text-[10px] shadow-xl">Copy to Matrix</button>
                    <button onclick="saveToHistory()" class="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-white/10 transition-all uppercase text-[10px]">Save to Library</button>
                    <button onclick="resetToolModal()" class="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-white/10 transition-all uppercase text-[10px]">Generate New</button>
                </div>
            </div>
            
            <!-- Matrix background decorative element -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-dynamic/30 to-transparent"></div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    gsap.fromTo(content, { scale: 0.9, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
}

function closeToolModal() {
    const modal = document.getElementById('tool-modal');
    gsap.to(modal.querySelector('.glass-morphism'), {
        scale: 0.9, y: 20, opacity: 0, duration: 0.4, onComplete: () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            selectedTool = null;
        }
    });
}

function resetToolModal() {
    if (selectedTool) openToolModal(selectedTool.id);
}

function executeAICommand() {
    const input = document.getElementById('ai-command-input');
    const inputZone = document.getElementById('ai-input-zone');
    const outputZone = document.getElementById('ai-output-zone');
    const outputContent = document.getElementById('ai-output-content');
    const runBtn = document.getElementById('run-ai-btn');

    if (!input.value.trim()) {
        gsap.to(input, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
        return;
    }

    runBtn.disabled = true;
    runBtn.innerHTML = `
        <div class="flex items-center justify-center gap-4">
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span class="tracking-widest capitalize">Syncing Neural Vectors...</span>
        </div>
    `;

    // Visual feedback for processing
    gsap.to(input, { opacity: 0.3, duration: 0.5 });

    setTimeout(() => {
        const responseData = generateMockAIResponse(selectedTool, input.value);

        outputContent.innerHTML = responseData.html;
        outputContent.setAttribute('data-raw', responseData.raw);

        gsap.to(inputZone, {
            opacity: 0, y: -30, duration: 0.5, ease: 'power2.in', onComplete: () => {
                inputZone.classList.add('hidden');
                outputZone.classList.remove('hidden');
                gsap.fromTo(outputZone, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' });
            }
        });

        updateUsageStats();
    }, 2200);
}

function generateMockAIResponse(tool, query) {
    const q = query.toLowerCase();
    let raw = "";
    let html = "";

    // Specific logic for different tools
    if (tool.id === 'chatgpt') {
        const scripts = [
            {
                hook: "This one AI secret making faceless channels $10k/month.",
                body: `Detailed breakdown of ${query.substring(0, 30)}... focused on curiosity gap and high retention.`,
                cta: "Click biological link for the neural blueprint."
            },
            {
                hook: "I quit my job after discovering this content framework.",
                body: `The step-by-step matrix for scaling ${query.substring(0, 20)} using autonomous logic.`,
                cta: "Comment 'EMPIRE' for access."
            }
        ];
        const res = scripts[Math.floor(Math.random() * scripts.length)];
        raw = `EMPIRE VIRAL SCRIPT\n\n[HOOK]: ${res.hook}\n[BODY]: ${res.body}\n[CTA]: ${res.cta}`;
        html = `
            <div class="space-y-6 font-mono text-sm">
                <p class="text-accent-dynamic font-black uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">EMPIRE_SCRIPT_GEN_V.4</p>
                <div class="space-y-6">
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p class="text-[10px] text-accent-purple font-black mb-2 uppercase">Viral Hook</p>
                        <p class="text-lg italic font-bold">"${res.hook}"</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-white/30 font-black mb-2 uppercase">Neural Narrative</p>
                        <p class="text-white/70">${res.body}</p>
                    </div>
                    <div class="flex items-center gap-3 text-accent-dynamic font-black uppercase text-[10px]">
                        <span>[CTA]</span>
                        <p class="tracking-widest">${res.cta}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tool.id === 'elevenlabs') {
        raw = `VOICEOVER NODE SETTINGS\n\nVOICE: Adam_Elite\nSTABILITY: 85%\nCLARITY: 92%\nSOURCE: "${query}"`;
        html = `
            <div class="space-y-8">
                <div class="flex items-center gap-6 p-6 rounded-[2rem] bg-accent-dynamic/5 border border-accent-dynamic/20 shadow-lg">
                    <div class="w-16 h-16 rounded-full border-2 border-accent-dynamic flex items-center justify-center text-3xl animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">🎙️</div>
                    <div>
                        <p class="text-[10px] text-white/40 uppercase font-black tracking-widest">Active Voice Profile</p>
                        <p class="text-xl font-black italic">ADAM_ELITE_SYNTH</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between items-end"><span class="text-[10px] font-black uppercase text-white/40">Stability Matrix</span><span class="text-accent-dynamic font-mono font-bold">85%</span></div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-accent-dynamic shadow-[0_0_10px_#3b82f6]" style="width: 85%"></div></div>
                    <div class="flex justify-between items-end"><span class="text-[10px] font-black uppercase text-white/40">Neural Clarity</span><span class="text-accent-dynamic font-mono font-bold">92%</span></div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-accent-dynamic shadow-[0_0_10px_#3b82f6]" style="width: 92%"></div></div>
                </div>
                <p class="text-sm border-l-4 border-accent-dynamic/30 pl-6 py-2 italic text-white/70 bg-white/[0.02] rounded-r-xl">"${query}"</p>
            </div>
        `;
    } else if (tool.category.includes('Image')) {
        raw = `/imagine prompt: high-end cinematic visualization for ${query}, hyper-detailed, global illumination, unreal engine 5 --ar 16:9 --v 6.0`;
        html = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <p class="text-[10px] text-accent-dynamic font-black uppercase tracking-[0.3em]">Imaging Protocol v6</p>
                    <span class="text-[8px] px-2 py-0.5 rounded bg-accent-dynamic/10 text-accent-dynamic border border-accent-dynamic/20 font-black">HIGH_RES</span>
                </div>
                <div class="bg-dark/80 p-8 rounded-[2.5rem] border border-white/10 font-mono text-sm leading-relaxed text-accent-dynamic break-words shadow-inner group-hover:border-accent-dynamic/40 transition-all">
                    /imagine prompt: cinematic high-performance visualization of <span class="text-white underline decoration-accent-dynamic/30 underline-offset-4">${query}</span>, global illumination, raytraced reflections, hyper-detailed textures, unreal engine 5 render, global illumination, cyberpunk aesthetic --ar 16:9 --v 6.0 --stylize 750
                </div>
                <div class="grid grid-cols-4 gap-3">
                    ${[1, 2, 3, 4].map(() => `<div class="h-16 bg-white/5 rounded-xl border border-dashed border-white/10 animate-pulse"></div>`).join('')}
                </div>
                <p class="text-[9px] text-white/30 text-center uppercase tracking-widest italic">Latent space pre-visualizing 4 variants...</p>
            </div>
        `;
    } else {
        raw = `NEURAL NODE OUTPUT\n\nCOMMAND: ${query}\nRESULT: Success\nTOOL: ${tool.name}`;
        html = `
            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                    <p class="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Node Execution Success</p>
                </div>
                <p class="text-lg leading-relaxed text-white/80 italic font-medium">"Neural circuits have processed your command regarding '${query}'. Data streams have been successfully optimized and integrated via the ${tool.name} node."</p>
                <div class="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                    <div><p class="text-[9px] text-white/20 uppercase font-bold">Latency</p><p class="text-xs font-mono text-accent-dynamic">14ms</p></div>
                    <div><p class="text-[9px] text-white/20 uppercase font-bold">Entropy</p><p class="text-xs font-mono text-accent-dynamic">0.002%</p></div>
                </div>
                <p class="text-[10px] text-white/20 text-center font-mono uppercase tracking-tighter">NODE_RESPONSE_HASH: ${Math.random().toString(16).substring(2, 12).toUpperCase()}</p>
            </div>
        `;
    }

    return { raw, html };
}

function saveToHistory() {
    const outputContent = document.getElementById('ai-output-content');
    const input = document.getElementById('ai-command-input');
    const rawContent = outputContent.getAttribute('data-raw');

    if (!selectedTool || !rawContent) return;

    const historyItem = {
        id: Date.now(),
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        query: input.value,
        output: rawContent,
        timestamp: new Date().toISOString()
    };

    toolHistory.unshift(historyItem);
    localStorage.setItem('empire-tool-history', JSON.stringify(toolHistory));

    // Update global stats
    toolStats.totalOutputs = toolHistory.length;
    localStorage.setItem('empire-tool-stats', JSON.stringify(toolStats));

    // Feedback
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'SYNCED_TO_MATRIX';
    btn.classList.add('bg-accent-dynamic', 'text-white');

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-accent-dynamic', 'text-white');
        renderContent('directory'); // Refresh to show in history sidebar
    }, 1000);
}

function updateUsageStats() {
    toolStats.usedToday++;

    // Determine most used based on history
    if (toolHistory.length > 0) {
        const counts = {};
        toolHistory.forEach(h => counts[h.toolName] = (counts[h.toolName] || 0) + 1);
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        toolStats.mostUsed = top ? top[0] : selectedTool.name;
    } else {
        toolStats.mostUsed = selectedTool.name;
    }

    localStorage.setItem('empire-tool-stats', JSON.stringify(toolStats));
}

function loadHistoryItem(id) {
    const item = toolHistory.find(h => h.id === id);
    if (!item) return;

    openToolModal(item.toolId);

    setTimeout(() => {
        const input = document.getElementById('ai-command-input');
        if (input) {
            input.value = item.query;
            executeAICommand();
        }
    }, 600);
}

function clearToolHistory() {
    if (confirm('TERMINATE ALL NEURAL RECORDS IN THE HISTORY MATRIX?')) {
        toolHistory = [];
        toolStats.totalOutputs = 0;
        localStorage.setItem('empire-tool-history', JSON.stringify(toolHistory));
        localStorage.setItem('empire-tool-stats', JSON.stringify(toolStats));
        renderContent('directory');
    }
}

function copyOutput() {
    const content = document.getElementById('ai-output-content');
    const raw = content.getAttribute('data-raw');

    navigator.clipboard.writeText(raw).then(() => {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = 'COPIED_TO_BIOS';
        btn.classList.add('bg-accent-dynamic', 'text-dark');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-accent-dynamic', 'text-dark');
        }, 1500);
    });
}

function renderTracker() {
    return `
        <div class="space-y-8 animate-in">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-4xl font-extrabold tracking-tight">Platform <span class="text-accent-dynamic text-glow-accent">Pulse</span></h2>
                    <p class="text-white/40 mt-1">Aggregated performance across the empire.</p>
                </div>
                <div class="bg-white/5 p-1 rounded-xl border border-white/10 flex">
                    <button class="px-4 py-2 rounded-lg bg-accent-purple text-xs font-bold shadow-lg">YouTube</button>
                    <button class="px-4 py-2 rounded-lg text-xs font-bold text-white/40">TikTok</button>
                    <button class="px-4 py-2 rounded-lg text-xs font-bold text-white/40">Instagram</button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-3 glass-card p-8 rounded-3xl h-[450px]">
                    <div class="flex items-center justify-between mb-8">
                        <h3 class="text-xl font-bold">Retention / Watch Time</h3>
                        <div class="flex gap-4">
                            <div class="flex items-center gap-2"><div class="w-3 h-3 bg-accent-dynamic rounded-full shadow-accent-dynamic"></div><span class="text-xs text-white/40">Current</span></div>
                            <div class="flex items-center gap-2"><div class="w-3 h-3 bg-accent-cyan rounded-full"></div><span class="text-xs text-white/40">Rolling Avg</span></div>
                        </div>
                    </div>
                    <div class="relative h-[320px]">
                        <canvas id="tracker-chart"></canvas>
                    </div>
                </div>
                <div class="space-y-6">
                    ${renderPlatformStat('Subscribers', '112.4K', 'purple')}
                    ${renderPlatformStat('Avg Views', '85.2K', 'cyan')}
                    ${renderPlatformStat('Shares', '1.2K', 'blue')}
                </div>
            </div>
        </div>
    `;
}

function renderPlatformStat(label, val, col) {
    return `
        <div class="glass-card p-6 rounded-2xl border-r-2 border-accent-dynamic">
            <p class="text-white/40 text-[10px] font-bold uppercase mb-1">${label}</p>
            <h3 class="text-2xl font-black font-mono text-accent-dynamic">${val}</h3>
        </div>
    `;
}

// --- SETTINGS LOGIC ---

function updateAccentColor(color) {
    console.log(`Switching to accent color: ${color}`);
    empireSettings.accentColor = color;
    applySettings();
    showSaveNotification();
    // Re-render settings to show the updated active state (white border)
    renderContent('settings');
}

function updateSetting(key, val) {
    if (key === 'undefined' || !key) return; // Guard against bad rendered values
    empireSettings[key] = val;
    applySettings();
    showSaveNotification();
}

function showSaveNotification() {
    const bar = document.getElementById('save-bar');
    if (bar) {
        bar.classList.remove('opacity-0', 'translate-y-10');
        bar.classList.add('opacity-100', 'translate-y-0');
    }
}

function applySettings() {
    // 1. Theme class on body
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    document.body.classList.add(`theme-${empireSettings.accentColor}`);

    // 2. Local Storage
    // We don't save permanently until they hit "Save Empire Settings"
    // but we apply visually immediately
}

function renderSettings() {
    return `
        <div class="space-y-12 animate-in pb-32">
            <div>
                <h2 class="text-4xl font-extrabold tracking-tight">Empire <span class="text-accent-dynamic text-glow-accent">Settings</span></h2>
                <p class="text-white/40 mt-1">Configure neural nodes and production protocols.</p>
                <div class="w-full h-[1px] bg-gradient-to-r from-accent-dynamic/50 to-transparent mt-6"></div>
            </div>

            <!-- Save Zone (Top Notification Bar) -->
            <div id="save-bar" class="glass-morphism p-4 rounded-3xl flex items-center justify-between border border-white/10 overflow-hidden relative group opacity-0 translate-y-10 transition-all duration-500">
                <!-- Progress pulse background -->
                <div id="save-progress" class="absolute left-0 top-0 h-full bg-accent-dynamic/5 w-0 transition-all duration-500"></div>
                
                <div class="flex items-center gap-4 relative z-10 px-4">
                    <div class="w-2 h-2 bg-accent-dynamic rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
                    <span class="text-xs font-bold tracking-widest text-white/40 uppercase">Unsaved Neural Modifications Detected</span>
                </div>

                <div class="flex gap-4 relative z-10">
                    <button onclick="resetSettings()" class="px-6 py-3 rounded-2xl text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Reset Protocols</button>
                    <button id="save-btn" onclick="saveSettings()" class="bg-white text-dark px-10 py-3 rounded-2xl font-bold text-[10px] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all uppercase tracking-widest">Save Empire Settings</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- A. Account & Profile -->
                ${renderSettingsCard('👤', 'Account & Profile', 'Identity and authentication protocols.', `
                    <div class="space-y-4">
                        ${renderInput('Username', 'text', empireSettings.username, 'setting-username')}
                        ${renderInput('Email', 'email', empireSettings.email, 'setting-email')}
                        ${renderInput('Password', 'password', '••••••••••••')}
                        <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <p class="text-[10px] text-white/40 uppercase">Current Plan</p>
                                <p class="text-sm font-bold text-accent-purple">EMPIRE ELITE</p>
                            </div>
                            <button class="bg-accent-purple/20 text-accent-purple text-[10px] font-bold px-3 py-1 rounded-lg border border-accent-purple/30 hover:bg-accent-purple hover:text-white transition-all">UPGRADE</button>
                        </div>
                    </div>
                `)}

                <!-- B. AI Tools Integration -->
                ${renderSettingsCard('🤖', 'AI Integration', 'Central API orchestration.', `
                    <div class="space-y-4">
                        ${renderToggle('ElevenLabs', true, 'Connected')}
                        ${renderToggle('HeyGen', true, 'Connected')}
                        ${renderToggle('Midjourney', false, 'Auth Pending')}
                        ${renderToggle('ChatGPT-4o', true, 'Connected')}
                        <div class="pt-2">
                             ${renderInput('Master Forge Key', 'password', 'sk-••••••••••••••••••••')}
                        </div>
                    </div>
                `)}

                <!-- C. Content Automation -->
                ${renderSettingsCard('⚡', 'Production Algos', 'Autonomous generation triggers.', `
                    <div class="space-y-4">
                        ${renderToggle('Auto-Script Gen', true)}
                        ${renderToggle('Neural Voiceover', true)}
                        ${renderToggle('Visual Assembly', false)}
                        <div class="pt-4">
                            <label class="block text-[10px] text-white/40 uppercase mb-3">Default Video Pitch</label>
                            <input type="range" class="w-full mb-2">
                            <div class="flex justify-between text-[10px] font-mono text-white/30">
                                <span>15s</span>
                                <span>60s</span>
                                <span>10m</span>
                            </div>
                        </div>
                    </div>
                `)}

                <!-- D. Platform Defaults -->
                ${renderSettingsCard('🌐', 'Matrix Nodes', 'Target platform synchronization.', `
                    <div class="space-y-4">
                        <select class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-accent-dynamic">
                            <option>9:16 (YT Shorts / TikTok)</option>
                            <option>16:9 (Mainframe Video)</option>
                            <option>1:1 (Insta Flow)</option>
                        </select>
                         <div class="p-3 rounded-xl bg-white/5 border border-dashed border-white/20">
                            <p class="text-[10px] text-white/30 uppercase mb-2">Priority Rank</p>
                            <div class="space-y-2">
                                <div class="bg-dark/40 p-2 rounded text-xs flex justify-between">1. YouTube Shorts <span>⋮⋮</span></div>
                                <div class="bg-dark/40 p-2 rounded text-xs flex justify-between">2. TikTok Pulse <span>⋮⋮</span></div>
                                <div class="bg-dark/40 p-2 rounded text-xs flex justify-between">3. Insta Reels <span>⋮⋮</span></div>
                            </div>
                         </div>
                    </div>
                `)}

                <!-- E. Theme & Interface -->
                ${renderSettingsCard('🎨', 'Neural Interface', 'Visual and sensory settings.', `
                    <div class="space-y-6">
                        <div>
                            <p class="text-[10px] text-white/40 uppercase mb-3">Accent Matrix</p>
                            <div class="flex gap-4">
                                <div onclick="updateAccentColor('purple')" class="w-8 h-8 rounded-full bg-purple-500 border-2 ${empireSettings.accentColor === 'purple' ? 'border-white' : 'border-transparent'} cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-110 transition-all"></div>
                                <div onclick="updateAccentColor('cyan')" class="w-8 h-8 rounded-full bg-cyan-500 border-2 ${empireSettings.accentColor === 'cyan' ? 'border-white' : 'border-transparent'} cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-110 transition-all"></div>
                                <div onclick="updateAccentColor('blue')" class="w-8 h-8 rounded-full bg-blue-500 border-2 ${empireSettings.accentColor === 'blue' ? 'border-white' : 'border-transparent'} cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-110 transition-all"></div>
                                <div onclick="updateAccentColor('green')" class="w-8 h-8 rounded-full bg-green-500 border-2 ${empireSettings.accentColor === 'green' ? 'border-white' : 'border-transparent'} cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-110 transition-all"></div>
                            </div>
                        </div>
                        ${renderToggle('3D Depth Motion', empireSettings.depthMotion, '', 'depthMotion')}
                        ${renderToggle('Reduced Latency', empireSettings.reducedLatency, '', 'reducedLatency')}
                    </div>
                `)}

                <!-- G. Security & Protocols -->
                ${renderSettingsCard('🛡️', 'Protocol Security', 'Defensive empire encryption.', `
                    <div class="space-y-4">
                         ${renderToggle('Two-Factor Sync', true)}
                         <div class="pt-2 pb-2">
                             <label class="block text-[10px] text-white/40 uppercase mb-2">Session Decay</label>
                             <select class="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs">
                                <option>4 Hours</option>
                                <option>24 Hours</option>
                                <option>Permanent</option>
                             </select>
                         </div>
                         <button class="w-full py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all">TERMINATE ALL SESSIONS</button>
                    </div>
                `)}
            </div>

            <!-- Security Protocols End -->
        </div>
    `;
}

function renderSettingsCard(icon, title, desc, content) {
    return `
        <div class="glass-card p-8 rounded-[2.5rem] flex flex-col h-full border-t border-l border-white/10">
            <div class="flex items-center gap-4 mb-6">
                <div class="text-3xl">${icon}</div>
                <div>
                    <h3 class="text-xl font-bold">${title}</h3>
                    <p class="text-[10px] text-white/30 uppercase tracking-widest font-mono">${desc}</p>
                </div>
            </div>
            <div class="flex-1">
                ${content}
            </div>
        </div>
    `;
}

function renderInput(label, type, val, id) {
    return `
        <div>
            <label class="block text-[10px] text-white/40 uppercase mb-2 ml-1">${label}</label>
            <input type="${type}" id="${id || ''}" value="${val}" oninput="showSaveNotification()" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-accent-dynamic transition-all">
        </div>
    `;
}

function renderToggle(label, checked, status, settingKey) {
    const id = 'toggle-' + label.toLowerCase().replace(/\s+/g, '-');
    return `
        <div class="flex items-center justify-between group">
            <div class="flex flex-col">
                <span class="text-xs font-bold group-hover:text-white transition-colors text-white/70">${label}</span>
                ${status ? `<span class="text-[9px] ${status === 'Connected' ? 'text-green-400' : 'text-yellow-500'} font-mono">${status}</span>` : ''}
            </div>
            <div class="relative inline-block w-12 mr-2 align-middle select-none">
                <input type="checkbox" id="${id}" onchange="updateSetting('${settingKey}', this.checked)" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer invisible" ${checked ? 'checked' : ''}/>
                <label for="${id}" class="toggle-label transition-all"></label>
            </div>
        </div>
    `;
}


function initSettingsListeners() {
    // Re-apply magnetic to save button
    initMagnetic();
    applyCardParallax();
}

function saveSettings() {
    const btn = document.getElementById('save-btn');
    const progress = document.getElementById('save-progress');

    btn.innerHTML = 'SYNCHRONIZING...';
    btn.disabled = true;

    gsap.to(progress, {
        width: '100%',
        duration: 1.5,
        ease: 'power1.inOut',
        onComplete: () => {
            // Commit to LocalStorage
            localStorage.setItem('empire-settings', JSON.stringify(empireSettings));

            btn.innerHTML = 'PROTOCOLS SAVED';
            btn.classList.add('bg-green-500', 'text-white');
            btn.classList.remove('bg-white', 'text-dark');

            // Hide the save bar
            const bar = document.getElementById('save-bar');
            setTimeout(() => {
                if (bar) {
                    bar.classList.add('opacity-0', 'translate-y-10');
                    bar.classList.remove('opacity-100', 'translate-y-0');
                }

                btn.innerHTML = 'SAVE EMPIRE SETTINGS';
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-white', 'text-dark');
                btn.disabled = false;
                gsap.to(progress, { width: '0%', duration: 0.5 });
            }, 2000);
        }
    });
}

function resetSettings() {
    if (confirm('REVERT ALL NEURAL NODES TO DEFAULT?')) {
        empireSettings = {
            accentColor: 'purple',
            depthMotion: true,
            reducedLatency: false,
            username: 'Empire_Architect_01',
            email: 'architect@faceless.os'
        };
        localStorage.setItem('empire-settings', JSON.stringify(empireSettings));
        applySettings();
        renderContent('settings');
    }
}

// --- MOCK LOGIC ---

function generateScriptStructure() {
    const topic = document.getElementById('script-topic').value;
    const output = document.getElementById('script-output');

    if (!topic) {
        gsap.to(output, { x: 10, duration: 0.1, repeat: 3, yoyo: true });
        return;
    }

    output.innerHTML = `<div class="flex flex-col items-center gap-4 text-center">
        <div class="w-8 h-8 border-2 border-accent-dynamic border-t-transparent rounded-full animate-spin"></div>
        <p class="font-mono text-xs uppercase animate-pulse">Computing viral coefficients...</p>
    </div>`;

    setTimeout(() => {
        output.innerHTML = `
            <div class="w-full space-y-6 animate-in">
                <div class="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 class="text-xl font-bold text-accent-dynamic">Script Framework: ${topic.substring(0, 15)}...</h3>
                    <button class="text-[10px] font-bold bg-white/5 px-3 py-1 rounded border border-white/10 uppercase">Copy Framework</button>
                </div>
                <div class="space-y-4">
                    ${renderScriptBlock('HOOK', 'The negative curiosity loop. Start with "Most people are doing [X] wrong..."', 'border-accent-purple')}
                    ${renderScriptBlock('STORY', 'The bridge from failure to success via AI automation.', 'border-accent-blue')}
                    ${renderScriptBlock('VALUE', '3 key tools identified: ElevenLabs, CapCut, Leonardo.', 'border-accent-cyan')}
                    ${renderScriptBlock('CTA', 'Micro-conversion: Comment "AI" for the full stack checklist.', 'border-white')}
                </div>
            </div>
        `;
    }, 1500);
}

function renderScriptBlock(label, text, border) {
    return `
        <div class="bg-white/5 p-4 rounded-2xl border-l-4 ${border}">
            <p class="text-[10px] font-bold text-white/30 uppercase mb-1">${label}</p>
            <p class="text-sm font-medium">${text}</p>
        </div>
    `;
}

function initTrackerCharts() {
    const ctx = document.getElementById('tracker-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Retention',
                    data: [70, 75, 72, 85, 82, 90, 88],
                    borderColor: 'var(--accent-dynamic)',
                    borderWidth: 4,
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: 'var(--accent-dynamic)',
                    pointRadius: 4
                },
                {
                    label: 'Avg',
                    data: [65, 68, 65, 67, 66, 68, 67],
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Space Grotesk' } } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Space Grotesk' } } }
            }
        }
    });
}

// --- MAGNETIC MOUSE LOGIC ---
function initMagnetic() {
    const magneticEls = document.querySelectorAll('.magnetic');

    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

// --- 3D MOUSE PARALLAX ---
function initNeuralCore() {
    console.log("NEURAL_CORE_INITIALIZED");
    // Holographic core logic can be expanded here
}

function applyCardParallax() {
    if (!empireSettings.depthMotion) return;
    const cards = document.querySelectorAll('.glass-card');

    const handleMouseMove = (e) => {
        if (!empireSettings.depthMotion) return;
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;

            const angleX = (clientY - cardY) / 30;
            const angleY = (clientX - cardX) / -30;

            gsap.to(card, {
                rotateX: angleX * 0.5,
                rotateY: angleY * 0.5,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Parallax depth for the grid/particles
        if (particles) {
            gsap.to(particles.rotation, {
                x: yPos * 0.02,
                y: xPos * 0.02,
                duration: 1.5,
                ease: 'power2.out'
            });
        }
    };

    document.addEventListener('mousemove', handleMouseMove);
}

// --- REVENUE MANAGER PRO ENGINE ---

function renderRevenue() {
    const filteredData = filterRevenueData();
    const stats = calculateRevenueStats(filteredData);
    const sources = ['All', 'Ads', 'Affiliate', 'Sponsorship', 'Digital Products'];

    return `
        <div class="space-y-8 animate-in relative pb-20">
            <!-- Header & Controls -->
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 class="text-4xl font-extrabold tracking-tight italic">REVENUE <span class="text-accent-dynamic uppercase tracking-tighter text-glow-accent">Manager</span></h2>
                    <p class="text-white/40 mt-1 uppercase text-[10px] tracking-widest font-mono">Financial Command Center v4.0</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 glass-card p-2 rounded-2xl border-white/10">
                        ${['7', '30', '90', 'All'].map(d => `
                            <button onclick="updateRevenueDateRange('${d}')" 
                                class="px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${revenueState.dateRange === d ? 'bg-accent-dynamic text-dark shadow-accent-dynamic' : 'text-white/40 hover:text-white'}">
                                ${d === 'All' ? 'ALL TIME' : d + ' DAYS'}
                            </button>
                        `).join('')}
                    </div>
                    <button onclick="exportRevenueCSV()" class="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-accent-dynamic group" title="Export Ledger">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Dashboard Analytics -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                ${renderRevenueKPI('Total Yield', '$' + stats.total.toLocaleString(), 'accent-dynamic', stats.totalGrowth)}
                ${renderRevenueKPI('MRR Projection', '$' + stats.mrr.toLocaleString(), 'accent-blue', stats.mrrGrowth)}
                ${renderRevenueKPI('Avg / Node', '$' + stats.avgPerVideo.toLocaleString(), 'white', '+2.4%')}
                ${renderRevenueKPI('Empire Growth', stats.growth + '%', 'accent-cyan', 'Alpha')}
                ${renderRevenueKPI('Best Platform', stats.bestPlatform || 'YouTube', 'accent-purple', 'High-Yield')}
            </div>

            <!-- Visualization Core -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 glass-card p-8 rounded-[3rem] border-white/10 min-h-[450px] relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-accent-dynamic/10 blur-[100px] -z-10 group-hover:bg-accent-dynamic/20 transition-all duration-700"></div>
                    <div class="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 class="text-sm font-black uppercase tracking-widest text-white/60">Neural Cashflow Projection</h3>
                            <p class="text-[10px] text-white/30 font-mono mt-1">DATASTREAM://REVENUE_ALPHA_01</p>
                        </div>
                        <div class="flex gap-2">
                             <button class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/40 hover:text-white transition-all">DAILY</button>
                             <button class="px-4 py-2 bg-white border border-white rounded-xl text-[10px] font-bold text-dark shadow-[0_0_20px_rgba(255,255,255,0.2)]">WEEKLY</button>
                        </div>
                    </div>
                    <div class="h-[320px]">
                        <canvas id="revenue-line-chart"></canvas>
                    </div>
                </div>

                <div class="lg:col-span-4 space-y-6">
                    <div class="glass-card p-8 rounded-[3rem] border-white/10 h-full flex flex-col relative overflow-hidden group">
                        <div class="absolute bottom-0 right-0 w-32 h-32 bg-accent-dynamic/5 blur-[50px] -z-10"></div>
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 bg-accent-dynamic rounded-full animate-pulse"></span>
                             Empire Insights
                        </h3>
                        <div class="space-y-4 flex-1">
                            ${renderFinancialInsight('Top Earner', stats.topEarner ? stats.topEarner.title : 'N/A', 'bg-accent-dynamic/10 text-accent-dynamic border-accent-dynamic/20')}
                            ${renderFinancialInsight('Sponsor Pulse', 'NordVPN campaign trending up 12%.', 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20')}
                            ${renderFinancialInsight('System Alert', stats.hasPending ? 'Pending sponsorships require verification.' : 'System stable. Growth targets met.', stats.hasPending ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-white/40 border-white/10')}
                        </div>
                        <div class="mt-8 pt-6 border-t border-white/5">
                            <p class="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1 text-center">30D Projected Growth</p>
                            <div class="flex items-end justify-center gap-2">
                                <span class="text-3xl font-black text-accent-dynamic">$${(stats.mrr * 1.15).toLocaleString()}</span>
                                <span class="text-[10px] text-green-400 font-bold mb-1">+15%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Source Ledger -->
                <div class="lg:col-span-8 space-y-8">
                    <div class="space-y-6">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div class="flex flex-wrap gap-2">
                                ${sources.map(s => `
                                    <button onclick="updateRevenueSourceFilter('${s}')" 
                                        class="px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${revenueState.sourceFilter === s ? 'bg-white text-dark border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}">
                                        ${s.toUpperCase()}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="relative w-full md:w-72 group">
                                <div class="absolute inset-0 bg-accent-dynamic/5 blur-xl group-focus-within:bg-accent-dynamic/10 transition-all"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent-dynamic transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input type="text" placeholder="Search Empire Ledger..." oninput="updateRevenueSearch(this.value)" value="${revenueState.search}"
                                    class="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs focus:border-accent-dynamic transition-all outline-none relative z-10 backdrop-blur-xl">
                            </div>
                        </div>

                        <div class="glass-card rounded-[3rem] overflow-hidden border-white/5 relative group">
                            <div class="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                            <div class="overflow-x-auto relative z-10">
                                <table class="w-full text-left">
                                    <thead>
                                        <tr class="bg-white/5 border-b border-white/10">
                                            <th class="px-8 py-6 text-[9px] font-black uppercase text-white/30 tracking-widest cursor-pointer hover:text-white group/th" onclick="sortRevenue('date')">
                                                Date <span class="ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity">↓</span>
                                            </th>
                                            <th class="px-8 py-6 text-[9px] font-black uppercase text-white/30 tracking-widest">Identity</th>
                                            <th class="px-8 py-6 text-[9px] font-black uppercase text-white/30 tracking-widest">Source</th>
                                            <th class="px-8 py-6 text-[9px] font-black uppercase text-white/30 tracking-widest cursor-pointer hover:text-white group/th" onclick="sortRevenue('amount')">
                                                Yield <span class="ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity">↓</span>
                                            </th>
                                            <th class="px-8 py-6 text-[9px] font-black uppercase text-white/30 tracking-widest">Protocol</th>
                                            <th class="px-8 py-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/5 text-sm">
                                        ${filteredData.map(r => `
                                            <tr onclick="openRevenueDetail(${r.id})" class="hover:bg-white/[0.03] transition-all cursor-pointer group/row">
                                                <td class="px-8 py-6 font-mono text-white/40 text-xs">${r.date}</td>
                                                <td class="px-8 py-6">
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-white/80 group-hover/row:text-white transition-colors">${r.title}</span>
                                                        <span class="text-[9px] uppercase tracking-widest text-white/20 mt-1">${r.platform} NODE</span>
                                                    </div>
                                                </td>
                                                <td class="px-8 py-6">
                                                    <span class="px-3 py-1 rounded-full bg-accent-dynamic/5 border border-accent-dynamic/20 text-accent-dynamic text-[9px] font-black tracking-widest uppercase">${r.source}</span>
                                                </td>
                                                <td class="px-8 py-6">
                                                    <span class="text-base font-black text-accent-dynamic text-glow-accent">$${r.amount.toLocaleString()}</span>
                                                </td>
                                                <td class="px-8 py-6">
                                                    <div class="flex items-center gap-2">
                                                        <span class="w-1.5 h-1.5 rounded-full ${r.status === 'Paid' ? 'bg-accent-dynamic shadow-accent-dynamic' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}"></span>
                                                        <span class="text-[10px] font-black uppercase tracking-widest ${r.status === 'Paid' ? 'text-accent-dynamic' : 'text-yellow-400'}">${r.status}</span>
                                                    </div>
                                                </td>
                                                <td class="px-8 py-6 text-right">
                                                    <button onclick="deleteRevenueEntry(event, ${r.id})" class="p-2 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-500 transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Forge -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="glass-card p-8 rounded-[3rem] border-white/10 border-t border-l relative overflow-hidden">
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-accent-dynamic/10 blur-[50px]"></div>
                        <h3 class="text-sm font-black uppercase tracking-[0.3em] mb-8 text-white/60">Revenue Forge</h3>
                        <div class="space-y-4">
                            <div class="space-y-1">
                                <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Asset Identity</label>
                                <input type="text" id="rev-title" placeholder="e.g. YT AdSense Feb" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-accent-dynamic outline-none transition-all focus:bg-white/10">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Yield Type</label>
                                    <select id="rev-source" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs focus:border-accent-dynamic outline-none appearance-none cursor-pointer">
                                        <option value="Ads">Ads</option>
                                        <option value="Affiliate">Affiliate</option>
                                        <option value="Sponsorship">Sponsorship</option>
                                        <option value="Digital Products">Prod Sale</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Fiat Amount</label>
                                    <input type="number" id="rev-amount" placeholder="0.00" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-accent-dynamic outline-none transition-all">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Identity Node</label>
                                    <select id="rev-platform" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs focus:border-accent-dynamic outline-none appearance-none cursor-pointer">
                                        <option value="YouTube">YouTube</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Web">Network</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Log Date</label>
                                    <input type="date" id="rev-date" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs focus:border-accent-dynamic outline-none">
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Meta-Data Notes</label>
                                <textarea id="rev-notes" placeholder="Detailed transaction context..." class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-accent-dynamic outline-none h-24 resize-none"></textarea>
                            </div>
                            <button onclick="addRevenueEntry()" class="w-full bg-accent-dynamic text-dark py-5 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:shadow-[0_0_40px_#22c55e] transition-all transform hover:-translate-y-1 active:scale-95">LOG_TRANSACTION</button>
                        </div>
                    </div>

                    <!-- Allocation Matrix -->
                    <div class="glass-card p-8 rounded-[3rem] border-white/10 min-h-[320px] relative group overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-dynamic to-transparent opacity-30"></div>
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8 flex justify-between items-center">
                            Allocation Matrix
                            <span class="text-accent-dynamic text-[8px]">REVENUE // SPLIT</span>
                        </h3>
                        <div class="h-[200px]">
                            <canvas id="revenue-donut-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="revenue-modal" class="fixed inset-0 z-[150] bg-dark/95 backdrop-blur-3xl flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-700">
            <div class="max-w-2xl w-full glass-morphism p-16 rounded-[5rem] relative border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                <div class="absolute top-0 left-0 w-full h-full bg-noise opacity-[0.03] pointer-events-none"></div>
                <div class="absolute -top-24 -left-24 w-96 h-96 bg-accent-dynamic/10 blur-[150px] -z-10"></div>
                
                <button onclick="closeRevenueModal()" class="absolute top-12 right-12 text-white/20 hover:text-white hover:rotate-90 transition-all duration-500 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div id="revenue-modal-content" class="relative z-10 transition-all duration-500"></div>
            </div>
        </div>
    `;
}

function renderRevenueKPI(label, val, col, trend) {
    const isPos = trend.includes('+') || trend === 'Stable' || trend === 'Alpha';
    return `
        <div class="glass-card p-6 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all border-t border-l group hover:-translate-y-1 shadow-xl">
            <div class="flex items-center justify-between mb-4">
                <p class="text-[9px] font-black text-white/30 uppercase tracking-widest">${label}</p>
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span class="text-[8px] font-black ${isPos ? 'text-green-400' : 'text-red-400'}">${trend}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 ${isPos ? 'text-green-500' : 'text-red-500'} ${isPos ? '' : 'rotate-180'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </div>
            </div>
            <h4 class="text-3xl font-black text-${col} tracking-tight glow-text-sm">${val}</h4>
        </div>
    `;
}

function renderFinancialInsight(title, val, style) {
    return `
        <div class="p-5 rounded-3xl ${style} border flex flex-col gap-1 hover:brightness-110 transition-all cursor-crosshair">
            <p class="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">${title}</p>
            <p class="text-xs font-bold tracking-tight">${val}</p>
        </div>
    `;
}

// --- FINANCIAL LOGIC ---

function calculateRevenueStats(data) {
    if (data.length === 0) return { total: 0, mrr: 0, avgPerVideo: 0, growth: 0, bestSource: 'N/A', totalGrowth: '0%', mrrGrowth: '0%', topEarner: null, hasPending: false, bestPlatform: 'N/A' };

    const total = data.reduce((sum, r) => sum + r.amount, 0);
    const mrr = Math.round(total * 0.4);
    const avgPerVideo = data.length > 0 ? Math.round(total / data.length) : 0;

    const sourceTotals = {};
    const platformTotals = {};
    data.forEach(r => {
        sourceTotals[r.source] = (sourceTotals[r.source] || 0) + r.amount;
        platformTotals[r.platform] = (platformTotals[r.platform] || 0) + r.amount;
    });

    const bestSource = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const bestPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const topEarner = [...data].sort((a, b) => b.amount - a.amount)[0];
    const hasPending = data.some(r => r.status === 'Pending' && r.amount > 1000);

    return {
        total,
        mrr,
        avgPerVideo,
        growth: 28,
        bestSource,
        bestPlatform,
        totalGrowth: '+22.4%',
        mrrGrowth: '+8.1%',
        topEarner,
        hasPending
    };
}

function filterRevenueData() {
    let data = REVENUE_DATA.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(revenueState.search.toLowerCase());
        const matchesSource = revenueState.sourceFilter === 'All' || r.source === revenueState.sourceFilter;

        // Date range filtering
        if (revenueState.dateRange === '7') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return matchesSearch && matchesSource && new Date(r.date) >= sevenDaysAgo;
        } else if (revenueState.dateRange === '30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return matchesSearch && matchesSource && new Date(r.date) >= thirtyDaysAgo;
        } else if (revenueState.dateRange === '90') {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            return matchesSearch && matchesSource && new Date(r.date) >= ninetyDaysAgo;
        }

        return matchesSearch && matchesSource;
    });

    data.sort((a, b) => {
        let valA = a[revenueState.sortBy];
        let valB = b[revenueState.sortBy];
        if (revenueState.sortDir === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });

    return data;
}

function initRevenueCharts() {
    initRevenueDonutChart();
    initRevenueLineChart();
}

function initRevenueDonutChart() {
    const canvas = document.getElementById('revenue-donut-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.revDonutInstance) window.revDonutInstance.destroy();

    const data = filterRevenueData();
    const sourceTotals = {};
    data.forEach(r => sourceTotals[r.source] = (sourceTotals[r.source] || 0) + r.amount);

    window.revDonutInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sourceTotals),
            datasets: [{
                data: Object.values(sourceTotals),
                backgroundColor: ['#22c55e', '#3b82f6', '#a855f7', '#06b6d4', '#f59e0b'],
                borderColor: '#0b0f1a',
                borderWidth: 5,
                hoverOffset: 15
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.4)', font: { size: 9, family: 'Space Grotesk', weight: 'bold' }, padding: 20 }
                }
            },
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function initRevenueLineChart() {
    const canvas = document.getElementById('revenue-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.revLineInstance) window.revLineInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    window.revLineInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6', 'Node 7', 'Node 8', 'Node 9', 'Node 10'],
            datasets: [{
                label: 'Empire Yield',
                data: [4200, 3800, 5200, 4800, 6800, 6100, 8400, 7800, 9200, 8900],
                borderColor: '#22c55e',
                borderWidth: 6,
                tension: 0.4,
                fill: true,
                backgroundColor: gradient,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#fff',
                pointBorderWidth: 4,
                pointRadius: 0,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 5,
                pointHitRadius: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(11, 15, 26, 0.9)',
                    titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
                    bodyFont: { family: 'Space Grotesk', size: 16 },
                    padding: 20,
                    borderColor: 'rgba(34, 197, 94, 0.5)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return '$' + context.parsed.y.toLocaleString() + ' Yield';
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] },
                    ticks: { color: 'rgba(255,255,255,0.2)', font: { family: 'Space Grotesk', size: 10 }, padding: 15 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.2)', font: { family: 'Space Grotesk', size: 10 }, padding: 15 }
                }
            }
        }
    });
}

function updateRevenueDateRange(range) {
    revenueState.dateRange = range;
    const contentArea = document.getElementById('content-area');
    gsap.to(contentArea, {
        opacity: 0.5, duration: 0.2, onComplete: () => {
            renderContent('revenue');
            setTimeout(() => {
                gsap.to(contentArea, { opacity: 1, duration: 0.2 });
                initRevenueCharts();
            }, 50);
        }
    });
}

function updateRevenueSourceFilter(source) {
    revenueState.sourceFilter = source;
    renderContent('revenue');
    initRevenueCharts();
}

function updateRevenueSearch(val) {
    revenueState.search = val;
    renderContent('revenue');
    initRevenueCharts();
}

function sortRevenue(col) {
    if (revenueState.sortBy === col) {
        revenueState.sortDir = revenueState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        revenueState.sortBy = col;
        revenueState.sortDir = 'desc';
    }
    renderContent('revenue');
    initRevenueCharts();
}

function addRevenueEntry() {
    const title = document.getElementById('rev-title').value;
    const source = document.getElementById('rev-source').value;
    const amount = parseFloat(document.getElementById('rev-amount').value);
    const date = document.getElementById('rev-date').value;
    const platform = document.getElementById('rev-platform').value;
    const notes = document.getElementById('rev-notes').value;

    if (!title || isNaN(amount) || !date) {
        gsap.to(document.getElementById('rev-title').parentElement, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
        return;
    }

    const newEntry = {
        id: Date.now(),
        title,
        source,
        amount,
        date,
        platform,
        notes,
        status: 'Paid'
    };

    REVENUE_DATA.unshift(newEntry);
    localStorage.setItem('empire-revenue', JSON.stringify(REVENUE_DATA));

    // Clear form
    document.getElementById('rev-title').value = '';
    document.getElementById('rev-amount').value = '';
    document.getElementById('rev-notes').value = '';

    // Play feedback animation
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'SYNCING_IDENTITY...';
    btn.classList.add('bg-white', 'text-dark');

    setTimeout(() => {
        btn.innerHTML = 'SUCCESS_LOGGED';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-white', 'text-dark');
            renderContent('revenue');
            initRevenueCharts();
        }, 1000);
    }, 800);
}

function deleteRevenueEntry(e, id) {
    e.stopPropagation();
    if (confirm('TERMINATE TRANSACTION NODE FROM LEDGER?')) {
        REVENUE_DATA = REVENUE_DATA.filter(r => r.id !== id);
        localStorage.setItem('empire-revenue', JSON.stringify(REVENUE_DATA));
        renderContent('revenue');
        initRevenueCharts();
    }
}

function openRevenueDetail(id) {
    const entry = REVENUE_DATA.find(r => r.id === id);
    const modal = document.getElementById('revenue-modal');
    const content = document.getElementById('revenue-modal-content');

    if (!entry) return;

    content.innerHTML = `
        <div class="space-y-10 animate-in">
            <div class="flex items-center gap-8">
                <div class="w-24 h-24 rounded-[3rem] bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(34,197,94,0.3)]">💰</div>
                <div>
                    <h2 class="text-4xl font-black italic tracking-tighter mb-2 underline decoration-accent-green decoration-4 underline-offset-8">${entry.title}</h2>
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">TRANSACTION_SHA_${entry.id.toString(16)}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
                <div class="glass-card p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 group hover:border-accent-green/50 transition-all">
                    <p class="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-3">Settlement Yield</p>
                    <p class="text-5xl font-black text-accent-green tracking-tighter glow-text-green">$${entry.amount.toLocaleString()}</p>
                </div>
                <div class="glass-card p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 group hover:border-accent-cyan/50 transition-all">
                    <p class="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-3">Capital Source</p>
                    <p class="text-3xl font-bold text-accent-cyan uppercase tracking-tight">${entry.source}</p>
                </div>
            </div>

            <div class="glass-card p-10 rounded-[3rem] bg-white/[0.02] border border-dashed border-white/20 relative group overflow-hidden">
                 <div class="absolute inset-0 bg-accent-green/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <p class="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Neural Insights & Metadata
                 </p>
                 <p class="text-base text-white/70 leading-relaxed italic relative z-10 font-medium">"${entry.notes || 'No meta-data was attached during the forge cycle of this transaction.'}"</p>
            </div>

            <div class="grid grid-cols-3 gap-6 pt-4">
                <div class="text-center p-4 border-r border-white/5">
                    <p class="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-1">Origin Node</p>
                    <p class="text-xs font-bold text-white/60">${entry.platform}</p>
                </div>
                <div class="text-center p-4 border-r border-white/5">
                    <p class="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-1">Time Vector</p>
                    <p class="text-xs font-bold font-mono text-white/60">${entry.date}</p>
                </div>
                <div class="text-center p-4">
                    <p class="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-1">Current Protocol</p>
                    <span class="text-[10px] font-black uppercase tracking-widest ${entry.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}">${entry.status}</span>
                </div>
            </div>

            <div class="flex gap-4 mt-8 relative z-10">
                ${entry.status === 'Pending' ? `
                    <button onclick="markAsPaid(${entry.id})" class="flex-1 bg-accent-green text-dark py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:shadow-[0_0_50px_#22c55e] transition-all transform hover:-translate-y-1">MARK_SETTLED</button>
                ` : ''}
                <button onclick="closeRevenueModal()" class="flex-1 bg-white/5 border border-white/10 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white/10 transition-all text-white/40 hover:text-white">CLOSE_MATRIX</button>
                <button onclick="deleteRevenueEntryModal(${entry.id})" class="px-8 bg-red-500/10 text-red-500 border border-red-500/20 rounded-3xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    gsap.fromTo(content, { scale: 0.9, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
}

function closeRevenueModal() {
    const modal = document.getElementById('revenue-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}

function markAsPaid(id) {
    const entry = REVENUE_DATA.find(r => r.id === id);
    if (entry) {
        entry.status = 'Paid';
        localStorage.setItem('empire-revenue', JSON.stringify(REVENUE_DATA));
        renderContent('revenue');
        setTimeout(() => {
            initRevenueCharts();
            openRevenueDetail(id); // Re-open to show updated status with animation
        }, 100);
    }
}

function deleteRevenueEntryModal(id) {
    if (confirm('PURGE TRANSACTION RECORD FROM THE SYSTEM?')) {
        REVENUE_DATA = REVENUE_DATA.filter(r => r.id !== id);
        localStorage.setItem('empire-revenue', JSON.stringify(REVENUE_DATA));
        closeRevenueModal();
        setTimeout(() => {
            renderContent('revenue');
            initRevenueCharts();
        }, 400);
    }
}

function exportRevenueCSV() {
    const headers = ['Date', 'Item', 'Origin', 'Type', 'Fiat_Amount', 'State', 'Meta_Notes'];
    const csvContent = [
        headers.join(','),
        ...REVENUE_DATA.map(r => [
            r.date,
            `"${r.title.replace(/"/g, '""')}"`,
            r.platform,
            r.source,
            r.amount,
            r.status,
            `"${(r.notes || 'N/A').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `EMPIRE_LEDGER_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
