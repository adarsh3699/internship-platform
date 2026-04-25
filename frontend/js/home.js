document.addEventListener("DOMContentLoaded", async () => {
    // Load stats
    try {
        const data = await api.get("/stats");
        if (data.success) {
            document.getElementById("statStudents").textContent =
                data.stats.students + "+";
            document.getElementById("statOrgs").textContent =
                data.stats.organizations + "+";
            document.getElementById("statOpps").textContent =
                data.stats.opportunities + "+";
        }
    } catch {}

    // Load latest opportunities
    try {
        const data = await api.get("/opportunities?limit=6&sort=-createdAt");
        if (data.opportunities?.length > 0) {
            document.getElementById("latestOpportunities").innerHTML =
                data.opportunities
                    .map((opp) => renderOpportunityCard(opp))
                    .join("");
        } else {
            document.getElementById("latestOpportunities").innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">📭</div>
          <div class="empty-title">No opportunities yet</div>
          <div class="empty-desc">Be the first to post an opportunity!</div>
        </div>`;
        }
    } catch {
        document.getElementById("latestOpportunities").innerHTML =
            `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><div class="empty-title">Couldn't load opportunities</div></div>`;
    }
});
