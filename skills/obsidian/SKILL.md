---
name: obsidian
description: "Obsidian 笔记管理 - 直接操作 Obsidian vault 中的 Markdown 笔记。"
homepage: https://help.obsidian.md
metadata:
  clawdbot:
    emoji: "💎"
    requires:
      bins: ["python3"]
---

# Obsidian 笔记管理

因为 Obsidian vault 就是普通的 Markdown 文件夹，可以使用 Python 直接管理。

## 功能

- 📋 列出笔记
- 🔍 搜索笔记内容
- ✏️ 创建新笔记
- 📖 读取笔记
- ✂️ 更新/追加笔记
- 🗑️ 删除笔记

## 使用方法

### 1. 设置 Vault 路径

```bash
# 方式1: 运行时指定
python3 obsidian_manager.py set-vault "/你的/obsidian/路径"

# 方式2: 修改脚本中的 DEFAULT_VAULT_PATH
```

### 2. 列出所有笔记

```bash
python3 obsidian_manager.py list
```

### 3. 搜索笔记

```bash
python3 obsidian_manager.py search "关键词"
```

### 4. 创建笔记

```bash
python3 obsidian_manager.py create "笔记标题" "笔记内容"
```

### 5. 读取笔记

```bash
python3 obsidian_manager.py read "笔记标题"
```

### 6. 更新笔记

```bash
python3 obsidian_manager.py update "笔记标题" "新内容"
```

### 7. 追加内容

```bash
python3 obsidian_manager.py append "笔记标题" "追加的内容"
```

### 8. 删除笔记

```bash
python3 obsidian_manager.py delete "笔记标题"
```

## 脚本位置

```
/home/robot/.openclaw/workspace/skills/obsidian/obsidian_manager.py
```

## 设置你的 Vault

**当前已配置路径**: `~/Obsidian/Vault`

更改路径:
```bash
python3 obsidian_manager.py set-vault "/你的/obsidian/路径"
```
