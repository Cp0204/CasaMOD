// 1. 设置主画布
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
// 移除 CSS filter blur，提升性能
canvas.style = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* 让鼠标事件穿透画布，不影响下方内容 */
    z-index: 9999;
`;
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// 2. 性能优化核心：创建离屏 Canvas 缓存雪花图片
// 只画一次雪花，之后无限复用这张“贴纸”
const particleSize = 10; // 基础绘制尺寸
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = particleSize * 2;
offscreenCanvas.height = particleSize * 2;
const offCtx = offscreenCanvas.getContext('2d');

// 在离屏 Canvas 上绘制一个径向渐变的圆
const gradient = offCtx.createRadialGradient(particleSize, particleSize, 0, particleSize, particleSize, particleSize);
gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // 边缘完全透明
offCtx.fillStyle = gradient;
offCtx.beginPath();
offCtx.arc(particleSize, particleSize, particleSize, 0, Math.PI * 2);
offCtx.fill();

// 3. 雪花类优化
class Snowflake {
    constructor() {
        this.init(true);
    }

    // 初始化/重置方法
    // initial 参数用于区分是“刚开始生成”还是“落到底部重置”
    init(initial = false) {
        this.x = Math.random() * width;
        // 如果是初始化，Y坐标随机分布在屏幕上；如果是重置，从顶部上方开始
        this.y = initial ? Math.random() * height : -10;
        // 缩放比例，让雪花大小不一
        this.scale = Math.random() * 0.5 + 0.2; // 0.2 到 0.7 倍大小
        // 下落速度
        this.speedY = Math.random() * 1 + 0.5;
        // 水平漂移基础速度
        this.speedX = Math.random() * 0.6 - 0.3; 
        // 摇摆参数
        this.swing = Math.random() * 0.05; 
        this.swingStep = Math.random() * Math.PI;
    }

    update() {
        this.y += this.speedY;
        
        // 添加正弦波摇摆效果，模拟自然飘落
        this.swingStep += this.swing;
        this.x += this.speedX + Math.sin(this.swingStep) * 0.5;

        // 边界检查与循环
        // 1. 底部边界
        if (this.y > height + 10) {
            this.init(false);
        }
        // 2. 左右边界循环（无缝衔接）
        if (this.x > width + 10) {
            this.x = -10;
        } else if (this.x < -10) {
            this.x = width + 10;
        }
    }

    draw() {
        // 使用 drawImage 替代 createRadialGradient，性能极大提升
        const drawSize = particleSize * 2 * this.scale;
        
        // 居中绘制图片
        ctx.drawImage(
            offscreenCanvas, 
            this.x - drawSize / 2, 
            this.y - drawSize / 2, 
            drawSize, 
            drawSize
        );
    }
}

// 4. 初始化
const snowflakes = [];
const numberOfSnowflakes = 200;

for (let i = 0; i < numberOfSnowflakes; i++) {
    snowflakes.push(new Snowflake());
}

// 5. 动画循环
function animate() {
    ctx.clearRect(0, 0, width, height);

    // 使用普通 for 循环比 forEach 稍微快一点点（在大量数据下）
    for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];
        flake.update();
        flake.draw();
    }

    requestAnimationFrame(animate);
}

animate();

// 6. Resize 优化
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // 不再调用 reset()，让雪花继续自然下落，避免闪烁
});
