document.addEventListener("DOMContentLoaded", async () => {
    if (!api.getToken()) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const data = await api.get("/opportunities/my-applications");
        const apps = data.applications || [];
        if (!apps.length) {
            document.getElementById("appsContainer").innerHTML =
                `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No applications yet</div><div class="empty-desc">Start exploring and applying to opportunities!</div><button class="btn btn-primary" onclick="window.location.href='/opportunities.html'">Browse Opportunities</button></div>`;
            return;
        }

        document.getElementById("appsContainer").innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Opportunity</th><th>Company</th><th>Type</th><th>Mode</th><th>Stipend</th><th>Status</th><th>Applied On</th></tr></thead>
          <tbody>${apps
              .map(
                  (a) => `
            <tr onclick="window.location.href='/opportunity-detail.html?id=${a.opportunity._id}'" style="cursor:pointer">
              <td style="font-weight:600">${a.opportunity.title}</td>
              <td>${a.opportunity.organization?.companyName || a.opportunity.organization?.name || "-"}</td>
              <td><span class="hero-card-tag tag-${a.opportunity.type}">${capitalize(a.opportunity.type)}</span></td>
              <td>${capitalize(a.opportunity.mode)}</td>
              <td>${a.opportunity.stipend?.isPaid ? `₹${a.opportunity.stipend.amount}/mo` : "Unpaid"}</td>
              <td><span class="status-badge status-${a.status}">${capitalize(a.status)}</span></td>
              <td style="color:var(--text-3)">${new Date(a.appliedAt).toLocaleDateString()}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    } catch (err) {
        toast.error(err.message);
    }
});
