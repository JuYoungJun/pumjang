const TALKTALK_CHANNEL_ID = "172076";
const TALKTALK_SCRIPT_SRC = "https://partner.talk.naver.com/banners/script";

async function loadTalkTalk(htmlPath) {
    const alreadyMounted = document.querySelector(".tt-wrapper");
    if (alreadyMounted) return;

    const response = await fetch(htmlPath, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`${htmlPath} load failed`);
    }

    const html = await response.text();
    const temp = document.createElement("div");
    temp.innerHTML = html;

    while (temp.firstChild) {
        document.body.appendChild(temp.firstChild);
    }
}

function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === "true") {
                resolve();
                return;
            }
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error(`${src} load failed`)), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.src = src;

        script.addEventListener("load", () => {
            script.dataset.loaded = "true";
            resolve();
        }, { once: true });

        script.addEventListener("error", () => {
            reject(new Error(`${src} load failed`));
        }, { once: true });

        document.head.appendChild(script);
    });
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sendMsg() {
    const input = document.getElementById("tt-input");
    const body = document.getElementById("tt-body");
    if (!input || !body) return;

    const text = input.value.trim();
    if (!text) return;

    const now = new Date();
    const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");

    const row = document.createElement("div");
    row.className = "tt-msg-row user";
    row.innerHTML = `
        <div class="tt-msg-time">${time}</div>
        <div class="tt-bubble user">${escapeHtml(text)}</div>
    `;

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    input.value = "";
}

function closeChat() {
    const chat = document.getElementById("tt-chat");
    const closed = document.getElementById("tt-closed");
    if (chat) chat.style.display = "none";
    if (closed) closed.style.display = "flex";
}

function openTalkTalk() {
    const badge = document.getElementById("tt-badge");
    if (badge) badge.style.display = "none";

    const bannerDiv = document.querySelector(".talk_banner_div");
    const generatedButton = document.querySelector(".talk_banner_div a, .talk_banner_div button, .talk_banner_div iframe");

    if (generatedButton && typeof generatedButton.click === "function") {
        generatedButton.click();
        return;
    }

    if (window.NaverTalkTalk && typeof window.NaverTalkTalk.open === "function") {
        window.NaverTalkTalk.open();
        return;
    }

    if (bannerDiv) {
        window.open(`https://talk.naver.com/ct/${TALKTALK_CHANNEL_ID}`, "_blank", "width=400,height=600");
        return;
    }

    window.open(`https://talk.naver.com/ct/${TALKTALK_CHANNEL_ID}`, "_blank", "width=400,height=600");
}

function bindTalkTalkEvents() {
    const btn = document.getElementById("tt-btn");
    const closeBtn = document.getElementById("tt-close-btn");
    const sendBtn = document.getElementById("tt-send-btn");
    const input = document.getElementById("tt-input");

    if (btn && !btn.dataset.bound) {
        btn.addEventListener("click", openTalkTalk);
        btn.dataset.bound = "true";
    }

    if (closeBtn && !closeBtn.dataset.bound) {
        closeBtn.addEventListener("click", closeChat);
        closeBtn.dataset.bound = "true";
    }

    if (sendBtn && !sendBtn.dataset.bound) {
        sendBtn.addEventListener("click", sendMsg);
        sendBtn.dataset.bound = "true";
    }

    if (input && !input.dataset.bound) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendMsg();
        });
        input.dataset.bound = "true";
    }
}

async function initTalkTalk(options = {}) {
    const htmlPath = options.htmlPath || "./components/talktalk/talktalk.html";

    await loadTalkTalk(htmlPath);
    await loadExternalScript(TALKTALK_SCRIPT_SRC);

    const banner = document.querySelector(".talk_banner_div");
    if (banner) {
        banner.setAttribute("data-id", TALKTALK_CHANNEL_ID);
    }

    bindTalkTalkEvents();

    const now = new Date();
    const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
    const timeEl = document.getElementById("tt-time");
    if (timeEl) timeEl.textContent = time;

    setTimeout(() => {
        const tooltip = document.getElementById("tt-tooltip");
        if (tooltip) tooltip.style.display = "block";
    }, 1000);

    setTimeout(() => {
        const tooltip = document.getElementById("tt-tooltip");
        if (!tooltip) return;
        tooltip.style.transition = "opacity 0.5s ease";
        tooltip.style.opacity = "0";
        setTimeout(() => {
            tooltip.style.display = "none";
            tooltip.style.opacity = "1";
        }, 500);
    }, 6000);
}