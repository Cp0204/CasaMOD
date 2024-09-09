// 创建画布并添加到文档主体
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: blur(2px); /* 添加高斯模糊效果 */
`;
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 雪花类定义
class Snowflake {
    constructor(x, y, size, speed, wind) {
        this.x = x || Math.random() * canvas.width; // 雪花的X坐标随机分布
        this.y = y || Math.random() * -canvas.height; // 雪花的Y坐标从屏幕上方开始
        this.size = size || (Math.random() * 5 + 2); // 雪花的大小随机
        this.speed = speed || (Math.random() * 1 + 0.5); // 雪花下落的速度随机
        this.wind = wind || (Math.random() * 2 - 1); // 水平漂移随机
    }

    reset() {
        this.x = Math.random() * canvas.width; // 雪花的X坐标随机分布
        this.y = Math.random() * -canvas.height; // 雪花的Y坐标从屏幕上方开始
    }

    update() {
        this.y += this.speed; // 更新雪花的Y坐标
        this.x += this.wind; // 更新雪花的X坐标，使雪花有水平漂移的效果

        // 当雪花飘出屏幕下方时，重置雪花到上方
        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        // 使用径向渐变创建透明边缘的雪花
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // 中心不透明
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)'); // 边缘透明
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // 绘制圆形雪花
        ctx.fill();
    }
}

// 创建雪花数组
const snowflakes = [];
const numberOfSnowflakes = 200; // 生成200个雪花
for (let i = 0; i < numberOfSnowflakes; i++) {
    snowflakes.push(new Snowflake());
}

// 动画循环函数
function animate() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制每一片雪花
    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });

    // 递归调用动画
    requestAnimationFrame(animate);
}

animate(); // 开始动画

// 监听窗口大小变化，更新画布尺寸
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 重新初始化雪花的位置，避免重置时超出画布
    snowflakes.forEach(snowflake => {
        snowflake.reset();
    });
});