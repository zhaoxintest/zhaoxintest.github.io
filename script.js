// 游戏状态变量
let snake = [];
let food = null;
let direction = 'right';
let gameLoop = null;
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
    
    // 绘制网格
    ctx.strokeStyle = '#ddd';
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头使用深色
            ctx.fillStyle = '#388E3C';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
    
    // 绘制食物
    ctx.fillStyle = '#F44336';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
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
    clearInterval(gameLoop);
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
    
    gameLoop = setInterval(() => {
        if (isGameRunning) {
            update();
            draw();
        }
    }, speed);
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