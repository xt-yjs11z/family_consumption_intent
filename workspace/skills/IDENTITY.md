# Intent Detection Skill

从用户聊天中识别消费意图，提取关键信息。

## 功能

- 识别消费类型（教育、家电、食品、日用品等）
- 提取消费对象（自己、孩子、家庭、父母）
- 识别消费场景（开学、节日、坏了、想买等）
- 估算预算范围
- 判断时间紧迫性

## 输出格式

```json
{
  "intent_type": "education",
  "object": "schoolbag",
  "target": "child",
  "scene": "school_start",
  "budget": null,
  "time": "future"
}
```

## 消费类型

- education（教育）
- appliance（家电）
- food（食品）
- daily（日用品）
- digital（数码产品）
- clothing（服装鞋帽）
- entertainment（娱乐）
- health（医疗保健）
- service（服务）

## 使用方法

```bash
python3 intent_detector.py "孩子要开学了"
```

## 识别逻辑

1. 关键词匹配 → 消费类型
2. 语义理解 → 消费对象、场景
3. 预算估算 → 从上下文推断
