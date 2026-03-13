---
name: family-intent-recognition
description: "家庭消费意图识别 V3.1 - 智能识别消费意图，支持家庭画像和个性化建议"
homepage: https://github.com/openclaw/skills
metadata:
  clawdbot:
    emoji: "🎯"
    requires:
      bins: ["python3"]
---

# 家庭消费意图识别 V3.1

从家庭成员的日常聊天文本中识别是否存在消费意图，并输出结构化JSON结果。支持家庭画像和个性化消费建议。

## V3.1 新增功能

- 🏠 **家庭画像** - 支持设置家庭成员、收入水平、消费习惯
- 💡 **智能建议** - 根据画像和商品类别给出个性化消费建议
- 👨‍👩‍👧 **成员管理** - 支持家长、小孩、老人、孕妇等成员

## 消费意图定义

用户表达出可能购买某种商品或服务的需求、兴趣、计划、比较、询问价格或评价等行为。

**示例：**
- 想买
- 需要换一个
- 有没有推荐
- 这个多少钱
- 最近想换
- 这个好不好

## 输出格式

```json
{
  "has_intent": true,
  "intent_category": "餐饮",
  "intent_stage": "awareness",
  "intent_strength": "low",
  "keywords": ["火锅"],
  "product": "火锅",
  "reason": "用户只是提到或对某商品表达兴趣",
  "family_profile": {
    "family_name": "吴海超家",
    "members": ["爸爸", "妈妈"],
    "income_level": "高",
    "spending_habit": "中等",
    "has_child": true
  },
  "spending_advice": "经济条件较好，可以考虑品质更好的产品"
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| has_intent | boolean | 是否存在消费意图 |
| intent_category | string | 商品类别 |
| intent_stage | string | 意图阶段 (awareness/consideration/purchase) |
| intent_strength | string | 意图强度 (low/medium/high) |
| keywords | array | 触发关键词列表 |
| product | string | 具体商品名称 |
| reason | string | 判断理由 |
| family_profile | object | 家庭画像信息 |
| spending_advice | string | 个性化消费建议 |

## 意图阶段

| 阶段 | 说明 | 示例 |
|------|------|------|
| awareness | 兴趣阶段，只是提到某类商品或表达兴趣 | "明天去吃火锅吧"、"想买电脑" |
| consideration | 考虑阶段，询问价格、评价、品牌、对比 | "电脑多少钱？"、"哪个牌子好" |
| purchase | 购买阶段，明确表达想买、准备买、需要买 | "买了手机"、"打算买电脑" |

## 意图强度

| 强度 | 说明 |
|------|------|
| low | 只是轻微提及 |
| medium | 有一定兴趣或讨论 |
| high | 明确表达购买意图或已完成购买 |

## 商品类别

- 家电
- 数码产品
- 电脑外设
- 家具
- 食品饮料
- 服装鞋帽
- 日用品
- 汽车
- 交通工具
- 母婴用品
- 娱乐产品
- 教育培训
- 医疗保健
- 通讯费
- 水电燃气
- 餐饮
- 服务

## 家庭画像

### 设置画像

```bash
python3 family_profile.py set family_name "我的家庭"
python3 family_profile.py set members "爸爸,妈妈"
python3 family_profile.py set income_level 高/中/低
python3 family_profile.py set spending_habit 节俭/中等/大方
python3 family_profile.py set has_child true/false
python3 family_profile.py set has_elderly true/false
python3 family_profile.py set has_pregnant true/false
```

### 查看画像

```bash
python3 family_profile.py get
```

## 使用方法

### 命令行调用

```bash
python3 intent_classifier.py "想买一台电脑"
```

### API 服务

```bash
# 启动 API 服务
python3 api.py

# 意图识别
curl -X POST http://localhost:5000/intent -H "Content-Type: application/json" -d '{"text": "想买手机"}'

# 获取家庭画像
curl http://localhost:5000/profile

# 设置家庭画像
curl -X POST http://localhost:5000/profile -H "Content-Type: application/json" -d '{"family_name": "我家", "members": ["爸爸", "妈妈"], "income_level": "高"}'
```

### Python 调用

```python
from intent_classifier import classify, format_result

result = classify("明天咱们去吃火锅吧")
print(format_result(result))
```

## 消费建议示例

| 商品类别 | 建议 |
|----------|------|
| 水电燃气 | 建议开通自动缴费，避免欠费停电 |
| 母婴用品 | 建议选择安全、环保的产品 |
| 数码产品 | 建议关注售后保修服务 |
| 家电 | 建议选择能效高的产品，省电耐用 |
| 食品饮料 | 注意查看保质期和营养成分 |

---

**版本历史**
- V3.1: 新增家庭画像和个性化消费建议
- V3.0: 初始版本
