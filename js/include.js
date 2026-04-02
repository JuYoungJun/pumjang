/**
 * include.js
 *
 * 이 파일은 하위 호환성 유지를 위해 남겨둡니다.
 * 실제 로직은 common.js로 통합되었습니다.
 *
 * common.js가 로드된 환경에서는 이 파일이 불필요하지만,
 * 혹시 이 파일만 로드하는 페이지를 위해 동일 기능을 위임합니다.
 *
 * ⚠️  이 파일을 common.js와 동시에 로드하면 중복 실행됩니다.
 *     한 페이지에서 둘 중 하나만 로드하세요.
 */

// common.js가 이미 로드된 경우 중복 실행 방지
if (typeof window.__commonJsLoaded === "undefined") {
    window.__commonJsLoaded = true;

    async function includeHTML(selector, url) {
        const el = document.querySelector(selector);
        if (!el) return;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(url + " load failed");
            el.innerHTML = await res.text();
        } catch (e) {
            console.error("[include.js includeHTML]", e);
        }
    }

    function bindNavToggle() {
        const navMenu = document.getElementById("navMenu");
        if (!navMenu) return;

        const toggleBtn = document.querySelector(".nav-toggle");

        const toggle = () => {
            const opened = navMenu.classList.toggle("active");
            if (toggleBtn) toggleBtn.setAttribute("aria-expanded", opened ? "true" : "false");
        };

        const close = () => {
            navMenu.classList.remove("active");
            if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
        };

        if (toggleBtn && !toggleBtn.dataset.bound) {
            toggleBtn.addEventListener("click", toggle);
            toggleBtn.dataset.bound = "1";
        }

        navMenu.querySelectorAll("a").forEach((a) => {
            if (a.dataset.bound) return;
            a.addEventListener("click", close);
            a.dataset.bound = "1";
        });
    }

    window.addEventListener("DOMContentLoaded", async () => {
        const navMount = document.querySelector("#include-nav");
        const footerMount = document.querySelector("#include-footer");

        if (navMount) {
            await includeHTML("#include-nav", "nav.html");
            bindNavToggle();
        }
        if (footerMount) {
            await includeHTML("#include-footer", "footer.html");
        }
    });
}
