# family_consumption_intent - 家庭消费意图识别 Agent

通过飞书消息识别家庭成员消费意图的 AI Agent。

## 目录结构

```
family_consumption_intent/
├── workspace/                          # Agent 工作目录
│   ├── IDENTITY.md                   # Agent 身份定义
│   ├── USER.md                       # 默认用户配置
│   ├── USER/                         # 用户配置目录
│   │   ├── USER_wuhaichao.md         # 吴海超的配置
│   │   ├── USER_lihua.md            # 其他用户配置
│   │   └── ...
│   ├── SOUL.md                       # Agent 核心价值观
│   ├── TOOLS.md                      # 工具说明
│   ├── AGENTS.md                     # 工作流程规范
│   ├── HEARTBEAT.md                  # 定期任务
│   ├── skills/                       # 技能库
│   │   └── family-consumption-intent/
│   │       ├── SKILL.md              # 技能规范
│   │       ├── agent.py              # 主入口
│   │       ├── intent_detector.py   # 意图识别
│   │       ├── family_profile/      # 家庭画像
│   │       ├── slots/               # 槽位填充
│   │       ├── recommendation/      # 推荐系统
│   │       └── memory/              # 记忆存储
│   ├── memory/                       # 用户记忆文件
│   │   ├── wuhaichao.md
│   │   └── ...
│   └── .openclaw/                    # OpenClaw 配置
│
├── agent-config/                     # Agent 运行配置
│   └── family_consumption_intent/
│       ├── agent/                    # 模型配置
│       │   ├── models.json
│       │   └── auth-profiles.json
│       └── sessions/                 # 会话存储
│
└── config/                          # OpenClaw 配置
    └── family-consumption-intent.json
```

## 功能 Features

| 能力 | 说明 |
|------|------|
| 🎯 意图识别 | 从飞书消息识别消费意图（商品+对象） |
| 💬 自动追问 | 信息不完整时智能追问 |
| 👥 多家庭支持 | 管理多个家庭成员不同消费特征 |
| 📝 记忆存储 | 记录用户消费历史和偏好 |

## 消费意图结构

### 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| target | 消费对象 | 自己、孩子、父母、家庭 |
| object | 商品 | 手机、电脑、空调 |

### 自动识别字段

| 字段 | 说明 | 示例 |
|------|------|------|
| intent_type | 商品类别 | digital, appliance, education |
| scene | 使用场景 | 节日、开学、坏了 |
| budget | 预算范围 | 根据用户画像预测 |

## 消费类型

- education（教育/学习）
- appliance（家电）
- food（食品）
- daily（日用品）
- digital（数码）
- clothing（服装）
- entertainment（娱乐）
- health（医疗保健）
- service（服务）

## 工作流程

```
飞书消息 → 意图识别 → 槽位检查 → (追问/输出结果)
```

### 1. 意图识别

解析消息，提取：
- 消费对象（target）：自己、孩子、父母、家庭
- 商品（object）：手机、电脑、空调等

### 2. 槽位检查

检查必填字段是否完整

### 3. 决策

| 状态 | 动作 |
|------|------|
| 信息完整 | 输出识别结果 + 预算预测 + 选购建议 |
| 信息不完整 | 追问缺失字段 |

## 快速开始

### 1. 配置飞书机器人

在 OpenClaw 中配置飞书机器人凭证。

### 2. 启动 Agent

```bash
openclaw start
```

### 3. 测试

在飞书中发送消息：

| 对话示例 | 识别结果 |
|----------|----------|
| 给孩子买手机 | 消费对象：孩子，商品：手机 |
| 买空调 | 消费对象：家庭，商品：空调 |
| 过年给父母买礼物 | 消费对象：父母，商品：待补充 |

## 用户配置

### 配置结构 (USER/USER_{userId}.md)

```json
{
  "family_id": "family_1",
  "family_name": "吴海超家",
  "members": ["爸爸", "妈妈", "孩子"],
  "income_level": "高",
  "consume_style": "大方",
  "has_child": true
}
```

### 消费风格与预算

| 风格 | 数码 | 家电 | 教育 |
|------|------|------|------|
| 节俭 | 1000-2000 | 2000-3000 | 50-100 |
| 理性 | 2000-4000 | 3000-5000 | 100-300 |
| 适度 | 3000-5000 | 4000-6000 | 200-500 |
| 大方 | 5000-8000 | 6000-10000 | 500-1000 |
| 奢侈 | 10000+ | 10000+ | 1000+ |

## 对话示例

### 完整识别

```
用户：给孩子买手机
Agent：✅ 识别完成！
  - 消费对象：孩子
  - 商品：手机
  - 类型：digital
  - 预算：5000-8000
  - 建议：...
```

### 需要追问

```
用户：我想买礼物
Agent：想买什么商品？
```

## 技术栈

- **运行时**: OpenClaw
- **消息通道**: 飞书/Lark
- **语言**: Python 3
- **模型**: MiniMax

## 注意事项

- 追问时只显示问题，不显示选项列表
- 不推荐具体产品型号，只提供选购方向
- 模糊词（礼物、东西）不识别为商品
