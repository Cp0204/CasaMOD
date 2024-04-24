const intervalId = setInterval(() => {
  const element = document.getElementById('background');
  if (element) {
    element.style.backgroundImage = 'url("https://bing.img.run/1920x1080.php")';
    clearInterval(intervalId);
  }
}, 100);