// name: 允许编辑镜像设置 / Allow modify image settings
// author: Cp0204
// date: 2024-04-30

(function () {
    const observedAnchor = '.tab-content';
    async function moduleFunction() {
        const tabContents = document.querySelectorAll(observedAnchor)
        tabContents.forEach(tabContent => {
            const inputElements = tabContent.querySelectorAll('input[readonly="readonly"]');
            inputElements.forEach(inputElement => {
                inputElement.removeAttribute('readonly');
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
    const debounced = debounce(moduleFunction, 1000);
})();