# 家庭画像技能

## 功能

管理用户家庭画像，加载和更新用户配置。

## 核心字段

| 字段 | 说明 |
|------|------|
| userId | 用户ID |
| family_name | 家庭名称 |
| members | 家庭成员 |
| income_level | 收入水平（高/中/低） |
| consume_style | 消费风格（节俭/理性/适度/大方/奢侈） |
| has_child | 是否有孩子 |
| has_elderly | 是否有老人 |

## 加载规则

1. 优先加载 USER/USER_{userId}.md
2. 不存在则使用默认 USER/USER.md

## 存储位置

- 用户配置：workspace/USER/USER_{userId}.md
- 用户记忆：workspace/memory/{userId}.md
