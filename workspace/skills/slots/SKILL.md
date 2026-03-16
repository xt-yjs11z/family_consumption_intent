# 槽位填充技能

## 功能

检查和处理意图槽位。

## 必填槽位

- target：消费对象
- object：商品

## 检查逻辑

```
有 target + 有 object → 完整
有 target + 无 object → 追问商品
无 target + 有 object → 追问对象
无 target + 无 object → 追问对象
```

## 追问规则

追问时只显示问题，不显示选项列表。
