# Family Profile Skill

管理多个家庭画像，支持增删改查。

## 功能

1. **家庭画像管理** - 创建、读取、更新、删除
2. **多家庭支持** - 区分不同家庭
3. **消费特征** - 收入水平、消费风格
4. **历史消费** - 记录消费偏好

## 数据结构

```json
{
  "family_id": "A",
  "family_name": "吴海超家",
  "members": ["爸爸", "妈妈", "孩子"],
  "children_age": [8],
  "income_level": "高",
  "consume_style": "大方",
  "preferred_brands": ["国产品牌", "品牌"],
  "historical_consumption": {
    "education": ["文具", "书包"],
    "food": ["水果", "零食"]
  },
  "budget_range": {
    "education": [100, 500],
    "daily": [50, 200]
  }
}
```

## 消费风格

- rational（理性）
- frugal（节俭）
- moderate（中等）
- generous（大方）
- luxury（奢侈）

## 使用方法

```python
from family_profile import FamilyProfileManager

manager = FamilyProfileManager()

# 创建家庭
manager.create_family({
    "family_name": "吴海超家",
    "members": ["爸爸", "妈妈", "孩子"],
    "income_level": "高",
    "consume_style": "大方"
})

# 获取家庭
family = manager.get_family("A")

# 更新家庭
manager.update_family("A", {"income_level": "中"})

# 列出所有家庭
families = manager.list_families()
```

## 存储

- 本地 JSON 文件：`family_profiles.json`
- MEMORY.md 自动同步
