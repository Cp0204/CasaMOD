// author: lan
// date: 2024-4-28

(function () {
  const observedAnchor = '.ps-container';
  const name = '📝 Nots';
  const placeholder = 'Record something!';
  const tips = '❗Tips: Save to local browser only!';
  function moduleFunction() {
      const container = document.querySelector('.ps-container');
      const newElement = document.createElement('div');
      newElement.setAttribute('widget-id', 'notes');
      newElement.innerHTML = `
<div class="widget has-text-white is-relative notes">
  <div class="blur-background"></div>
  <div class="widget-content">
  <div class="widget-header is-flex"><div class="widget-title is-flex-grow-1">${name}</div></div>
  <div class="columns is-mobile is-multiline pt-2">
      <div class="column is-full pb-0">
      <textarea class="widget-notes-textarea" placeholder="${placeholder}" spellcheck="false" ></textarea>
      <span class="widget-tips">${tips}</span>
      <div class="is-flex is-align-items-center">
          <div class="header-icon">
          </div>
          <div class="ml-4 style="width:13rem">
          </div>
      </div>
      </div>
  </div>
  </div>
</div>
  `;
container.insertBefore(newElement, container.firstChild);

//获取文本框
const notes_textarea = document.querySelector('.widget-notes-textarea');

//保存文本框内容
function saveNotesData() {
  const inputContent = notes_textarea.value;
    localStorage.setItem('widget-notes-data', inputContent);
}
//读取恢复文本框内容
function restoreNotesData() {

  const inputContent = localStorage.getItem('widget-notes-data');
    if (inputContent) {
      notes_textarea.value = inputContent;
    }
}
//监听输入
notes_textarea.addEventListener('input', saveNotesData);

//调用
restoreNotesData();
autoTextarea(notes_textarea);
  }

/**
 * 文本框根据输入内容自适应高度
 * elem                {HTMLElement}        输入框元素
 * extra               {Number}             设置光标与输入框保持的距离
 * maxHeight           {Number}             设置最大高度(可选)
 */
  var autoTextarea = function (elem, extra, maxHeight) {
    extra = extra || 24; //设置光标与输入框保持的距离
    var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
    isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
    addEvent = function (type, callback) {
        elem.addEventListener ?
            elem.addEventListener(type, callback, false) :
            elem.attachEvent('on' + type, callback);
    },
    getStyle = elem.currentStyle ? function (name) {
        var val = elem.currentStyle[name];
  
        if (name === 'height' && val.search(/px/i) !== 1) {
            var rect = elem.getBoundingClientRect();
            return rect.bottom - rect.top -
                    parseFloat(getStyle('paddingTop')) -
                    parseFloat(getStyle('paddingBottom')) + 'px';        
        };
  
        return val;
    } : function (name) {
        return getComputedStyle(elem, null)[name];
    },
    minHeight = parseFloat(getStyle('height'));
  
    elem.style.resize = 'none';
  
    var change = function () {
        var scrollTop,
            height,
            padding = 0,
            style = elem.style;
  
        if (elem._length === elem.value.length) return;
        elem._length = elem.value.length;
  
        if (!isFirefox && !isOpera) {
            padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
        };
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  
        elem.style.height = minHeight + 'px';
        if (elem.scrollHeight > minHeight) {
            if (maxHeight && elem.scrollHeight > maxHeight) {
                height = maxHeight - padding;
                style.overflowY = 'auto';
            } else {
                height = elem.scrollHeight - padding;
                style.overflowY = 'hidden';
            };
            style.height = height + extra + 'px';
            scrollTop += parseInt(style.height) - elem.currHeight;
            document.body.scrollTop = scrollTop;
            document.documentElement.scrollTop = scrollTop;
            elem.currHeight = parseInt(style.height);
        };
    };
    addEvent('propertychange', change);
    addEvent('input', change);
    addEvent('focus', change);
    change();
  };


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
