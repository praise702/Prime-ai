const form = document.getElementById("signupForm");
const message = document.getElementById("message");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const createButton = document.getElementById("createBtn");

function setMessage(text) {
    message.textContent = text;
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name) {
        setMessage("Please enter your name.");
        nameInput.focus();
        return;
    }

    if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        confirmPasswordInput.focus();
        return;
    }

    createButton.disabled = true;
    setMessage("Creating account…");

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ name, email, password })
        });

        let data = {};
        try {
            data = await response.json();
        } catch {}

        if (!response.ok) {
            const error = new Error(data.error || "Account creation failed.");
            error.status = response.status;
            throw error;
        }

        location.href = "chat.html";
    } catch (error) {
        setMessage(error.message || "Account creation failed.");
    } finally {
        createButton.disabled = false;
    }
});

document.getElementById("backBtn").addEventListener("click", () => {
    location.href = "login.html";
});
