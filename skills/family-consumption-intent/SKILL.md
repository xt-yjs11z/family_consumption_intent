# 家庭消费意图识别 Agent

基于 OpenClaw 的智能消费意图识别系统。

## 概述

一个能够在日常聊天中识别用户消费意图，并结合家庭画像提供个性化建议的 AI Agent。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🎯 意图识别 | 从自然语言识别消费需求 |
| 💬 自动追问 | 信息不完整时智能追问 |
| 🏠 多家庭 | 支持多个家庭画像 |
| 📝 长期记忆 | 记录消费历史和偏好 |
| ✨ 个性化推荐 | 结合画像和历史推荐 |

## 系统架构

```
family-consumption-intent/
├── agent.py              # 主程序入口
├── intent_detector.py   # 意图识别
├── slots/
│   └── slot_filler.py   # 槽位填充 + 追问
├── family_profile/
│   └── family_profile.py # 家庭画像管理
├── recommendation/
│   └── recommender.py   # 个性化推荐
└── memory/
    └── consumption_memory.py # 消费记忆
```

## 工作流程

```
用户消息
    │
    ▼
意图识别 (intent_detector)
    │
    ▼
槽位检查 (slot_filler)
    │
 ┌──┴───┐
 │      │
完整   不完整
 │      │
 ▼      ▼
推荐系统  自动追问
 │      │
 ▼      ▼
输出    补充信息
```

## 快速开始

### 1. 创建家庭画像

```python
from family_profile import FamilyProfileManager

manager = FamilyProfileManager()
family_id = manager.create_family({
    "family_name": "吴海超家",
    "members": ["爸爸", "妈妈", "孩子"],
    "income_level": "高",
    "consume_style": "大方",
    "has_child": True
})
```

### 2. 识别消费意图

```python
from agent import ConsumptionAgent

agent = ConsumptionAgent()
response = agent.process_message("孩子要开学了", family_id="family_1")
print(response)
```

### 3. 对话示例

```
你: 孩子要开学了
Agent: 请问是给谁购买的？
    1. 自己
    2. 孩子
    3. 家庭
    4. 父母

你: 2
Agent: 请问想买什么类型的产品？
    1. 学习用品
    2. 家电
    ...

你: 书包
Agent: 预算大概是多少？
    1. 100元以内
    2. 100-300元
    ...

你: 2
Agent: 📋 当前信息：
    类型: education
    对象: 孩子
    商品: 书包

    🎁 为您推荐：
    1. MUJI - 文具系列
       💰 价格: 50-200元
       💡 理由: 品质优良，值得信赖
    2. LAMY - 钢笔
       💰 价格: 100-500元
       ...
```

## Slot 结构

| 字段 | 必填 | 说明 |
|------|------|------|
| intent_type | ✅ | 消费类型 |
| target | ✅ | 消费对象 |
| object | ❌ | 具体商品 |
| budget | ❌ | 预算 |
| time | ❌ | 时间 |
| scene | ❌ | 场景 |

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

## 消费风格

- rational（理性）
- frugal（节俭）
- moderate（中等）
- generous（大方）
- luxury（奢侈）

## API

### ConsumptionAgent

```python
agent = ConsumptionAgent()

# 处理消息
response = agent.process_message("用户消息", family_id="family_1")

# 处理选项
response = agent.handle_option("1")
```

### FamilyProfileManager

```python
manager = FamilyProfileManager()

# 创建家庭
family_id = manager.create_family({...})

# 获取家庭
family = manager.get_family(family_id)

# 列出所有家庭
families = manager.list_families()
```

### ConsumptionMemory

```python
memory = ConsumptionMemory()

# 记录消费
memory.record(family_id, intent_type, product, budget)

# 获取历史
history = memory.get_history(family_id)

# 获取偏好
prefs = memory.get_preferences(family_id)
```

## 配置

- 家庭画像存储: `family_profile/family_profiles.json`
- 消费历史存储: `memory/consumption_history.json`

## 依赖

- Python 3.8+
- 无需额外依赖（纯 Python 实现）
