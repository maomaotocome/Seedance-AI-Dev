# PRD: Gridfinity Generator Online Tool

> gridfinitygenerator.org

---

## 1. 产品定位

**一句话描述：**

> GridfinityGenerator.org 是一个免费的纯浏览器端 Gridfinity 模型生成器，让 3D 打印用户在 30 秒内完成参数配置并下载可直接打印的 STL 文件——无需安装任何软件。

**为谁服务：** 拥有 3D 打印机、需要模块化收纳方案的创客、DIY 爱好者、专业技师

**核心价值：** 零安装 → 实时预览 → 一键下载可打印 STL

---

## 2. MVP 功能定义（2 周上线）

### 功能取舍原则

保留：直接帮助用户更快拿到可打印 STL 文件的功能
砍掉：用户系统、支付系统、社区功能、AI 功能、STEP 导出、3MF 导出

### 2.1 箱体生成器（Bin Generator）— P0

**用户故事：**
作为一个 3D 打印用户，我想通过调整参数生成一个 Gridfinity 箱体模型，以便下载 STL 并打印出来放进我的收纳系统。

**参数面板：**

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| Grid X | 1-6 | 2 | 宽度（42mm 单位） |
| Grid Y | 1-6 | 2 | 深度（42mm 单位） |
| Grid Z | 1-12 | 3 | 高度（7mm 单位） |
| Dividers X | 0-5 | 0 | X 方向隔板数 |
| Dividers Y | 0-5 | 0 | Y 方向隔板数 |
| Scoop | on/off | on | 前部铲形斜面 |
| Label Tab | none / left / center / right / full | full | 标签挡板位置 |
| Magnet Holes | on/off | off | 底部 6x2mm 磁铁孔 |
| Stacking Lip | on/off | on | 标准叠合唇 |

**验收标准：**
- [ ] 参数调整后 < 1 秒生成 3D 预览
- [ ] 生成的 STL 文件水密、可直接切片打印
- [ ] 尺寸与 kennetek/gridfinity-rebuilt-openscad 标准兼容（42mm 网格、7mm 高度单位、0.5mm 公差）
- [ ] 支持鼠标/触控旋转、缩放、平移 3D 预览
- [ ] 一键下载 STL 按钮，文件名包含参数信息（如 `gridfinity-2x2x3-div1x1-scoop.stl`）

### 2.2 底板生成器（Baseplate Generator）— P0

**用户故事：**
作为一个 3D 打印用户，我想生成适合我抽屉尺寸的 Gridfinity 底板，以便箱体能稳固放置。

**参数面板：**

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| Grid X | 1-10 | 4 | 宽度（42mm 单位） |
| Grid Y | 1-10 | 4 | 深度（42mm 单位） |
| Style | lite / full | full | 轻量版 vs 标准版 |
| Magnet Holes | on/off | off | 磁铁安装孔 |
| Screw Holes | on/off | off | 螺丝固定孔 |

**验收标准：**
- [ ] 参数调整后 < 1 秒生成预览
- [ ] 生成的底板与标准 Gridfinity 箱体兼容（卡扣配合正确）
- [ ] 一键下载 STL

### 2.3 实时 3D 预览 — P0

**用户故事：**
作为用户，我想在下载前看到模型的真实外观，确认参数符合预期。

**验收标准：**
- [ ] WebGL 3D 视图，支持旋转/缩放/平移
- [ ] 显示模型尺寸标注（长 x 宽 x 高 mm）
- [ ] 线框/实体切换
- [ ] 移动端触控操作流畅
- [ ] 加载状态提示（geometry 生成中显示 spinner）

### 2.4 预设模板（Quick Start Templates）— P1

**用户故事：**
作为新手用户，我不确定参数该怎么设，想从常见场景模板开始快速生成。

**MVP 内置模板（6 个）：**

| 模板名 | 参数预设 | 场景 |
|--------|---------|------|
| Small Parts Bin | 2x2x3, 2x2 div, scoop | 螺丝、螺母收纳 |
| Tool Holder | 1x3x5, no div, no scoop | 螺丝刀、钳子 |
| Battery Organizer | 2x2x4, 3x2 div | AA/AAA 电池 |
| Desktop Catch-All | 3x3x3, no div, scoop | 桌面杂物 |
| Electronics Bin | 2x3x3, 2x3 div, label | 电子元件 |
| Standard Baseplate 4x4 | 4x4 baseplate, full | 通用底板 |

**验收标准：**
- [ ] 首页/生成器页展示模板卡片
- [ ] 点击模板 → 参数自动填入 → 即时预览
- [ ] 模板可修改参数后下载

### 2.5 参数 URL 编码与分享 — P1

**用户故事：**
作为用户，我想把我配置好的参数分享给朋友，让他直接打开就能看到同样的模型。

**验收标准：**
- [ ] 参数变化实时同步到 URL query string（如 `?gx=2&gy=2&gz=3&dx=1&dy=1&scoop=1`）
- [ ] 打开带参数的 URL 自动加载对应配置
- [ ] 提供"Copy Link"按钮

### 2.6 STL 下载 — P0

**验收标准：**
- [ ] 纯客户端生成，无需服务器
- [ ] 文件为 binary STL 格式（体积小）
- [ ] 文件名语义化：`gridfinity-{type}-{gx}x{gy}x{gz}-{options}.stl`
- [ ] 下载前显示预估文件大小和打印时间提示（基于标准 0.2mm 层高估算）

---

## 3. 砍掉的功能（不在 MVP）

| 功能 | 砍掉原因 |
|------|---------|
| 用户注册/登录 | 不需要账号就能下载 STL |
| 收藏/历史记录 | URL 分享已替代此需求 |
| 3MF/STEP 导出 | STL 覆盖 99% 用户需求，后续版本加 |
| 可视化隔板编辑器（拖拽） | 开发成本高，MVP 用数量输入替代 |
| 抽屉尺寸计算器 | V1.0 再加 |
| 社区分享/评论 | 不直接帮助获取 STL |
| AI 尺寸建议 | V2.0 |
| 付费功能 | 免费定位 |
| 多语言（中文） | 英文优先，覆盖 90%+ 目标用户 |

---

## 4. 核心页面结构

### 4.1 首页 `/`

**定位：** 工具入口 + SEO 着陆页

**页面结构：**

```
[Header: Logo + Nav（Generator / Templates / Guide / Blog）]

[Hero Section]
  标题: "Free Gridfinity Generator — Create Custom Bins & Baseplates Online"
  副标题: "Design, preview, and download printable STL files in seconds. No software needed."
  CTA 按钮: "Start Generating →" → 跳转到 /generator

[Quick Templates Section]
  6 个预设模板卡片（含缩略图 + 参数摘要 + "Use Template" 按钮）

[How It Works — 3 步]
  1. Choose Parameters → 2. Preview in 3D → 3. Download STL

[Gridfinity Size Guide Summary]
  42mm grid, 7mm height unit 的可视化示意图
  链接到 /gridfinity-size-guide

[FAQ Section]（结构化数据 FAQ Schema）
  - What is Gridfinity?
  - What size bin do I need?
  - What printer settings should I use?
  - Are the STL files free?

[Footer: Links to Guide pages + Blog + Privacy + Terms]
```

### 4.2 生成器页面 `/generator`

**定位：** 核心工具页

**页面布局（桌面端）：**

```
┌─────────────────────────────────────────────────┐
│  [Tabs: Bin | Baseplate]                        │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  Parameter   │       3D Preview                 │
│  Panel       │       (Three.js Canvas)          │
│              │                                  │
│  - Grid X    │       [Rotate/Zoom/Pan]          │
│  - Grid Y    │                                  │
│  - Grid Z    │       尺寸标注:                   │
│  - Dividers  │       84mm × 84mm × 28.8mm       │
│  - Options   │                                  │
│              │                                  │
│  [Templates] │                                  │
│              ├──────────────────────────────────┤
│              │  [Copy Link]  [Download STL ↓]   │
│              │  gridfinity-bin-2x2x3.stl (45KB) │
└──────────────┴──────────────────────────────────┘
```

**页面布局（移动端）：**

```
┌──────────────────────┐
│ [Tabs: Bin|Baseplate] │
├──────────────────────┤
│                      │
│   3D Preview         │
│   (触控旋转/缩放)     │
│                      │
├──────────────────────┤
│   Parameter Panel    │
│   (可折叠分组)        │
├──────────────────────┤
│ [Copy Link] [下载STL] │
└──────────────────────┘
```

**交互流程：**
1. 用户进入页面 → 默认显示 Bin 标签 + 默认参数预览
2. 调整任意参数 → Web Worker 中 Manifold 重新生成 → < 1s 更新预览
3. URL query string 实时同步
4. 点击 "Download STL" → 浏览器直接下载 binary STL

### 4.3 Gridfinity 尺寸指南 `/gridfinity-size-guide`

**定位：** SEO 内容页 + 工具辅助

**内容：**
- Gridfinity 标准尺寸体系可视化图解
- 42mm 网格单位、7mm 高度单位详细说明
- 常见物品对应推荐尺寸表
- 底部 CTA → 跳转生成器

### 4.4 博客页 `/blog`

**定位：** SEO 长尾内容中心

**展示方式：** 文章卡片网格，按分类筛选

### 4.5 其他必要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| Privacy Policy | `/privacy-policy` | 已有 |
| Terms of Service | `/terms-of-service` | 已有 |
| About | `/about` | 项目介绍 + 开源信息 |

---

## 5. SEO 策略

### 5.1 首页 SEO

**目标关键词：** gridfinity generator, gridfinity bin generator, gridfinity stl generator

**Meta 信息：**

```html
<title>Free Gridfinity Generator — Create Custom Bins & Baseplates Online | GridfinityGenerator.org</title>
<meta name="description" content="Free online Gridfinity generator. Design custom bins, baseplates, and organizers with real-time 3D preview. Download printable STL files instantly — no software needed." />
<meta name="keywords" content="gridfinity generator, gridfinity bin generator, gridfinity stl, gridfinity baseplate generator, gridfinity online, gridfinity customizer" />
```

**Open Graph:**
```html
<meta property="og:title" content="Free Gridfinity Generator — Design & Download STL Files" />
<meta property="og:description" content="Create custom Gridfinity bins and baseplates online. Real-time 3D preview, instant STL download. No software needed." />
<meta property="og:image" content="/og-image-generator.png" />
```

### 5.2 长尾内容页面计划（25 页）

按优先级排序，分批上线：

**第一批：MVP 同期上线（5 页）**

| # | 路径 | 目标关键词 | 页面类型 |
|---|------|-----------|---------|
| 1 | `/gridfinity-size-guide` | gridfinity size guide, gridfinity dimensions, gridfinity unit size | 指南页 |
| 2 | `/gridfinity-print-settings` | gridfinity print settings, gridfinity infill, gridfinity slicer settings | 指南页 |
| 3 | `/blog/what-is-gridfinity` | what is gridfinity, gridfinity explained, gridfinity system | 博客文章 |
| 4 | `/blog/gridfinity-pla-vs-petg` | gridfinity PLA vs PETG, best filament for gridfinity | 对比文章 |
| 5 | `/blog/how-to-use-gridfinity` | how to use gridfinity, gridfinity for beginners, gridfinity getting started | 教程文章 |

**第二批：上线后 2 周内（10 页）**

| # | 路径 | 目标关键词 |
|---|------|-----------|
| 6 | `/gridfinity-ikea-alex-guide` | gridfinity IKEA Alex, gridfinity drawer organizer |
| 7 | `/gridfinity-milwaukee-packout` | gridfinity Milwaukee Packout, gridfinity toolbox insert |
| 8 | `/blog/best-gridfinity-bins` | best gridfinity bins, must have gridfinity |
| 9 | `/blog/gridfinity-screwdriver-holder-guide` | gridfinity screwdriver holder |
| 10 | `/blog/gridfinity-battery-holder-guide` | gridfinity battery holder, gridfinity battery organizer |
| 11 | `/blog/gridfinity-hex-bit-organizer` | gridfinity hex bit holder, gridfinity bit organizer |
| 12 | `/blog/gridfinity-paint-holder` | gridfinity paint holder, gridfinity citadel, gridfinity vallejo |
| 13 | `/blog/gridfinity-sd-card-usb-holder` | gridfinity SD card holder, gridfinity electronics organizer |
| 14 | `/gridfinity-compatible-products` | gridfinity compatible, buy gridfinity, gridfinity commercial |
| 15 | `/blog/gridfinity-vs-sortimo` | gridfinity vs sortimo, gridfinity alternatives |

**第三批：上线后 1 个月内（10 页）**

| # | 路径 | 目标关键词 |
|---|------|-----------|
| 16 | `/blog/gridfinity-vs-kaizen-foam` | gridfinity vs kaizen foam, tool foam organizer |
| 17 | `/blog/gridfinity-wall-mount-guide` | gridfinity wall mount, gridfinity vertical |
| 18 | `/blog/gridfinity-bambu-lab-guide` | gridfinity Bambu Lab, gridfinity P1S settings |
| 19 | `/blog/gridfinity-prusa-guide` | gridfinity Prusa, gridfinity MK4 settings |
| 20 | `/blog/gridfinity-workshop-setup` | gridfinity workshop, gridfinity workbench organization |
| 21 | `/blog/gridfinity-desk-organizer` | gridfinity desk organizer, gridfinity office |
| 22 | `/blog/gridfinity-kitchen-organizer` | gridfinity kitchen, gridfinity spice organizer |
| 23 | `/blog/gridfinity-magnet-guide` | gridfinity magnet, gridfinity magnet size, do I need magnets |
| 24 | `/blog/gridfinity-label-guide` | gridfinity label, gridfinity labeling system |
| 25 | `/blog/gridfinity-lite-guide` | gridfinity lite, gridfinity lightweight, gridfinity fast print |

### 5.3 内链结构

```
首页 (/)
├── /generator ←→ 所有内容页底部 CTA
├── /gridfinity-size-guide ← 首页内嵌摘要 + 所有博客文章引用
├── /gridfinity-print-settings ← 首页 FAQ 链接 + 生成器下载确认页
│
├── /blog/what-is-gridfinity → /gridfinity-size-guide, /generator
├── /blog/how-to-use-gridfinity → /generator, /gridfinity-size-guide, /gridfinity-print-settings
├── /blog/gridfinity-pla-vs-petg → /gridfinity-print-settings
│
├── /gridfinity-ikea-alex-guide → /generator (预填抽屉尺寸)
├── /gridfinity-milwaukee-packout → /generator
│
├── /blog/gridfinity-screwdriver-holder-guide → /generator (预填工具箱模板)
├── /blog/gridfinity-battery-holder-guide → /generator (预填电池模板)
│   ...（所有工具收纳文章 → /generator + /gridfinity-size-guide）
│
└── /gridfinity-compatible-products → /generator (免费替代方案 CTA)
```

**内链原则：**
- 每篇内容页至少 2 个内链指向 `/generator`
- 每篇内容页至少 1 个内链指向 `/gridfinity-size-guide`
- 工具收纳类文章互相交叉链接
- 生成器页面侧边栏显示"相关指南"链接

### 5.4 结构化数据

| 页面 | Schema 类型 |
|------|------------|
| 首页 | WebApplication + FAQPage |
| 生成器 | SoftwareApplication (category: DesignApplication) |
| 指南页 | HowTo + Article |
| 博客文章 | Article + FAQPage |
| 对比文章 | Article |

---

## 6. 技术方案

### 6.1 架构总览

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 15 (已有)                  │
│                                                     │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ 参数 UI   │  │ Three.js /  │  │ SEO 内容页     │  │
│  │ (React)   │──│ R3F 预览    │  │ (MDX)         │  │
│  │ + Zustand │  │             │  │               │  │
│  └─────┬─────┘  └──────▲──────┘  └───────────────┘  │
│        │               │                            │
│        ▼               │                            │
│  ┌─────────────────────┴──────┐                     │
│  │      Web Worker            │                     │
│  │  ┌──────────────────────┐  │                     │
│  │  │   ManifoldCAD WASM   │  │                     │
│  │  │   (~1MB, Apache 2.0) │  │                     │
│  │  │                      │  │                     │
│  │  │  Geometry → Mesh     │  │                     │
│  │  │  Mesh → STL export   │  │                     │
│  │  └──────────────────────┘  │                     │
│  └────────────────────────────┘                     │
│                                                     │
│  部署: Vercel / Cloudflare (已有配置)                  │
└─────────────────────────────────────────────────────┘
```

### 6.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | **Next.js 15**（已有） | App Router, SSR/SSG for SEO pages |
| UI | **React 19 + Tailwind CSS 4 + Radix UI**（已有） | 参数面板、布局 |
| 状态管理 | **Zustand** | 参数状态、UI 状态（新增依赖） |
| 3D 预览 | **@react-three/fiber + @react-three/drei** | Three.js React 封装（新增依赖） |
| 几何引擎 | **manifold-3d** | WASM CSG 内核，Web Worker 运行（新增依赖） |
| STL 导出 | **自实现 binary STL writer** | ~50 行代码，将 Manifold mesh 转 STL buffer |
| 内容 | **MDX**（已有 fumadocs-mdx） | 博客/指南页面 |
| 部署 | **Vercel**（已有） | 自动 CI/CD |

### 6.3 新增依赖（仅 4 个）

```json
{
  "manifold-3d": "^3.0.0",
  "@react-three/fiber": "^9.0.0",
  "@react-three/drei": "^10.0.0",
  "zustand": "^5.0.0"
}
```

### 6.4 关键实现细节

**Manifold Web Worker 通信：**
```
Main Thread                    Web Worker
     │                              │
     │── postMessage({params}) ────→│
     │                              │── Manifold.cube/cylinder/subtract
     │                              │── 生成 watertight mesh
     │◄── postMessage({vertices,    │
     │    normals, indices}) ───────│
     │                              │
     │── 更新 Three.js BufferGeometry
     │── 或序列化为 STL 下载
```

**Gridfinity 标准尺寸常量：**
```typescript
const GRID_UNIT = 42;        // mm, 网格单位
const HEIGHT_UNIT = 7;       // mm, 高度单位
const TOLERANCE = 0.5;       // mm, 配合公差
const WALL_THICKNESS = 1.2;  // mm, 壁厚
const BOTTOM_THICKNESS = 1;  // mm, 底厚
const MAGNET_DIAMETER = 6;   // mm
const MAGNET_DEPTH = 2.4;    // mm
const SCREW_DIAMETER = 3;    // mm
const LIP_HEIGHT = 4.4;      // mm, 叠合唇高度
```

---

## 7. 用户增长钩子

### 7.1 自发分享机制

| 钩子 | 机制 | 预期效果 |
|------|------|---------|
| **参数 URL 分享** | 每个配置生成唯一 URL，用户在 Reddit/Discord 分享 "这是我做的箱体" | 直接带来高意图流量 |
| **STL 文件名品牌** | 下载的 STL 文件名包含 `gridfinitygenerator.org` | 用户在 Printables/Thingiverse 上传时自带品牌曝光 |
| **嵌入式预览** | 提供 `<iframe>` 嵌入代码，让博主/论坛可以嵌入 3D 预览 | 外链 + 品牌曝光 |
| **"Made with GridfinityGenerator.org"** | 生成的 STL 元数据中包含来源信息 | 被动传播 |

### 7.2 SEO 飞轮

```
高质量内容页（size guide, print settings, IKEA Alex guide）
    → Google 索引排名
        → 自然搜索流量
            → 用户使用生成器
                → 下载 STL 并分享参数 URL 到 Reddit/Discord
                    → 社交引用 + 外链
                        → 域名权重提升
                            → 内容页排名进一步提升
                                → 更多流量 → 循环加速
```

**飞轮启动策略：**
1. MVP 上线同期发布 5 篇核心 SEO 内容页
2. 在 r/gridfinity、r/3dprinting、r/functionalprint 发布工具介绍帖
3. 在 Printables/Thingiverse 发布示例 STL，描述中链接到生成器
4. 主动提交到 Google Search Console，提交 sitemap
5. 监控 Google Search Console 查询数据，持续优化排名靠前的关键词

---

## 8. 成功指标（上线 30 天）

| 指标 | 目标值 | 衡量方式 |
|------|--------|---------|
| 月访客 (UV) | ≥ 3,000 | Google Analytics |
| STL 下载次数 | ≥ 1,500 | 客户端事件埋点 |
| 下载转化率 | ≥ 40% (访客→下载) | 下载数 / UV |
| 平均停留时间 | ≥ 3 分钟 | Google Analytics |
| Google 索引页面数 | ≥ 10 页 | Google Search Console |
| 自然搜索点击 | ≥ 500 次/月 | Google Search Console |
| 参数链接分享次数 | ≥ 200 | Copy Link 按钮事件 |
| 跳出率（生成器页） | ≤ 30% | Google Analytics |
| 核心关键词排名 | "gridfinity generator" Top 10 | Ahrefs / Search Console |
| Reddit/社区提及 | ≥ 5 次自然提及 | 手动监控 |

---

## 9. 里程碑时间线

| 周 | 里程碑 | 交付物 |
|----|--------|--------|
| **W1** | 核心引擎 + 基础 UI | Manifold Worker 集成、箱体参数生成、Three.js 预览、STL 下载 |
| **W2** | 产品打磨 + 内容 | 底板生成、模板库、URL 分享、首页、5 篇 SEO 内容页、移动端适配 |
| **W2 末** | **MVP 上线** | 部署到 Vercel，提交 Google Search Console |
| W3-W4 | 增长启动 | 社区推广、10 篇追加内容、用户反馈收集 |

---

## 10. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| ManifoldCAD WASM 在低端设备性能不足 | 用户体验差 | 设置参数上限（6x6x12），超大模型显示警告 |
| Gridfinity 尺寸精度问题导致打印件不兼容 | 用户投诉、信任丧失 | 上线前用 3 款切片器验证 + 实际打印测试 |
| 竞品 gridfinitygenerator.com 快速迭代 | 功能差距缩小 | 专注内容 SEO 护城河 + 免费定位差异化 |
| 移动端 WebGL 兼容性问题 | 移动用户无法使用 | 降级方案：显示参数表 + 静态预览图 |
| SEO 内容被 AI 生成内容淹没 | 排名竞争加剧 | 提供真正有价值的工具集成内容（计算器、互动图表），不可被纯文本替代 |
