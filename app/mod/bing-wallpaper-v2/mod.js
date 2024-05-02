// name: bing-wallpaper-v2
// author: Cp0204
// date: 2024-05-02
// description: 自动设置必应壁纸，右键显示壁纸描述，支持多语言
// description: Automatically set Bing wallpaper, right-click display wallpaper description, support multi-language

(function () {
    const observedAnchor = '#background';
    async function moduleFunction() {
        // 官方API无法跨域
        // The official API cannot cross the domain
        // https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN
        const mkt = mapLanguageCode(localStorage.getItem('lang'));
        let apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${mkt}`;
        apiUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // 改壁纸
                // Change wallpaper
                const imageUrl = `https://www.bing.com${data.images[0].url}`;
                console.log("Bing Wallpaper URL:", imageUrl);
                const bgElement = document.querySelector(observedAnchor);
                bgElement.style.backgroundImage = `url("${imageUrl}")`;
                bgElement.style.filter = 'blur(5px) brightness(0.8)'; // 模糊和压暗效果

                // 添加右键菜单
                // Add right-click menu
                const menuElement = document.querySelector(".dropdown-content");
                const htmlString = `<a class="dropdown-item is-flex is-align-items-center" target="_blank" style="width:250px;white-space:normal;" href="${data.images[0].copyrightlink}">${data.images[0].copyright}</a>`;
                menuElement.insertAdjacentHTML("beforeend", htmlString)
            })
            .catch(error => {
                console.error("Get Bing Wallpaper failed:", error);
            });

        function mapLanguageCode(code) {
            const languagesMaps = {
                "en_us": "en-US",
                "zh_cn": "zh-CN",
                "ja_jp": "ja-JP",
                "de_de": "de-DE",
                "fr_fr": "fr-FR"
            };
            return languagesMaps[code] || "en-US";
        }
    }


    // ================================================
    // 观察，等待 vue 渲染后执行
    // Observe and wait for Vue rendering to complete.
    // ================================================
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.querySelector(observedAnchor)) {
                observer.disconnect();
                debounced();
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true, once: true });
    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    const debounced = debounce(moduleFunction, 1);
})();