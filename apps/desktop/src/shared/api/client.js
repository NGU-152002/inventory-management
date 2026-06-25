const API_URL = "http://localhost:4000";
export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("inventory_token");
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Request failed");
    }
    return response.json();
}
