document.addEventListener("DOMContentLoaded", () => {
    const user = api.getUser();
    if (!user || user.role !== "organization") {
        window.location.href = "/login.html";
        return;
    }

    document
        .getElementById("postDeadline")
        .setAttribute("min", new Date().toISOString().split("T")[0]);
});

window.toggleStipend = () => {
    document.getElementById("stipendGroup").style.display =
        document.getElementById("postPaid").value === "true" ? "block" : "none";
};

window.handlePostOpportunity = async () => {
    const title = document.getElementById("postTitle").value.trim();
    const type = document.getElementById("postType").value;
    const domain = document.getElementById("postDomain").value;
    const description = document.getElementById("postDesc").value.trim();
    const skills = document.getElementById("postSkills").value.trim();
    const location = document.getElementById("postLocation").value.trim();
    const mode = document.getElementById("postMode").value;
    const deadline = document.getElementById("postDeadline").value;
    const durVal = document.getElementById("postDurVal").value;

    if (
        !title ||
        !type ||
        !domain ||
        !description ||
        !skills ||
        !location ||
        !mode ||
        !deadline ||
        !durVal
    ) {
        toast.error("Please fill all required fields");
        return;
    }

    const isPaid = document.getElementById("postPaid").value === "true";
    const btn = document.getElementById("postBtn");
    btn.disabled = true;
    btn.textContent = "Posting...";

    try {
        await api.post("/opportunities", {
            title,
            type,
            domain,
            description,
            skills,
            location,
            mode,
            openings:
                parseInt(document.getElementById("postOpenings").value) || 1,
            duration: {
                value: parseInt(durVal),
                unit: document.getElementById("postDurUnit").value,
            },
            applicationDeadline: deadline,
            stipend: {
                isPaid,
                amount: isPaid
                    ? parseInt(document.getElementById("postStipend").value) ||
                      0
                    : 0,
            },
            requirements: document.getElementById("postReq").value,
            responsibilities: document.getElementById("postResp").value,
            perks: document.getElementById("postPerks").value,
        });
        toast.success("Opportunity posted successfully! 🎉");
        window.location.href = "/dashboard.html";
    } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
        btn.innerHTML = "🚀 Post Opportunity";
    }
};
