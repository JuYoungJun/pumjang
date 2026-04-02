/**
 * common.js  —  공유 페이지(about.html, review.html 등) 전역 진입점
 *
 * 담당:
 *   1. #include-nav  → nav.html fetch 삽입 + 햄버거 토글 바인딩
 *   2. #include-footer → footer.html fetch 삽입
 *   3. TalkTalk 위젯 전역 초기화 (about, review 포함 공유 페이지 전체)
 *
 * 사용하지 않는 페이지:
 *   - index.html  : nav-landing.html을 인라인 loadPartial로 직접 처리 + TalkTalk 인라인
 *   - sub.html    : 자체 인라인 스크립트로 처리 + talktalk.js 직접 로드
 *
 * 클래스 규칙: .active  (nav.html + common.css 기준)
 */

/* ─────────────────────────────────────────
   유틸
───────────────────────────────────────── */
async function includeHTML(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(url + ' load failed');
        el.innerHTML = await res.text();
    } catch (e) {
        console.error('[common.js includeHTML]', e);
    }
}

/* ─────────────────────────────────────────
   Nav 토글
───────────────────────────────────────── */
function bindNavToggle() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    const toggleBtn = document.querySelector('.nav-toggle');

    const open  = () => {
        navMenu.classList.add('active');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.setAttribute('aria-label', '메뉴 닫기');
        }
    };
    const close = () => {
        navMenu.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.setAttribute('aria-label', '메뉴 열기');
        }
    };
    const toggle = () => navMenu.classList.contains('active') ? close() : open();

    if (toggleBtn && !toggleBtn.dataset.bound) {
        toggleBtn.addEventListener('click', toggle);
        toggleBtn.dataset.bound = '1';
    }

    navMenu.querySelectorAll('a').forEach(a => {
        if (a.dataset.bound) return;
        a.addEventListener('click', close);
        a.dataset.bound = '1';
    });

    if (!document.body.dataset.navOutsideBound) {
        document.addEventListener('click', e => {
            const header = document.querySelector('header');
            if (header && !header.contains(e.target)) close();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') close();
        });
        document.body.dataset.navOutsideBound = '1';
    }

    /* 현재 페이지 메뉴 active */
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    navMenu.querySelectorAll('a[href]').forEach(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        if (!href || href.startsWith('http')) return;
        a.classList.toggle('active', href === path);
    });
}

/* ─────────────────────────────────────────
   TalkTalk 전역 초기화
   - talktalk.js 가 이미 로드된 환경을 전제 (common.js보다 먼저 <script> 로드)
   - talktalk.html 경로: 루트 기준
───────────────────────────────────────── */
async function initGlobalTalkTalk() {
    if (typeof initTalkTalk !== 'function') return; // talktalk.js 미로드 방어
    try {
        await initTalkTalk({ htmlPath: './components/talktalk/talktalk.html' });
    } catch (e) {
        console.warn('[common.js] TalkTalk init failed:', e);
    }
}

/* ─────────────────────────────────────────
   DOMContentLoaded 진입점
───────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', async () => {
    const navMount    = document.querySelector('#include-nav');
    const footerMount = document.querySelector('#include-footer');

    if (navMount) {
        await includeHTML('#include-nav', 'nav.html');
        bindNavToggle();
    }
    if (footerMount) {
        await includeHTML('#include-footer', 'footer.html');
    }

    /* TalkTalk: #include-nav 가 있는 공유 페이지에서만 초기화 */
    if (navMount) {
        await initGlobalTalkTalk();
    }
});
