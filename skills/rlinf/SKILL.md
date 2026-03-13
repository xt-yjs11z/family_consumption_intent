# RLinf - 强化学习基础设施

> Reinforcement Learning Infrastructure for Embodied and Agentic AI

## 概述

RLinf 是一个灵活且可扩展的开源 RL（强化学习）基础设施，专为具身智能（Embodied AI）和智能体（Agentic AI）设计。

**官网**: https://rlinf.readthedocs.io
**GitHub**: https://github.com/RLinf/RLinf

---

## 🎯 核心能力

### 1. 分布式 RL 训练
- 支持大规模多 GPU 节点训练
- 隐藏分布式编程复杂性
- 支持 FSDP + HuggingFace/SGLang/vLLM
- 支持 Megatron 优化大规模训练

### 2. 支持的算法

| 算法 | 类型 |
|:---|:---|
| **PPO** | 策略梯度 |
| **GRPO** | 组相对策略优化 |
| **SAC** | 软演员-评论家 |
| **DAPO** | 离散动作策略优化 |
| **Reinforce++** | 增强版策略梯度 |
| **CrossQ** | 跨域 Q 学习 |
| **RLPD** | 策略蒸馏 |
| **SAC-Flow** | 流匹配策略 |

### 3. 支持的模拟器

- **ManiSkill** - 机器人操作
- **IsaacLab** - NVIDIA 仿真
- **MetaWorld** - 元学习环境
- **CALVIN** - 长期操作
- **RoboCasa** - 家庭场景
- **BEHAVIOR-1K** - 1000 个日常活动

### 4. 支持的模型

#### VLA (Vision-Language-Action)
- π₀ / π₀.₅
- OpenVLA
- GR00T-N1.5
- Dexbotic

#### VLM
- Qwen2.5-VL

#### World Model
- OpenSora
- Wan

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────┐
│            RLinf 框架                        │
├─────────────────────────────────────────────┤
│  Core Engine                               │
│  ├── Scheduler (分布式调度)                  │
│  ├── Runner (运行器)                        │
│  └── Worker (工作器)                        │
├─────────────────────────────────────────────┤
│  Algorithms                                │
│  ├── PPO / GRPO / SAC                      │
│  └── 自定义算法                             │
├─────────────────────────────────────────────┤
│  Environments                              │
│  ├── Sim (仿真)                            │
│  └── Real (真实机器人)                     │
├─────────────────────────────────────────────┤
│  Models                                    │
│  ├── VLA / VLM / World Model              │
│  └── Custom Models                        │
└─────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 安装

```bash
# 通过 pip 安装
pip install rlinf

# 或克隆仓库
git clone https://github.com/RLinf/RLinf.git
cd RLinf
pip install -e .
```

### 运行示例

```bash
# 运行 ManiSkill3 示例
python -m rlinf.run \
    --config-path examples/embodied/maniskill3 \
    --config-name pi0_push_episode
```

---

## 📚 文档

- [官方文档](https://rlinf.readthedocs.io)
- [中文文档](https://rlinf.readthedocs.io/zh-cn/)
- [论文](https://arxiv.org/abs/2509.15965)

---

## 🔧 技术特点

1. **高灵活性** - 支持多种 RL 算法和工作流
2. **高效执行** - 混合执行模式吞吐量提升 2.434×
3. **易于扩展** - 无需修改代码即可扩展到大量 GPU
4. **SOTA 支持** - 开箱即用的 state-of-the-art 结果

---

## 相关论文

```bibtex
@article{yu2025rlinf,
  title={RLinf: Flexible and Efficient Large-scale Reinforcement Learning via Macro-to-Micro Flow Transformation},
  author={Yu, Chao and Wang, Yuanqing and Guo, Zhen and others},
  journal={arXiv preprint arXiv:2509.15965},
  year={2025}
}
```

---

## 🔗 π₀.5 + SAC 真机强化学习

### DSRL (Diffusion Steering via RL)

**核心思想**: 使用 SAC 算法在潜在噪声空间训练轻量级 Agent 来控制预训练的 Diffusion Policy (π₀.5)

**方案文档**: 见 `skills/pi05-sac-realworld/SKILL.md`

### 支持的真机平台
- **Franka** - 单臂机器人
- **Turtle2** - 双臂机器人 (XSquare)
- **XSquare Turtle2** - 支持真机 RL

### 关键算法
- **embodied_sac** - 用于具身智能的 SAC 变体
- **DSRL** - Diffusion Steering via RL
