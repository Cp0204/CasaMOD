// name: add-hostname-to-title
// author: Cp0204
// date: 2024-05-01
// description: 添加访问地址到网页标题，用以区分多个主机；因为没有后端获取主机名，所以默认用访问地址；你也可以直接修改本 js 用自定义字符串。
// description: Add the access address to the page title to differentiate between multiple hosts; since there is no backend to get the hostname, the default is the access address; you can also modify this js directly to use a custom string.

(function () {
    // 自定义字符
    // Custom Strings
    let additionalTitle = "";

    if (additionalTitle == "") {
        const hostname = window.location.hostname;
        const port = window.location.port;
        if (hostname) {
            additionalTitle += hostname;
            if (port) {
                additionalTitle += ":" + port;
            }
        }
    }
    if (additionalTitle != "") {
        document.title = document.title + " - " + additionalTitle;
    }
})();