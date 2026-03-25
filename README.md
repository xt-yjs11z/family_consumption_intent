# 🏠 家庭消费意图识别系统

智能识别家庭消费意图，支持 LLM 驱动和规则匹配双模式。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🎯 意图识别 | 智能识别消费意图 |
| 🤖 LLM 驱动 | 支持 MiniMax 大模型 |
| 📷 图片 OCR | 支持图片识别消费意图 |
| 🏠 家庭画像 | 个性化用户画像 |
| 💬 LLM 对话 | AI 助手对话功能 |
| 💡 消费建议 | 基于画像的个性化建议 |

## 🚀 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

**OCR 额外依赖：**
- macOS: `brew install tesseract`
- Ubuntu/Debian: `sudo apt install tesseract-ocr`

### 2. 启动服务

```bash
python3 api.py
```

访问地址：
- API: http://localhost:5000
- 意图识别: http://localhost:5000/intent
- 家庭画像: http://localhost:5000/profile
- LLM 对话: http://localhost:5000/chat

### 3. 启动 Web 前端

```bash
# 方法1: 直接打开 HTML 文件
# family-intent-frontend.html

# 方法2: 使用 HTTP 服务器
python3 -m http.server 8080
# 浏览器访问: http://localhost:8080/family-intent-frontend.html
```

### 4. 局域网访问

```bash
hostname -I | awk '{print $1}'
# 访问: http://<IP>:8080/family-intent-frontend.html
```

## 📡 API 示例

### 意图识别

```bash
curl -X POST http://localhost:5000/intent \
  -H "Content-Type: application/json" \
  -d '{"text":"想买一台电脑"}'
```

返回：
```json
{
  "intent": true,
  "category": "数码产品",
  "target": "电脑",
  "scenario": "自用",
  "budget": "",
  "time": "",
  "location": "",
  "user_profile": "收入低，消费节俭...",
  "motivation": ""
}
```

### 设置家庭画像

```bash
curl -X POST http://localhost:5000/profile \
  -H "Content-Type: application/json" \
  -d '{
    "family_name": "吴海超家",
    "members": ["爸爸", "妈妈"],
    "income_level": "高",
    "spending_habit": "中等",
    "has_child": true
  }'
```

### LLM 对话

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"推荐一款手机"}'
```

### 图片识别

```bash
curl -X POST http://localhost:5000/intent/image \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_encoded_image_data"}'
```

## ⚙️ 配置 LLM

修改 `intent_classifier.py`：

```python
LLM_API_URL = "https://api.minimaxi.com/v1/text/chatcompletion_v2"
LLM_MODEL = "abab6.5s-chat"
LLM_API_KEY = "your-api-key"
```

## 📁 目录结构

```
.
├── api.py                     # Flask API 服务
├── intent_classifier.py       # 意图识别核心
├── family_profile.py          # 家庭画像管理
├── cli.py                     # 命令行工具
├── family-intent-frontend.html # Web 前端
└── requirements.txt           # 依赖清单
```

## 📦 依赖

```
flask
flask-cors
requests
pytesseract  # 可选
```

## 📄 许可证

MIT
