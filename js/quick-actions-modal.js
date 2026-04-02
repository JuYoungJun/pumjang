document.addEventListener('DOMContentLoaded', async () => {
    await ensureQuickActionModals();
    initQuickActionModals();
});

async function ensureQuickActionModals() {
    if (document.getElementById('store-finder-modal') || document.getElementById('booking-entry-modal')) return;

    try {
        const response = await fetch('modal/quick-actions-modal.html', { cache: 'no-store' });
        if (!response.ok) throw new Error('quick-actions-modal.html load failed');

        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('퀵 액션 모달 로딩 실패:', error);
    }
}

function initQuickActionModals() {
    if (typeof MicroModal === 'undefined') {
        console.warn('MicroModal not found');
        return;
    }

    const STORE_DATA = {
        naju: {
            key: 'naju',
            name: '나주점',
            address: '전남 나주시 노안면 건재로 524-11',
            lat: 35.0445,
            lng: 126.7178,
            mapUrl: 'https://map.naver.com/p/search/%ED%92%88%EC%9E%A5%20%EB%82%98%EC%A3%BC%EC%A0%90/place/1621907545?/address/3z8bR8,2z53V7,%EC%A0%84%EB%9D%BC%EB%82%A8%EB%8F%84%20%EB%82%98%EC%A3%BC%EC%8B%9C%20%EB%85%B8%EC%95%88%EB%A9%B4%20%EA%B1%B4%EC%9E%AC%EB%A1%9C%20524-11?isCorrectAnswer=true&c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603181616&locale=ko&svcName=map_pcv5&searchText=%ED%92%88%EC%9E%A5%20%EB%82%98%EC%A3%BC%EC%A0%90',
            phone: '061-123-4567'
        },
        eulwang: {
            key: 'eulwang',
            name: '을왕리점',
            address: '인천 중구 용유서로 402-11 1동 1층, 2층, 3층',
            lat: 37.4478,
            lng: 126.3726,
            mapUrl: 'https://map.naver.com/p/search/%ED%92%88%EC%9E%A5%20%EC%9D%84%EC%99%95%EB%A6%AC%EC%A0%90/address/3yShHZ,2AHkdf,%EC%9D%B8%EC%B2%9C%EA%B4%91%EC%97%AD%EC%8B%9C%20%EC%A4%91%EA%B5%AC%20%EC%9A%A9%EC%9C%A0%EC%84%9C%EB%A1%9C%20402-11?isCorrectAnswer=true&c=15.00,0,0,0,dh',
            phone: '032-751-1239',
            bookingUrl: 'https://m.booking.naver.com/booking/6/bizes/1484723/items/7026688?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place'
        }
    };

    const openStoreFinderBtn = document.querySelector('.js-open-store-finder');
    const openBookingEntryBtn = document.querySelector('.js-open-booking-entry');
    const nearestStoreBtn = document.getElementById('findNearestStore');
    const nearestStoreResult = document.getElementById('nearestStoreResult');

    MicroModal.init({
        disableScroll: true,
        awaitOpenAnimation: false,
        awaitCloseAnimation: false,
        onShow: (modal) => animateQuickModalIn(modal)
    });

    if (openStoreFinderBtn) {
        openStoreFinderBtn.addEventListener('click', () => {
            resetNearestResult();
            MicroModal.show('store-finder-modal', {
                disableScroll: true,
                onShow: (modal) => animateQuickModalIn(modal)
            });
        });
    }

    if (openBookingEntryBtn) {
        openBookingEntryBtn.addEventListener('click', () => {
            resetBookingGuides();
            MicroModal.show('booking-entry-modal', {
                disableScroll: true,
                onShow: (modal) => animateQuickModalIn(modal)
            });
        });
    }

    document.querySelectorAll('[data-store-map]').forEach((button) => {
        button.addEventListener('click', () => {
            const key = button.dataset.storeMap;
            const store = STORE_DATA[key];
            if (!store) return;
            window.open(store.mapUrl, '_blank', 'noopener');
        });
    });

    document.querySelectorAll('[data-toggle-booking-guide]').forEach((button) => {
        button.addEventListener('click', () => {
            const key = button.dataset.toggleBookingGuide;
            const guide = document.getElementById(`bookingGuide-${key}`);
            if (!guide) return;

            const shouldOpen = guide.hasAttribute('hidden');

            document.querySelectorAll('.quick-branch-guide').forEach((item) => {
                item.setAttribute('hidden', '');
            });

            document.querySelectorAll('[data-toggle-booking-guide]').forEach((btn) => {
                btn.textContent = '예약 안내 보기';
            });

            if (shouldOpen) {
                guide.removeAttribute('hidden');
                button.textContent = '안내 닫기';
            }
        });
    });

    if (nearestStoreBtn) {
        nearestStoreBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                renderNearestResultMessage('현재 브라우저에서는 위치 기능을 지원하지 않습니다. 아래 지점을 직접 선택해주세요.');
                return;
            }

            nearestStoreBtn.disabled = true;
            nearestStoreBtn.textContent = '현재 위치 확인 중...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    const najuDistance = getDistanceKm(userLat, userLng, STORE_DATA.naju.lat, STORE_DATA.naju.lng);
                    const eulwangDistance = getDistanceKm(userLat, userLng, STORE_DATA.eulwang.lat, STORE_DATA.eulwang.lng);

                    const nearest = najuDistance <= eulwangDistance
                        ? { store: STORE_DATA.naju, distance: najuDistance }
                        : { store: STORE_DATA.eulwang, distance: eulwangDistance };

                    renderNearestStore(nearest.store, nearest.distance);
                    resetNearestButton();
                },
                (error) => {
                    let message = '위치 정보를 가져오지 못했습니다. 지점을 직접 선택해주세요.';

                    if (error.code === 1) message = '위치 권한이 허용되지 않았습니다. 지점을 직접 선택해주세요.';
                    if (error.code === 2) message = '현재 위치를 확인할 수 없습니다. 지점을 직접 선택해주세요.';
                    if (error.code === 3) message = '위치 확인 시간이 초과되었습니다. 지점을 직접 선택해주세요.';

                    renderNearestResultMessage(message);
                    resetNearestButton();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 7000,
                    maximumAge: 60000
                }
            );
        });
    }

    function resetNearestButton() {
        if (!nearestStoreBtn) return;
        nearestStoreBtn.disabled = false;
        nearestStoreBtn.textContent = '내 위치로 가까운 매장 찾기';
    }

    function resetNearestResult() {
        if (!nearestStoreResult) return;
        nearestStoreResult.classList.remove('is-show');
        nearestStoreResult.innerHTML = '';
        resetNearestButton();
    }

    function resetBookingGuides() {
        document.querySelectorAll('.quick-branch-guide').forEach((item) => {
            item.setAttribute('hidden', '');
        });

        document.querySelectorAll('[data-toggle-booking-guide]').forEach((btn) => {
            btn.textContent = '예약 안내 보기';
        });
    }

    function renderNearestResultMessage(message) {
        if (!nearestStoreResult) return;
        nearestStoreResult.innerHTML = `
            <div class="quick-result__eyebrow">STORE GUIDE</div>
            <div class="quick-result__desc">${message}</div>
        `;
        nearestStoreResult.classList.add('is-show');
    }

    function renderNearestStore(store, distance) {
        if (!nearestStoreResult) return;

        const actions = store.key === 'naju'
            ? `
                <div class="quick-result__actions">
                    <a href="${store.mapUrl}" target="_blank" rel="noopener" class="quick-result__btn quick-result__btn--primary">길찾기</a>
                    <a href="tel:${store.phone}" class="quick-result__btn quick-result__btn--ghost">전화 예약</a>
                </div>
              `
            : `
                <div class="quick-result__actions">
                    <a href="${store.mapUrl}" target="_blank" rel="noopener" class="quick-result__btn quick-result__btn--primary">길찾기</a>
                    <a href="${store.bookingUrl}" target="_blank" rel="noopener" class="quick-result__btn quick-result__btn--ghost">네이버 예약</a>
                </div>
              `;

        nearestStoreResult.innerHTML = `
            <div class="quick-result__eyebrow">가까운 매장 추천</div>
            <div class="quick-result__title">${store.name}</div>
            <div class="quick-result__desc">
                현재 위치 기준 약 <strong>${formatDistance(distance)}</strong> 거리입니다.<br>
                ${store.address}
            </div>
            ${actions}
        `;
        nearestStoreResult.classList.add('is-show');
    }

    function toRad(degree) {
        return degree * (Math.PI / 180);
    }

    function getDistanceKm(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function formatDistance(distance) {
        if (distance < 1) return Math.round(distance * 1000) + 'm';
        return distance.toFixed(1) + 'km';
    }
}

function animateQuickModalIn(modal) {
    if (typeof gsap === 'undefined') return;

    const overlay = modal.querySelector('.quick-modal__overlay');
    const container = modal.querySelector('.quick-modal__container');

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