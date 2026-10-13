const seedanceModels = [
  {
    id: "seedance-2.5",
    label: "Seedance 2.5",
    maker: "ByteDance",
    status: "Default",
    resolutions: ["480p", "720p"],
    durations: [5, 10, 15, 20, 30],
    scenes: ["text", "image", "reference"],
    audio: true,
    maxImages: 6,
    credit: { "480p": 6, "720p": 12 }
  },
  {
    id: "seedance-2.0",
    label: "Seedance 2.0 Standard",
    maker: "ByteDance",
    status: "Available",
    resolutions: ["480p", "720p"],
    durations: [5, 10],
    scenes: ["text", "image", "reference"],
    audio: true,
    maxImages: 6,
    credit: { "480p": 4, "720p": 8 }
  },
  {
    id: "kling-3.0",
    label: "Kling 3.0",
    maker: "Kuaishou",
    status: "Popular",
    resolutions: ["720p", "1080p"],
    durations: [5, 10, 15],
    scenes: ["text", "image"],
    audio: true,
    maxImages: 2,
    credit: { "720p": 2, "1080p": 2 },
    audioCredit: { "720p": 3, "1080p": 4 }
  },
  {
    id: "wan-2.7",
    label: "Wan 2.7",
    maker: "Alibaba",
    status: "New",
    resolutions: ["720p", "1080p"],
    durations: [5, 10, 15],
    scenes: ["text", "image"],
    audio: false,
    maxImages: 2,
    credit: { "720p": 2, "1080p": 3 }
  },
  {
    id: "minimax-h3",
    label: "MiniMax H3",
    maker: "MiniMax",
    status: "New",
    resolutions: ["768P", "2K"],
    durations: [6, 10, 15],
    scenes: ["text", "image"],
    audio: false,
    maxImages: 2,
    credit: { "768P": 2, "2K": 3 }
  },
  {
    id: "grok-imagine-video-1.5",
    label: "Grok Imagine Video 1.5",
    maker: "xAI",
    status: "Preview",
    resolutions: ["480p", "720p"],
    durations: [5, 8, 10, 15],
    scenes: ["text", "image"],
    audio: false,
    maxImages: 7,
    credit: { "480p": 1, "720p": 1 }
  }
];

const seedanceCopy = {
  en: {
    nav: { create: "Create", models: "Models", guides: "Guides", pricing: "Pricing", signIn: "Sign in" },
    toolbar: { direction: "Direction", page: "Page", language: "Language", home: "Homepage", guide: "Model guide", hide: "Hide controls", show: "Design controls" },
    direction: {
      a: { name: "Director’s Console", note: "Product-first · balanced" },
      b: { name: "Contact Sheet", note: "Editorial · visual" },
      c: { name: "Production Ledger", note: "Technical · precise" }
    },
    hero: {
      status: "Six video model lines are available",
      title: "Direct the shot. Choose the right AI video model.",
      body: "Create with Seedance, Kling, Wan, MiniMax H3 or Grok Imagine. The console shows only compatible controls and the exact product credit charge before you generate.",
      guide: "Explore the model guides",
      facts: [
        ["6 model lines", "Seedance 2.5/2.0 plus four current Kie-backed models"],
        ["Model-aware controls", "Workflow, resolution, duration and audio reconcile automatically"],
        ["Exact product credits", "Visible before every generation"]
      ],
      disclaimer: "Seedance AI is an independent service using third-party API access. Model names and trademarks belong to their respective owners."
    },
    generator: {
      title: "New shot",
      project: "Untitled sequence",
      scene: "Workflow",
      scenes: { text: "Text to video", image: "Image to video", reference: "Visual reference" },
      prompt: "Direction",
      placeholder: "Describe subject, action, camera, timing and sound…",
      defaultPrompt: "A brushed-metal speaker sits on wet black stone. Slow dolly-in as warm practical light catches the edge; restrained room tone.",
      reference: "Reference frame",
      referenceHelp: "PNG, JPG or WebP · up to 30 MB",
      addReference: "Add image",
      model: "Model",
      resolution: "Resolution",
      duration: "Duration",
      aspect: "Frame",
      audio: "Generate audio",
      cost: "Product cost",
      credits: "credits",
      ready: "Ready",
      generate: "Generate shot",
      generating: "Directing shot…",
      validation: "Add a direction before generating.",
      output: "Output stage",
      outputEmpty: "Your generated shot will appear here.",
      outputHint: "Review the settings and exact credit cost, then generate.",
      outputDone: "Prototype generation complete",
      outputDoneHint: "The production UI would show the returned video here.",
      prototype: "Prototype state"
    },
    proof: {
      label: "Available here today",
      title: "Product limits you can verify before spending credits.",
      body: "Model announcements and provider marketing are not the same as the settings available in this product. The generator is the source of truth for the current launch surface.",
      items: [
        ["01", "Eight allowlisted model modes", "Every visible product model maps to a reviewed server-side request adapter."],
        ["02", "480p through 2K by model", "Resolution options change with the selected model instead of implying one universal capability."],
        ["03", "Compatible controls only", "Workflow, aspect ratio, duration, image count and audio reconcile when the model changes."],
        ["04", "Credits fixed before generation", "The product charge is calculated before generation; confirmed failures are refunded."]
      ]
    },
    roster: {
      label: "Choose by shot requirements",
      title: "Current models, each with a real workflow.",
      open: "Open guide",
      items: {
        "kling-3.0": "Single-shot text or first/last-frame generation with 720p/1080p and optional sound.",
        "wan-2.7": "Flexible text framing or first/last-frame motion with prompt enhancement and negative direction.",
        "minimax-h3": "Text or frame-led generation with 768P/2K output and six text-to-video aspect ratios.",
        "grok-imagine-video-1.5": "Fast text or multi-image experimentation with focused 480p/720p product controls."
      }
    },
    contact: {
      label: "Output evidence",
      title: "A contact sheet should prove the product, not decorate the page.",
      frames: [
        ["SHOT 01", "Product output slot", "Seedance 2.5 · 5s · 720p"],
        ["SHOT 02", "Product output slot", "Kling 3.0 · 10s · 1080p"],
        ["SHOT 03", "Product output slot", "Wan 2.7 · 5s · 720p"]
      ],
      note: "No third-party demo media is presented as product output in this prototype."
    },
    prompt: {
      label: "Prompt like a shot list",
      title: "Give the model direction, not a bag of adjectives.",
      body: "A useful prompt states the subject, action, camera, timing and sound.",
      rows: [
        ["00:00–00:03", "Establish", "A brushed-metal speaker sits on wet black stone in a quiet studio."],
        ["00:03–00:06", "Move", "Slow dolly-in as warm practical light catches the product edge."],
        ["00:06–00:08", "Resolve", "A hand enters frame, stops beside the dial; restrained room tone."]
      ]
    },
    guide: {
      status: "Product guide · Last reviewed August 25, 2026",
      title: "Seedance 2.5: plan the shot before you spend credits.",
      body: "Use this page to separate upstream model claims from the workflows, resolutions, durations and audio controls currently available in this product.",
      cta: "Open the generator",
      source: "Independent product guide · not affiliated with ByteDance, Doubao or Dreamina",
      availability: "Available in this product",
      upstream: "Upstream context",
      rows: [
        ["Workflows", "Text, start frame, visual reference", "Model availability varies by access surface"],
        ["Duration", "5–30 seconds", "Confirm current upstream limits at source"],
        ["Resolution", "480p, 720p", "Do not infer 4K availability here"],
        ["Audio", "Optional synchronized audio", "Availability can vary by provider"]
      ]
    },
    footer: { statement: "Make the next shot easier to direct.", legal: "Independent product · Terms · Privacy" }
  },
  zh: {
    nav: { create: "开始创作", models: "模型", guides: "指南", pricing: "价格", signIn: "登录" },
    toolbar: { direction: "设计方向", page: "页面", language: "语言", home: "首页", guide: "模型内页", hide: "隐藏控制器", show: "设计控制器" },
    direction: {
      a: { name: "导演控制台", note: "产品优先 · 平衡" },
      b: { name: "导演选片桌", note: "编辑感 · 视觉化" },
      c: { name: "制作台账", note: "技术感 · 精确" }
    },
    hero: {
      status: "六条视频模型产品线已上线",
      title: "导演镜头，为它选择合适的 AI 视频模型。",
      body: "使用 Seedance、Kling、Wan、MiniMax H3 或 Grok Imagine 创作。控制台只展示兼容参数，并在生成前显示准确产品积分。",
      guide: "查看模型指南",
      facts: [
        ["6 条模型产品线", "Seedance 2.5/2.0 与四个当前 Kie 模型"],
        ["模型适配控制", "工作流、分辨率、时长与音频会自动匹配"],
        ["准确产品积分", "每次生成前清晰可见"]
      ],
      disclaimer: "Seedance AI 是使用第三方 API 的独立服务；模型名称与商标归各自权利方所有。"
    },
    generator: {
      title: "新镜头",
      project: "未命名序列",
      scene: "工作流",
      scenes: { text: "文生视频", image: "图生视频", reference: "视觉参考" },
      prompt: "导演指令",
      placeholder: "描述主体、动作、镜头、时间与声音……",
      defaultPrompt: "一只拉丝金属音箱放在潮湿黑色石面上。镜头缓慢推进，暖色实景灯扫过边缘，保留克制的室内环境声。",
      reference: "参考画面",
      referenceHelp: "PNG、JPG 或 WebP · 最大 30 MB",
      addReference: "添加图片",
      model: "模型",
      resolution: "分辨率",
      duration: "时长",
      aspect: "画幅",
      audio: "生成音频",
      cost: "产品积分",
      credits: "积分",
      ready: "就绪",
      generate: "生成镜头",
      generating: "正在执导镜头……",
      validation: "请先填写导演指令。",
      output: "输出画面",
      outputEmpty: "生成的镜头会显示在这里。",
      outputHint: "先检查设置与准确积分，再开始生成。",
      outputDone: "原型生成完成",
      outputDoneHint: "正式产品会在这里显示返回的视频。",
      prototype: "原型状态"
    },
    proof: {
      label: "本站当前可用",
      title: "在花费积分之前，就能核验的产品限制。",
      body: "模型发布信息和供应商宣传不等于本站已开放能力。生成器里能选到的设置，才是当前产品上线范围。",
      items: [
        ["01", "8 个白名单生成模式", "每个可见产品模型都映射到经过复核的服务器请求适配器。"],
        ["02", "按模型开放 480p 到 2K", "分辨率随模型变化，不把不同上游宣传合并为一项通用能力。"],
        ["03", "只展示兼容控制", "切换模型时，工作流、画幅、时长、图片数量与音频自动匹配。"],
        ["04", "生成前锁定积分", "产品积分会在生成前计算，供应商确认失败的任务会自动退还。"]
      ]
    },
    roster: {
      label: "按镜头需求选择",
      title: "当前模型，每个都有真实工作流。",
      open: "打开指南",
      items: {
        "kling-3.0": "单镜头文字或首尾帧生成，支持 720p/1080p 与可选声音。",
        "wan-2.7": "灵活文字画幅或首尾帧动作，支持提示词增强与负面指令。",
        "minimax-h3": "文字或帧驱动生成，支持 768P/2K 与六种文生视频画幅。",
        "grok-imagine-video-1.5": "快速文字或多图实验，本站聚焦开放 480p/720p 控制。"
      }
    },
    contact: {
      label: "输出证据",
      title: "接触印样应该证明产品，而不是装饰页面。",
      frames: [
        ["镜头 01", "产品输出占位", "Seedance 2.5 · 5 秒 · 720p"],
        ["镜头 02", "产品输出占位", "Kling 3.0 · 10 秒 · 1080p"],
        ["镜头 03", "产品输出占位", "Wan 2.7 · 5 秒 · 720p"]
      ],
      note: "本原型不会把第三方演示素材伪装成本站产品输出。"
    },
    prompt: {
      label: "像镜头表一样写提示词",
      title: "给模型明确导演指令，而不是堆砌形容词。",
      body: "实用提示词应包含主体、动作、镜头、时间与声音。",
      rows: [
        ["00:00–00:03", "建立场景", "一只拉丝金属音箱放在潮湿黑色石面上，置于安静摄影棚。"],
        ["00:03–00:06", "推动动作", "镜头缓慢推进，暖色实景灯扫过产品金属边缘。"],
        ["00:06–00:08", "完成镜头", "一只手进入画面并停在旋钮旁，保留克制环境声。"]
      ]
    },
    guide: {
      status: "产品指南 · 最近复核于 2026 年 8 月 25 日",
      title: "Seedance 2.5：花费积分前，先把镜头计划清楚。",
      body: "本页用于区分上游模型宣传，与当前产品实际开放的工作流、分辨率、时长和音频控制。",
      cta: "打开生成器",
      source: "独立产品指南 · 与字节跳动、豆包或即梦无隶属关系",
      availability: "本站当前可用",
      upstream: "上游背景",
      rows: [
        ["工作流", "文字、首帧、视觉参考", "不同访问渠道的模型能力可能不同"],
        ["时长", "5–30 秒", "当前上游限制应以官方来源为准"],
        ["分辨率", "480p、720p", "不能推断本站已开放 4K"],
        ["音频", "可选同步音频", "不同供应商的开放情况可能变化"]
      ]
    },
    footer: { statement: "让下一个镜头更容易执导。", legal: "独立产品 · 条款 · 隐私" }
  }
};

Object.assign(window, { seedanceModels, seedanceCopy });
