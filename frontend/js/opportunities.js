let currentOppPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('search')) document.getElementById('searchInput').value = urlParams.get('search');
  if (urlParams.get('type')) document.getElementById('typeFilter').value = urlParams.get('type');
  if (urlParams.get('domain')) document.getElementById('domainFilter').value = urlParams.get('domain');
  if (urlParams.get('mode')) document.getElementById('modeFilter').value = urlParams.get('mode');

  if (api.getToken() && api.getUser()?.role === 'student') {
    document.getElementById('studentFilters').style.display = 'flex';
  }

  if (urlParams.get('matched') === 'true') {
    await loadMatchedOpps();
  } else {
    await loadAllOpps(1);
  }
});

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
    renderPagination(data.pages, data.currentPage, 'loadAllOpps');
  } catch (err) { toast.error(err.message); }
}

async function loadMatchedOpps() {
  document.getElementById('oppResults').innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;
  try {
    const data = await api.get('/opportunities/matched');
    if (!data.opportunities?.length) {
      document.getElementById('oppResults').innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">No matches found</div><div class="empty-desc">Add skills to your profile to get personalized matches!</div><button class="btn btn-primary" onclick="window.location.href='/profile.html'">Update Profile</button></div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    renderOppGrid(data.opportunities, true);
    document.getElementById('pagination').innerHTML = '';
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

window.renderPagination = function(totalPages, currentPage, handlerName) {
  const container = document.getElementById('pagination');
  if (!container || totalPages <= 1) { if(container) container.innerHTML=''; return; }
  let html = `<button class="page-btn" onclick="${handlerName}(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="${handlerName}(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span style="color:var(--text-3);padding:0 0.25rem">...</span>`;
    }
  }
  html += `<button class="page-btn" onclick="${handlerName}(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
  container.innerHTML = html;
}

window.applyFilters = function() { loadAllOpps(1); }
window.clearFilters = function() {
  ['searchInput','typeFilter','domainFilter','modeFilter'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  document.getElementById('sortFilter').value = '-createdAt';
  loadAllOpps(1);
}
