/* ===== API CLIENT ===== */
const API_BASE = "/api";

const api = {
    getToken: () => localStorage.getItem("token"),
    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    },
    setAuth: (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    },
    clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    request: async (endpoint, options = {}) => {
        const token = api.getToken();
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...options,
            body: options.body ? JSON.stringify(options.body) : undefined,
        };
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Request failed");
            return data;
        } catch (err) {
            throw err;
        }
    },

    get: (ep) => api.request(ep),
    post: (ep, body) => api.request(ep, { method: "POST", body }),
    put: (ep, body) => api.request(ep, { method: "PUT", body }),
    delete: (ep) => api.request(ep, { method: "DELETE" }),
};

/* ===== TOAST SYSTEM ===== */
const toast = {
    container: null,
    init() {
        this.container = document.createElement("div");
        this.container.className = "toast-container";
        document.body.appendChild(this.container);
    },
    show(msg, type = "info") {
        const icons = { success: "✅", error: "❌", info: "ℹ️" };
        const el = document.createElement("div");
        el.className = `toast toast-${type}`;
        el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
        this.container.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    },
    success: (m) => toast.show(m, "success"),
    error: (m) => toast.show(m, "error"),
    info: (m) => toast.show(m, "info"),
};

window.addEventListener("DOMContentLoaded", () => {
    toast.init();
});

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
