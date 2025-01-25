const express = require('express');
const path = require('path');
const app = express();

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 设置端口
const port = process.env.PORT || 3000;

// 启动服务器
app.listen(port, () => {
    const interfaces = require('os').networkInterfaces();
    const addresses = [];
    
    // 获取所有网络接口的IP地址
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    
    console.log('服务器已启动！');
    console.log(`本地访问: http://localhost:${port}`);
    console.log('局域网访问:');
    addresses.forEach(ip => {
        console.log(`http://${ip}:${port}`);
    });
});