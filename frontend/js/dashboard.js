document.addEventListener("DOMContentLoaded", async () => {
    const user = api.getUser();
    if (!user) {
        window.location.href = "/login.html";
        return;
    }

    document.getElementById("sidebar-container").innerHTML = renderSidebar(
        user.role,
    );

    if (user.role === "student") {
        document.getElementById("student-dashboard").style.display = "block";
        document.getElementById("studentGreeting").textContent =
            `Welcome back, ${user.name.split(" ")[0]}! 👋`;
        await loadStudentDashboardData();
    } else {
        document.getElementById("org-dashboard").style.display = "block";
        document.getElementById("orgGreeting").textContent =
            user.companyName || user.name;
        await loadOrgDashboardData();
    }
});

async function loadStudentDashboardData() {
    try {
        const [appsData, matchData, meData] = await Promise.all([
            api.get("/opportunities/my-applications"),
            api.get("/opportunities/matched"),
            api.get("/auth/me"),
        ]);

        const apps = appsData.applications || [];
        const shortlisted = apps.filter((a) =>
            ["shortlisted", "selected"].includes(a.status),
        ).length;

        document.getElementById("appCount").textContent = apps.length;
        document.getElementById("shortlistCount").textContent = shortlisted;
        document.getElementById("savedCount").textContent =
            meData.user?.savedOpportunities?.length || 0;
        document.getElementById("matchCount").textContent = (
            matchData.opportunities || []
        ).length;

        // Profile strength
        const fields = [
            "name",
            "email",
            "bio",
            "skills",
            "portfolio",
            "resume",
        ];
        const filled = fields.filter((f) => {
            if (f === "skills") return meData.user?.skills?.length > 0;
            return !!meData.user?.[f];
        }).length;

        const pct = Math.round((filled / fields.length) * 100);
        document.getElementById("profileStrength").innerHTML = `
      <div style="margin-bottom:0.75rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem">
          <span style="font-size:0.85rem;font-weight:600">${pct}% Complete</span>
          <span style="font-size:0.8rem;color:var(--text-3)">${filled}/${fields.length} fields</span>
        </div>
        <div style="height:8px;background:var(--bg-alt);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--gradient-primary);border-radius:4px;transition:width 1s ease"></div>
        </div>
      </div>
      ${pct < 100 ? `<button class="btn btn-outline btn-sm" onclick="window.location.href='/profile.html'">Complete Profile →</button>` : '<span style="color:var(--green);font-size:0.85rem;font-weight:600">✅ Profile complete!</span>'}
    `;

        // Recent applications
        if (!apps.length) {
            document.getElementById("recentApplications").innerHTML =
                `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No applications yet</div><div class="empty-desc">Start applying to opportunities!</div><button class="btn btn-primary btn-sm" onclick="window.location.href='/opportunities.html'">Browse Now</button></div>`;
        } else {
            document.getElementById("recentApplications").innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Opportunity</th><th>Company</th><th>Type</th><th>Status</th><th>Applied</th></tr></thead>
            <tbody>${apps
                .slice(0, 5)
                .map(
                    (a) => `
              <tr onclick="window.location.href='/opportunity-detail.html?id=${a.opportunity._id}'" style="cursor:pointer">
                <td style="font-weight:600">${a.opportunity.title}</td>
                <td>${a.opportunity.organization?.companyName || a.opportunity.organization?.name || "-"}</td>
                <td><span class="hero-card-tag tag-${a.opportunity.type}">${capitalize(a.opportunity.type)}</span></td>
                <td><span class="status-badge status-${a.status}">${capitalize(a.status)}</span></td>
                <td style="color:var(--text-3)">${new Date(a.appliedAt).toLocaleDateString()}</td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
        }
    } catch (err) {
        toast.error("Failed to load dashboard data");
    }
}

async function loadOrgDashboardData() {
    try {
        const data = await api.get("/opportunities/my-posts");
        const opps = data.opportunities || [];

        document.getElementById("postsCount").textContent = opps.filter(
            (o) => o.status === "active",
        ).length;
        document.getElementById("totalApps").textContent = opps.reduce(
            (s, o) => s + (o.applicants?.length || 0),
            0,
        );
        document.getElementById("totalViews").textContent = opps.reduce(
            (s, o) => s + (o.views || 0),
            0,
        );
        document.getElementById("selectedCount").textContent = opps.reduce(
            (s, o) =>
                s +
                (o.applicants?.filter((a) => a.status === "selected")?.length ||
                    0),
            0,
        );

        if (!opps.length) {
            document.getElementById("orgPosts").innerHTML =
                `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">No opportunities posted yet</div><div class="empty-desc">Post your first internship or project!</div><button class="btn btn-primary" onclick="window.location.href='/post-opportunity.html'">Post Now</button></div>`;
        } else {
            document.getElementById("orgPosts").innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${opps
              .map(
                  (opp) => `
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
                  <span>💰 ${opp.stipend?.isPaid ? `₹${opp.stipend.amount}/mo` : "Unpaid"}</span>
                </div>
              </div>
              <div style="display:flex;gap:0.5rem;flex-shrink:0">
                <button class="btn btn-secondary btn-sm" onclick="window.location.href='/applicants.html?id=${opp._id}'">View Applicants</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOpportunity('${opp._id}')">Delete</button>
              </div>
            </div>`,
              )
              .join("")}
        </div>`;
        }
    } catch (err) {
        toast.error(err.message);
    }
}

window.deleteOpportunity = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    try {
        await api.delete(`/opportunities/${id}`);
        toast.success("Opportunity deleted");
        loadOrgDashboardData();
    } catch (err) {
        toast.error(err.message);
    }
};
