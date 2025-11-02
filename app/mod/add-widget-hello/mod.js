// author: Cp0204
// date: 2024-4-27

(function () {
    const observedAnchor = '.ps-container';
    function moduleFunction() {
        const container = document.querySelector('.ps-container');
        const newElement = document.createElement('div');
        newElement.setAttribute('widget-id', 'hello');

        headerImg = "/v1/users/avatar?token=" + localStorage.getItem('access_token');
        username = JSON.parse(localStorage.getItem('user')).username;
        description = localStorage.getItem('lang')
        if (description == "zh_cn") {
            description = "食咗饭未啊？";
        } else if (description == "tr_tr") {
            description = "Bugün nasılsın?";
        } else {
            description = "How Are You Today?";
        }

        newElement.innerHTML = `
<div class="widget has-text-white is-relative">
    <div class="blur-background"></div>
    <div class="widget-content">
    <div class="columns is-mobile is-multiline pt-2">
        <div class="column is-full pb-0">
        <div class="is-flex is-align-items-center">
            <div class="header-icon">
            <img src="`+ headerImg + `" loading="lazy" style="border-radius: 50%;" width="64">
            </div>
            <div class="ml-4 style="width:13rem">
            <h3 class="has-text-left" style="font-size: 1.1rem; margin-top: -0.8rem;margin-bottom: 0.5rem;">`+ username + `</h3>
            <p class="has-text-left is-size-14px"style="color: hsl(208, 16%, 85%);">`+ description + `</p>
            </div>
        </div>
        </div>
    </div>
    </div>
</div>
    `;
        container.insertBefore(newElement, container.firstChild);
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