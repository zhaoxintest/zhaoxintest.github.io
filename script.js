// 游戏状态变量
let snake = [];
let food = null;
let direction = 'right';
let gameInterval = null;
let score = 0;
let isGameRunning = false;

// 游戏配置
const config = {
    easy: { speed: 200, points: 1 },
    medium: { speed: 150, points: 2 },
    hard: { speed: 100, points: 3 }
};

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = 400;
canvas.height = 400;

// 网格配置
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
    // 生成食物
    generateFood();
    
    // 重置分数
    score = 0;
    document.getElementById('score').textContent = score;
    
    // 重置方向
    direction = 'right';
}

// 生成食物
function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 确保食物不会生成在蛇身上
        if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            break;
        }
    }
}

// 更新游戏状态
function update() {
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向更新蛇头位置
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 移动蛇
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        const difficulty = document.getElementById('difficulty').value;
        score += config[difficulty].points;
        document.getElementById('score').textContent = score;
        
        // 生成新食物
        generateFood();
        
        // 播放音效
        playSound('eat');
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
}

// 检查碰撞
function checkCollision(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查是否撞到自己
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!isGameRunning && snake.length === 0) {
        // 显示欢迎语
        ctx.fillStyle = '#388E3C';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('欢迎体验贪吃蛇小游戏', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const radius = gridSize / 2;

        // 绘制蛇身
        ctx.beginPath();
        ctx.arc(x + gridSize/2, y + gridSize/2, radius * 0.8, 0, Math.PI * 2);
        
        // 创建渐变色
        const gradient = ctx.createRadialGradient(
            x + gridSize/2, y + gridSize/2, radius * 0.3,
            x + gridSize/2, y + gridSize/2, radius * 0.8
        );
        // 蛇头使用绿色渐变，蛇身保持红色
        if (index === 0) {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#388E3C');
        } else {
            gradient.addColorStop(0, '#FF5252');
            gradient.addColorStop(1, '#F44336');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加光泽效果
        ctx.beginPath();
        ctx.arc(x + gridSize/2 - radius/4, y + gridSize/2 - radius/4, radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 为蛇头添加眼睛
        if (index === 0) {
            // 左眼
            ctx.beginPath();
            ctx.arc(x + gridSize/3, y + gridSize/2, radius/4, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + gridSize/3, y + gridSize/2, radius/8, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();

            // 右眼
            ctx.beginPath();
            ctx.arc(x + gridSize*2/3, y + gridSize/2, radius/4, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + gridSize*2/3, y + gridSize/2, radius/8, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    });
    
    // 绘制食物
    if (food) {
        const x = food.x * gridSize;
        const y = food.y * gridSize;
        const radius = gridSize / 2;
        
        ctx.beginPath();
        ctx.arc(x + gridSize/2, y + gridSize/2, radius * 0.8, 0, Math.PI * 2);
        
        // 创建径向渐变
        const gradient = ctx.createRadialGradient(
            x + gridSize/2, y + gridSize/2, radius * 0.3,
            x + gridSize/2, y + gridSize/2, radius * 0.8
        );
        gradient.addColorStop(0, '#FF5252');
        gradient.addColorStop(1, '#F44336');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加光泽效果
        ctx.beginPath();
        ctx.arc(x + gridSize/2 - radius/4, y + gridSize/2 - radius/4, radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

// 游戏主循环
function gameLoop() {
    if (!isGameRunning) return;
    update();
    draw();
}

// 游戏结束处理
function gameOver() {
    isGameRunning = false;
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    playSound('gameover');
    
    // 更新最终分数
    document.getElementById('finalScore').textContent = score;
    
    // 更新排行榜
    updateLeaderboard();
    
    // 显示游戏结束弹窗
    document.getElementById('gameOver').style.display = 'flex';
}

// 更新排行榜
function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 5); // 只保留前5名
    
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = leaderboard
        .map((score, index) => `<div>${index + 1}. ${score}分</div>`)
        .join('');
}

// 播放音效
function playSound(type) {
    const audio = new Audio(`assets/sounds/${type}.mp3`);
    audio.play().catch(error => console.log('音效播放失败:', error));
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') direction = 'right';
            break;
    }
});

// 移动端控制
const hammer = new Hammer(canvas);
hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

hammer.on('swipe', (e) => {
    if (!isGameRunning) return;
    
    const angle = e.angle;
    if (angle > -45 && angle < 45 && direction !== 'left') {
        direction = 'right';
    } else if (angle < -135 || angle > 135 && direction !== 'right') {
        direction = 'left';
    } else if (angle < -45 && angle > -135 && direction !== 'down') {
        direction = 'up';
    } else if (angle > 45 && angle < 135 && direction !== 'up') {
        direction = 'down';
    }
});

// 移动端按钮控制
document.getElementById('upBtn').addEventListener('click', () => {
    if (direction !== 'down') direction = 'up';
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (direction !== 'up') direction = 'down';
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction !== 'right') direction = 'left';
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction !== 'left') direction = 'right';
});

// 开始按钮事件
document.getElementById('startBtn').addEventListener('click', () => {
    if (isGameRunning) return;
    
    initGame();
    isGameRunning = true;
    
    const difficulty = document.getElementById('difficulty').value;
    const speed = config[difficulty].speed;
    
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameInterval = setInterval(gameLoop, speed);
});

// 规则按钮事件
document.getElementById('rulesBtn').addEventListener('click', () => {
    document.getElementById('rules').style.display = 'flex';
});

// 关闭按钮事件
document.getElementById('closeRules').addEventListener('click', () => {
    document.getElementById('rules').style.display = 'none';
});

document.getElementById('closeGameOver').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startBtn').click();
});

// 初始化画布
draw();