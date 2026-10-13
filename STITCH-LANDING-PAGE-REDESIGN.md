# SeedanceAI Studio 落地页重新设计 — Stitch 实施指南 (v2 优化版)

## 项目背景

SeedanceAI Studio (https://seedanceai.dev/) 是一个基于 ShipAny 模板构建的 AI 视频/图片生成工具网站。当前落地页使用模板默认设计，千篇一律，无法与 Google 搜索排名前 20 的竞品网站竞争。

### 技术栈
- Next.js 15 + App Router + React 19
- Tailwind CSS v4 + shadcn/ui (new-york style)
- framer-motion 动画
- next-intl i18n (en/zh)
- 主题系统: `src/themes/default/` 下的 blocks/pages/layouts
- 数据驱动: 所有落地页内容通过 JSON locale 文件配置 (`src/config/locale/messages/`)
- 动态页面系统: `dynamic-page.tsx` 遍历 `page.sections` 渲染对应 block
- 已安装: @number-flow/react, canvas-confetti, framer-motion

### 当前落地页结构 (需要重新设计)
页面配置在 `src/config/locale/messages/en/pages/index.json` 的 `show_sections`:
1. `hero` — Spline 3D 背景 + 标题 + CTA 按钮 + 视频分类卡片
2. `workbench` — 假的产品预览 UI (多轨编辑器界面)
3. `community-showcase` — 瀑布流视频卡片
4. `comparison` — 左右对比面板
5. `pricing` — 定价卡片 + 月/年切换
6. `use-cases` — 4列用例卡片
7. `faq` — 手风琴 FAQ
8. `features` — 3列特性网格

### 当前设计的核心问题
1. **Hero 区域是静态营销页** — 用户需要点击按钮跳转才能使用工具
2. **Workbench 是假 UI** — 展示一个不可交互的编辑器界面，没有实际价值
3. **所有 section 结构雷同** — Badge + 标题 + 描述 + 网格卡片，视觉单调
4. **全站只用 gold 一种强调色** — 缺乏视觉层次和节奏变化
5. **缺少社会证明** — 没有用户评价、使用数据、专业人士背书
6. **特性展示过于抽象** — 只有图标+文字，没有实际效果演示
7. **纯黑背景 + gold 文字的组合过于单调** — 需要更丰富的色彩系统

---

## 竞品分析总结 (8个竞品网站深度调研)

### 关键发现: 竞品的视觉空白

**所有竞品都直接在 Hero 放工具，没有人在第一屏用震撼的视觉内容吸引用户。** 这是我们的差异化机会:
- deevid.ai: 直接 headline → tool，无视觉冲击
- seedance2.ai: 静态图标 + tool，无 demo 视频
- dreamina.capcut.com: 图标驱动，无电影感视觉
- jxp.com: 用文字模拟电影感 (PRORES RAW, 24FPS)，但无实际视频
- nanaimg.io: 最简洁，headline → tool，无任何视觉钩子

**我们的策略**: 第一屏用震撼的 demo 视频/视觉内容吸引注意力，第二屏再展示生成器工具。这样既有视觉冲击力，又有产品体验，两者兼得。

### 竞品共同的制胜设计模式

1. **具体数字而非抽象描述**: "9张图+3视频+3音频"、"<15秒"、"5000字符"
2. **灵感画廊**: 预设提示词+生成结果，解决空白画布焦虑
3. **电影级元数据叠加**: 缩略图上显示 "720P · 5s · 16:9"
4. **受众细分**: 针对电影人、电商、创作者等具体人群
5. **透明定价**: 按分辨率显示 credits 消耗
6. **工作流叙事**: 3步流程可视化，而非功能列表

---

## 设计原则

### 反 AI 套路 (Anti-Slop) — 最高优先级

以下是 2024-2025 年 AI 生成界面的典型指纹，**必须全部避免**:

- ❌ 双色光晕背景 (左上暖色 + 右下冷色) — 这是 AI 暗色 Hero 的 #1 套路
- ❌ 渐变文字 (白→彩色) — AI 设计的 #1 标志
- ❌ emoji 信任标签 (⚡<15s · 🎬4K) — 每个 AI 工具都这样做
- ❌ 每个 section 不同强调色 — 看起来像 8 个不同网站拼在一起
- ❌ NumberFlow 动画计数器排成一行 — 2024 年每个 AI 落地页的标配
- ❌ 12 条结构化 testimonials 覆盖 4 个人群 — 一眼假
- ❌ 纯黑 (#000) 或纯灰背景 — 始终给中性色加蓝色调 (tinted neutrals)
- ❌ 卡片嵌套卡片 — 扁平化层级
- ❌ 弹跳/弹性缓动 — 用自然的 ease-in-out
- ❌ 向下滚动指示器 — 用户会忽略，增加视觉噪音

### 色彩规范
- 使用 OKLCH 色彩空间 (项目已在用)
- 文字对比度 >= 4.5:1 (WCAG AA)
- 暗色模式用 OLED 优化的深色背景
- **全站只用 2 种强调色** (gold + blue)，通过明度/饱和度变化创造层次

### 动画规范
- 微交互: 150-300ms
- 列表/网格: 交错动画，有意图感
- 始终提供 `prefers-reduced-motion` 回退 (静态缩略图替代自动播放视频)
- 避免弹跳/弹性缓动

### 性能规范 (React/Next.js)
- 用 `next/dynamic` 代码分割重型组件
- 视频: lazy load + preload="none"
- 避免 barrel file 导入
- 用 Suspense 边界做流式渲染
- 移除 Spline 3D (最大性能瓶颈)

---

## 色彩系统 (双色强调 + Tinted Neutrals)

### 设计理念
当前全站只用 gold (#D4A843) 作为唯一强调色，导致视觉单调。但 v1 方案走向另一个极端 — 8 种强调色让每个 section 像不同网站。

**v2 方案**: 只用 2 种强调色 + tinted neutrals。通过明度和饱和度变化创造视觉层次，而非引入新色相。

### 双色强调体系

```
品牌主色 — Gold (CTA、定价、品牌标识):
  --brand-gold: oklch(0.82 0.12 85)
  --brand-gold-dim: oklch(0.65 0.10 85)      // 次要/hover 状态
  --brand-gold-subtle: oklch(0.30 0.05 85)   // 背景色/边框

交互辅色 — Blue (生成器、链接、交互元素):
  --accent-blue: oklch(0.72 0.15 230)
  --accent-blue-dim: oklch(0.55 0.12 230)    // 次要状态
  --accent-blue-subtle: oklch(0.25 0.05 230) // 背景色/边框
```

### 中性色 (Tinted Neutrals — 带蓝色调，不是纯黑/纯灰)
```
背景层级:
  --bg-deepest: oklch(0.10 0.02 270)     // 最深背景 (替代纯黑)
  --bg-deep: oklch(0.13 0.02 270)        // 深背景
  --bg-surface: oklch(0.16 0.015 270)    // 卡片/表面
  --bg-elevated: oklch(0.20 0.015 270)   // 悬浮/hover 状态

文字层级:
  --text-primary: oklch(0.95 0.01 270)   // 主文字 (不是纯白)
  --text-secondary: oklch(0.75 0.01 270) // 次要文字
  --text-tertiary: oklch(0.55 0.01 270)  // 辅助文字
  --text-muted: oklch(0.40 0.01 270)     // 最弱文字

边框:
  --border-subtle: oklch(0.25 0.01 270)  // 微妙边框
  --border-default: oklch(0.30 0.015 270)// 默认边框
  --border-hover: oklch(0.40 0.02 270)   // hover 边框
```

### 各 Section 色彩映射 (只用 gold + blue 的变体)
| Section | 背景 | 强调色 | 用法 |
|---------|------|--------|------|
| Hero | --bg-deepest + 微妙径向渐变 | gold | CTA 按钮、品牌标识 |
| Generator | --bg-deep | blue | 交互元素、Generate 按钮边框 |
| Featured Creations | --bg-deepest | gold-dim | 视频卡片 hover 边框 |
| Features | --bg-deep | blue-dim | 特性图标、视频播放按钮 |
| Pricing | --bg-deepest | gold | 推荐套餐高亮、价格数字 |
| FAQ | --bg-deep | blue-dim | 展开图标、链接 |
| CTA | --bg-deep + 微妙渐变 | gold (按钮) | 最终转化 |

**关键**: 视觉节奏通过背景明度交替 (deepest ↔ deep) 实现，不是通过换颜色。

---
## 重新设计方案 — 逐 Section 实施指南

### 新的页面结构 (7 个 section，精简转化漏斗)

v1 方案有 11 个 section，认知负荷过重。v2 精简为 7 个，每个 section 有明确的转化职责:

```json
"show_sections": [
  "hero",              // 视觉钩子 — 让人一眼爱上 (欲望)
  "generator",         // 核心工具 — 立即体验 (行动)
  "featured-creations",// 质量证明 — 替代 testimonials (信任)
  "features",          // 能力展示 — 带视频演示 (理解)
  "pricing",           // 转化决策 — 透明定价 (决策)
  "faq",               // 消除疑虑 (安心)
  "cta"                // 最终推动 (行动)
]
```

**砍掉的 section 及原因**:
- ~~stats~~ — 没有真实数据，硬编码数字损害信任
- ~~testimonials~~ — 没有真实评价，虚构的一眼假。用 featured-creations 替代 (生成质量本身就是最好的社会证明)
- ~~use-cases~~ — 受众细分信息合并到 features 中，通过视频演示展示不同场景
- ~~comparison~~ — 竞品对比表格容易过时且显得防御性。"为什么选我们" 的信息融入 hero 副标题和 features

**转化漏斗逻辑**:
```
欲望 (Hero: 看到效果) → 行动 (Generator: 立即试用) → 信任 (Creations: 更多证明)
→ 理解 (Features: 深入了解) → 决策 (Pricing: 多少钱) → 安心 (FAQ: 消除顾虑) → 行动 (CTA: 最终推动)
```

---

### Section 1: Hero — 视频驱动的视觉冲击 (最高优先级)

**核心理念**: 让 demo 视频成为视觉主角，而不是用 CSS 光晕装饰文字。竞品都在第一屏放工具，我们用输出质量做差异化。

**文件**: `src/themes/default/blocks/hero.tsx` — 重写

**设计规范**:

```
布局结构 (全屏高度):
┌─────────────────────────────────────────────────────┐
│  [背景: --bg-deepest + 单色微妙径向渐变 (中心稍亮)]   │
│  [可选: 极低透明度噪点纹理 (grain texture)]           │
│                                                       │
│              居中布局 (max-w-4xl)                      │
│                                                       │
│     小标签: Powered by Seedance 2.0                   │
│     (--text-tertiary, 无 emoji, 无 badge 组件)        │
│                                                       │
│     H1: Create Cinematic                              │
│         AI Videos in Seconds                          │
│     (纯 --text-primary，不用渐变文字)                  │
│                                                       │
│     副标题: From text, images, or video references    │
│     to professional footage. No editing skills needed.│
│     (--text-secondary)                                │
│                                                       │
│     ┌──────────────┐  ┌──────────────┐                │
│     │ Start Free → │  │ See Examples │                │
│     │ (gold 填充)   │  │ (ghost 按钮) │                │
│     └──────────────┘  └──────────────┘                │
│                                                       │
│     信任行: <15s generation · Up to 4K · Commercial   │
│     license (纯文字，用 · 分隔，--text-tertiary)       │
│                                                       │
│  ┌─ 视频展示带 (这是视觉主角) ──────────────────────┐ │
│  │                                                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │ 视频卡1  │ │ 视频卡2  │ │ 视频卡3  │ ...      │ │
│  │  │ 自动播放  │ │ hover播放│ │ hover播放│          │ │
│  │  │ 720P·5s  │ │ 1080P·8s │ │ 720P·10s │          │ │
│  │  │ 16:9     │ │ 9:16     │ │ 16:9     │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘          │ │
│  │  (视频卡片占据 hero 下半部分 ~40% 高度)            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**与 v1 的关键区别**:
1. **无双色光晕** — 不用"左上暖色+右下冷色"的 AI 套路。背景只用单色微妙径向渐变 (中心 --bg-deep, 边缘 --bg-deepest)
2. **无渐变文字** — H1 用纯 --text-primary (接近白色)。渐变文字是 AI 设计的 #1 标志
3. **无 emoji 信任标签** — 用纯文字 + 中点分隔符，更克制更专业
4. **视频卡片是视觉主角** — 占据 hero 下半部分 40% 高度，不是点缀。这些真实的 AI 生成视频就是最好的"视觉冲击"
5. **无滚动指示器** — 用户会忽略，增加视觉噪音

**视频卡片设计**:
```
┌────────────────────┐
│                    │
│   [视频/缩略图]     │  ← 第一张自动静音播放，其余 hover 播放
│                    │
│   ┌─ 元数据叠加 ──┐│  ← 左下角半透明标签
│   │ 720P · 5s     ││
│   └───────────────┘│
│                    │
│   标题文字          │  ← 卡片底部
│   "Cinematic Chase" │
└────────────────────┘
```

**实现要点**:

1. **背景**: 移除 Spline 3D (`hero-bg.tsx` 简化为纯 CSS)
   - 基础: `--bg-deepest`
   - 中心: 微妙径向渐变 `radial-gradient(ellipse at 50% 30%, var(--bg-deep), transparent 70%)`
   - 可选: CSS noise texture (用 `background-image: url("data:image/svg+xml,...")` 内联 SVG 噪点)
   - **不要**: 彩色光晕、多色渐变、Spline 3D

2. **标题**: 纯色，不用渐变。`text-5xl md:text-7xl font-bold tracking-tight text-[--text-primary]`

3. **信任行**: 纯文字，不用 emoji 或 badge 组件
   ```tsx
   <p className="text-sm text-[--text-tertiary]">
     {"<15s generation · Up to 4K · Commercial license"}
   </p>
   ```

4. **视频展示带**: 横向滚动，CSS scroll-snap
   - 第一张视频 autoplay + muted + loop
   - 其余 hover 时播放
   - 元数据叠加: 分辨率 + 时长，用 `backdrop-blur-sm bg-black/40` 半透明标签
   - `prefers-reduced-motion`: 全部显示静态缩略图

5. **CTA 按钮**:
   - 主按钮: gold 填充 (`bg-[--brand-gold] text-black`)
   - 次按钮: ghost (`text-[--text-secondary] hover:text-[--text-primary]`)，不用 outline 边框


**移动端**:
- 标题 `text-3xl`
- 视频展示带保持横向滚动 (CSS scroll-snap)
- CTA 按钮上下堆叠
- 视频卡片宽度 `min-w-[260px]`

---

### Section 2: Generator — 嵌入式生成器 (核心转化)

**核心理念**: 用户被第一屏的视觉效果吸引后，滚动到第二屏直接开始创作。渐进增强 — 未登录也可以输入，降低首次使用门槛。

**新建文件**: `src/themes/default/blocks/generator.tsx`

**设计规范**:

```
布局结构:
┌─────────────────────────────────────────────────────┐
│  背景: --bg-deep                                     │
│                                                       │
│  标题: "Start Creating Now" (--text-primary)          │
│  副标题: "No sign-up required to try" (--text-muted) │
│                                                       │
│  ┌─ 生成器面板 (max-w-3xl, 居中) ──────────────────┐ │
│  │  背景: --bg-surface                               │ │
│  │  border: 1px solid var(--border-default)          │ │
│  │                                                    │ │
│  │  ┌─ Tab 切换 ─────────────────────────────────┐  │ │
│  │  │ [Text to Video] [Image to Video]            │  │ │
│  │  │  (--accent-blue 下划线激活态)                │  │ │
│  │  └────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  │  ┌─ 提示词输入 ──────────────────────────────┐   │ │
│  │  │ "A cinematic drone shot over snow-capped   │   │ │
│  │  │  mountains at golden hour..."              │   │ │
│  │  │                                  0/2000 字  │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │                                                    │ │
│  │  ┌─ 参数 (默认折叠，点击展开) ───────────────┐   │ │
│  │  │ ▸ Advanced Options                         │   │ │
│  │  │   (折叠状态只显示默认值预览:                │   │ │
│  │  │    720P · 5s · 16:9)                       │   │ │
│  │  │                                            │   │ │
│  │  │ 展开后:                                    │   │ │
│  │  │   分辨率: [720P ▾]                         │   │ │
│  │  │   时长: [5s ▾]                             │   │ │
│  │  │   比例: [16:9 ▾]                           │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │                                                    │ │
│  │  ┌─ 上传区域 (Image to Video tab 时显示) ─────┐  │ │
│  │  │ 拖拽上传或点击选择                           │  │ │
│  │  │ (虚线边框, --border-default)                 │  │ │
│  │  └────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  │  ┌────────────────────────────────────────────┐  │ │
│  │  │         Generate Video                     │  │ │
│  │  │         (gold 按钮，全宽)                   │  │ │
│  │  └────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ "Get Inspired" 灵感画廊 (生成器下方) ────────────┐ │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │ │
│  │ │缩略图1 │ │缩略图2 │ │缩略图3 │ │缩略图4 │     │ │
│  │ │ 截断的  │ │ 截断的  │ │ 截断的  │ │ 截断的  │     │ │
│  │ │ 提示词  │ │ 提示词  │ │ 提示词  │ │ 提示词  │     │ │
│  │ └────────┘ └────────┘ └────────┘ └────────┘     │ │
│  │ (点击: 填充提示词 + 所有参数到生成器)              │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**与 v1 的关键区别**:
1. **参数默认折叠** — 解决认知负荷问题。首次用户只看到: Tab + 提示词输入 + Generate 按钮。3 个决策点，不是 7 个
2. **折叠预览**: 参数行折叠时显示 "720P · 5s · 16:9" (当前默认值)，让用户知道有这些选项但不强迫选择
3. **灵感画廊点击填充所有参数** — 不只是提示词，还包括分辨率、时长、比例。消除空白画布焦虑
4. **无蓝色发光边框** — 不用 `box-shadow: 0 0 60px` 的 AI 发光面板效果。用 `--border-default` 普通边框
5. **Generate 按钮用 gold** — 全站 CTA 统一用 gold，不为这个 section 换蓝色

**错误状态设计** (v1 完全缺失):

```
1. 空提示词 → Generate 按钮禁用 (灰色)，下方微妙提示:
   "Enter a prompt or pick one from Get Inspired"

2. 提示词过长 (>2000字符) → 字符计数变 --brand-gold 色
   输入框下方: "Prompt exceeds 2000 characters"

3. 未登录点击 Generate → "沉没成本"拦截流程:
   ┌──────────────────────────────────┐
   │  显示 1.5s 加载状态:             │
   │  "Analyzing prompt..."            │
   │  [████░░░░░░░░░]  ~15%           │
   └──────────────────────────────────┘
   ↓ 进度到 ~20% 时
   ┌──────────────────────────────────┐
   │  毛玻璃遮罩                       │
   │  ┌────────────────────────────┐  │
   │  │  Your video is preparing!  │  │
   │  │                            │  │
   │  │  Sign up free to continue  │  │
   │  │                            │  │
   │  │  [Continue with Google]    │  │
   │  │  [Continue with Email]     │  │
   │  │                            │  │
   │  │  Already have an account?  │  │
   │  │  Sign in                   │  │
   │  └────────────────────────────┘  │
   └──────────────────────────────────┘
   登录成功后 → 自动恢复生成 (prompt/params 存 localStorage)

4. 生成失败 (API 错误):
   Generate 按钮下方出现 inline 错误:
   "Generation failed. Please try again." [Retry]
   (不用 toast, 不用 modal — inline 最不打断)

5. Credits 不足:
   "You've used all free credits."
   [Upgrade to Pro — $29/mo] (gold 按钮)
   [View pricing] (text link)

6. 内容政策拦截:
   "This prompt may violate our content policy."
   "Try rephrasing or using different imagery."

7. 排队等待 (高流量):
   Generate 按钮变为进度显示:
   "Generating... ~30s remaining"
   [████████░░░░░] 65%
```

**渐进增强登录流程**:
- 未登录: 可输入提示词、选参数、选灵感画廊。点击 Generate 触发上述"沉没成本"拦截
- 伪加载文字序列: "Analyzing prompt..." → "Initializing model..." → "Preparing generation..."
- Modal 文案强调 "Your video is preparing" — 暗示注册后立即继续
- 优先展示 OAuth (Google)，降低注册摩擦
- 登录成功后自动恢复: prompt、参数、选中的 tab 全部从 localStorage 恢复

**移动端**:
- 全宽单列布局
- Tab 切换用横向滚动
- 参数行折叠 (与桌面一致)
- Generate 按钮全宽 + `position: sticky; bottom: 0` (拇指区域)
- 灵感画廊水平滚动

---

### Section 3: Featured Creations — 质量证明 (替代 Testimonials)

**文件**: 基于 `src/themes/default/blocks/community-showcase.tsx` 优化

**核心理念**: 没有真实用户评价时，AI 生成工具最好的社会证明就是输出质量。展示精选的生成作品，每个附带提示词，既证明质量又教会用户怎么用。

**设计规范**:

```
布局结构:
┌─────────────────────────────────────────────────────┐
│  背景: --bg-deepest                                   │
│                                                       │
│  标题: "Made with SeedanceAI" (--text-primary)        │
│  副标题: "Click any creation to see the prompt"       │
│  (--text-tertiary)                                    │
│                                                       │
│  ┌─ Tab 切换 ────────────────────────────────────┐   │
│  │ [All] [Cinematic] [Anime] [Product] [Social]  │   │
│  │ (--accent-blue 下划线激活态)                    │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │      │ │      │ │      │ │      │               │
│  │ 视频 │ │ 视频 │ │ 视频 │ │ 视频 │               │
│  │      │ │      │ │      │ │      │               │
│  │ 720P │ │1080P │ │ 720P │ │ 720P │               │
│  │ · 5s │ │ · 8s │ │ · 5s │ │ · 10s│               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │      │ │      │ │      │ │      │               │
│  │ ...  │ │ ...  │ │ ...  │ │ ...  │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                       │
│  [Load More] (text button, --text-tertiary)           │
│                                                       │
│  ┌─ 底部 CTA ───────────────────────────────────────┐│
│  │  "Try this style" → 点击跳转到 Generator         ││
│  │  并自动填充对应 prompt                             ││
│  └───────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**视频卡片交互**:
- 默认: 静态缩略图 + 底部元数据 (分辨率 · 时长)
- Hover: 视频自动播放 + 底部滑入提示词预览 (截断 2 行)
- Click: 展开提示词全文 + "Try this prompt" 按钮 (跳转 generator 并填充)

**分类 Tab**:
- All / Cinematic / Anime / Product / Social Media
- 用 `--accent-blue` 下划线激活态
- 数据在 JSON locale 文件中配置，每个作品标注 category

**与 v1 Testimonials 的区别**:
- 不虚构用户评价 — 展示真实生成效果
- 每个作品可点击试用对应 prompt — 直接转化
- 分类筛选帮助不同受众找到自己的场景

---

### Section 4: Features — 带视频演示的能力展示

**文件**: 基于已有 `src/themes/default/blocks/features-media.tsx` 优化

**核心理念**: 交替左右布局，每个特性配短视频演示。比纯图标+文字更有说服力。同时通过视频内容覆盖不同受众场景 (替代独立的 use-cases section)。

**设计规范**:

```
布局结构:
┌─────────────────────────────────────────────────────┐
│  背景: --bg-deep                                     │
│                                                       │
│  标题: "Built for Professional Creators"              │
│  (--text-primary)                                     │
│                                                       │
│  ┌─ Feature 1 ──────────────────────────────────────┐ │
│  │ ┌─ 文字 (45%) ────┐  ┌─ 视频 (55%) ──────────┐ │ │
│  │ │                   │  │                        │ │ │
│  │ │ Lucide 图标       │  │  [演示视频]             │ │ │
│  │ │ (--accent-blue)   │  │                        │ │ │
│  │ │                   │  │  720P · 5s · 16:9      │ │ │
│  │ │ "Multi-Modal      │  │  (元数据标签)           │ │ │
│  │ │  Input"            │  │                        │ │ │
│  │ │                   │  └────────────────────────┘ │ │
│  │ │ 描述文字...       │                             │ │
│  │ │                   │                             │ │
│  │ │ 规格: 9 images    │                             │ │
│  │ │ · 3 videos        │                             │ │
│  │ │ · 3 audio         │                             │ │
│  │ └───────────────────┘                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Feature 2 (反向布局) ───────────────────────────┐ │
│  │ ┌─ 视频 (55%) ──────────┐  ┌─ 文字 (45%) ────┐ │ │
│  │ │                        │  │ "Camera Control" │ │ │
│  │ └────────────────────────┘  └──────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ... (6 个特性，交替左右)                                │
└─────────────────────────────────────────────────────────┘
```

**6 个核心特性** (图标统一用 --accent-blue, 不要每个不同颜色):
1. Multi-Modal Input — "Up to 9 images, 3 videos, 3 audio files as references"
   - 演示视频: 上传多素材生成视频的过程 (展示给电商/营销用户)
2. Camera Control — "Pan, tilt, zoom, dolly, orbital — direct every shot"
   - 演示视频: 电影级运镜效果 (展示给影视用户)
3. Character Consistency — "Stable faces, clothing, proportions across scenes"
   - 演示视频: 同一角色多场景切换 (展示给内容创作者)
4. Video Extension — "Seamlessly extend clips while maintaining continuity"
   - 演示视频: 5s 扩展到 15s 的对比
5. Built-in Audio — "Auto-generate synchronized audio and sound effects"
   - 演示视频: 带同步音效的短片
6. High-Res Output — "Export up to 4K with professional color grading"
   - 演示视频: 4K 细节特写

**实现要点**:
- 图标: Lucide SVG, 统一 `--accent-blue` 色 (不要每个特性换颜色)
- 视频: hover 自动播放, preload="none"
- 规格标签: 小圆角 pill, `--bg-elevated` 背景
- 交替布局: 奇数行文字左视频右，偶数行反转
- 移动端: 文字+视频上下堆叠


│                                                       │
│  标题: "Made with SeedanceAI" (--text-primary)        │
│  副标题: "Click any creation to use its prompt"       │
│  (--text-secondary)                                    │
│                                                       │
│  ┌─ 瀑布流网格 (3列桌面 / 2列平板 / 1列手机) ──────┐ │
│  │                                                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │          │ │          │ │          │          │ │
│  │  │ 视频卡片  │ │ 视频卡片  │ │ 视频卡片  │          │ │
│  │  │ (不同高度)│ │ (不同高度)│ │ (不同高度)│          │ │
│  │  │          │ │          │ │          │          │ │
│  │  │ 元数据:   │ │          │ │          │          │ │
│  │  │ 720P·5s  │ │          │ │          │          │ │
│  │  │          │ │          │ │          │          │ │
│  │  │ 提示词:   │ │ 提示词:   │ │ 提示词:   │          │ │
│  │  │ "A drone │ │ "Anime..." │ │ "Slow mo.."│         │ │
│  │  │  shot.." │ │          │ │          │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘          │ │
│  │                                                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │ ...更多   │ │ ...更多   │ │ ...更多   │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  [View All Creations →] (text link, --accent-blue)     │
└─────────────────────────────────────────────────────────┘
```

**视频卡片设计**:
```
┌────────────────────┐
│                    │
│   [视频/缩略图]     │  ← hover 播放
│                    │
│   ┌─ 元数据 ──────┐│
│   │ 720P · 5s     ││  ← 左下角 backdrop-blur 标签
│   └───────────────┘│
│                    │
├────────────────────┤
│ "A cinematic drone │  ← 提示词预览 (2行截断)
│  shot over snow..."│
│                    │
│ [Use This Prompt]  │  ← hover 时显示，点击跳转到 generator
│                    │     并填充提示词+参数
└────────────────────┘
```

**与 v1 Testimonials 的区别**:
- 不是虚构的用户评价，而是真实的生成作品
- 每个作品附带可复用的提示词 — 既是展示也是教学
- 点击 "Use This Prompt" 滚动到 generator 并填充 — 形成闭环
- 瀑布流布局比整齐网格更有画廊感，避免"AI 卡片网格"套路

**实现要点**:
- 视频 hover 播放 + `preload="none"` + lazy load
- 提示词截断 2 行 (`line-clamp-2`)
- "Use This Prompt" 按钮: hover 时从底部滑入 (`translate-y-full → translate-y-0`)
- 点击行为: `scrollIntoView({ behavior: 'smooth' })` 到 generator + 填充 prompt/params
- 至少 6-9 个精选作品，覆盖不同风格 (电影感、动漫、产品、自然)

**移动端**:
- 单列布局
- 视频卡片全宽
- "Use This Prompt" 始终可见 (不依赖 hover)

---

### Section 4: Features — 带视频演示的能力展示

**文件**: `src/themes/default/blocks/features.tsx` — 重写 (或新建 `features-media.tsx`)

**核心理念**: 不再是 3x2 图标+文字网格 (当前的 AI 套路)。改为交替左右布局，每个特性配一个短视频演示。

**设计规范**:

```
布局结构:
┌─────────────────────────────────────────────────────┐
│  背景: --bg-deep                                     │
│                                                       │
│  标题: "Built for Professional Creators"              │
│  (--text-primary)                                     │
│                                                       │
│  ┌─ 特性 1 (文字左 + 视频右) ───────────────────────┐│
│  │                                                    ││
│  │  Multi-Modal Input              ┌──────────────┐  ││
│  │  Start from text, images,       │              │  ││
│  │  audio, or video references.    │  [演示视频]   │  ││
│  │  9 images + 3 videos + 3 audio  │              │  ││
│  │  in a single generation.        │              │  ││
│  │                                 └──────────────┘  ││
│  └────────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ 特性 2 (视频左 + 文字右) ───────────────────────┐│
│  │                                                    ││
│  │  ┌──────────────┐  Camera Control                 ││
│  │  │              │  Direct pan, tilt, zoom,         ││
│  │  │  [演示视频]   │  dolly, and orbital movements   ││
│  │  │              │  with precision.                 ││
│  │  │              │                                  ││
│  │  └──────────────┘                                  ││
│  └────────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ 特性 3 (文字左 + 视频右) ───────────────────────┐│
│  │  ... 交替继续                                      ││
│  └────────────────────────────────────────────────────┘│
│                                                       │
│  (展示 4 个核心特性，不是 6 个。少即是多)              │
└─────────────────────────────────────────────────────────┘
```

**4 个核心特性** (从 6 个精简):
1. **Multi-Modal Input** — 9 images + 3 videos + 3 audio (具体数字)
2. **Camera Control** — Pan, tilt, zoom, dolly, orbital
3. **Character Consistency** — 跨镜头保持角色一致
4. **4K Output** — 专业级输出 + 商用授权

**砍掉的特性**:
- ~~Video Extension~~ — 合并到 Multi-Modal Input 的描述中
- ~~Audio Reactive~~ — 合并到 Multi-Modal Input 的描述中

**与 v1 的区别**:
- 不是 3x2 图标网格 (AI 套路)，而是交替左右布局
- 每个特性配视频演示，不是抽象图标
- 4 个特性而非 6 个 — 减少认知负荷
- 文字包含具体数字 ("9 images + 3 videos + 3 audio")，不是抽象描述

**实现要点**:
- 交替布局: 奇数行 `flex-row`，偶数行 `flex-row-reverse`
- 视频: `IntersectionObserver` 进入视口时自动播放，离开时暂停
- 视频容器: `aspect-video rounded-xl overflow-hidden border border-[--border-subtle]`
- 文字侧: 标题 (`text-2xl font-bold`) + 描述 (`text-[--text-secondary]`) + 具体数字高亮 (`text-[--accent-blue]`)
- 进入动画: 文字侧从左/右 fade-in，视频侧从对侧 fade-in (交错 200ms)

**移动端**:
- 全部变为上下堆叠 (视频在上，文字在下)
- 视频全宽
- 不再交替左右

---

### Section 5: Pricing — 透明定价

**文件**: `src/themes/default/blocks/pricing.tsx` — 优化

**设计规范**:

```
布局结构:
┌─────────────────────────────────────────────────────┐
│  背景: --bg-deepest                                   │
│                                                       │
│  标题: "Simple, Transparent Pricing"                  │
│  副标题: "Start free. Upgrade when you need more."   │
│                                                       │
│  [Monthly] ──○── [Yearly · Save 20%]                 │
│  (切换开关，--accent-blue 激活色)                      │
│                                                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐       │
│  │  Free    │  │  Pro ★       │  │ Business │       │
│  │          │  │  (推荐)       │  │          │       │
│  │  $0/mo   │  │  $29/mo      │  │  $99/mo  │       │
│  │          │  │              │  │          │       │
│  │  5 clips │  │  100 clips   │  │ Unlimited│       │
│  │  720P    │  │  1080P       │  │  4K      │       │
│  │  5s max  │  │  10s max     │  │  30s max │       │
│  │          │  │              │  │          │       │
│  │ [Start]  │  │ [Upgrade]    │  │ [Contact]│       │
│  │ (ghost)  │  │ (gold 填充)   │  │ (ghost)  │       │
│  │          │  │              │  │          │       │
│  │ ✓ 功能1  │  │ ✓ 功能1      │  │ ✓ 功能1  │       │
│  │ ✓ 功能2  │  │ ✓ 功能2      │  │ ✓ 功能2  │       │
│  │          │  │ ✓ 功能3      │  │ ✓ 功能3  │       │
│  │          │  │ ✓ 功能4      │  │ ✓ 功能4  │       │
│  │          │  │              │  │ ✓ 功能5  │       │
│  └──────────┘  └──────────────┘  └──────────┘       │
│                                                       │
│  Credits 消耗明细 (折叠):                              │
│  ▸ "How credits work"                                │
│    展开: 720P=1 credit, 1080P=3 credits, 4K=10...   │
└─────────────────────────────────────────────────────────┘
```

**与 v1 的区别**:
- 3 个套餐而非更多 — 减少选择焦虑 (认知负荷)
- 推荐套餐用 gold 边框 + gold CTA 按钮，其他用 ghost
- Credits 消耗明细默认折叠 — 渐进披露
- 每个套餐顶部显示最关键的 3 个数字: 片段数、分辨率、时长

**实现要点**:
- 推荐套餐: `border-[--brand-gold] shadow-[0_0_20px_rgba(212,168,67,0.08)]` (微妙光晕，不是 AI 式大面积发光)
- 月/年切换: 用 `Switch` 组件，激活色 `--accent-blue`
- 价格数字: 用 `NumberFlow` 做月/年切换动画 (这是 NumberFlow 的正确用法，不是排成一行的计数器)
- Credits 折叠: 用 `Collapsible` 组件

**移动端**:
- 单列堆叠，推荐套餐在最前
- 横向滚动也可以 (snap to center)


---

### Section 6: FAQ — 消除疑虑

**文件**: `src/themes/default/blocks/faq.tsx` — 小幅优化

**设计规范**: 保持手风琴布局不变，优化色彩和内容。

**色彩调整**:
- ChevronDown 图标色: `text-[--accent-blue-dim]` (替代 gold)
- 展开状态标题: `text-[--text-primary]` (替代白色)
- 背景: `--bg-deep`

**FAQ 内容** (8 个高转化问题):
1. "Can I use generated videos commercially?" → Yes, full commercial rights on Pro and Business
2. "How long does generation take?" → 10-30s depending on resolution and duration
3. "What input formats are supported?" → Images (JPG/PNG/WebP), Videos (MP4/MOV), Audio (MP3/WAV)
4. "Is my content private?" → Yes, we don't use your content for training
5. "What if I run out of credits?" → Credits refresh monthly. Buy more anytime at the same rate
6. "Can I cancel anytime?" → Yes, no lock-in, cancel with one click
7. "Are there watermarks?" → No watermarks on paid plans
8. "Can I use my own images/videos as references?" → Yes, up to 9 images + 3 videos + 3 audio

**砍掉的问题**:
- ~~"How is SeedanceAI different from Sora/Runway?"~~ — 太自吹。差异化通过 Hero/Features 自然展示
- ~~"What resolutions are available?"~~ — 已在 Pricing 中展示

---

### Section 7: CTA — 最终转化

**文件**: `src/themes/default/blocks/cta.tsx` — 优化

**设计规范**:

```
布局结构:
┌──────────────────────────────────────────────────────┐
│  背景: --bg-deep +                                    │
│  微妙径向渐变 (中心 --bg-surface, 边缘 --bg-deep)    │
│                                                       │
│  H2: "Ready to Create Your First AI Video?"           │
│      (--text-primary, text-4xl md:text-5xl)           │
│                                                       │
│  副标题: "No credit card required.                    │
│  Start generating in seconds."                        │
│  (--text-secondary)                                    │
│                                                       │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Start Creating   │  │ View Pricing     │          │
│  │ Free →           │  │                  │          │
│  │ (gold 填充)       │  │ (ghost 按钮)      │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**与 v1 的区别**:
- 不用 "紫→蓝→青" 三色渐变背景 — AI 套路。用微妙的单色径向渐变
- 不说 "Join 50,000+ creators" — 没有真实数据
- CTA 文案简洁: "Start Creating Free" (不是 "Start Creating Free →")
- 主按钮 gold (与全站 CTA 一致)，次按钮 ghost (不是白色边框)

---

## 全局设计规范

### 色彩实现方式

在 `src/config/style/theme.css` 的 `.dark` 选择器中添加新的 CSS 变量:

```css
.dark {
  /* 保留现有变量，新增以下变量 */

  /* Tinted neutral backgrounds (替代纯黑) */
  --bg-deepest: oklch(0.10 0.02 270);
  --bg-deep: oklch(0.13 0.02 270);
  --bg-surface: oklch(0.16 0.015 270);
  --bg-elevated: oklch(0.20 0.015 270);

  /* Tinted neutral text (替代纯白) */
  --text-primary: oklch(0.95 0.01 270);
  --text-secondary: oklch(0.75 0.01 270);
  --text-tertiary: oklch(0.55 0.01 270);
  --text-muted: oklch(0.40 0.01 270);

  /* Tinted neutral borders */
  --border-subtle: oklch(0.25 0.01 270);
  --border-default: oklch(0.30 0.015 270);
  --border-hover: oklch(0.40 0.02 270);

  /* 双色强调 (只有这两种，不再增加) */
  --brand-gold: oklch(0.82 0.12 85);
  --brand-gold-dim: oklch(0.65 0.10 85);
  --brand-gold-subtle: oklch(0.30 0.05 85);

  --accent-blue: oklch(0.72 0.15 230);
  --accent-blue-dim: oklch(0.55 0.12 230);
  --accent-blue-subtle: oklch(0.25 0.05 230);
}
```

### Tailwind 中使用方式

```tsx
// 背景
className="bg-[--bg-deepest]"  // 替代 bg-black
className="bg-[--bg-deep]"     // 替代 bg-black (卡片区域)
className="bg-[--bg-surface]"  // 替代 bg-white/[0.02]

// 文字
className="text-[--text-primary]"   // 替代 text-white
className="text-[--text-secondary]" // 替代 text-white/70
className="text-[--text-tertiary]"  // 替代 text-white/50

// 边框
className="border-[--border-subtle]"  // 替代 border-white/[0.06]
className="hover:border-[--border-hover]" // 替代 hover:border-gold/20

// 强调色 — 全站只用这两种
className="bg-[--brand-gold] text-black"     // CTA 按钮
className="text-[--brand-gold]"              // 价格、品牌高亮
className="text-[--accent-blue]"             // 交互元素、链接
className="border-[--accent-blue-subtle]"    // 生成器面板边框
```

### 动画规范 (保持现有模式)
```tsx
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// 入场动画
const fadeInUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
});

// 交错动画
const staggerChild = (index: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: 0.08 * index, ease: EASE_OUT_EXPO },
});
```

### 排版规范
- H1: `text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight`
- H2: `text-3xl md:text-5xl font-bold tracking-tight`
- H3: `text-lg md:text-xl font-semibold`
- Body: `text-base leading-relaxed text-[--text-secondary]`
- Small: `text-sm leading-relaxed text-[--text-tertiary]`
- **不用渐变文字** — 全部用纯色

### 间距规范
- Section padding: `py-24 md:py-32`
- 容器: `container` (Tailwind 默认 max-width)
- Section 标题到内容: `mb-16`
- 卡片间距: `gap-6`
- 卡片内边距: `p-6 md:p-8`

---

## 实施优先级

### Phase 1 — 色彩系统 + Hero + Generator (最高优先级)
1. 色彩系统: 在 theme.css 中添加 CSS 变量 (双色 + tinted neutrals)
2. Hero 重写: 视频驱动 + 纯色标题 + 无光晕
3. Generator 新建: 嵌入式生成器 + 参数折叠 + 错误状态 + 登录拦截
4. Hero-bg 简化: CSS 替代 Spline 3D

### Phase 2 — 质量证明 + 能力展示
5. Featured Creations: 瀑布流作品展示 (替代 Testimonials)
6. Features 重写: 交替左右 + 视频演示 (4 个核心特性)

### Phase 3 — 转化优化
7. Pricing 优化: credits 折叠 + 3 套餐
8. FAQ 内容优化: 8 个高转化问题
9. CTA 优化: 微妙渐变 + 简洁文案

---

## 关键文件清单

### 需要修改的文件
| 文件 | 改动类型 | 优先级 |
|------|----------|--------|
| `src/config/style/theme.css` | 添加 CSS 变量 (双色强调 + tinted neutrals) | P0 |
| `src/themes/default/blocks/hero.tsx` | 重写 — 视频驱动 Hero | P0 |
| `src/themes/default/blocks/hero-bg.tsx` | 简化 — CSS 替代 Spline 3D | P0 |
| `src/themes/default/blocks/community-showcase.tsx` | 重写 → featured-creations (瀑布流 + 提示词) | P1 |
| `src/themes/default/blocks/features.tsx` | 重写 — 交替左右布局 + 视频演示 | P1 |
| `src/themes/default/blocks/pricing.tsx` | 优化 — credits 折叠 + 3 套餐 | P2 |
| `src/themes/default/blocks/cta.tsx` | 优化 — 微妙渐变 + 简洁文案 | P2 |
| `src/themes/default/blocks/faq.tsx` | 微调 — 色彩 | P2 |
| `src/config/locale/messages/en/pages/index.json` | 更新 — 新 section 配置和内容 | P0 |
| `src/config/locale/messages/zh/pages/index.json` | 更新 — 中文版内容 | P0 |

### 需要新建的文件
| 文件 | 用途 | 优先级 |
|------|------|--------|
| `src/themes/default/blocks/generator.tsx` | 嵌入式生成器 + 错误状态 + 登录拦截 | P0 |

### 需要删除/停用的文件
| 文件 | 原因 |
|------|------|
| `src/themes/default/blocks/workbench.tsx` | 假 UI，替换为 generator |
| `src/themes/default/blocks/stats.tsx` | 砍掉 Stats section (如已存在) |

### 不需要修改的文件
- `src/themes/default/pages/dynamic-page.tsx` — 动态页面系统无需改动
- `src/core/theme/index.ts` — block 名称匹配文件名即可自动加载

---

## 移动端适配要点

1. **Hero**: 标题 `text-3xl`，视频展示带横向滚动 (CSS scroll-snap)，CTA 上下堆叠
2. **Generator**: 全宽，参数折叠，Generate 按钮 `sticky bottom-0` (拇指区域)
3. **Featured Creations**: 单列瀑布流，"Use This Prompt" 始终可见
4. **Features**: 文字+视频上下堆叠 (不交替)
5. **Pricing**: 单列或 snap 横向滚动，推荐套餐居首
6. **FAQ**: 无变化 (手风琴布局天然适配)
7. **CTA**: CTA 按钮上下堆叠
8. **所有断点**: 375px / 768px / 1024px / 1440px

---

## SEO 优化要点

1. **H1**: 包含 "AI Video Generator" 关键词 (当前 H1 不包含)
2. **结构化数据**: 添加 Product、FAQ 的 JSON-LD schema (不加 Review — 没有真实评价)
3. **内部链接**: Footer 添加工具子页面链接
4. **图片 alt**: 所有缩略图添加描述性 alt
5. **页面速度**: 移除 Spline 3D，视频 lazy load + preload="none"
6. **Meta 描述**: 包含具体数字和差异化卖点

---

## 注意事项

1. **保持数据驱动架构**: 所有文案通过 JSON locale 文件配置，组件只负责渲染
2. **保持 i18n**: 所有新增内容需要 en 和 zh 版本
3. **保持组件接口**: Section 接口 (`section: Section`) 不变
4. **性能优先**: 移除 Spline 3D，用 `next/dynamic` 分割 generator，视频 lazy load
5. **无障碍**: `useReducedMotion()` 回退为静态缩略图，键盘导航，对比度 >= 4.5:1
6. **不要破坏现有路由**: `/app/video-generator`, `/video`, `/ai-video-generator` 保持不变
7. **渐进增强**: 生成器未登录可输入，点击 Generate 才触发登录拦截
8. **反 AI 套路**: 不用渐变文字、不用彩色光晕、不用 emoji badge、不用多色强调

---

## 验收标准

1. ✅ 色彩系统: 全站只用 gold + blue 两种强调色 + tinted neutrals
2. ✅ 背景: 不再是纯黑，使用带蓝色调的 tinted neutrals，交替 deepest/deep 创造节奏
3. ✅ Hero: 视频卡片是视觉主角，标题纯色不用渐变，无彩色光晕
4. ✅ Generator: 参数默认折叠 (3 个决策点)，完整错误状态设计，"沉没成本"登录拦截
5. ✅ Featured Creations: 瀑布流精选作品 + 可复用提示词，替代虚假 testimonials
6. ✅ Features: 4 个核心特性 + 视频演示，交替左右布局
7. ✅ Pricing: 3 个清晰套餐，credits 明细折叠
8. ✅ 页面只有 7 个 section (不是 11 个)，认知负荷可控
9. ✅ 移动端: 所有 section 适配良好，Generator 按钮在拇指区域
10. ✅ 性能: 页面加载优于当前版本 (移除 Spline 3D)
11. ✅ 中英文: 双语内容完整
12. ✅ 无障碍: 对比度达标，动画可关闭，键盘可导航
13. ✅ 反 AI 套路: 不像 AI 生成的界面

---

## v1 → v2 变更总结

| 维度 | v1 (原方案) | v2 (优化后) | 原因 |
|------|-------------|-------------|------|
| Section 数量 | 11 个 | 7 个 | 认知负荷过重，用户滚不到 pricing |
| 强调色数量 | 8 种 (amber/blue/purple/green/pink/cyan/gold/multi) | 2 种 (gold + blue) | 8 色让每个 section 像不同网站 |
| Hero 背景 | 双色光晕 (左暖右冷) | 单色微妙径向渐变 | 双色光晕是 AI 暗色 Hero 的 #1 套路 |
| Hero 标题 | 渐变文字 (白→琥珀) | 纯 --text-primary | 渐变文字是 AI 设计的 #1 标志 |
| 信任标签 | emoji (⚡🎬🔓) + badge | 纯文字 + 中点分隔 | emoji 信任标签每个 AI 工具都用 |
| Generator 参数 | 全部展开 (7 个决策点) | 默认折叠 (3 个决策点) | 认知负荷: 首次用户不需要选分辨率 |
| Generator 错误状态 | 无设计 | 7 种错误状态 | 核心交互组件不能没有错误处理 |
| 登录拦截 | 直接弹 modal | "沉没成本" 伪加载 → modal | 先投入心理成本再要求注册 |
| Stats section | 4 个动画计数器 | 砍掉 | 没有真实数据，硬编码数字损害信任 |
| Testimonials | 12 条虚构评价 | Featured Creations (真实作品) | 虚构评价一眼假，生成质量才是社会证明 |
| Use Cases | 独立 8 卡 section | 合并到 Features 视频演示 | 减少 section 数量 |
| Comparison | 独立表格 section | 砍掉 | 竞品对比表格显得防御性且易过时 |
| 特性数量 | 6 个 | 4 个 | 少即是多，减少认知负荷 |
| 滚动指示器 | 有 (弹跳动画) | 砍掉 | 用户会忽略，增加视觉噪音 |
| CTA 背景 | 三色渐变 (紫→蓝→青) | 单色微妙径向渐变 | 三色渐变是 AI 套路 |
