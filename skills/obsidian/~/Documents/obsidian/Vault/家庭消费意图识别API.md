# 家庭消费意图识别API

# 家庭消费意图识别 API

## 启动服务
```bash
cd ~/workspace/skills/family-intent-recognition
python3 api.py
```

## 调用接口

### 意图识别
```bash
curl -X POST http://localhost:5000/intent   -H "Content-Type: application/json"   -d '{"text": "想买一台电脑"}'
```

### 返回示例
```json
{
  "intent": "purchase_intent",
  "intent_desc": "有消费支出意向（电脑）",
  "confidence": 0.8,
  "memory_action": "none",
  "entities": {
    "members": [],
    "amount": null,
    "category": "电脑"
  }
}
```

## 意图类型

| intent | 说明 |
|--------|------|
| purchase_done | 已消费支出 |
| purchase_intent | 有消费支出意向 |
| query | 查询消费信息 |
| recommend | 请求推荐 |
| budget_control | 预算控制 |
| risk_alert | 风险提醒 |
| plan | 理财规划 |
| memory_update | 更新记忆信息 |
| explain | 解释说明 |

## memory_action

- `write` - 写入记忆
- `read` - 读取记忆
- `none` - 无需操作


---
创建时间: 2026-03-05 11:17:42
