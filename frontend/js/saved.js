document.addEventListener("DOMContentLoaded", async () => {
    if (!api.getToken()) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const data = await api.get("/auth/me");
        const saved = data.user?.savedOpportunities || [];

        if (!saved.length) {
            document.getElementById("savedContainer").innerHTML =
                `<div class="empty-state"><div class="empty-icon">💾</div><div class="empty-title">No saved opportunities</div><div class="empty-desc">Browse and save opportunities you like!</div><button class="btn btn-primary" onclick="window.location.href='/opportunities.html'">Browse Now</button></div>`;
            return;
        }

        // Fetch full details
        const details = await Promise.all(
            saved.map((id) =>
                api.get(`/opportunities/${id._id || id}`).catch(() => null),
            ),
        );
        const valid = details
            .filter(Boolean)
            .map((d) => d.opportunity)
            .filter(Boolean);
        document.getElementById("savedContainer").innerHTML =
            `<div class="opportunities-grid">${valid.map((opp) => renderOpportunityCard(opp)).join("")}</div>`;
    } catch (err) {
        toast.error(err.message);
    }
});
