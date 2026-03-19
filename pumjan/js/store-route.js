
function openNaverRoute(elng, elat, etext) {
    if (!navigator.geolocation) {
        alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const slat = position.coords.latitude;
            const slng = position.coords.longitude;
            const stext = "내 위치";

            const url =
                "https://map.naver.com/index.nhn" +
                "?slng=" + encodeURIComponent(slng) +
                "&slat=" + encodeURIComponent(slat) +
                "&stext=" + encodeURIComponent(stext) +
                "&elng=" + encodeURIComponent(elng) +
                "&elat=" + encodeURIComponent(elat) +
                "&etext=" + encodeURIComponent(etext) +
                "&menu=route" +
                "&pathType=1";

            window.open(url, "_blank");
        },
        function (error) {
            console.error("위치 조회 실패:", error);
            alert("현재 위치를 가져오지 못했습니다. 위치 권한을 허용해주세요.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

document.addEventListener("click", function (e) {
    const routeLink = e.target.closest(".js-naver-route");
    if (!routeLink) return;

    e.preventDefault();

    const elng = routeLink.dataset.elng;
    const elat = routeLink.dataset.elat;
    const etext = routeLink.dataset.etext || "도착지";

    if (!elng || !elat) {
        alert("도착지 좌표가 설정되지 않았습니다.");
        return;
    }

    openNaverRoute(elng, elat, etext);
});
