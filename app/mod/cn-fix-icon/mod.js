(function () {
    const observedAnchor = '.image';
    async function moduleFunction(ob) {
        const images = ob.querySelectorAll('img');
        images.forEach(img => {
            if (img.src.startsWith('https://cdn.jsdelivr.net/gh')) {
                img.src = img.src.replace(
                    /(cdn\.jsdelivr\.net\/gh\/)([^@]+)@(.*)/,
                    // 'raw.gitmirror.com/$2/$3'
                    'ghp.ci/raw.githubusercontent.com/$2/$3'
                );
            }
        });
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.querySelector(observedAnchor)) {
                //observer.disconnect();
                debounced(mutation.target);
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