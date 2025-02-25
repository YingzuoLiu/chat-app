// chatbot.js
class Chatbot {
    constructor() {
        this.patterns = [
            {
                pattern: /(你好|hello|hi|嗨)/i,
                responses: [
                    "你好！很高兴见到你！",
                    "嗨！有什么我可以帮你的吗？",
                    "你好啊！今天过得怎么样？"
                ]
            },
            {
                pattern: /(天气|weather)/i,
                responses: [
                    "今天是个好天气呢！",
                    "要记得带伞哦，以防下雨。",
                    "是个适合出门的好天气！"
                ]
            },
            {
                pattern: /(名字|叫什么|who are you)/i,
                responses: [
                    "我是小助手机器人，很高兴认识你！",
                    "我叫小助手，随时都可以找我聊天哦！",
                    "你可以叫我小助手~"
                ]
            },
            {
                pattern: /(时间|几点|what time)/i,
                responses: [
                    () => `现在的时间是：${new Date().toLocaleTimeString()}`,
                    () => `当前时间：${new Date().toLocaleTimeString()}`
                ]
            },
            {
                pattern: /(笑话|joke)/i,
                responses: [
                    "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25",
                    "据说程序员最怕什么？怕他写的代码被别人维护。",
                    "如何让程序员疯掉？给他一个文件命名为 final.txt, final2.txt, final_final.txt"
                ]
            }
        ];

        this.defaultResponses = [
            "抱歉，我没太明白你的意思。",
            "这个问题有点难，我还在学习中...",
            "你能换个方式问我吗？",
            "让我想想怎么回答比较好...",
            "这个问题很有趣，不过我现在还回答不了。"
        ];

        // 用户对话历史记录
        this.chatHistory = new Map();
    }

    getRandomResponse(responses) {
        const index = Math.floor(Math.random() * responses.length);
        const response = responses[index];
        return typeof response === 'function' ? response() : response;
    }

    process(message, userId) {
        // 记录用户对话历史
        if (!this.chatHistory.has(userId)) {
            this.chatHistory.set(userId, []);
        }
        const history = this.chatHistory.get(userId);
        history.push({ user: message, timestamp: new Date() });

        // 匹配回复
        for (const {pattern, responses} of this.patterns) {
            if (pattern.test(message)) {
                const response = this.getRandomResponse(responses);
                history.push({ bot: response, timestamp: new Date() });
                return response;
            }
        }

        // 如果没有匹配的模式，使用默认回复
        const defaultResponse = this.getRandomResponse(this.defaultResponses);
        history.push({ bot: defaultResponse, timestamp: new Date() });
        return defaultResponse;
    }

    // 清理超过24小时的聊天记录
    cleanup() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        for (const [userId, history] of this.chatHistory.entries()) {
            const recentMessages = history.filter(msg => msg.timestamp > oneDayAgo);
            if (recentMessages.length === 0) {
                this.chatHistory.delete(userId);
            } else {
                this.chatHistory.set(userId, recentMessages);
            }
        }
    }
}

module.exports = new Chatbot();