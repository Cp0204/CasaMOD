// name: dont-change-my-icon
// author: Cp0204
// date: 2024-05-07
// description: 禁止编辑镜像地址时自动匹配图标 / Disable auto-matching icons when editing image

(function () {
    const observedAnchor = '.tab-content';
    async function moduleFunction() {
        const tabContents = document.querySelectorAll(observedAnchor);
        tabContents.forEach(tabContent => {
            const tabPanels = tabContent.querySelectorAll(':scope > div');
            tabPanels.forEach(tabPanel => {
                const imageInput = tabPanel.querySelector('span > div:nth-child(1) > div > div > span.is-flex-grow-1 > div > div > input');
                imageInput.addEventListener("input", (e) => {
                    e.stopPropagation(); // 阻止事件传播
                    console.log("Don't change my icon!");
                    return false;
                }, true);
            });

        });
    }


    // ================================================
    // 观察，等待 vue 渲染后执行
    // Observe and wait for Vue rendering to complete.
    // ================================================
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.querySelector(observedAnchor)) {
                //observer.disconnect();
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
    const debounced = debounce(moduleFunction, 500);
})();