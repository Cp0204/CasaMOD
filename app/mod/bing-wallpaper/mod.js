const intervalId = setInterval(() => {
  const element = document.getElementById('background');
  if (element) {
    element.style.backgroundImage = 'url("https://bing.img.run/1920x1080.php")';
    element.style.filter = 'blur(5px) brightness(0.8)'; // 毛玻璃和压暗效果
    clearInterval(intervalId);
  }
}, 100);