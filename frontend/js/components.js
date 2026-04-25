/* ===== COMPONENTS ===== */

function renderNavbar() {
  const user = api.getUser();
  const isLoggedIn = !!api.getToken();
  const nav = document.getElementById('navbar');
  if(!nav) return;

  nav.innerHTML = `
    <nav class="navbar" id="mainNavbar">
      <div class="container">
        <div class="nav-content">
          <a class="nav-logo" href="/" style="cursor:pointer; text-decoration:none;">
            <div class="nav-logo-icon">🚀</div>
            <span>InternBridge</span>
          </a>
          <ul class="nav-links" id="navLinks">
            <li><a href="/" class="nav-link">Home</a></li>
            <li><a href="/opportunities.html" class="nav-link">Browse</a></li>
            ${isLoggedIn ? `
              <li><a href="/dashboard.html" class="nav-link">Dashboard</a></li>
              ${user?.role === 'organization' ? `<li><a href="/post-opportunity.html" class="nav-link">Post Job</a></li>` : ''}
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
              <button class="btn btn-secondary btn-sm" onclick="window.location.href='/login.html'">Sign In</button>
              <button class="btn btn-primary btn-sm" onclick="window.location.href='/register.html'">Get Started</button>
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
    if (link.getAttribute('href') === window.location.pathname || link.getAttribute('href') === window.location.pathname.replace('.html', '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}

function logout() {
  api.clearAuth();
  toast.info('Signed out successfully');
  window.location.href = '/';
}

function renderFooter() {
  const footer = document.getElementById('footer');
  if(!footer) return;
  footer.innerHTML = `
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
              <li><a href="/opportunities.html">Browse Opportunities</a></li>
              <li><a href="/register.html">Sign Up Free</a></li>
              <li><a href="/login.html">Sign In</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-title">For Students</div>
            <ul class="footer-links">
              <li><a href="/opportunities.html?type=internship">Internships</a></li>
              <li><a href="/opportunities.html?type=project">Projects</a></li>
              <li><a href="/opportunities.html?type=research">Research</a></li>
              <li><a href="/opportunities.html?mode=remote">Remote</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-title">For Organizations</div>
            <ul class="footer-links">
              <li><a href="/post-opportunity.html">Post Opportunity</a></li>
              <li><a href="/register.html">Create Account</a></li>
              <li><a href="/dashboard.html">Dashboard</a></li>
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

function renderOpportunityCard(opp, matchScore = null) {
  const org = opp.organization || {};
  const orgName = org.companyName || org.name || 'Organization';
  const daysLeft = Math.ceil((new Date(opp.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  const deadlineText = daysLeft < 0 ? 'Deadline passed' : daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`;
  const deadlineColor = daysLeft <= 3 ? 'color:var(--rose)' : 'color:var(--text-3)';
  return `
    <div class="opportunity-card" onclick="window.location.href='/opportunity-detail.html?id=${opp._id}'">
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
  if (!api.getToken()) { toast.info('Sign in to save opportunities'); window.location.href='/login.html'; return; }
  try {
    const data = await api.post(`/opportunities/${oppId}/save`);
    btn.textContent = data.saved ? '★' : '☆';
    btn.classList.toggle('saved', data.saved);
    toast.success(data.message);
  } catch (err) { toast.error(err.message); }
}

function renderSidebar(role) {
  const studentLinks = `
    <li><a href="/dashboard.html" class="${location.pathname.includes('/dashboard') ? 'active':''}"><span class="nav-icon">🏠</span>Overview</a></li>
    <li><a href="/opportunities.html" class="${location.pathname.includes('/opportunities') ? 'active':''}"><span class="nav-icon">🔍</span>Browse</a></li>
    <li><a href="/applications.html" class="${location.pathname.includes('/applications') ? 'active':''}"><span class="nav-icon">📤</span>Applications</a></li>
    <li><a href="/saved.html" class="${location.pathname.includes('/saved') ? 'active':''}"><span class="nav-icon">💾</span>Saved</a></li>
    <li><a href="/profile.html" class="${location.pathname.includes('/profile') ? 'active':''}"><span class="nav-icon">👤</span>Profile</a></li>
  `;
  const orgLinks = `
    <li><a href="/dashboard.html" class="${location.pathname.includes('/dashboard') ? 'active':''}"><span class="nav-icon">🏠</span>Overview</a></li>
    <li><a href="/post-opportunity.html" class="${location.pathname.includes('/post-opportunity') ? 'active':''}"><span class="nav-icon">➕</span>Post Opportunity</a></li>
    <li><a href="/profile.html" class="${location.pathname.includes('/profile') ? 'active':''}"><span class="nav-icon">🏢</span>Company Profile</a></li>
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

window.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
});
