# Memory Skill

长期记忆家庭消费行为，支持记录和查询。

## 功能

1. **消费历史记录** - 记录每次消费意图
2. **偏好学习** - 从历史中学习消费偏好
3. **预算追踪** - 追踪预算区间
4. **品牌记忆** - 记住偏好的品牌

## 记录结构

```json
{
  "family_id": "A",
  "records": [
    {
      "id": "record_1",
      "intent_type": "education",
      "product": "书包",
      "target": "孩子",
      "budget": 300,
      "timestamp": "2026-03-13T10:00:00",
      "completed": true
    }
  ]
}
```

## 使用方法

```python
from consumption_memory import ConsumptionMemory

memory = ConsumptionMemory()

# 记录消费
memory.record(
    family_id="A",
    intent_type="education",
    product="书包",
    target="孩子",
    budget=300,
    completed=True
)

# 查询历史
history = memory.get_history("A", intent_type="education")

# 获取偏好
preferences = memory.get_preferences("A")
```

## 查询功能

- 按类型查询
- 按时间范围查询
- 获取最近 N 条
- 统计消费频次
