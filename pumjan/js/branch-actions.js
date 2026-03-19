document.addEventListener('DOMContentLoaded', async () => {
    await ensureReservationModal();
    initReservationActions();
});

async function ensureReservationModal() {
    if (document.getElementById('reservation-modal')) return;

    try {
        const response = await fetch('modal/branch-reservation.html', { cache: 'no-store' });
        if (!response.ok) throw new Error('branch-reservation.html load failed');

        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('예약 모달 로딩 실패:', error);
    }
}

function initReservationActions() {
    const title = document.getElementById('reservation-modal-title');
    const desc = document.getElementById('reservation-modal-desc');
    const branch = document.getElementById('reservationModalBranch');
    const note = document.getElementById('reservationModalNote');
    const primaryButton = document.getElementById('reservationPrimaryButton');
    const secondaryButton = document.getElementById('reservationSecondaryButton');

    if (!title || !desc || !branch || !note || !primaryButton || !secondaryButton || typeof MicroModal === 'undefined') {
        console.warn('예약 모달 초기화 실패');
        return;
    }

    MicroModal.init({
        openTrigger: 'data-custom-open',
        disableScroll: true,
        awaitOpenAnimation: false,
        awaitCloseAnimation: false,
        onShow: (modal) => animateModalIn(modal),
        onClose: (modal) => resetModalState(modal)
    });

    document.querySelectorAll('.js-reserve-trigger').forEach((button) => {
        button.addEventListener('click', (event) => {
            const reserveType = button.dataset.reserveType;
            const branchName = button.dataset.branchName || '품장 지점';
            const phoneNumber = button.dataset.phone || '';
            const reserveUrl = button.dataset.reserveUrl || button.getAttribute('href') || '#';

            if (!reserveType) return;

            event.preventDefault();

            branch.textContent = branchName;

            if (reserveType === 'phone') {
                title.textContent = '전화 예약 안내';
                desc.innerHTML = '해당 지점은 온라인 예약 대신<br>전화 예약으로 도와드리고 있습니다.';
                note.textContent = '원하시면 지금 바로 연결해드릴게요.';

                primaryButton.textContent = '전화 예약하기';
                primaryButton.setAttribute('href', `tel:${phoneNumber}`);
                primaryButton.setAttribute('target', '_self');
                primaryButton.classList.remove('is-hidden');

                secondaryButton.textContent = '닫기';
                secondaryButton.setAttribute('href', '#');
                secondaryButton.removeAttribute('target');
                secondaryButton.classList.remove('is-hidden');
                secondaryButton.setAttribute('data-micromodal-close', '');
            }

            if (reserveType === 'naver') {
                title.textContent = '예약 안내';
                desc.innerHTML = '원하시는 방식으로 편하게<br>예약 또는 문의하실 수 있습니다.';
                note.textContent = '네이버 예약 또는 전화 문의 중 편한 방법을 선택해주세요.';

                primaryButton.textContent = '네이버 예약하기';
                primaryButton.setAttribute('href', reserveUrl);
                primaryButton.setAttribute('target', '_blank');
                primaryButton.setAttribute('rel', 'noopener');
                primaryButton.classList.remove('is-hidden');

                secondaryButton.textContent = '전화 문의하기';
                secondaryButton.setAttribute('href', `tel:${phoneNumber}`);
                secondaryButton.setAttribute('target', '_self');
                secondaryButton.classList.remove('is-hidden');
                secondaryButton.removeAttribute('data-micromodal-close');
            }

            MicroModal.show('reservation-modal', {
                disableScroll: true,
                onShow: (modal) => animateModalIn(modal),
                onClose: (modal) => resetModalState(modal)
            });
        });
    });
}

function animateModalIn(modal) {
    if (typeof gsap === 'undefined') return;

    const overlay = modal.querySelector('.reservation-modal__overlay');
    const container = modal.querySelector('.reservation-modal__container');

    gsap.killTweensOf([overlay, container]);

    gsap.set(overlay, { opacity: 0 });
    gsap.set(container, { opacity: 0, y: 18, scale: 0.97 });

    gsap.timeline()
        .to(overlay, {
            opacity: 1,
            duration: 0.22,
            ease: 'power2.out'
        })
        .to(container, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            ease: 'power3.out'
        }, 0.04);
}

function resetModalState(modal) {
    const primaryButton = modal.querySelector('#reservationPrimaryButton');
    const secondaryButton = modal.querySelector('#reservationSecondaryButton');

    if (primaryButton) {
        primaryButton.setAttribute('href', '#');
        primaryButton.removeAttribute('target');
        primaryButton.removeAttribute('rel');
    }

    if (secondaryButton) {
        secondaryButton.setAttribute('href', '#');
        secondaryButton.removeAttribute('target');
        secondaryButton.removeAttribute('rel');
        secondaryButton.removeAttribute('data-micromodal-close');
    }
}