# TOOLS.md - 本地工具

## 家庭消费意图识别工具

### 1. 意图识别 (intent_detector.py)
```
位置: skills/family-consumption-intent/intent_detector.py
功能: 从自然语言识别消费意图
输出: intent_type, target, scene, budget, time
```

### 2. 槽位填充 (slot_filler.py)
```
位置: skills/family-consumption-intent/slots/slot_filler.py
功能: 检查信息完整度，生成追问
输入: intent dict
输出: is_complete, missing_fields, next_question
```

### 3. 家庭画像 (family_profile.py)
```
位置: skills/family-consumption-intent/family_profile/family_profile.py
功能: CRUD 家庭画像
存储: family_profiles.json
```

### 4. 推荐系统 (recommender.py)
```
位置: skills/family-consumption-intent/recommendation/recommender.py
功能: 基于画像+历史生成推荐
输入: intent, family_context
输出: recommendations list
```

### 5. 消费记忆 (consumption_memory.py)
```
位置: skills/family-consumption-intent/memory/consumption_memory.py
功能: 记录消费历史，分析偏好
存储: consumption_history.json
```

## API 服务

```
服务: family-sync-server.js
端口: 3847
端点:
  - GET  /api/families        # 获取家庭列表
  - POST /api/chat            # 处理聊天消息
  - GET  /api/history         # 获取消费历史
  - POST /api/sync-family     # 同步到MEMORY
```

## Web 界面

```
文件: family-consumption-intent/test.html
功能: 测试意图识别交互界面
```

## 外部工具

### Whisper 语音转文字
- 脚本位置: skills/whisper/transcribe.py
- 首次使用下载模型（约 40-140MB）
- 模型选项: tiny, base, small, medium
