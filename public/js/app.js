/* ===== API CLIENT ===== */
const API_BASE = '/api';

const api = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  setAuth: (token, user) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  clearAuth: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },

  request: async (endpoint, options = {}) => {
    const token = api.getToken();
    const config = {
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  },

  get: (ep) => api.request(ep),
  post: (ep, body) => api.request(ep, { method: 'POST', body }),
  put: (ep, body) => api.request(ep, { method: 'PUT', body }),
  delete: (ep) => api.request(ep, { method: 'DELETE' }),
};

/* ===== TOAST SYSTEM ===== */
const toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },
  success: (m) => toast.show(m, 'success'),
  error: (m) => toast.show(m, 'error'),
  info: (m) => toast.show(m, 'info'),
};

/* ===== ROUTER ===== */
const router = {
  routes: {},
  currentPage: null,

  register(path, handler) { this.routes[path] = handler; },

  navigate(path, pushState = true) {
    if (pushState) window.history.pushState({}, '', path);
    const parts = path.split('?')[0].split('/').filter(Boolean);
    let matched = this.routes[path.split('?')[0]];
    let params = {};

    if (!matched) {
      for (const [route, handler] of Object.entries(this.routes)) {
        const routeParts = route.split('/').filter(Boolean);
        if (routeParts.length !== parts.length) continue;
        let match = true;
        routeParts.forEach((r, i) => {
          if (r.startsWith(':')) params[r.slice(1)] = parts[i];
          else if (r !== parts[i]) match = false;
        });
        if (match) { matched = handler; break; }
      }
    }

    if (matched) {
      this.currentPage = path;
      matched(params, new URLSearchParams(path.includes('?') ? path.split('?')[1] : ''));
    } else {
      this.navigate('/');
    }
  },

  init() {
    window.addEventListener('popstate', () => this.navigate(window.location.pathname + window.location.search, false));
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-link]');
      if (a) { e.preventDefault(); this.navigate(a.dataset.link || a.href.replace(location.origin, '')); }
    });
  }
};

/* ===== NAVBAR RENDERER ===== */
function renderNavbar() {
  const user = api.getUser();
  const isLoggedIn = !!api.getToken();
  const nav = document.getElementById('navbar');

  nav.innerHTML = `
    <nav class="navbar" id="mainNavbar">
      <div class="container">
        <div class="nav-content">
          <div class="nav-logo" data-link="/" style="cursor:pointer">
            <div class="nav-logo-icon">🚀</div>
            <span>InternBridge</span>
          </div>
          <ul class="nav-links" id="navLinks">
            <li><a href="#" data-link="/">Home</a></li>
            <li><a href="#" data-link="/opportunities">Browse</a></li>
            ${isLoggedIn ? `
              <li><a href="#" data-link="/dashboard">Dashboard</a></li>
              ${user?.role === 'organization' ? `<li><a href="#" data-link="/post-opportunity">Post Job</a></li>` : ''}
            ` : ''}
          </ul>
          <div class="nav-actions" id="navActions">
            ${isLoggedIn ? `
              <div class="nav-user" id="navUserMenu">
                <div class="nav-avatar">${(user?.name || 'U')[0].toUpperCase()}</div>
                <span class="nav-user-name">${user?.name?.split(' ')[0] || 'User'}</span>
                <span>▾</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="logout()">Sign Out</button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('/login')">Sign In</button>
              <button class="btn btn-primary btn-sm" onclick="router.navigate('/register')">Get Started</button>
            `}
          </div>
          <div class="hamburger" onclick="toggleMobileMenu()">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Sticky class
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('mainNavbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Active link
  const links = nav.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.dataset.link === window.location.pathname) link.classList.add('active');
    else link.classList.remove('active');
  });
}

function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}

function logout() {
  api.clearAuth();
  toast.info('Signed out successfully');
  renderNavbar();
  router.navigate('/');
}

/* ===== HOME PAGE ===== */
async function renderHome() {
  document.title = 'InternBridge - Find Your Perfect Internship & Project';
  document.getElementById('app').innerHTML = `
    <div class="page">
      <!-- HERO -->
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-left">
              <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span> Find your next opportunity</div>
              <h1 class="hero-title">
                Where students meet<br>
                <em>meaningful work</em>
              </h1>
              <p class="hero-desc">Browse internships, live projects, and research roles from verified organizations. Apply with a single profile and track everything in one place.</p>
              <div class="hero-actions">
                <button class="btn btn-primary btn-lg" onclick="router.navigate('/opportunities')">Browse Opportunities</button>
                <button class="btn btn-secondary btn-lg" onclick="router.navigate('/register')">Create Free Account</button>
              </div>
              <div class="hero-stats" id="heroStats">
                <div class="hero-stat"><div class="hero-stat-value" id="statStudents">--</div><div class="hero-stat-label">Students registered</div></div>
                <div class="hero-stat"><div class="hero-stat-value" id="statOrgs">--</div><div class="hero-stat-label">Organizations</div></div>
                <div class="hero-stat"><div class="hero-stat-value" id="statOpps">--</div><div class="hero-stat-label">Open roles</div></div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="hero-card-stack">
                <div class="hero-floating-card">
                  <div class="hero-card-header">
                    <div class="hero-card-icon feature-icon-1">💻</div>
                    <div>
                      <div style="font-size:0.76rem;color:var(--text-4);margin-bottom:0.15rem">TechCorp Solutions</div>
                      <div style="font-weight:600;font-size:0.92rem;color:var(--text)">Frontend Developer Intern</div>
                    </div>
                    <span class="match-pill">95% match</span>
                  </div>
                  <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                    <span class="hero-card-tag tag-internship">Internship</span>
                    <span class="hero-card-tag tag-remote">Remote</span>
                    <span class="skill-tag">React.js</span>
                    <span class="skill-tag">Node.js</span>
                  </div>
                </div>
                <div class="hero-floating-card">
                  <div class="hero-card-header">
                    <div class="hero-card-icon feature-icon-2">📊</div>
                    <div>
                      <div style="font-size:0.76rem;color:var(--text-4);margin-bottom:0.15rem">Analytics Hub</div>
                      <div style="font-weight:600;font-size:0.92rem;color:var(--text)">Data Science Project</div>
                    </div>
                    <span class="match-pill">88% match</span>
                  </div>
                  <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                    <span class="hero-card-tag tag-project">Project</span>
                    <span class="hero-card-tag tag-hybrid">Hybrid</span>
                    <span class="skill-tag">Python</span>
                    <span class="skill-tag">ML</span>
                  </div>
                </div>
                <div class="hero-floating-card">
                  <div class="hero-card-header">
                    <div class="hero-card-icon feature-icon-3">🎨</div>
                    <div>
                      <div style="font-size:0.76rem;color:var(--text-4);margin-bottom:0.15rem">CreativeStudio</div>
                      <div style="font-weight:600;font-size:0.92rem;color:var(--text)">UI/UX Design Internship</div>
                    </div>
                    <span class="match-pill">82% match</span>
                  </div>
                  <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                    <span class="hero-card-tag tag-internship">Internship</span>
                    <span class="hero-card-tag tag-onsite">On-site</span>
                    <span class="skill-tag">Figma</span>
                    <span class="skill-tag">Adobe XD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="section" style="background:var(--bg-alt)">
        <div class="container">
          <div class="section-header">
            <div class="section-badge">What you get</div>
            <h2 class="section-title">Built for how students actually work</h2>
            <p class="section-desc">Every feature was designed around a real student need — from first browse to first day.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card"><div class="feature-icon feature-icon-1">🎯</div><div class="feature-title">Skill-based matching</div><div class="feature-desc">Add your skills once. Get a ranked list of opportunities that actually fit — with match percentages you can trust.</div></div>
            <div class="feature-card"><div class="feature-icon feature-icon-2">🏢</div><div class="feature-title">Trusted organizations</div><div class="feature-desc">Work with companies and institutes that have been verified. No ghost listings or spam.</div></div>
            <div class="feature-card"><div class="feature-icon feature-icon-3">📋</div><div class="feature-title">5 opportunity types</div><div class="feature-desc">Internships, projects, freelance, part-time, and research — filtered and browsable in one view.</div></div>
            <div class="feature-card"><div class="feature-icon feature-icon-4">📬</div><div class="feature-title">One-profile applying</div><div class="feature-desc">Fill your profile once. Apply to any opportunity without re-entering details every time.</div></div>
            <div class="feature-card"><div class="feature-icon feature-icon-5">📈</div><div class="feature-title">Application tracking</div><div class="feature-desc">See every application you've sent, its current status, and any updates from the organization.</div></div>
            <div class="feature-card"><div class="feature-icon feature-icon-6">🌐</div><div class="feature-title">Remote & hybrid roles</div><div class="feature-desc">Filter by work mode. Remote, hybrid, on-site — find what works for your schedule and location.</div></div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="section" style="border-top:1px solid var(--border)">
        <div class="container">
          <div class="section-header">
            <div class="section-badge">How it works</div>
            <h2 class="section-title">From sign-up to first day in three steps</h2>
          </div>
          <div class="steps-grid">
            <div class="step-card"><div class="step-number">1</div><div class="step-title">Build your profile</div><div class="step-desc">Add your skills, education, and what you're looking for. Takes about five minutes.</div></div>
            <div class="step-card"><div class="step-number">2</div><div class="step-title">Browse or get matched</div><div class="step-desc">Use filters to explore, or check your personal match list sorted by compatibility.</div></div>
            <div class="step-card"><div class="step-number">3</div><div class="step-title">Apply and track</div><div class="step-desc">Send your application with a cover note. Watch the status update as the organization reviews it.</div></div>
          </div>
        </div>
      </section>

      <!-- LATEST OPPORTUNITIES SNIPPET -->
      <section class="section" style="background:var(--bg-alt);border-top:1px solid var(--border)">
        <div class="container">
          <div class="section-header">
            <div class="section-badge">Recently posted</div>
            <h2 class="section-title">Latest openings</h2>
            <p class="section-desc">Freshly posted internships and projects from active organizations</p>
          </div>
          <div class="opportunities-grid" id="latestOpportunities"><div class="loading-spinner"><div class="spinner"></div></div></div>
          <div style="text-align:center;margin-top:2rem">
            <button class="btn btn-outline btn-lg" onclick="router.navigate('/opportunities')">View all opportunities</button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section" style="border-top:1px solid var(--border)">
        <div class="container">
          <div style="max-width:580px;margin:0 auto;text-align:center">
            <div class="section-badge" style="justify-content:center;margin-bottom:1rem">Get started today</div>
            <h2 style="font-family:'Lora',serif;font-size:1.9rem;margin-bottom:0.875rem;color:var(--text)">The right opportunity is probably already here</h2>
            <p style="margin-bottom:1.75rem;font-size:0.95rem;max-width:440px;margin-left:auto;margin-right:auto">Students find internships that fit. Organizations find students who are ready. It starts with a free account.</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
              <button class="btn btn-primary btn-lg" onclick="router.navigate('/register')">Join as a Student</button>
              <button class="btn btn-secondary btn-lg" onclick="router.navigate('/register')">Post as an Organization</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  // Load stats
  try {
    const data = await api.get('/stats');
    if (data.success) {
      document.getElementById('statStudents').textContent = data.stats.students + '+';
      document.getElementById('statOrgs').textContent = data.stats.organizations + '+';
      document.getElementById('statOpps').textContent = data.stats.opportunities + '+';
      document.getElementById('statApps').textContent = data.stats.applications + '+';
    }
  } catch {}

  // Load latest opportunities
  try {
    const data = await api.get('/opportunities?limit=6&sort=-createdAt');
    if (data.opportunities?.length > 0) {
      document.getElementById('latestOpportunities').innerHTML = data.opportunities.map(renderOpportunityCard).join('');
    } else {
      document.getElementById('latestOpportunities').innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">📭</div>
          <div class="empty-title">No opportunities yet</div>
          <div class="empty-desc">Be the first to post an opportunity!</div>
        </div>`;
    }
  } catch {
    document.getElementById('latestOpportunities').innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><div class="empty-title">Couldn't load opportunities</div></div>`;
  }
}

/* ===== RENDER OPPORTUNITY CARD ===== */
function renderOpportunityCard(opp, matchScore = null) {
  const org = opp.organization || {};
  const orgName = org.companyName || org.name || 'Organization';
  const daysLeft = Math.ceil((new Date(opp.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  const deadlineText = daysLeft < 0 ? 'Deadline passed' : daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`;
  const deadlineColor = daysLeft <= 3 ? 'color:var(--rose)' : 'color:var(--text-3)';
  return `
    <div class="opportunity-card" onclick="router.navigate('/opportunities/${opp._id}')">
      <div class="opp-card-header">
        <div class="opp-org-info">
          <div class="opp-org-logo">${orgName[0]?.toUpperCase()}</div>
          <div>
            <div class="opp-org-name">${orgName}</div>
            <div class="opp-title">${opp.title}</div>
          </div>
        </div>
        <button class="save-btn" onclick="handleSave(event,'${opp._id}',this)" aria-label="Save">☆</button>
      </div>
      <div class="opp-tags">
        <span class="hero-card-tag tag-${opp.type}">${capitalize(opp.type)}</span>
        <span class="hero-card-tag tag-${opp.mode}">${capitalize(opp.mode)}</span>
        ${matchScore ? `<span class="match-pill">🎯 ${matchScore}% match</span>` : ''}
        ${opp.skills?.slice(0,3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        ${opp.skills?.length > 3 ? `<span class="skill-tag">+${opp.skills.length - 3}</span>` : ''}
      </div>
      <div class="opp-meta">
        <div class="opp-meta-item">📍 ${opp.location}</div>
        <div class="opp-meta-item">⏱️ ${opp.duration?.value} ${opp.duration?.unit}</div>
        <div class="opp-meta-item">🏷️ ${opp.domain}</div>
        ${opp.openings ? `<div class="opp-meta-item">👥 ${opp.openings} opening${opp.openings>1?'s':''}</div>` : ''}
      </div>
      <div class="opp-card-footer">
        <div class="stipend-badge">${opp.stipend?.isPaid ? `₹${opp.stipend.amount?.toLocaleString()}/mo` : 'Unpaid'}</div>
        <div class="deadline-text" style="${deadlineColor}">⏰ ${deadlineText}</div>
      </div>
    </div>
  `;
}

async function handleSave(e, oppId, btn) {
  e.stopPropagation();
  if (!api.getToken()) { toast.info('Sign in to save opportunities'); router.navigate('/login'); return; }
  try {
    const data = await api.post(`/opportunities/${oppId}/save`);
    btn.textContent = data.saved ? '★' : '☆';
    btn.classList.toggle('saved', data.saved);
    toast.success(data.message);
  } catch (err) { toast.error(err.message); }
}

/* ===== BROWSE OPPORTUNITIES ===== */
async function renderOpportunities(params, query) {
  document.title = 'Browse Opportunities – InternBridge';
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:80px;min-height:100vh">
      <div class="container" style="padding-top:2rem;padding-bottom:4rem">
        <div style="margin-bottom:1.5rem">
          <h1 class="page-title">Browse Opportunities</h1>
          <p class="page-subtitle">Discover internships, projects, and more</p>
        </div>
        <div class="filter-bar">
          <div class="filter-group search-input-wrap" style="flex:3;min-width:240px">
            <label class="filter-label">Search</label>
            <span class="search-icon">🔍</span>
            <input class="filter-input" id="searchInput" placeholder="Job title, skills, keywords..." style="padding-left:2.2rem" value="${query.get('search')||''}">
          </div>
          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select class="filter-select" id="typeFilter">
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="project">Project</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="research">Research</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Domain</label>
            <select class="filter-select" id="domainFilter">
              <option value="">All Domains</option>
              <option value="Technology">Technology</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Data Science">Data Science</option>
              <option value="Research">Research</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Content">Content</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Mode</label>
            <select class="filter-select" id="modeFilter">
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Sort</label>
            <select class="filter-select" id="sortFilter">
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-views">Most Viewed</option>
              <option value="applicationDeadline">Deadline Soon</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="applyFilters()">Apply Filters</button>
          <button class="btn btn-secondary" onclick="clearFilters()">Clear</button>
        </div>

        ${api.getToken() && api.getUser()?.role === 'student' ? `
          <div style="display:flex;gap:1rem;margin-bottom:1.5rem">
            <button class="btn btn-secondary btn-sm" id="btnAll" onclick="loadAllOpps()">All Opportunities</button>
            <button class="btn btn-outline btn-sm" id="btnMatched" onclick="loadMatchedOpps()">🎯 My Matches</button>
          </div>` : ''}

        <div id="oppResults" style="min-height:300px"><div class="loading-spinner"><div class="spinner"></div></div></div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  `;

  // Set filters from query
  if (query.get('type')) document.getElementById('typeFilter').value = query.get('type');
  if (query.get('domain')) document.getElementById('domainFilter').value = query.get('domain');
  if (query.get('mode')) document.getElementById('modeFilter').value = query.get('mode');

  await loadAllOpps(1);
}

let currentOppPage = 1;

async function loadAllOpps(page = 1) {
  currentOppPage = page;
  const search = document.getElementById('searchInput')?.value || '';
  const type = document.getElementById('typeFilter')?.value || '';
  const domain = document.getElementById('domainFilter')?.value || '';
  const mode = document.getElementById('modeFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || '-createdAt';
  let url = `/opportunities?page=${page}&limit=12&sort=${sort}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (type) url += `&type=${type}`;
  if (domain) url += `&domain=${encodeURIComponent(domain)}`;
  if (mode) url += `&mode=${mode}`;
  try {
    const data = await api.get(url);
    renderOppGrid(data.opportunities);
    renderPagination(data.pages, data.currentPage, loadAllOpps);
  } catch (err) { toast.error(err.message); }
}

async function loadMatchedOpps() {
  document.getElementById('oppResults').innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;
  try {
    const data = await api.get('/opportunities/matched');
    if (!data.opportunities?.length) {
      document.getElementById('oppResults').innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">No matches found</div><div class="empty-desc">Add skills to your profile to get personalized matches!</div><button class="btn btn-primary" onclick="router.navigate('/profile')">Update Profile</button></div>`;
      return;
    }
    renderOppGrid(data.opportunities, true);
  } catch (err) { toast.error(err.message); }
}

function renderOppGrid(opportunities, showMatch = false) {
  const container = document.getElementById('oppResults');
  if (!opportunities?.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No opportunities found</div><div class="empty-desc">Try adjusting your filters</div></div>`;
    return;
  }
  container.innerHTML = `<div class="opportunities-grid">${opportunities.map(opp => renderOpportunityCard(opp, showMatch ? opp.matchScore : null)).join('')}</div>`;
}

function renderPagination(totalPages, currentPage, handler) {
  const container = document.getElementById('pagination');
  if (!container || totalPages <= 1) { if(container) container.innerHTML=''; return; }
  let html = `<button class="page-btn" onclick="${handler.name}(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="${handler.name}(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span style="color:var(--text-3);padding:0 0.25rem">...</span>`;
    }
  }
  html += `<button class="page-btn" onclick="${handler.name}(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
  container.innerHTML = html;
}

function applyFilters() { loadAllOpps(1); }
function clearFilters() {
  ['searchInput','typeFilter','domainFilter','modeFilter'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  document.getElementById('sortFilter').value = '-createdAt';
  loadAllOpps(1);
}

/* ===== OPPORTUNITY DETAIL ===== */
async function renderOpportunityDetail(params) {
  document.getElementById('app').innerHTML = `<div class="loading-spinner" style="height:80vh"><div class="spinner"></div></div>`;
  try {
    const data = await api.get(`/opportunities/${params.id}`);
    const opp = data.opportunity;
    const org = opp.organization || {};
    document.title = `${opp.title} – InternBridge`;
    const user = api.getUser();
    const isOrg = user?.role === 'organization';
    const deadline = new Date(opp.applicationDeadline);
    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('app').innerHTML = `
      <div class="page" style="padding-top:90px;padding-bottom:4rem">
        <div class="container">
          <button class="btn btn-secondary btn-sm" onclick="history.back()" style="margin-bottom:1.5rem">← Back</button>
          <div class="opp-detail-grid">
            <div class="opp-detail-main">
              <!-- Header -->
              <div class="opp-detail-card">
                <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.5rem">
                  <div class="opp-org-logo" style="width:56px;height:56px;font-size:1.4rem">${(org.companyName||org.name||'O')[0]}</div>
                  <div style="flex:1">
                    <div style="color:var(--text-3);font-size:0.85rem;margin-bottom:0.25rem">${org.companyName || org.name}</div>
                    <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:0.75rem">${opp.title}</h1>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
                      <span class="hero-card-tag tag-${opp.type}">${capitalize(opp.type)}</span>
                      <span class="hero-card-tag tag-${opp.mode}">${capitalize(opp.mode)}</span>
                      <span class="hero-card-tag" style="background:rgba(255,179,71,0.1);color:var(--amber)">${opp.domain}</span>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div class="stipend-badge" style="font-size:1rem;padding:0.5rem 1rem;display:block;margin-bottom:0.5rem">${opp.stipend?.isPaid ? `₹${opp.stipend.amount?.toLocaleString()}/mo` : 'Unpaid'}</div>
                    <div style="font-size:0.8rem;color:${daysLeft<=3?'var(--rose)':'var(--text-3)'}">⏰ ${daysLeft < 0 ? 'Deadline passed' : daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`}</div>
                  </div>
                </div>
                <div class="detail-row">
                  <div class="detail-item"><div class="detail-key">📍 Location</div><div class="detail-value">${opp.location}</div></div>
                  <div class="detail-item"><div class="detail-key">⏱️ Duration</div><div class="detail-value">${opp.duration?.value} ${opp.duration?.unit}</div></div>
                  <div class="detail-item"><div class="detail-key">👥 Openings</div><div class="detail-value">${opp.openings}</div></div>
                  <div class="detail-item"><div class="detail-key">📅 Deadline</div><div class="detail-value">${deadline.toLocaleDateString()}</div></div>
                  <div class="detail-item"><div class="detail-key">👁️ Views</div><div class="detail-value">${opp.views}</div></div>
                  <div class="detail-item"><div class="detail-key">📤 Applied</div><div class="detail-value">${opp.applicants?.length || 0}</div></div>
                </div>
              </div>

              <!-- Description -->
              <div class="opp-detail-card">
                <div class="section-title-small">About the Opportunity</div>
                <p style="line-height:1.9;white-space:pre-wrap">${opp.description}</p>
              </div>

              ${opp.requirements ? `<div class="opp-detail-card"><div class="section-title-small">Requirements</div><p style="line-height:1.9;white-space:pre-wrap">${opp.requirements}</p></div>` : ''}
              ${opp.responsibilities ? `<div class="opp-detail-card"><div class="section-title-small">Responsibilities</div><p style="line-height:1.9;white-space:pre-wrap">${opp.responsibilities}</p></div>` : ''}

              <!-- Skills -->
              <div class="opp-detail-card">
                <div class="section-title-small">Required Skills</div>
                <div class="skills-list">${opp.skills?.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>
              </div>

              ${opp.perks?.length ? `<div class="opp-detail-card"><div class="section-title-small">Perks & Benefits</div><div class="perks-list">${opp.perks.map(p=>`<div class="perk-item">✓ ${p}</div>`).join('')}</div></div>` : ''}
            </div>

            <!-- Sidebar -->
            <div>
              <!-- Apply Card -->
              <div class="opp-detail-card" style="margin-bottom:1.5rem;position:sticky;top:100px">
                <div style="margin-bottom:1rem">
                  <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">Ready to Apply?</div>
                  <div style="font-size:0.85rem;color:var(--text-3)">${opp.applicants?.length || 0} people have already applied</div>
                </div>
                ${!api.getToken() ? `
                  <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.75rem" onclick="router.navigate('/login')">Sign in to Apply</button>
                ` : isOrg ? `
                  <div style="padding:1rem;background:var(--bg-alt);border-radius:var(--radius-md);text-align:center;color:var(--text-3);font-size:0.88rem">Organizations cannot apply</div>
                ` : daysLeft < 0 ? `
                  <div style="padding:1rem;background:rgba(255,107,107,0.1);border-radius:var(--radius-md);text-align:center;color:var(--rose);font-size:0.88rem">Application deadline has passed</div>
                ` : `
                  <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.75rem" onclick="openApplyModal('${opp._id}','${opp.title}')">🚀 Apply Now</button>
                  <button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="handleSave(event,'${opp._id}',this)">☆ Save</button>
                `}
              </div>

              <!-- Org Card -->
              <div class="opp-detail-card">
                <div class="section-title-small">About the Company</div>
                <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
                  <div class="opp-org-logo">${(org.companyName||org.name||'O')[0]}</div>
                  <div>
                    <div style="font-weight:700">${org.companyName || org.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-3)">${org.industry || ''}</div>
                  </div>
                </div>
                ${org.bio ? `<p style="font-size:0.85rem;margin-bottom:1rem">${org.bio}</p>` : ''}
                <div style="display:flex;flex-direction:column;gap:0.5rem">
                  ${org.location ? `<div class="opp-meta-item">📍 ${org.location}</div>` : ''}
                  ${org.companySize ? `<div class="opp-meta-item">👥 ${org.companySize} employees</div>` : ''}
                  ${org.website ? `<a href="${org.website}" target="_blank" class="btn btn-outline btn-sm" style="margin-top:0.5rem">🌐 Visit Website</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    toast.error(err.message);
    router.navigate('/opportunities');
  }
}

/* ===== APPLY MODAL ===== */
function openApplyModal(oppId, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'applyModalOverlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div><h3>Apply for Position</h3><p style="font-size:0.85rem;color:var(--text-3);margin-top:0.25rem">${title}</p></div>
        <button class="modal-close" onclick="document.getElementById('applyModalOverlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Cover Letter <span class="form-required">*</span></label>
          <textarea class="form-textarea" id="coverLetter" placeholder="Tell the organization why you're a great fit for this role..." style="min-height:180px"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Resume URL</label>
          <input class="form-input" id="resumeUrl" placeholder="https://drive.google.com/your-resume">
          <div class="form-hint">Paste a link to your resume (Google Drive, Notion, etc.)</div>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="submitApplication('${oppId}')">🚀 Submit Application</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function submitApplication(oppId) {
  const coverLetter = document.getElementById('coverLetter').value.trim();
  if (!coverLetter) { toast.error('Please write a cover letter'); return; }
  try {
    await api.post(`/opportunities/${oppId}/apply`, {
      coverLetter,
      resumeUrl: document.getElementById('resumeUrl').value.trim()
    });
    document.getElementById('applyModalOverlay').remove();
    toast.success('Application submitted successfully! 🎉');
  } catch (err) { toast.error(err.message); }
}

/* ===== AUTH PAGES ===== */
function renderLogin() {
  document.title = 'Sign In – InternBridge';
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <div class="auth-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">🔐</div>
          <h2 class="auth-title">Welcome Back</h2>
          <p class="auth-subtitle">Sign in to your InternBridge account</p>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" id="loginEmail" type="email" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="loginPassword" type="password" placeholder="Enter your password">
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem" id="loginBtn" onclick="handleLogin()">Sign In</button>
        <div class="auth-divider">or</div>
        <p style="text-align:center;font-size:0.9rem;color:var(--text-3)">Don't have an account? <span class="auth-link" onclick="router.navigate('/register')">Create one free</span></p>
      </div>
    </div>
  `;
  document.getElementById('loginPassword').addEventListener('keypress', e => { if(e.key==='Enter') handleLogin(); });
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { toast.error('Please fill in all fields'); return; }
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Signing in...';
  try {
    const data = await api.post('/auth/login', { email, password });
    api.setAuth(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    renderNavbar();
    router.navigate('/dashboard');
  } catch (err) {
    toast.error(err.message);
    btn.disabled = false; btn.innerHTML = 'Sign In';
  }
}

function renderRegister() {
  document.title = 'Create Account – InternBridge';
  let selectedRole = 'student';
  document.getElementById('app').innerHTML = `
    <div class="auth-container" style="min-height:100vh;padding:2rem 1.5rem">
      <div class="auth-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
      </div>
      <div class="auth-card" style="max-width:560px">
        <div class="auth-header">
          <div class="auth-icon">✨</div>
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Join InternBridge – it's completely free</p>
        </div>
        <div class="role-selector" id="roleSelector">
          <div class="role-card active" id="roleStudent" onclick="selectRole('student')">
            <div class="role-card-icon">🎓</div>
            <div class="role-card-title">I'm a Student</div>
            <div class="role-card-desc">Find internships & projects</div>
          </div>
          <div class="role-card" id="roleOrg" onclick="selectRole('organization')">
            <div class="role-card-icon">🏢</div>
            <div class="role-card-title">I'm an Organization</div>
            <div class="role-card-desc">Post opportunities & hire</div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Full Name <span class="form-required">*</span></label>
            <input class="form-input" id="regName" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="form-required">*</span></label>
            <input class="form-input" id="regEmail" type="email" placeholder="you@example.com">
          </div>
        </div>
        <div id="orgFields" style="display:none">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Company Name <span class="form-required">*</span></label>
              <input class="form-input" id="regCompany" placeholder="Acme Corp">
            </div>
            <div class="form-group">
              <label class="form-label">Industry</label>
              <select class="form-select" id="regIndustry">
                <option value="">Select Industry</option>
                <option>Technology</option><option>Healthcare</option><option>Finance</option>
                <option>Education</option><option>Marketing</option><option>Design</option>
                <option>Engineering</option><option>E-commerce</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>
        <div id="studentFields">
          <div class="form-group">
            <label class="form-label">Skills <span class="form-hint" style="display:inline">(comma-separated)</span></label>
            <input class="form-input" id="regSkills" placeholder="JavaScript, Python, Figma, React">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password <span class="form-required">*</span></label>
          <input class="form-input" id="regPassword" type="password" placeholder="Min. 6 characters">
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem" id="regBtn" onclick="handleRegister()">Create Account 🚀</button>
        <div class="auth-divider">or</div>
        <p style="text-align:center;font-size:0.9rem;color:var(--text-3)">Already have an account? <span class="auth-link" onclick="router.navigate('/login')">Sign in</span></p>
      </div>
    </div>
  `;

  window.selectRole = (role) => {
    selectedRole = role;
    document.getElementById('roleStudent').classList.toggle('active', role === 'student');
    document.getElementById('roleOrg').classList.toggle('active', role === 'organization');
    document.getElementById('orgFields').style.display = role === 'organization' ? 'block' : 'none';
    document.getElementById('studentFields').style.display = role === 'student' ? 'block' : 'none';
  };

  window.handleRegister = async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!name || !email || !password) { toast.error('Please fill all required fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const payload = { name, email, password, role: selectedRole };
    if (selectedRole === 'organization') {
      payload.companyName = document.getElementById('regCompany').value.trim();
      payload.industry = document.getElementById('regIndustry').value;
      if (!payload.companyName) { toast.error('Company name is required'); return; }
    } else {
      payload.skills = document.getElementById('regSkills').value;
    }
    const btn = document.getElementById('regBtn');
    btn.disabled = true; btn.textContent = 'Creating account...';
    try {
      const data = await api.post('/auth/register', payload);
      api.setAuth(data.token, data.user);
      toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
      renderNavbar();
      router.navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.innerHTML = 'Create Account 🚀';
    }
  };
}

/* ===== DASHBOARD ===== */
async function renderDashboard() {
  const user = api.getUser();
  if (!user) { router.navigate('/login'); return; }
  document.title = 'Dashboard – InternBridge';
  if (user.role === 'student') await renderStudentDashboard();
  else await renderOrgDashboard();
}

async function renderStudentDashboard() {
  const user = api.getUser();
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:76px">
      <div class="dashboard-layout">
        ${renderSidebar('student')}
        <main class="main-content">
          <div class="page-title">Welcome back, ${user.name.split(' ')[0]}! 👋</div>
          <div class="page-subtitle">Your internship journey dashboard</div>
          <div class="stats-grid" id="studentStats">
            <div class="stat-card stat-card-1"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">📤</div><div class="stat-value" id="appCount">-</div><div class="stat-label">Applications Sent</div></div>
            <div class="stat-card stat-card-2"><div class="stat-icon" style="background:rgba(0,217,163,0.15)">✅</div><div class="stat-value" id="shortlistCount">-</div><div class="stat-label">Shortlisted</div></div>
            <div class="stat-card stat-card-3"><div class="stat-icon" style="background:rgba(255,107,107,0.15)">💾</div><div class="stat-value" id="savedCount">-</div><div class="stat-label">Saved</div></div>
            <div class="stat-card stat-card-4"><div class="stat-icon" style="background:rgba(255,179,71,0.15)">🎯</div><div class="stat-value" id="matchCount">-</div><div class="stat-label">Matches</div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
            <!-- Profile Completion -->
            <div class="opp-detail-card">
              <div class="section-title-small">Profile Strength</div>
              <div id="profileStrength"></div>
            </div>
            <!-- Quick Actions -->
            <div class="opp-detail-card">
              <div class="section-title-small">Quick Actions</div>
              <div style="display:flex;flex-direction:column;gap:0.75rem">
                <button class="btn btn-primary" onclick="router.navigate('/opportunities')">🔍 Browse Opportunities</button>
                <button class="btn btn-secondary" onclick="router.navigate('/opportunities?matched=true')">🎯 View My Matches</button>
                <button class="btn btn-secondary" onclick="router.navigate('/profile')">✏️ Update Profile</button>
              </div>
            </div>
          </div>
          <!-- Recent Applications -->
          <div class="opp-detail-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
              <div class="section-title-small" style="margin:0">Recent Applications</div>
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('/applications')">View All</button>
            </div>
            <div id="recentApplications"><div class="loading-spinner"><div class="spinner"></div></div></div>
          </div>
        </main>
      </div>
    </div>
  `;
  await loadStudentDashboardData();
}

async function loadStudentDashboardData() {
  const user = api.getUser();
  try {
    const [appsData, matchData, meData] = await Promise.all([
      api.get('/opportunities/my-applications'),
      api.get('/opportunities/matched'),
      api.get('/auth/me')
    ]);
    const apps = appsData.applications || [];
    const shortlisted = apps.filter(a => ['shortlisted','selected'].includes(a.status)).length;
    document.getElementById('appCount').textContent = apps.length;
    document.getElementById('shortlistCount').textContent = shortlisted;
    document.getElementById('savedCount').textContent = meData.user?.savedOpportunities?.length || 0;
    document.getElementById('matchCount').textContent = (matchData.opportunities || []).length;

    // Profile strength
    const fields = ['name','email','bio','skills','portfolio','resume'];
    const filled = fields.filter(f => {
      if (f === 'skills') return meData.user?.skills?.length > 0;
      return !!meData.user?.[f];
    }).length;
    const pct = Math.round((filled / fields.length) * 100);
    document.getElementById('profileStrength').innerHTML = `
      <div style="margin-bottom:0.75rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem">
          <span style="font-size:0.85rem;font-weight:600">${pct}% Complete</span>
          <span style="font-size:0.8rem;color:var(--text-3)">${filled}/${fields.length} fields</span>
        </div>
        <div style="height:8px;background:var(--bg-alt);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--gradient-primary);border-radius:4px;transition:width 1s ease"></div>
        </div>
      </div>
      ${pct < 100 ? `<button class="btn btn-outline btn-sm" onclick="router.navigate('/profile')">Complete Profile →</button>` : '<span style="color:var(--green);font-size:0.85rem;font-weight:600">✅ Profile complete!</span>'}
    `;

    // Recent applications
    if (!apps.length) {
      document.getElementById('recentApplications').innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No applications yet</div><div class="empty-desc">Start applying to opportunities!</div><button class="btn btn-primary btn-sm" onclick="router.navigate('/opportunities')">Browse Now</button></div>`;
    } else {
      document.getElementById('recentApplications').innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Opportunity</th><th>Company</th><th>Type</th><th>Status</th><th>Applied</th></tr></thead>
            <tbody>${apps.slice(0,5).map(a => `
              <tr onclick="router.navigate('/opportunities/${a.opportunity._id}')" style="cursor:pointer">
                <td style="font-weight:600">${a.opportunity.title}</td>
                <td>${a.opportunity.organization?.companyName || a.opportunity.organization?.name || '-'}</td>
                <td><span class="hero-card-tag tag-${a.opportunity.type}">${capitalize(a.opportunity.type)}</span></td>
                <td><span class="status-badge status-${a.status}">${capitalize(a.status)}</span></td>
                <td style="color:var(--text-3)">${new Date(a.appliedAt).toLocaleDateString()}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
  } catch (err) { toast.error('Failed to load dashboard data'); }
}

async function renderOrgDashboard() {
  const user = api.getUser();
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:76px">
      <div class="dashboard-layout">
        ${renderSidebar('organization')}
        <main class="main-content">
          <div class="page-title">Organization Dashboard 🏢</div>
          <div class="page-subtitle">${user.companyName || user.name}</div>
          <div class="stats-grid" id="orgStats">
            <div class="stat-card stat-card-1"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">📋</div><div class="stat-value" id="postsCount">-</div><div class="stat-label">Active Posts</div></div>
            <div class="stat-card stat-card-2"><div class="stat-icon" style="background:rgba(0,217,163,0.15)">📤</div><div class="stat-value" id="totalApps">-</div><div class="stat-label">Total Applications</div></div>
            <div class="stat-card stat-card-3"><div class="stat-icon" style="background:rgba(255,107,107,0.15)">👁️</div><div class="stat-value" id="totalViews">-</div><div class="stat-label">Total Views</div></div>
            <div class="stat-card stat-card-4"><div class="stat-icon" style="background:rgba(255,179,71,0.15)">✅</div><div class="stat-value" id="selectedCount">-</div><div class="stat-label">Selected</div></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
            <h3>Posted Opportunities</h3>
            <button class="btn btn-primary btn-sm" onclick="router.navigate('/post-opportunity')">+ Post New</button>
          </div>
          <div id="orgPosts"><div class="loading-spinner"><div class="spinner"></div></div></div>
        </main>
      </div>
    </div>
  `;
  try {
    const data = await api.get('/opportunities/my-posts');
    const opps = data.opportunities || [];
    document.getElementById('postsCount').textContent = opps.filter(o=>o.status==='active').length;
    document.getElementById('totalApps').textContent = opps.reduce((s,o) => s + (o.applicants?.length||0), 0);
    document.getElementById('totalViews').textContent = opps.reduce((s,o) => s + (o.views||0), 0);
    document.getElementById('selectedCount').textContent = opps.reduce((s,o) => s + (o.applicants?.filter(a=>a.status==='selected')?.length||0), 0);

    if (!opps.length) {
      document.getElementById('orgPosts').innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">No opportunities posted yet</div><div class="empty-desc">Post your first internship or project!</div><button class="btn btn-primary" onclick="router.navigate('/post-opportunity')">Post Now</button></div>`;
    } else {
      document.getElementById('orgPosts').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${opps.map(opp => `
            <div class="opp-detail-card" style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem">
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
                  <span class="hero-card-tag tag-${opp.type}">${capitalize(opp.type)}</span>
                  <span class="status-badge status-${opp.status}">${capitalize(opp.status)}</span>
                  <h4 style="font-weight:700">${opp.title}</h4>
                </div>
                <div style="display:flex;gap:1.5rem;font-size:0.82rem;color:var(--text-3)">
                  <span>📤 ${opp.applicants?.length || 0} applicants</span>
                  <span>👁️ ${opp.views || 0} views</span>
                  <span>📅 Deadline: ${new Date(opp.applicationDeadline).toLocaleDateString()}</span>
                  <span>💰 ${opp.stipend?.isPaid ? `₹${opp.stipend.amount}/mo` : 'Unpaid'}</span>
                </div>
              </div>
              <div style="display:flex;gap:0.5rem;flex-shrink:0">
                <button class="btn btn-secondary btn-sm" onclick="router.navigate('/opportunities/${opp._id}/applicants')">View Applicants</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOpportunity('${opp._id}')">Delete</button>
              </div>
            </div>`).join('')}
        </div>`;
    }
  } catch (err) { toast.error(err.message); }
}

function renderSidebar(role) {
  const studentLinks = `
    <li><a href="#" data-link="/dashboard" class="active"><span class="nav-icon">🏠</span>Overview</a></li>
    <li><a href="#" data-link="/opportunities"><span class="nav-icon">🔍</span>Browse</a></li>
    <li><a href="#" data-link="/applications"><span class="nav-icon">📤</span>Applications</a></li>
    <li><a href="#" data-link="/saved"><span class="nav-icon">💾</span>Saved</a></li>
    <li><a href="#" data-link="/profile"><span class="nav-icon">👤</span>Profile</a></li>
  `;
  const orgLinks = `
    <li><a href="#" data-link="/dashboard" class="active"><span class="nav-icon">🏠</span>Overview</a></li>
    <li><a href="#" data-link="/post-opportunity"><span class="nav-icon">➕</span>Post Opportunity</a></li>
    <li><a href="#" data-link="/my-posts"><span class="nav-icon">📋</span>My Posts</a></li>
    <li><a href="#" data-link="/profile"><span class="nav-icon">🏢</span>Company Profile</a></li>
  `;
  return `
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Main</div>
        <ul class="sidebar-nav">${role === 'student' ? studentLinks : orgLinks}</ul>
      </div>
      <div class="sidebar-section" style="margin-top:auto">
        <ul class="sidebar-nav">
          <li><a href="#" onclick="logout()"><span class="nav-icon">🚪</span>Sign Out</a></li>
        </ul>
      </div>
    </aside>
  `;
}

/* ===== POST OPPORTUNITY ===== */
function renderPostOpportunity() {
  const user = api.getUser();
  if (!user || user.role !== 'organization') { router.navigate('/login'); return; }
  document.title = 'Post Opportunity – InternBridge';
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:80px;padding-bottom:4rem">
      <div class="container" style="max-width:800px">
        <button class="btn btn-secondary btn-sm" onclick="history.back()" style="margin-bottom:1.5rem">← Back</button>
        <div style="margin-bottom:2rem">
          <h1 class="page-title">Post an Opportunity</h1>
          <p class="page-subtitle">Reach talented students for your internship or project</p>
        </div>
        <div class="opp-detail-card">
          <div class="form-group">
            <label class="form-label">Title <span class="form-required">*</span></label>
            <input class="form-input" id="postTitle" placeholder="e.g. Frontend Developer Intern">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Type <span class="form-required">*</span></label>
              <select class="form-select" id="postType">
                <option value="">Select Type</option>
                <option value="internship">Internship</option>
                <option value="project">Project</option>
                <option value="part-time">Part-time</option>
                <option value="freelance">Freelance</option>
                <option value="research">Research</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Domain <span class="form-required">*</span></label>
              <select class="form-select" id="postDomain">
                <option value="">Select Domain</option>
                <option>Technology</option><option>Design</option><option>Marketing</option>
                <option>Finance</option><option>Data Science</option><option>Research</option>
                <option>Healthcare</option><option>Education</option><option>Business</option>
                <option>Content</option><option>Engineering</option><option>Legal</option>
                <option>Human Resources</option><option>Operations</option><option>Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description <span class="form-required">*</span></label>
            <textarea class="form-textarea" id="postDesc" placeholder="Describe the opportunity, what students will work on, team culture..." style="min-height:160px"></textarea>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Required Skills <span class="form-required">*</span></label>
              <input class="form-input" id="postSkills" placeholder="React.js, Python, Figma (comma-separated)">
            </div>
            <div class="form-group">
              <label class="form-label">Location <span class="form-required">*</span></label>
              <input class="form-input" id="postLocation" placeholder="Mumbai, India or Remote">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Work Mode <span class="form-required">*</span></label>
              <select class="form-select" id="postMode">
                <option value="">Select Mode</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Number of Openings</label>
              <input class="form-input" id="postOpenings" type="number" min="1" value="1">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Duration <span class="form-required">*</span></label>
              <div style="display:flex;gap:0.5rem">
                <input class="form-input" id="postDurVal" type="number" min="1" placeholder="3" style="width:80px">
                <select class="form-select" id="postDurUnit">
                  <option value="months">Months</option>
                  <option value="weeks">Weeks</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Application Deadline <span class="form-required">*</span></label>
              <input class="form-input" id="postDeadline" type="date" min="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Paid Internship?</label>
              <select class="form-select" id="postPaid" onchange="toggleStipend()">
                <option value="false">No – Unpaid</option>
                <option value="true">Yes – Paid</option>
              </select>
            </div>
            <div class="form-group" id="stipendGroup" style="display:none">
              <label class="form-label">Monthly Stipend (₹)</label>
              <input class="form-input" id="postStipend" type="number" placeholder="15000">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Requirements</label>
            <textarea class="form-textarea" id="postReq" placeholder="Degree requirements, experience level, language..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Responsibilities</label>
            <textarea class="form-textarea" id="postResp" placeholder="Key tasks and deliverables for the role..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Perks & Benefits</label>
            <input class="form-input" id="postPerks" placeholder="Certificate, Letter of Recommendation, PPO, Flexible hours (comma-separated)">
          </div>
          <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center" id="postBtn" onclick="handlePostOpportunity()">🚀 Post Opportunity</button>
        </div>
      </div>
    </div>
  `;
  window.toggleStipend = () => {
    document.getElementById('stipendGroup').style.display = document.getElementById('postPaid').value === 'true' ? 'block' : 'none';
  };
}

async function handlePostOpportunity() {
  const title = document.getElementById('postTitle').value.trim();
  const type = document.getElementById('postType').value;
  const domain = document.getElementById('postDomain').value;
  const description = document.getElementById('postDesc').value.trim();
  const skills = document.getElementById('postSkills').value.trim();
  const location = document.getElementById('postLocation').value.trim();
  const mode = document.getElementById('postMode').value;
  const deadline = document.getElementById('postDeadline').value;
  const durVal = document.getElementById('postDurVal').value;
  if (!title||!type||!domain||!description||!skills||!location||!mode||!deadline||!durVal) {
    toast.error('Please fill all required fields'); return;
  }
  const isPaid = document.getElementById('postPaid').value === 'true';
  const btn = document.getElementById('postBtn');
  btn.disabled = true; btn.textContent = 'Posting...';
  try {
    await api.post('/opportunities', {
      title, type, domain, description, skills,
      location, mode,
      openings: parseInt(document.getElementById('postOpenings').value) || 1,
      duration: { value: parseInt(durVal), unit: document.getElementById('postDurUnit').value },
      applicationDeadline: deadline,
      stipend: { isPaid, amount: isPaid ? parseInt(document.getElementById('postStipend').value)||0 : 0 },
      requirements: document.getElementById('postReq').value,
      responsibilities: document.getElementById('postResp').value,
      perks: document.getElementById('postPerks').value,
    });
    toast.success('Opportunity posted successfully! 🎉');
    router.navigate('/dashboard');
  } catch (err) {
    toast.error(err.message);
    btn.disabled = false; btn.innerHTML = '🚀 Post Opportunity';
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;
  try {
    await api.delete(`/opportunities/${id}`);
    toast.success('Opportunity deleted');
    renderDashboard();
  } catch (err) { toast.error(err.message); }
}

/* ===== APPLICATIONS PAGE ===== */
async function renderApplications() {
  if (!api.getToken()) { router.navigate('/login'); return; }
  document.title = 'My Applications – InternBridge';
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:80px;padding-bottom:4rem">
      <div class="container">
        <h1 class="page-title" style="margin-bottom:0.25rem">My Applications</h1>
        <p class="page-subtitle" style="margin-bottom:2rem">Track all your submitted applications</p>
        <div id="appsContainer"><div class="loading-spinner"><div class="spinner"></div></div></div>
      </div>
    </div>
  `;
  try {
    const data = await api.get('/opportunities/my-applications');
    const apps = data.applications || [];
    if (!apps.length) {
      document.getElementById('appsContainer').innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No applications yet</div><div class="empty-desc">Start exploring and applying to opportunities!</div><button class="btn btn-primary" onclick="router.navigate('/opportunities')">Browse Opportunities</button></div>`;
      return;
    }
    document.getElementById('appsContainer').innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Opportunity</th><th>Company</th><th>Type</th><th>Mode</th><th>Stipend</th><th>Status</th><th>Applied On</th></tr></thead>
          <tbody>${apps.map(a=>`
            <tr onclick="router.navigate('/opportunities/${a.opportunity._id}')" style="cursor:pointer">
              <td style="font-weight:600">${a.opportunity.title}</td>
              <td>${a.opportunity.organization?.companyName || a.opportunity.organization?.name || '-'}</td>
              <td><span class="hero-card-tag tag-${a.opportunity.type}">${capitalize(a.opportunity.type)}</span></td>
              <td>${capitalize(a.opportunity.mode)}</td>
              <td>${a.opportunity.stipend?.isPaid ? `₹${a.opportunity.stipend.amount}/mo` : 'Unpaid'}</td>
              <td><span class="status-badge status-${a.status}">${capitalize(a.status)}</span></td>
              <td style="color:var(--text-3)">${new Date(a.appliedAt).toLocaleDateString()}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { toast.error(err.message); }
}

/* ===== PROFILE PAGE ===== */
async function renderProfile() {
  if (!api.getToken()) { router.navigate('/login'); return; }
  const user = api.getUser();
  document.title = 'Profile – InternBridge';
  try {
    const data = await api.get('/auth/me');
    const u = data.user;
    document.getElementById('app').innerHTML = `
      <div class="page" style="padding-top:80px;padding-bottom:4rem">
        <div class="container" style="max-width:700px">
          <h1 class="page-title" style="margin-bottom:2rem">My Profile</h1>
          <div class="profile-card">
            <div class="profile-cover"></div>
            <div class="profile-info">
              <div class="profile-avatar">${(u.name||'U')[0]}</div>
              <div class="profile-name">${u.name}</div>
              <div class="profile-org">${u.email} • ${capitalize(u.role)}</div>
              ${u.skills?.length ? `<div class="skills-list">${u.skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>` : ''}
            </div>
          </div>
          <div class="opp-detail-card">
            <div class="section-title-small">Edit Profile</div>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="profName" value="${u.name||''}">
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-textarea" id="profBio" placeholder="Tell organizations about yourself...">${u.bio||''}</textarea>
            </div>
            ${u.role === 'student' ? `
              <div class="form-group">
                <label class="form-label">Skills (comma-separated)</label>
                <input class="form-input" id="profSkills" value="${(u.skills||[]).join(', ')}">
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Portfolio URL</label>
                  <input class="form-input" id="profPortfolio" value="${u.portfolio||''}" placeholder="https://yourportfolio.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Resume URL</label>
                  <input class="form-input" id="profResume" value="${u.resume||''}" placeholder="https://drive.google.com/...">
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Degree</label>
                  <input class="form-input" id="profDegree" value="${u.education?.degree||''}" placeholder="B.Tech / BCA / MBA...">
                </div>
                <div class="form-group">
                  <label class="form-label">Institution</label>
                  <input class="form-input" id="profInstitution" value="${u.education?.institution||''}" placeholder="University name">
                </div>
              </div>
            ` : `
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Company Name</label>
                  <input class="form-input" id="profCompany" value="${u.companyName||''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Website</label>
                  <input class="form-input" id="profWebsite" value="${u.website||''}" placeholder="https://company.com">
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input class="form-input" id="profLocation" value="${u.location||''}" placeholder="Mumbai, India">
                </div>
                <div class="form-group">
                  <label class="form-label">Company Size</label>
                  <select class="form-select" id="profSize">
                    <option value="">Select</option>
                    ${['1-10','11-50','51-200','201-500','500+'].map(s=>`<option ${u.companySize===s?'selected':''}>${s}</option>`).join('')}
                  </select>
                </div>
              </div>
            `}
            <button class="btn btn-primary" id="saveProfileBtn" onclick="saveProfile('${u.role}')">💾 Save Changes</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) { toast.error(err.message); }
}

async function saveProfile(role) {
  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  const updates = {
    name: document.getElementById('profName').value.trim(),
    bio: document.getElementById('profBio').value.trim(),
  };
  if (role === 'student') {
    updates.skills = document.getElementById('profSkills').value;
    updates.portfolio = document.getElementById('profPortfolio').value.trim();
    updates.resume = document.getElementById('profResume').value.trim();
    updates.education = {
      degree: document.getElementById('profDegree').value.trim(),
      institution: document.getElementById('profInstitution').value.trim(),
    };
  } else {
    updates.companyName = document.getElementById('profCompany').value.trim();
    updates.website = document.getElementById('profWebsite').value.trim();
    updates.location = document.getElementById('profLocation').value.trim();
    updates.companySize = document.getElementById('profSize').value;
  }
  try {
    const data = await api.put('/auth/profile', updates);
    const current = api.getUser();
    api.setAuth(api.getToken(), { ...current, ...data.user });
    renderNavbar();
    toast.success('Profile updated! ✅');
    btn.disabled = false; btn.textContent = '💾 Save Changes';
  } catch (err) {
    toast.error(err.message);
    btn.disabled = false; btn.textContent = '💾 Save Changes';
  }
}

/* ===== APPLICANTS VIEW (ORG) ===== */
async function renderApplicants(params) {
  if (!api.getToken() || api.getUser()?.role !== 'organization') { router.navigate('/login'); return; }
  document.title = 'Applicants – InternBridge';
  document.getElementById('app').innerHTML = `<div class="loading-spinner" style="height:80vh"><div class="spinner"></div></div>`;
  try {
    const [oppData, appsData] = await Promise.all([
      api.get(`/opportunities/${params.id}`),
      api.get(`/opportunities/${params.id}/applicants`)
    ]);
    const opp = oppData.opportunity;
    const applicants = appsData.applicants || [];
    document.getElementById('app').innerHTML = `
      <div class="page" style="padding-top:80px;padding-bottom:4rem">
        <div class="container">
          <button class="btn btn-secondary btn-sm" onclick="history.back()" style="margin-bottom:1.5rem">← Back</button>
          <div style="margin-bottom:2rem">
            <h1 class="page-title">${opp.title}</h1>
            <p class="page-subtitle">${applicants.length} total applicant${applicants.length!==1?'s':''}</p>
          </div>
          ${!applicants.length ? `<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">No applicants yet</div><div class="empty-desc">Share your opportunity to attract more candidates</div></div>` : `
          <div style="display:flex;flex-direction:column;gap:1rem" id="applicantsList">
            ${applicants.map(app => renderApplicantCard(app, params.id)).join('')}
          </div>`}
        </div>
      </div>
    `;
  } catch (err) { toast.error(err.message); router.navigate('/dashboard'); }
}

function renderApplicantCard(app, oppId) {
  const student = app.student || {};
  return `
    <div class="opp-detail-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
        <div style="display:flex;align-items:center;gap:1rem;flex:1">
          <div class="profile-avatar" style="width:48px;height:48px;font-size:1.1rem;position:static">${(student.name||'?')[0]}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:1rem">${student.name || 'Anonymous'}</div>
            <div style="font-size:0.82rem;color:var(--text-3)">${student.email || ''}</div>
            ${student.skills?.length ? `<div class="skills-list" style="margin-top:0.5rem">${student.skills.slice(0,5).map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem">
          <span class="status-badge status-${app.status}">${capitalize(app.status)}</span>
          <div style="font-size:0.78rem;color:var(--text-3)">${new Date(app.appliedAt).toLocaleDateString()}</div>
        </div>
      </div>
      ${app.coverLetter ? `<div style="margin-top:1rem;padding:0.875rem;background:var(--bg-alt);border-radius:var(--radius-md);font-size:0.85rem;color:var(--text-secondary)">"${app.coverLetter.slice(0,300)}${app.coverLetter.length>300?'...':''}"</div>` : ''}
      <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">
        ${['reviewing','shortlisted','selected','rejected'].map(s=>`<button class="btn btn-sm ${app.status===s?'btn-primary':'btn-secondary'}" onclick="updateStatus('${oppId}','${student._id}','${s}',this)">${capitalize(s)}</button>`).join('')}
        ${student.portfolio ? `<a href="${student.portfolio}" target="_blank" class="btn btn-outline btn-sm">🔗 Portfolio</a>` : ''}
        ${app.resumeUrl ? `<a href="${app.resumeUrl}" target="_blank" class="btn btn-outline btn-sm">📄 Resume</a>` : ''}
      </div>
    </div>
  `;
}

async function updateStatus(oppId, studentId, status, btn) {
  try {
    await api.put(`/opportunities/${oppId}/applicants/${studentId}`, { status });
    toast.success(`Status updated to ${status}`);
    renderApplicants({ id: oppId });
  } catch (err) { toast.error(err.message); }
}

/* ===== SAVED OPPORTUNITIES ===== */
async function renderSaved() {
  if (!api.getToken()) { router.navigate('/login'); return; }
  document.title = 'Saved Opportunities – InternBridge';
  document.getElementById('app').innerHTML = `
    <div class="page" style="padding-top:80px;padding-bottom:4rem">
      <div class="container">
        <h1 class="page-title" style="margin-bottom:0.25rem">Saved Opportunities</h1>
        <p class="page-subtitle" style="margin-bottom:2rem">Your bookmarked internships and projects</p>
        <div id="savedContainer"><div class="loading-spinner"><div class="spinner"></div></div></div>
      </div>
    </div>
  `;
  try {
    const data = await api.get('/auth/me');
    const saved = data.user?.savedOpportunities || [];
    if (!saved.length) {
      document.getElementById('savedContainer').innerHTML = `<div class="empty-state"><div class="empty-icon">💾</div><div class="empty-title">No saved opportunities</div><div class="empty-desc">Browse and save opportunities you like!</div><button class="btn btn-primary" onclick="router.navigate('/opportunities')">Browse Now</button></div>`;
      return;
    }
    // Fetch full details
    const details = await Promise.all(saved.map(id => api.get(`/opportunities/${id._id || id}`).catch(() => null)));
    const valid = details.filter(Boolean).map(d => d.opportunity).filter(Boolean);
    document.getElementById('savedContainer').innerHTML = `<div class="opportunities-grid">${valid.map(opp => renderOpportunityCard(opp)).join('')}</div>`;
  } catch (err) { toast.error(err.message); }
}

/* ===== UTILITY ===== */
function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

/* ===== FOOTER ===== */
function renderFooter() {
  document.getElementById('footer').innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="nav-logo"><div class="nav-logo-icon">🚀</div><span>InternBridge</span></div>
            <p>Connecting ambitious students with innovative organizations for meaningful internships and projects.</p>
          </div>
          <div>
            <div class="footer-title">Platform</div>
            <ul class="footer-links">
              <li><a href="#" data-link="/opportunities">Browse Opportunities</a></li>
              <li><a href="#" data-link="/register">Sign Up Free</a></li>
              <li><a href="#" data-link="/login">Sign In</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-title">For Students</div>
            <ul class="footer-links">
              <li><a href="#" data-link="/opportunities?type=internship">Internships</a></li>
              <li><a href="#" data-link="/opportunities?type=project">Projects</a></li>
              <li><a href="#" data-link="/opportunities?type=research">Research</a></li>
              <li><a href="#" data-link="/opportunities?mode=remote">Remote</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-title">For Organizations</div>
            <ul class="footer-links">
              <li><a href="#" data-link="/post-opportunity">Post Opportunity</a></li>
              <li><a href="#" data-link="/register">Create Account</a></li>
              <li><a href="#" data-link="/dashboard">Dashboard</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-copy">© 2024 InternBridge. All rights reserved.</div>
          <div class="footer-copy">Built with ❤️ for students & organizations</div>
        </div>
      </div>
    </footer>
  `;
}

/* ===== INITIALIZE APP ===== */
document.addEventListener('DOMContentLoaded', () => {
  toast.init();

  // Register routes
  router.register('/', renderHome);
  router.register('/opportunities', renderOpportunities);
  router.register('/opportunities/:id', renderOpportunityDetail);
  router.register('/opportunities/:id/applicants', renderApplicants);
  router.register('/login', renderLogin);
  router.register('/register', renderRegister);
  router.register('/dashboard', renderDashboard);
  router.register('/post-opportunity', renderPostOpportunity);
  router.register('/applications', renderApplications);
  router.register('/saved', renderSaved);
  router.register('/profile', renderProfile);
  router.register('/my-posts', renderDashboard);

  router.init();
  renderNavbar();
  renderFooter();
  router.navigate(window.location.pathname + window.location.search, false);
});

