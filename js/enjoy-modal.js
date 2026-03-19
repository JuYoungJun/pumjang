(function () {
    const openButtons = document.querySelectorAll('[data-enjoy-open]');
    let modal = null;
    let dialog = null;
    let closeEls = [];
    let isLoaded = false;
    let isLoading = false;
    let lastFocused = null;

    if (!openButtons.length) return;

    async function loadModal() {
        if (isLoaded || isLoading) return;
        isLoading = true;

        try {
            const response = await fetch('modal/enjoy-modal.html', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('모달 파일을 불러오지 못했습니다.');
            }

            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);

            modal = document.getElementById('enjoyModal');
            dialog = modal ? modal.querySelector('.enjoy-modal__dialog') : null;
            closeEls = modal ? modal.querySelectorAll('[data-enjoy-close]') : [];

            if (!modal || !dialog) {
                throw new Error('모달 구조를 찾을 수 없습니다.');
            }

            closeEls.forEach(function (el) {
                el.addEventListener('click', closeModal);
            });

            document.addEventListener('keydown', function (e) {
                if (!modal || !modal.classList.contains('is-open')) return;
                if (e.key === 'Escape') closeModal();
            });

            isLoaded = true;
        } catch (error) {
            console.error(error);
        } finally {
            isLoading = false;
        }
    }

    function openModal() {
        if (!modal || !dialog) return;

        lastFocused = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('enjoy-modal-open');
        dialog.setAttribute('tabindex', '-1');
        dialog.focus();
    }

    function closeModal() {
        if (!modal) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('enjoy-modal-open');

        if (lastFocused) {
            lastFocused.focus();
        }
    }

    openButtons.forEach(function (button) {
        button.addEventListener('click', async function (e) {
            e.preventDefault();

            if (!isLoaded) {
                await loadModal();
            }

            openModal();
        });
    });
})();