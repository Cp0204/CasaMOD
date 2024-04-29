// name: 一言 / Quotable
// author: Cp0204
// date: 2024-04-29
// description: 本地缓存一小时

(function () {
    const observedAnchor = '.ps-container';
    async function moduleFunction() {
        const container = document.querySelector('.ps-container');
        const newElement = document.createElement('div');
        newElement.setAttribute('widget-id', 'quotable');


        const title = localStorage.getItem('lang') === "zh_cn" ? '💬 一言' : '💬 Quotable';
        quotable = "Loading..."

        newElement.innerHTML = `
<div class="widget has-text-white is-relative notes">
  <div class="blur-background"></div>
  <div class="widget-content">
    <div class="widget-header is-flex">
      <div class="widget-title is-flex-grow-1">${title}</div>
    </div>
    <div class="columns is-mobile is-multiline pt-2">
      <div class="column is-full pb-0">
        <P id="quotable">${quotable}</P>
      </div>
    </div>
  </div>
</div>
`;

        container.insertBefore(newElement, container.firstChild);

        async function getQuotable() {
            try {
                if (localStorage.getItem('lang') === "zh_cn") {
                    const response = await fetch('https://v1.hitokoto.cn/');
                    const data = await response.json();
                    return data.hitokoto;
                } else {
                    const response = await fetch('https://api.quotable.io/quotes/random');
                    const data = await response.json();
                    return data.content;
                }
            } catch (error) {
                console.error('Failed to get Quotable', error);
            }
        }

        async function cacheQuotable() {
            const cacheKey = 'quotable';
            // 缓存过期时间：1小时
            const cacheExpiry = 60 * 60 * 1000;
            // 尝试从 localStorage 获取缓存数据
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { quotable, timestamp } = JSON.parse(cachedData);
                const now = Date.now();
                if (now - timestamp < cacheExpiry) {
                    return quotable;
                }
            }
            // 获取新的一言
            const newQuotable = await getQuotable();
            localStorage.setItem(cacheKey, JSON.stringify({
                quotable: newQuotable,
                timestamp: Date.now(),
            }));
            return newQuotable;
        }
        document.querySelector('#quotable').innerHTML = await cacheQuotable();
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