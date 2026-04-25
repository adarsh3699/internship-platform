document.addEventListener("DOMContentLoaded", async () => {
    if (!api.getToken()) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const data = await api.get("/auth/me");
        const u = data.user;

        document.getElementById("profileContent").innerHTML = `
      <div class="page" style="padding-top:80px;padding-bottom:4rem">
        <div class="container" style="max-width:700px">
          <h1 class="page-title" style="margin-bottom:2rem">My Profile</h1>
          <div class="profile-card">
            <div class="profile-cover"></div>
            <div class="profile-info">
              <div class="profile-avatar">${(u.name || "U")[0]}</div>
              <div class="profile-name">${u.name}</div>
              <div class="profile-org">${u.email} • ${capitalize(u.role)}</div>
              ${u.skills?.length ? `<div class="skills-list">${u.skills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}</div>` : ""}
            </div>
          </div>
          <div class="opp-detail-card">
            <div class="section-title-small">Edit Profile</div>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="profName" value="${u.name || ""}">
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-textarea" id="profBio" placeholder="Tell organizations about yourself...">${u.bio || ""}</textarea>
            </div>
            ${
                u.role === "student"
                    ? `
              <div class="form-group">
                <label class="form-label">Skills (comma-separated)</label>
                <input class="form-input" id="profSkills" value="${(u.skills || []).join(", ")}">
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Portfolio URL</label>
                  <input class="form-input" id="profPortfolio" value="${u.portfolio || ""}" placeholder="https://yourportfolio.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Resume URL</label>
                  <input class="form-input" id="profResume" value="${u.resume || ""}" placeholder="https://drive.google.com/...">
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Degree</label>
                  <input class="form-input" id="profDegree" value="${u.education?.degree || ""}" placeholder="B.Tech / BCA / MBA...">
                </div>
                <div class="form-group">
                  <label class="form-label">Institution</label>
                  <input class="form-input" id="profInstitution" value="${u.education?.institution || ""}" placeholder="University name">
                </div>
              </div>
            `
                    : `
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Company Name</label>
                  <input class="form-input" id="profCompany" value="${u.companyName || ""}">
                </div>
                <div class="form-group">
                  <label class="form-label">Website</label>
                  <input class="form-input" id="profWebsite" value="${u.website || ""}" placeholder="https://company.com">
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input class="form-input" id="profLocation" value="${u.location || ""}" placeholder="Mumbai, India">
                </div>
                <div class="form-group">
                  <label class="form-label">Company Size</label>
                  <select class="form-select" id="profSize">
                    <option value="">Select</option>
                    ${["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => `<option ${u.companySize === s ? "selected" : ""}>${s}</option>`).join("")}
                  </select>
                </div>
              </div>
            `
            }
            <button class="btn btn-primary" id="saveProfileBtn" onclick="saveProfile('${u.role}')">💾 Save Changes</button>
          </div>
        </div>
      </div>
    `;
    } catch (err) {
        toast.error(err.message);
    }
});

window.saveProfile = async (role) => {
    const btn = document.getElementById("saveProfileBtn");
    btn.disabled = true;
    btn.textContent = "Saving...";

    const updates = {
        name: document.getElementById("profName").value.trim(),
        bio: document.getElementById("profBio").value.trim(),
    };

    if (role === "student") {
        updates.skills = document
            .getElementById("profSkills")
            .value.split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        updates.portfolio = document
            .getElementById("profPortfolio")
            .value.trim();
        updates.resume = document.getElementById("profResume").value.trim();
        updates.education = {
            degree: document.getElementById("profDegree").value.trim(),
            institution: document
                .getElementById("profInstitution")
                .value.trim(),
        };
    } else {
        updates.companyName = document
            .getElementById("profCompany")
            .value.trim();
        updates.website = document.getElementById("profWebsite").value.trim();
        updates.location = document.getElementById("profLocation").value.trim();
        updates.companySize = document.getElementById("profSize").value;
    }

    try {
        const data = await api.put("/auth/profile", updates);
        const current = api.getUser();
        api.setAuth(api.getToken(), { ...current, ...data.user });
        renderNavbar();
        toast.success("Profile updated! ✅");
        btn.disabled = false;
        btn.textContent = "💾 Save Changes";
    } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
        btn.textContent = "💾 Save Changes";
    }
};
