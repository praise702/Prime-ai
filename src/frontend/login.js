const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "Signing in…";
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.error || "Sign in failed.");
            error.status = response.status;
            throw error;
        }
        location.href = "/chat.html";
    } catch (error) {
        message.textContent = error.message || "Sign in failed.";
    }
});

document.getElementById("signupBtn").onclick = () => {
    location.href = "/create-account.html";
};
