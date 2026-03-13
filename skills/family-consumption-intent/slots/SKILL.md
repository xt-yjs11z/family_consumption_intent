# Slot Filling Skill

判断消费意图信息是否完整，并在信息不足时自动追问。

## 功能

1. **完整性检查** - 判断必要字段是否已填充
2. **追问生成** - 根据缺失字段生成追问问题
3. **选项生成** - 提供选择题选项

## 槽位定义

| 字段 | 必填 | 说明 |
|------|------|------|
| intent_type | ✅ | 消费类型 |
| target | ✅ | 消费对象 |
| object | ❌ | 具体商品 |
| scene | ❌ | 消费场景 |
| budget | ❌ | 预算 |
| time | ❌ | 时间 |

## 追问逻辑

```
如果缺少 intent_type → 询问想买什么类型
如果缺少 target → 询问是给谁买
如果缺少 budget → 询问预算范围
```

## 使用方法

```python
from slot_filler import check_and_fill, generate_question

# 检查完整性
result = check_and_fill(intent_dict)

# 生成追问
if not result["is_complete"]:
    question = generate_question(result["missing_fields"])
```

## 输出格式

```json
{
  "is_complete": false,
  "missing_fields": ["target", "budget"],
  "next_question": {
    "field": "target",
    "question": "是给谁购买的？",
    "options": [
      {"value": "自己", "label": "1. 自己"},
      {"value": "孩子", "label": "2. 孩子"},
      {"value": "家庭", "label": "3. 家庭"},
      {"value": "父母", "label": "4. 父母"}
    ]
  }
}
```
