const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3847;
const MEMORY_FILE = path.join(__dirname, 'MEMORY.md');
const SKILLS_DIR = path.join(__dirname, 'skills', 'family-consumption-intent');

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
}

function readMemory() {
    try {
        if (fs.existsSync(MEMORY_FILE)) {
            return fs.readFileSync(MEMORY_FILE, 'utf-8');
        }
    } catch (e) {}
    return '';
}

function writeMemory(content) {
    fs.writeFileSync(MEMORY_FILE, content, 'utf-8');
}

function updateFamilyProfiles(profiles) {
    const content = readMemory();
    
    const profileSection = profiles.map(p => {
        return `## ${p.family_name}
- 成员: ${p.members}
- 收入水平: ${p.income_level}
- 消费习惯: ${p.spending_habit}
- 有小孩: ${p.has_child ? '是' : '否'}
- 有老人: ${p.has_elderly ? '是' : '否'}
- 有孕妇: ${p.has_pregnant ? '是' : '否'}
- 更新时间: ${new Date(p.updated_at).toLocaleString()}`;
    }).join('\n\n');
    
    if (content.includes('## 家庭画像（当前）')) {
        const regex = /## 家庭画像（当前）[\s\S]*?(?=\n## |\n# |\Z)/;
        const newContent = content.replace(regex, `## 家庭画像（当前）\n\n${profileSection}\n`);
        writeMemory(newContent);
    } else {
        writeMemory(content + '\n\n## 家庭画像（当前）\n\n' + profileSection);
    }
    
    return { success: true };
}

// 更新消费意图记录
function updateIntentRecords(data) {
    const content = readMemory();
    const { family_id, intent, is_complete, recommendations } = data;
    
    if (!is_complete || !intent) {
        return { success: false, message: '意图未完成，不记录' };
    }
    
    // 获取家庭名称
    let familyName = '未知家庭';
    const jsonFile = path.join(SKILLS_DIR, 'family_profile', 'family_profiles.json');
    try {
        if (fs.existsSync(jsonFile)) {
            const families = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
            const family = (families.families || []).find(f => f.family_id === family_id);
            if (family) familyName = family.family_name;
        }
    } catch (e) {}
    
    // 构建表格格式的记录
    const timestamp = new Date().toLocaleString();
    const intentRecord = `| ${timestamp} | ${familyName} | ${intent.object || '-'} | ${intent.target || '-'} | ${intent.scene || '-'} | ${recommendations && recommendations.length > 0 ? recommendations[0].brand + ' ' + recommendations[0].price_range : '-'} | ✅ |`;
    
    // 查找或创建消费意图记录部分
    const sectionHeader = '## 📝 消费意图记录';
    const tableHeader = '| 时间 | 家庭 | 商品 | 消费对象 | 消费场景 | 推荐 | 状态 |';
    const tableSeparator = '|------|------|------|----------|----------|------|------|';
    
    let newContent;
    if (content.includes(sectionHeader)) {
        // 追加到现有部分
        const regex = new RegExp(`(${sectionHeader}[\\s\\S]*?)(?=\\n## |\\n# |\\Z)`);
        newContent = content.replace(regex, `$1\n${intentRecord}`);
    } else {
        // 添加新部分
        newContent = content + `\n\n${sectionHeader}\n\n${tableHeader}\n${tableSeparator}\n${intentRecord}`;
    }
    
    writeMemory(newContent);
    return { success: true };
}

// 简化版：直接在 Node.js 中处理意图识别
function processIntent(text) {
    // 模糊词汇列表 - 这些词不应被识别为具体商品（单独出现时）
    const vagueKeywords = ["礼物", "东西", "物品", "物件", "买点什么", "买点", "看看", "推荐"];
    
    const intentKeywords = {
        "education": ["学习", "补习", "培训", "学校", "书包", "文具", "作业", "学费", "辅导"],
        "appliance": ["冰箱", "空调", "洗衣机", "电视", "家电", "维修", "油烟机", "扫地机器人", "吸尘器", "净化器", "风扇", "电饭煲", "微波炉", "热水器", "煤气灶"],
        "food": ["水果", "零食", "买菜", "做饭", "牛奶", "饮料", "外卖", "餐厅", "海鲜", "蔬菜", "奶粉", "零食", "月饼", "蛋糕", "茶叶"],
        "daily": ["日用品", "牙膏", "洗衣液", "纸巾", "洗发水", "沐浴露", "生活用品", "洗衣粉", "洗手液", "垃圾袋"],
        "digital": ["手机", "电话手表", "电脑", "平板", "笔记本", "耳机", "数码", "电子产品", "相机", "游戏机", "耳机", "音箱", "键盘", "鼠标"],
        "clothing": ["衣服", "鞋子", "裤子", "裙子", "外套", "童装", "成人装", "羽绒服", "运动鞋", "皮鞋", "裙子", "衬衫", "T恤"],
        "entertainment": ["玩具", "游戏", "旅游", "电影", "娱乐", "周末玩", "游乐场", "门票"],
        "baby": ["婴儿车", "遛娃神器", "腰凳", "背带", "尿不湿", "尿不湿", "婴儿床", "儿童床", "儿童椅", "学习桌", "护眼灯", "台灯", "早教机", "点读机", "滑板车", "轮滑鞋"],
        "health": ["体检", "药", "补品", "保健品", "医院", "身体", "看病", "营养品", "血压计", "血糖仪"],
        "service": ["维修", "搬家", "家政", "保洁", "服务", "安装", "清洗", "保养"],
        "sports": ["运动", "跑步", "健身", "球类", "游泳", "自行车", "瑜伽垫", "哑铃", "健身器材"],
        "beauty": ["化妆品", "护肤品", "美容", "美发", "香水", "口红", "面膜", "洗面奶"],
        "pet": ["宠物", "猫", "狗", "狗粮", "猫粮", "宠物用品"],
        "car": ["汽车", "二手车", "新车", "电动车", "自行车", "摩托车"],
        "furniture": ["家具", "床", "沙发", "桌子", "椅子", "衣柜", "橱柜", "书柜", "茶几"],
        "insurance": ["保险", "教育基金", "医疗保险", "意外险"]
    };
    
    const targetKeywords = {
        "孩子": ["孩子", "小孩", "儿子", "女儿", "宝宝", "小朋友"],
        "父母": ["爸爸", "妈妈", "父亲", "母亲", "老人家", "老人", "公婆", "岳父母", "我爸", "我妈", "给爸", "给妈"],
        "家庭": ["家里", "家用", "家里用", "全家", "老婆", "老公", "妻子", "丈夫", "爱人", "太太", "一家人"],
        "自己": ["自己", "给我", "我要", "我想"]
    };
    
    const sceneKeywords = {
        "开学": ["开学", "上学", "新学期", "返校", "开学了"],
        "节日": ["节日", "春节", "中秋", "国庆", "生日", "过年", "六一", "儿童节", "六一儿童节", "情人节", "七夕", "母亲节", "父亲节", "元旦", "除夕", "元宵", "端午", "清明", "劳动节", "教师节", "护士节", "建军节", "圣诞节", "520", "214"],
        "坏了": ["坏了", "不能用了", "坏了想", "破了", "小了", "吃完了", "用完了", "坏了要换", "不能用了要换"],
        "换季": ["换季", "春天", "夏天", "冬天", "秋天", "天冷了", "天热了"],
        "促销": ["促销", "打折", "优惠", "双11", "双十一", "618", "618大促", "清仓", "甩卖"]
    };
    
    // 先检查是否包含模糊词
    const hasVagueWord = vagueKeywords.some(kw => text.includes(kw));
    
    // 识别商品类别 - 只有非模糊词时才识别具体商品
    let intent_type = null;
    let maxScore = 0;
    let detectedObject = null;
    
    if (!hasVagueWord) {
        for (const [type, keywords] of Object.entries(intentKeywords)) {
            const score = keywords.filter(kw => text.includes(kw)).length;
            if (score > maxScore) {
                maxScore = score;
                intent_type = type;
                // 找出匹配的商品关键词
                for (const kw of keywords) {
                    if (text.includes(kw)) {
                        detectedObject = kw;
                        break;
                    }
                }
            }
        }
    }
    
    // 识别消费对象
    let target = null;
    for (const t of ["孩子", "父母", "家庭", "自己"]) {
        const keywords = targetKeywords[t];
        if (keywords && keywords.some(kw => text.includes(kw))) {
            target = t;
            break;
        }
    }
    
    // 识别场景
    let scene = null;
    for (const [s, keywords] of Object.entries(sceneKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            scene = s;
            break;
        }
    }
    
    // 如果只有场景词，没有商品和对象，清空target（避免误识别）
    if (!intent_type && !detectedObject && scene) {
        target = null;
    }
    
    return {
        intent_type: intent_type,
        object: detectedObject,
        target: target,
        scene: scene,
        budget: null,
        time: "future",
        is_complete: !!(intent_type && target && detectedObject)
    };
}

// 简化版追问
// 简化版追问 - 只问核心必填字段：消费对象、商品
// 场景和预算根据家庭画像自动预测
const QUESTIONS = {
    "target": {
        field: "target",
        question: "是给谁购买的？",
        options: [
            {value: "自己", label: "1. 自己"},
            {value: "孩子", label: "2. 孩子"},
            {value: "家庭", label: "3. 家庭"},
            {value: "父母", label: "4. 父母"}
        ]
    },
    "object": {
        field: "object",
        question: "想买什么商品？",
        placeholder: "请输入商品名称"
    }
};

// 追问优先级 - 只追问必填字段：target 和 object
const FILLING_ORDER = ["target", "object"];

// 推荐品牌库
const BRAND_RECS = {
    "education": {
        "rational": [{"brand": "晨光", "products": ["文具套装", "中性笔"], "price": "10-50元"}],
        "frugal": [{"brand": "得力", "products": ["文具套装", "作业本"], "price": "5-20元"}],
        "moderate": [{"brand": "晨光", "products": ["文具盒", "书包"], "price": "30-100元"}],
        "generous": [{"brand": "MUJI", "products": ["文具系列", "笔记本"], "price": "50-200元"}],
        "luxury": [{"brand": "万宝龙", "products": ["钢笔", "铅笔"], "price": "500-3000元"}]
    },
    "appliance": {
        "rational": [{"brand": "海尔", "products": ["冰箱", "洗衣机"], "price": "1000-3000元"}],
        "frugal": [{"brand": "格力", "products": ["空调"], "price": "1500-3000元"}],
        "moderate": [{"brand": "美的", "products": ["冰箱", "空调"], "price": "1000-4000元"}],
        "generous": [{"brand": "戴森", "products": ["吸尘器", "吹风机"], "price": "2000-5000元"}],
        "luxury": [{"brand": "LG", "products": ["冰箱", "电视"], "price": "10000-30000元"}]
    },
    "food": {
        "rational": [{"brand": "应季水果", "products": ["苹果", "香蕉"], "price": "10-30元"}],
        "frugal": [{"brand": "散装食品", "products": ["大米", "面粉"], "price": "20-50元"}],
        "moderate": [{"brand": "盒马", "products": ["海鲜", "水果"], "price": "50-150元"}],
        "generous": [{"brand": "山姆会员店", "products": ["进口食品", "有机食品"], "price": "100-500元"}],
        "luxury": [{"brand": "和牛", "products": ["进口牛肉"], "price": "500-2000元"}]
    }
};

function getRecommendations(intent, familyContext) {
    const styleMap = {"理性": "rational", "节俭": "frugal", "中等": "moderate", "大方": "generous", "奢侈": "luxury"};
    const consumeStyle = familyContext.consume_style || "中等";
    const style = styleMap[consumeStyle] || "moderate";
    
    const typeRecs = BRAND_RECS[intent.intent_type] || BRAND_RECS["food"];
    const brands = typeRecs[style] || typeRecs["moderate"];
    
    return brands.map(b => ({
        brand: b.brand,
        product: b.products[0],
        price_range: b.price,
        reason: consumeStyle === "大方" ? "品质优良，值得信赖" : "性价比高"
    }));
}

// 内存存储（简化版）
let conversationState = {};
let consumptionHistory = {};

async function handleChat(message, familyId, option = null, userId = null) {
    let intent = {};
    
    // 优先从消息中提取意图（每次都重新识别，保留最新信息）
    const newIntent = processIntent(message || option);
    
    // 检查是否包含模糊词（礼物、东西等）
    const vagueKeywords = ["礼物", "东西", "物品", "物件", "买点什么", "买点", "看看", "推荐"];
    const hasVague = vagueKeywords.some(kw => (message || "").includes(kw));
    
    if (conversationState[familyId]) {
        // 有历史上下文，合并新旧意图
        const oldIntent = conversationState[familyId].intent || {};
        
        // 如果新消息包含模糊词，则不使用旧的object
        const useOldObject = newIntent.object || (hasVague ? null : oldIntent.object);
        
        intent = {
            intent_type: newIntent.intent_type || oldIntent.intent_type,
            object: useOldObject,
            target: newIntent.target || oldIntent.target,
            scene: newIntent.scene || oldIntent.scene,
            budget: newIntent.budget || oldIntent.budget,
            time: newIntent.time || oldIntent.time
        };
    } else {
        // 首次对话
        intent = newIntent;
    }
    
    // 保存上下文
    conversationState[familyId] = { 
        intent: intent,
        lastAsked: null
    };
    
    // 检查完整性 - 只检查必填字段：商品、消费对象
    const missing = [];
    if (!intent.object) missing.push("object");
    if (!intent.target) missing.push("target");
    
    const isComplete = missing.length === 0;
    
    // 获取家庭数据用于预测
    const familyData = getFamilyData(familyId, userId);
    
    // 如果信息完整，自动预测场景和预算
    if (isComplete) {
        // 根据商品自动识别类型
        if (!intent.intent_type) {
            intent.intent_type = detectIntentType(intent.object);
        }
        intent.scene = predictScene(intent.object, intent.target);
        intent.budget = predictBudget(intent.intent_type, familyData.consume_style);
    }
    
    // 检测商品类型
    function detectIntentType(object) {
        if (!object) return null;
        const typeMap = {
            "手机": "digital", "电脑": "digital", "平板": "digital", "笔记本": "digital", "耳机": "digital",
            "电视": "appliance", "冰箱": "appliance", "空调": "appliance", "洗衣机": "appliance",
            "衣服": "clothing", "裤子": "clothing", "裙子": "clothing", "鞋子": "clothing", "外套": "clothing",
            "书包": "education", "文具": "education", "书": "education",
            "玩具": "entertainment", "游戏": "entertainment",
            "手表": "digital", "首饰": "beauty", "化妆品": "beauty", "护肤品": "beauty",
            "水果": "food", "零食": "food", "菜": "food",
            "运动": "sports", "健身": "sports",
            "宠物": "pet", "猫": "pet", "狗": "pet",
            "汽车": "car", "车": "car"
        };
        return typeMap[object] || "daily";
    }
    
    // 生成追问或推荐 - 只追问必填字段
    let nextQuestion = null;
    let recommendations = [];
    
    if (!isComplete) {
        // 按优先级选择追问字段
        for (const field of FILLING_ORDER) {
            if (missing.includes(field)) {
                nextQuestion = QUESTIONS[field];
                // 记录当前追问的字段
                conversationState[familyId].lastAsked = field;
                break;
            }
        }
    } else {
        // 生成推荐
        recommendations = getRecommendations(intent, familyData);
        
        // 记录历史
        if (!consumptionHistory[familyId]) consumptionHistory[familyId] = [];
        consumptionHistory[familyId].unshift({
            intent_type: intent.intent_type,
            product: intent.object || "待定",
            target: intent.target,
            budget: intent.budget,
            timestamp: new Date().toISOString(),
            completed: false
        });
    }
    
    return {
        intent: intent,
        current_intent: intent,
        is_complete: isComplete,
        missing_fields: missing,
        next_question: nextQuestion ? nextQuestion.question : null,
        recommendations: isComplete ? recommendations : [],
        // 当信息不完整时，hide_details=true，前端只显示追问问题
        hide_details: !isComplete
    };
}

// 根据商品和使用对象预测场景
function predictScene(object, target) {
    const sceneMap = {
        "自己": ["自己", "给我", "我要"],
        "手机": { "孩子": "日常", "父母": "节日", "自己": "日常" },
        "自己": ["自己", "给我", "我要"],
        "电脑": { "孩子": "开学", "父母": "节日", "自己": "日常" },
        "自己": ["自己", "给我", "我要"],
        "手表": { "孩子": "节日", "父母": "节日", "自己": "日常" },
        "自己": ["自己", "给我", "我要"],
        "衣服": { "孩子": "换季", "父母": "节日", "自己": "换季" },
        "书包": { "孩子": "开学", "自己": "日常" },
        "玩具": { "孩子": "节日", "自己": "日常" }
    };
    
    // 模糊匹配
    for (const [key, scenes] of Object.entries(sceneMap)) {
        if (object && object.includes(key)) {
            return scenes[target] || "日常";
        }
    }
    return "日常";
}

// 根据商品类型和家庭消费风格预测预算
function predictBudget(intent_type, consumeStyle) {
    const styleBudget = {
        "frugal": { "digital": "1000-2000", "appliance": "2000-3000", "education": "50-100", "clothing": "100-300", "entertainment": "50-200" },
        "rational": { "digital": "2000-4000", "appliance": "3000-5000", "education": "100-300", "clothing": "300-500", "entertainment": "100-300" },
        "moderate": { "digital": "3000-5000", "appliance": "4000-6000", "education": "200-500", "clothing": "500-1000", "entertainment": "200-500" },
        "generous": { "digital": "5000-8000", "appliance": "6000-10000", "education": "500-1000", "clothing": "1000-2000", "entertainment": "500-1000" },
        "luxury": { "digital": "10000+", "appliance": "10000+", "education": "1000+", "clothing": "2000+", "entertainment": "1000+" },
        "中等": { "digital": "3000-5000", "appliance": "4000-6000", "education": "200-500", "clothing": "500-1000", "entertainment": "200-500" },
        "节俭": { "digital": "1000-2000", "appliance": "2000-3000", "education": "50-100", "clothing": "100-300", "entertainment": "50-200" },
        "理性": { "digital": "2000-4000", "appliance": "3000-5000", "education": "100-300", "clothing": "300-500", "entertainment": "100-300" },
        "大方": { "digital": "5000-8000", "appliance": "6000-10000", "education": "500-1000", "clothing": "1000-2000", "entertainment": "500-1000" },
        "奢侈": { "digital": "10000+", "appliance": "10000+", "education": "1000+", "clothing": "2000+", "entertainment": "1000+" }
    };
    
    const style = consumeStyle || "中等";
    const budgetMap = styleBudget[style] || styleBudget["中等"];
    return budgetMap[intent_type] || "待定";
}

function getFamilyData(familyId, userId = null) {
    // 优先根据 userId 加载对应用户画像
    if (userId) {
        const userFile = path.join(__dirname, '..', 'workspace-family_consumption_intent', 'USER', `USER_${userId}.md`);
        try {
            if (fs.existsSync(userFile)) {
                const content = fs.readFileSync(userFile, 'utf-8');
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const familyData = JSON.parse(jsonMatch[1]);
                    return {
                        income_level: familyData.income_level || "中",
                        consume_style: familyData.consume_style || "中等",
                        has_child: familyData.has_child
                    };
                }
            }
        } catch (e) {
            console.log('读取USER文件失败:', e.message);
        }
    }
    
    // 备选：从默认 USER.md 读取
    const userFile = path.join(__dirname, '..', 'workspace-family_consumption_intent', 'USER', 'USER.md');
    
    try {
        if (fs.existsSync(userFile)) {
            const content = fs.readFileSync(userFile, 'utf-8');
            // 从 USER.md 中提取 JSON 部分
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                const familyData = JSON.parse(jsonMatch[1]);
                return {
                    income_level: familyData.income_level || "中",
                    consume_style: familyData.consume_style || "中等",
                    has_child: familyData.has_child
                };
            }
        }
    } catch (e) {
        console.log('读取USER.md失败:', e.message);
    }
    
    // 备选：从 JSON 文件读取
    const jsonFile = path.join(SKILLS_DIR, 'family_profile', 'family_profiles.json');
    try {
        if (fs.existsSync(jsonFile)) {
            const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
            const family = (data.families || []).find(f => f.family_id === familyId) || (data.families ? data.families[0] : null);
            if (family) {
                return {
                    income_level: family.income_level || "中",
                    consume_style: family.consume_style || "中等",
                    has_child: family.has_child
                };
            }
        }
    } catch (e) {}
    return { income_level: "中", consume_style: "中等" };
}

function getHistory(familyId) {
    return consumptionHistory[familyId] || [];
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        if (req.url === '/api/sync-family' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = updateFamilyProfiles(body.profiles || []);
            res.writeHead(200);
            res.end(JSON.stringify(result));
        } 
        else if (req.url === '/api/sync-intent' && req.method === 'POST') {
            // 同步意图识别结果到 MEMORY.md
            const body = await parseBody(req);
            const result = updateIntentRecords(body);
            res.writeHead(200);
            res.end(JSON.stringify(result));
        } 
        else if (req.url === '/api/families' && req.method === 'GET') {
            const jsonFile = path.join(SKILLS_DIR, 'family_profile', 'family_profiles.json');
            if (fs.existsSync(jsonFile)) {
                const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
                res.writeHead(200);
                res.end(JSON.stringify(data.families || []));
            } else {
                // 返回默认家庭
                res.writeHead(200);
                res.end(JSON.stringify([{
                    family_id: "family_1",
                    family_name: "吴海超家",
                    members: ["爸爸", "妈妈", "孩子"],
                    income_level: "高",
                    consume_style: "大方",
                    has_child: true
                }]));
            }
        }
        else if (req.url === '/api/chat' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await handleChat(
                body.message,
                body.family_id || "family_1",
                body.option,
                body.userId
            );
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }
        else if (req.url.startsWith('/api/history') && req.method === 'GET') {
            const url = new URL(req.url, `http://localhost:${PORT}`);
            const familyId = url.searchParams.get('family_id') || 'family_1';
            const history = getHistory(familyId);
            res.writeHead(200);
            res.end(JSON.stringify(history));
        }
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } catch (e) {
        console.error('Error:', e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
});

server.listen(PORT, () => {
    console.log(`🎯 家庭消费意图识别服务已启动: http://localhost:${PORT}`);
});
