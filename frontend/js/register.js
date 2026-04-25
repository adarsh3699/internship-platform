let selectedRole = "student";

window.selectRole = (role) => {
    selectedRole = role;
    document
        .getElementById("roleStudent")
        .classList.toggle("active", role === "student");
    document
        .getElementById("roleOrg")
        .classList.toggle("active", role === "organization");
    document.getElementById("orgFields").style.display =
        role === "organization" ? "block" : "none";
    document.getElementById("studentFields").style.display =
        role === "student" ? "block" : "none";
};

window.handleRegister = async () => {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        toast.error("Please fill all required fields");
        return;
    }
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    const payload = { name, email, password, role: selectedRole };

    if (selectedRole === "organization") {
        payload.companyName = document
            .getElementById("regCompany")
            .value.trim();
        payload.industry = document.getElementById("regIndustry").value;
        if (!payload.companyName) {
            toast.error("Company name is required");
            return;
        }
    } else {
        payload.skills = document.getElementById("regSkills").value;
    }

    const btn = document.getElementById("regBtn");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
        const data = await api.post("/auth/register", payload);
        api.setAuth(data.token, data.user);
        toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
        window.location.href = "/dashboard.html";
    } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
        btn.textContent = "Create Account 🚀";
    }
};
