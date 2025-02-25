const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const chatbot = require('./chatbot');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 处理WebSocket连接
wss.on('connection', (ws) => {
    console.log('新用户连接');
    
    // 为新用户生成随机ID
    const userId = Math.random().toString(36).substring(7);
    ws.userId = userId;

    // 发送欢迎消息
    ws.send(JSON.stringify({
        type: 'system',
        content: `欢迎来到聊天室！你的ID是: ${userId}`
    }));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'chat':
                    // 发送用户消息给自己
                    ws.send(JSON.stringify({
                        type: 'chat',
                        userId: ws.userId,
                        content: message.content,
                        timestamp: new Date().toISOString(),
                        isSelf: true
                    }));

                    // 延迟一下再发送机器人回复
                    setTimeout(() => {
                        const botResponse = chatbot.process(message.content, ws.userId);
                        ws.send(JSON.stringify({
                            type: 'chat',
                            userId: 'Bot🤖',
                            content: botResponse,
                            timestamp: new Date().toISOString(),
                            isBot: true
                        }));
                    }, 1000);
                    break;
                    
                case 'typing':
                    // 可以选择是否保留输入状态提示
                    break;
            }
        } catch (e) {
            console.error('消息处理错误:', e);
        }
    });

    ws.on('close', () => {
        console.log('用户断开连接:', ws.userId);
    });
});

// 每天清理一次聊天记录
setInterval(() => {
    chatbot.cleanup();
}, 24 * 60 * 60 * 1000);

// 静态文件服务
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});