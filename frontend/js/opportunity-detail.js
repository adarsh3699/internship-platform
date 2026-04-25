document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const oppId = urlParams.get('id');
  if (!oppId) {
    window.location.href = '/opportunities.html';
    return;
  }

  try {
    const data = await api.get(`/opportunities/${oppId}`);
    const opp = data.opportunity;
    const org = opp.organization || {};
    
    document.title = `${opp.title} – InternBridge`;
    const user = api.getUser();
    const isOrg = user?.role === 'organization';
    const deadline = new Date(opp.applicationDeadline);
    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    
    document.getElementById('loading').style.display = 'none';
    const content = document.getElementById('detailContent');
    content.style.display = 'block';
    
    content.innerHTML = `
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
                  <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.75rem" onclick="window.location.href='/login.html'">Sign in to Apply</button>
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
    window.location.href = '/opportunities.html';
  }
});

/* ===== APPLY MODAL ===== */
window.openApplyModal = function(oppId, title) {
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

window.submitApplication = async function(oppId) {
  const coverLetter = document.getElementById('coverLetter').value.trim();
  if (!coverLetter) { toast.error('Please write a cover letter'); return; }
  try {
    await api.post(`/opportunities/${oppId}/apply`, {
      coverLetter,
      resumeUrl: document.getElementById('resumeUrl').value.trim()
    });
    document.getElementById('applyModalOverlay').remove();
    toast.success('Application submitted successfully!');
  } catch (err) { toast.error(err.message); }
}
