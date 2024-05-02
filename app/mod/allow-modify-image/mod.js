// name: 允许编辑镜像设置 / Allow modify image settings
// author: Cp0204
// date: 2024-04-30

(function () {
    const observedAnchor = '.tab-content';
    async function moduleFunction() {
        const tabContents = document.querySelectorAll(observedAnchor);
        tabContents.forEach(tabContent => {

            // 增加超链接
            const tabPanels = tabContent.querySelectorAll(':scope > div');
            tabPanels.forEach(tabPanel => {
                const imageLabel = tabPanel.querySelector('span > div:nth-child(1) > div > div > span.is-flex-grow-1 > div > label');
                const imageInput = tabPanel.querySelector('span > div:nth-child(1) > div > div > span.is-flex-grow-1 > div > div > input');
                linkToImage();
                imageInput.addEventListener('input', () => { linkToImage(); });
                function linkToImage() {
                    const imageURL = imageInput.value.includes('.') ? `https://${imageInput.value}` : `https://hub.docker.com/r/${imageInput.value}`;
                    imageLabel.innerHTML = `<a target="_blank" href="${imageURL}">Docker Image *</a>`;
                }
            });

            // 镜像可编辑
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
    const debounced = debounce(moduleFunction, 500);
})();