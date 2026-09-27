const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const form = document.getElementById("composer");
const history = document.getElementById("history");
const sidebar = document.getElementById("sidebar");
const plus = document.getElementById("plus");
const attachmentMenu = document.getElementById("attachmentMenu");
const chooseFiles = document.getElementById("chooseFiles");
const fileInput = document.getElementById("fileInput");
const attachmentsEl = document.getElementById("attachments");
const voiceButton = document.getElementById("voice");
import { cacheSearch, getLocationForQuery, savePreferences, supportsSearchApis } from "./searchClient.js";

let user = null;
let chats = [];
let current = null;
let sending = false;
let pendingAttachments = [];
let recognition = null;

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

const esc = value => String(value ?? "");

function inlineMarkdown(value) {
    const source = String(value || "").replace(/\\([#*_`])/g, "$1");
    const frag = document.createDocumentFragment();
    let remaining = source;
    const token = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|https?:\/\/[^\s)]+)/i;
    while (remaining) {
        const match = remaining.match(token);
        if (!match) { frag.append(document.createTextNode(remaining)); break; }
        const index = match.index || 0;
        if (index) frag.append(document.createTextNode(remaining.slice(0, index)));
        const raw = match[0];
        if (raw.startsWith("**") || raw.startsWith("__")) {
            const strong = document.createElement("strong");
            strong.textContent = raw.slice(2, -2);
            frag.append(strong);
        } else if (raw.startsWith("`")) {
            const code = document.createElement("code");
            code.textContent = raw.slice(1, -1);
            frag.append(code);
        } else {
            const link = document.createElement("a");
            link.href = raw; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = raw;
            frag.append(link);
        }
        remaining = remaining.slice(index + raw.length);
    }
    return frag;
}

function renderText(text) {
    const frag = document.createDocumentFragment();
    const normalized = String(text ?? "").replace(/\r\n/g, "\n").replace(/\\([#*_`])/g, "$1");
    const chunks = normalized.split(/```/);

    chunks.forEach((chunk, chunkIndex) => {
        if (chunkIndex % 2 === 1) {
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            code.textContent = chunk.replace(/^\w+\n/, "");
            pre.append(code); frag.append(pre); return;
        }

        const lines = chunk.split("\n");
        let list = null;
        for (const line of lines) {
            const trimmed = line.trim();
            const heading = trimmed.match(/^#{1,4}\s+(.+)$/);
            const bullet = trimmed.match(/^[-*]\s+(.+)$/);
            const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
            if (!trimmed) { if (list) { frag.append(list); list = null; } frag.append(document.createElement("br")); continue; }
            if (heading) { if (list) { frag.append(list); list = null; } const h = document.createElement(heading[0].match(/^#+/)[0].length <= 2 ? "h3" : "h4"); h.append(inlineMarkdown(heading[1])); frag.append(h); continue; }
            if (bullet || ordered) {
                const tag = ordered ? "ol" : "ul";
                if (!list || list.tagName.toLowerCase() !== tag) { if (list) frag.append(list); list = document.createElement(tag); }
                const li = document.createElement("li"); li.append(inlineMarkdown((bullet || ordered)[1])); list.append(li); continue;
            }
            if (list) { frag.append(list); list = null; }
            const p = document.createElement("div"); p.className = "text-line"; p.append(inlineMarkdown(trimmed)); frag.append(p);
        }
        if (list) frag.append(list);
    });
    return frag;
}

function scroll() {
    messages.scrollTop = messages.scrollHeight;
}

function renderAttachmentList(list, target) {
    if (!Array.isArray(list) || !list.length) return;

    const wrap = document.createElement("div");
    wrap.className = "message-attachments";

    for (const item of list.slice(0, MAX_ATTACHMENTS)) {
        const link = document.createElement("a");
        link.className = "attachment-card";
        link.href = item.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        if (String(item.type || "").startsWith("image/")) {
            const img = document.createElement("img");
            img.src = item.url;
            img.alt = item.name || "Uploaded image";
            link.append(img);
        } else {
            const icon = document.createElement("span");
            icon.textContent = "📄";
            link.append(icon);
        }

        const name = document.createElement("span");
        name.className = "attachment-name";
        name.textContent = item.name || "File";
        link.append(name);

        wrap.append(link);
    }

    target.append(wrap);
}

function renderMessages() {
    messages.replaceChildren();

    if (!current || !current.messages?.length) {
        const welcome = document.createElement("div");
        welcome.className = "welcome";

        const h1 = document.createElement("h1");
        h1.textContent = "How can I help?";

        const p = document.createElement("p");
        p.textContent = "Ask anything, work through a problem, or build something.";

        welcome.append(h1, p);
        messages.append(welcome);
        return;
    }

    for (const message of current.messages) {
        const row = document.createElement("div");
        row.className = `row ${message.sender === "user" ? "user" : "ai"}`;

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.append(renderText(message.text));

        renderAttachmentList(message.attachments, bubble);

        if (message.correction?.changed && message.correction.corrected) {
            const correction = document.createElement("div");
            correction.className = "message-correction";
            correction.textContent = `Corrected: ${message.correction.corrected}`;
            bubble.append(correction);
        }

        if (message.imageUrl) {
            const image = document.createElement("img");
            image.className = "generated-image";
            image.src = message.imageUrl;
            image.alt = "Generated by Prime";
            image.loading = "lazy";
            bubble.append(image);
        }

        if (message.sender !== "user" && message.text) {
            const speak = document.createElement("button");
            speak.type = "button";
            speak.textContent = "🔊";
            speak.title = "Read response aloud";
            speak.style.cssText = "border:0;background:transparent;padding:4px;color:#777";
            speak.onclick = () => {
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(
                        new SpeechSynthesisUtterance(message.text)
                    );
                }
            };
            bubble.append(speak);
        }

        row.append(bubble);
        messages.append(row);
    }

    scroll();
}

function renderHistory() {
    history.replaceChildren();

    for (const chat of chats) {
        const button = document.createElement("button");
        button.className = `history-item ${current?.id === chat.id ? "active" : ""}`;
        button.type = "button";
        button.textContent = chat.title || "New chat";
        button.onclick = () => {
            current = structuredClone(chat);
            pendingAttachments = [];
            renderPendingAttachments();
            renderMessages();
            renderHistory();
            sidebar.classList.remove("open");
        };
        history.append(button);
    }
}

async function api(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...options
    });

    let data = {};
    try {
        data = await response.json();
    } catch {}

    if (!response.ok) {
        const error = new Error(
            data.error || `Server returned HTTP ${response.status}`
        );
        error.status = response.status;
        throw error;
    }

    return data;
}

function bytesToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = String(reader.result || "");
            const comma = result.indexOf(",");
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };

        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
    });
}

async function uploadFile(file) {
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`${file.name} is larger than 8 MB.`);
    }

    const data = await bytesToBase64(file);

    const result = await api("/api/uploads", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            data
        })
    });

    return result.attachment;
}

function renderPendingAttachments() {
    attachmentsEl.replaceChildren();

    for (const attachment of pendingAttachments) {
        const chip = document.createElement("div");
        chip.className = "pending-attachment";

        const name = document.createElement("span");
        name.textContent = attachment.name;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "×";
        remove.title = "Remove attachment";
        remove.onclick = () => {
            pendingAttachments = pendingAttachments.filter(
                item => item.id !== attachment.id
            );
            renderPendingAttachments();
        };

        chip.append(name, remove);
        attachmentsEl.append(chip);
    }
}

async function handleFiles(files) {
    const incoming = Array.from(files || []);

    if (pendingAttachments.length + incoming.length > MAX_ATTACHMENTS) {
        alert("You can attach up to 5 files per message.");
        return;
    }

    for (const file of incoming) {
        try {
            const attachment = await uploadFile(file);
            pendingAttachments.push(attachment);
            renderPendingAttachments();
        } catch (error) {
            alert(`${file.name}: ${error.message}`);
        }
    }
}

function setupVoiceInput() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceButton.title = "Voice input is not supported by this browser";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
        voiceButton.classList.add("voice-active");
        voiceButton.textContent = "⏹";
    };

    recognition.onresult = event => {
        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            transcript += event.results[i][0].transcript;
        }

        input.value = transcript;
        input.dispatchEvent(new Event("input"));
    };

    recognition.onerror = event => {
        if (event.error !== "aborted") {
            console.warn("Voice input:", event.error);
        }
    };

    recognition.onend = () => {
        voiceButton.classList.remove("voice-active");
        voiceButton.textContent = "🎙";
    };

    voiceButton.onclick = () => {
        try {
            if (voiceButton.classList.contains("voice-active")) {
                recognition.stop();
            } else {
                recognition.start();
            }
        } catch {}
    };
}

async function load() {
    try {
        const me = await api("/api/auth/me");
        user = me.user;

        document.getElementById("accountName").textContent =
            user.name || user.email;

        const data = await api("/api/chats");
        chats = data.chats || [];

        current =
            chats[0] ||
            {
                id: crypto.randomUUID(),
                title: "New chat",
                messages: []
            };

        renderHistory();
        renderMessages();
    } catch (error) {
        if (error.status === 401) {
            location.href = "login.html";
        } else {
            messages.innerHTML =
                "<div class='welcome'><h1>Prime is offline</h1><p>Make sure the Prime server is running and try again.</p></div>";
        }
    }
}

async function persist() {
    if (!current) return;

    const existing =
        chats.findIndex(chat => chat.id === current.id);

    const data = await api(
        `/api/chats/${encodeURIComponent(current.id)}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(current)
        }
    );

    if (existing >= 0) {
        chats[existing] = data.chat;
    } else {
        chats.unshift(data.chat);
    }

    renderHistory();
}

function add(text, sender, attachments = [], extra = {}) {
    if (!current) {
        current = {
            id: crypto.randomUUID(),
            title: "New chat",
            messages: []
        };
    }

    current.messages.push({
        sender,
        text,
        attachments,
        ...extra,
        time: Date.now()
    });

    if (
        current.title === "New chat" &&
        sender === "user"
    ) {
        current.title = text.slice(0, 50) || "New chat";
    }

    renderMessages();
}

async function send() {
    if (sending) return;

    const text = input.value.trim();

    if (!text && pendingAttachments.length === 0) return;

    sending = true;

    const outgoingAttachments = [...pendingAttachments];

    add(text, "user", outgoingAttachments);

    input.value = "";
    input.style.height = "auto";
    pendingAttachments = [];
    renderPendingAttachments();

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "Prime is thinking…";
    messages.append(typing);
    scroll();

    try {
        const location = await getLocationForQuery(text);
        savePreferences({ lastSearch: text });

        const data = await api("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text || "Please inspect the attached file(s).",
                chatId: current.id,
                attachments: outgoingAttachments.map(attachment => ({
                    id: attachment.id,
                    name: attachment.name,
                    type: attachment.type,
                    size: attachment.size
                })),
                location
            })
        });

        if (data.metadata?.search?.results) {
            await cacheSearch(text, data.metadata.search.results, location);
        }

        const correction = data.metadata?.correction;
        if (correction?.changed && current?.messages?.length) {
            const lastUser = current.messages[current.messages.length - 2];
            if (lastUser?.sender === "user") {
                lastUser.correction = correction;
            }
        }

        typing.remove();

        add(
            data.message?.text ||
            data.answer ||
            "I couldn't generate a response.",
            "ai",
            data.message?.attachments || [],
            {
                imageUrl: data.imageUrl || data.image?.imageUrl || null
            }
        );

        await persist();
    } catch (error) {
        typing.remove();

        if (error.status === 401) {
            location.href = "login.html";
            return;
        }

        add(
            `Prime couldn't complete the request. ${error.message}`,
            "ai"
        );

        await persist().catch(() => {});
    } finally {
        sending = false;
        input.focus();
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    send();
});

input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height =
        Math.min(input.scrollHeight, 180) + "px";
});

input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
    }
});

plus.onclick = () => {
    attachmentMenu.hidden = !attachmentMenu.hidden;
};

chooseFiles.onclick = () => {
    attachmentMenu.hidden = true;
    fileInput.click();
};

fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files);
    fileInput.value = "";
});

document.getElementById("newChat").onclick = () => {
    current = {
        id: crypto.randomUUID(),
        title: "New chat",
        messages: []
    };

    pendingAttachments = [];
    renderPendingAttachments();
    renderMessages();
    renderHistory();
};

document.getElementById("menu").onclick = () =>
    sidebar.classList.toggle("open");

document.getElementById("logout").onclick = async () => {
    try {
        await api("/api/auth/logout", {
            method: "POST"
        });
    } finally {
        location.href = "login.html";
    }
};

const apiCapabilities = supportsSearchApis();
if (!apiCapabilities.fetch) console.warn("Prime: Fetch API is unavailable; chat requests cannot run.");
if (!apiCapabilities.indexedDB) console.info("Prime: IndexedDB unavailable; browser search cache disabled.");
setupVoiceInput();
load();
