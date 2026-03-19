document.addEventListener("DOMContentLoaded", function () {
    var images = document.querySelectorAll("img");

    images.forEach(function (img) {
        img.addEventListener("error", function () {
            console.warn("이미지 경로를 확인해주세요:", img.getAttribute("src"));
        });
    });
});