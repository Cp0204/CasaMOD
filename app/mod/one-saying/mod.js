(function () {
    const observedAnchors = '.ps-container';
    async function moduleFunction() {
        const container = document.querySelector('.ps-container');
        const newElement = document.createElement('div');
        newElement.setAttribute('widget-id', 'saying');

        userImage = "/v1/users/avatar?token=" + localStorage.getItem('access_token');
        userName = JSON.parse(localStorage.getItem('user')).username;
        saying = "你好！一言加载中..."

        newElement.innerHTML = `
<div class="widget has-text-white is-relative">
    <div class="blur-background"></div>
    <div class="widget-content">
    <div class="columns is-mobile is-multiline pt-2">
        <div class="column is-full pb-0">
        <div class="is-flex is-align-items-center">
            <div class="header-icon">
                <img src="`+ userImage + `" loading="lazy" style="border-radius: 50%;" width="64">
            </div>
            <div class="ml-4 style="width:13rem">
                <h3 class="has-text-left" style="font-size: 1.1rem; margin-top: -0.8rem;margin-bottom: 0.5rem;">`+ userName + `</h3>
                <p class="has-text-left is-size-14px"style="color: hsl(208, 16%, 85%);">
                    <p id="saying" style="cursor: pointer;font-size:12px;">${saying}</p>
                </p>
            </div>
        </div>
        </div>
    </div>
    </div>
</div>
`;
        container.insertBefore(newElement, container.firstChild);

        async function getSaying() {
            try {
                if (localStorage.getItem('lang') === "zh_cn") {
                    const response = await fetch('https://v1.hitokoto.cn/');
                    const data = await response.json();
                    return data.hitokoto;
                } else {
                    const response = await fetch('https://api.quotable.io/quotes/random');
                    const data = await response.json();
                    return data[0].content;
                }
            } catch (error) {
                console.error('Failed to get Saying', error);
                return false;
            }
        }

        async function cacheSaying(force = false) {
            const cacheKey = 'saying';
            const cacheExpiry = 60 * 60 * 1000;
            const cacheData = localStorage.getItem(cacheKey);
            if (cacheData && force == false) {
                const { saying, timestamp } = JSON.parse(cacheData);
                if (Date.now() - timestamp < cacheExpiry) {
                    return saying;
                }
            }
            const newSaying = await getSaying();
            localStorage.setItem(cacheKey, JSON.stringify({
                saying: newSaying,
                timestamp: Date.now(),
            }));
            return newSaying;
        }

        document.querySelector('#saying').innerHTML = await cacheSaying();
        document.querySelector('#saying').addEventListener('click', async function() {
            document.querySelector('#saying').innerHTML = await cacheSaying(true);
        });
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.querySelector(observedAnchors)) {
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