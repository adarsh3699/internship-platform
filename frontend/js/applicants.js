document.addEventListener("DOMContentLoaded", async () => {
    if (!api.getToken() || api.getUser()?.role !== "organization") {
        window.location.href = "/login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get("id");
    if (!oppId) {
        window.location.href = "/dashboard.html";
        return;
    }

    await loadApplicants(oppId);
});

async function loadApplicants(oppId) {
    try {
        const [oppData, appsData] = await Promise.all([
            api.get(`/opportunities/${oppId}`),
            api.get(`/opportunities/${oppId}/applicants`),
        ]);

        const opp = oppData.opportunity;
        const applicants = appsData.applicants || [];

        document.getElementById("loading").style.display = "none";
        const content = document.getElementById("applicantsContent");
        content.style.display = "block";

        content.innerHTML = `
      <div class="page" style="padding-top:80px;padding-bottom:4rem">
        <div class="container">
          <button class="btn btn-secondary btn-sm" onclick="history.back()" style="margin-bottom:1.5rem">← Back</button>
          <div style="margin-bottom:2rem">
            <h1 class="page-title">${opp.title}</h1>
            <p class="page-subtitle">${applicants.length} total applicant${applicants.length !== 1 ? "s" : ""}</p>
          </div>
          ${
              !applicants.length
                  ? `<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">No applicants yet</div><div class="empty-desc">Share your opportunity to attract more candidates</div></div>`
                  : `
          <div style="display:flex;flex-direction:column;gap:1rem" id="applicantsList">
            ${applicants.map((app) => renderApplicantCard(app, oppId)).join("")}
          </div>`
          }
        </div>
      </div>
    `;
    } catch (err) {
        toast.error(err.message);
        window.location.href = "/dashboard.html";
    }
}

function renderApplicantCard(app, oppId) {
    const student = app.student || {};
    return `
    <div class="opp-detail-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
        <div style="display:flex;align-items:center;gap:1rem;flex:1">
          <div class="profile-avatar" style="width:48px;height:48px;font-size:1.1rem;position:static">${(student.name || "?")[0]}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:1rem">${student.name || "Anonymous"}</div>
            <div style="font-size:0.82rem;color:var(--text-3)">${student.email || ""}</div>
            ${
                student.skills?.length
                    ? `<div class="skills-list" style="margin-top:0.5rem">${student.skills
                          .slice(0, 5)
                          .map((s) => `<span class="skill-tag">${s}</span>`)
                          .join("")}</div>`
                    : ""
            }
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem">
          <span class="status-badge status-${app.status}">${capitalize(app.status)}</span>
          <div style="font-size:0.78rem;color:var(--text-3)">${new Date(app.appliedAt).toLocaleDateString()}</div>
        </div>
      </div>
      ${app.coverLetter ? `<div style="margin-top:1rem;padding:0.875rem;background:var(--bg-alt);border-radius:var(--radius-md);font-size:0.85rem;color:var(--text-secondary)">"${app.coverLetter.slice(0, 300)}${app.coverLetter.length > 300 ? "..." : ""}"</div>` : ""}
      <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">
        ${["reviewing", "shortlisted", "selected", "rejected"].map((s) => `<button class="btn btn-sm ${app.status === s ? "btn-primary" : "btn-secondary"}" onclick="updateStatus('${oppId}','${student._id}','${s}',this)">${capitalize(s)}</button>`).join("")}
        ${student.portfolio ? `<a href="${student.portfolio}" target="_blank" class="btn btn-outline btn-sm">🔗 Portfolio</a>` : ""}
        ${app.resumeUrl ? `<a href="${app.resumeUrl}" target="_blank" class="btn btn-outline btn-sm">📄 Resume</a>` : ""}
      </div>
    </div>
  `;
}

window.updateStatus = async (oppId, studentId, status, btn) => {
    try {
        await api.put(`/opportunities/${oppId}/applicants/${studentId}`, {
            status,
        });
        toast.success(`Status updated to ${status}`);
        loadApplicants(oppId);
    } catch (err) {
        toast.error(err.message);
    }
};
