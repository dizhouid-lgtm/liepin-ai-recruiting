# Pixboom 招聘工作区

> 用**猎聘 CLI + 一个 AI 助手**搜人 / 筛人的跨平台作业工作区。AI 当"大脑"读这里的 SOP，驱动猎聘搜人、按岗位 JD 筛人、出 PDF 交付。Claude Code 与其他 AI 编码工具通用。

招聘流程里**重复的体力活**——翻页搜人、查重、对着标准筛简历、攒一批出 PDF、复盘调标准——交给 AI 按固定 SOP 跑；**判断**（这人对不对口、标准怎么调）留给人。沟通 / 面试不在本流程（归 HR）。

## 特点
- **两段式筛人**：粗筛(看卡片砍硬约束) → 精筛(读简历按 JD 三关判)，自动去重、连轮跑到攒够一批。
- **JD 越用越准**：每批复盘把"为什么入选/被毙"回写进岗位 JD，下一轮搜得更准。
- **跨平台 / 跨工具**：机械活全是 Node 脚本(Win/mac/Linux 通吃)；Claude Code 自动接入，其他 AI 工具读 `AGENTS.md` 接入。
- **隐私优先**：简历只存本地、不外发；仓库不含任何真实候选人数据。

## 它不做什么
不打招呼、不发消息、不面试(那些归 HR)。本工作区只负责"搜到并筛出合适的人"。

---

## 前置环境（所有人必装，与用什么 AI 无关）

| # | 装什么 | 怎么装 / 验证 |
|---|--------|---------------|
| 1 | **Node.js ≥ 20** | 官网装 LTS。验证 `node -v` |
| 2 | **Chrome 或 Edge** | 常规安装即可(CLI 用它驱动猎聘)。默认位置会自动检测；找不到再设环境变量 `CHROME_PATH` 指向浏览器可执行文件 |
| 3 | **猎聘 CLI** | `npm i -g @viyzhu/liepin-cli`。验证 `liepin help` |
| 4 | **猎聘招聘者账号** | 需**你自己的猎聘 R 端账号**(能登录 lpt.liepin.com)。**登录这步不用自己敲命令**——首次搜人时 AI 会帮你打开登录页、你扫码即可(见下文流程)。账号本身得你先有 |

> ⚠️ 环境层只需"装好 + 有账号"。**真正的登录、填 JD 都在你跟 AI 的对话里完成,不碰命令行**:你只管说要招什么岗、扫个码,其余 AI 引导。
> mac/Linux 把反斜杠换正斜杠;设环境变量用 `KEY=值 命令` 或 `export KEY=值`。脚本本身跨平台。

> **(可选但推荐)无头安全网**:本工作区的脚本已强制无头,正常不会弹浏览器。但若 AI 偶尔绕过脚本裸敲 `liepin`,npm 发布版默认会弹有头窗口。跑一次下面的补丁,把发布版默认也改成无头(login 仍可有头扫码),从根上免疫:
> ```bash
> node .claude/skills/pxb-liepin/scripts/patch-headless.mjs
> ```
> `npm update @viyzhu/liepin-cli` 会覆盖补丁,更新后重跑一次即可(幂等)。

装完自检(不需登录)——能打印计数、能占锁又释放即就绪:
```bash
node .claude/skills/pxb-liepin/scripts/dedup.mjs stats _共享/模板/去重台账模板.csv
node .claude/skills/pxb-liepin/scripts/lock.mjs acquire 自检 && node .claude/skills/pxb-liepin/scripts/lock.mjs release
```

## 安装与接入（按你的 AI 工具二选一）

### A. Claude Code（零改造，推荐）
1. 用 Claude Code 打开本文件夹作为工作目录。
2. `CLAUDE.md` 与 `.claude/skills/`(pxb-liepin、liepin-cli)会被**自动发现**。
3. 直接说「给 \<岗位\> 搜人 / 下一轮 / 开简历给我看」，它会自动按 `pxb-liepin` skill 跑流程。

### B. 其他 AI 工具（Codex / Cursor / Copilot / Gemini CLI 等）
这些工具**不会自动发现 `.claude/skills/`**，需手动把 SOP 喂给它:
1. 用该工具打开本文件夹。
2. 入口是根目录 **`AGENTS.md`**(Codex/Cursor/部分 Copilot 会自动读;不自动读的，首条消息让它"先读 AGENTS.md 和那两份 SKILL.md")。
3. `AGENTS.md` 指引它把 `pxb-liepin/SKILL.md`(主流程) + `liepin-cli/SKILL.md`(命令) 当作业手册。
4. **降级点**:若该工具没有子代理，SKILL 里"派 subagent 跑小循环"由它自己串行跑——逻辑不变(本就单账号串行)。

## 快速开始：第一次搜人
你只需开口,**JD、建文件夹、登录都交给 AI 引导**:
1. 告诉 AI:「按 `pxb-liepin` 给 \<岗位\> 搜人」——有现成 JD 就直接贴给它;**没有也没关系,AI 会多轮问你把 JD 补全**(做什么、最看重啥、预算、城市、招几个…),写进该岗 `JD.md`,你确认后才开搜。
2. 首次/换机:AI 会打开猎聘登录页,**你扫码**即可(不用敲命令)。
3. 然后它自动跑:抢锁 → 搜一页登台账 → 粗筛挑 ~10 → 精筛按 JD 判 → **轮间报进度**(每轮约 10–20 分钟)→ 攒够一批出 PDF 到 `待定/` → 你复核(说清谁合适/为什么、谁不合适/为什么)→ 入池 + 回写 JD,下一轮更准。

> 想自己先建好岗位文件夹也行:复制 `_共享/模板/` 三件到新文件夹(改名),建空 `待定/`,照 `JD模板.md` 填(公司素材见 `CLAUDE.md`)。

## 文件结构
```
pixboom-recruiting/
├── README.md            本文件:装环境 + 接入
├── CLAUDE.md            背景 + 结构(岗位中立)。Claude Code 自动读
├── AGENTS.md            同上镜像,给非 Claude 工具
├── LICENSE              MIT
├── .claude/skills/
│   ├── pxb-liepin/      作业流程 SKILL.md + scripts/(跨平台 Node 脚本)
│   └── liepin-cli/      猎聘命令参考
└── _共享/
    ├── 搜索队列.md       多对话/多岗排队防互顶
    └── 模板/            新岗位从这里复制三件
```
治理原则:**判断只看各岗 `JD.md`;通用背景/结构在 `CLAUDE.md`;作业程序在 `pxb-liepin` skill;机械脚本在 `scripts/`。**

## 隐私
简历只存本地、不外发、不传任何外部服务。本仓库不含真实候选人数据;`.gitignore` 已堵死 PDF、登录态与岗位数据，防误传。

## 换公司用
本流程与脚本**岗位中立、公司无关**。换公司只改 `CLAUDE.md`「关于 Pixboom」一节 + 各岗 `JD.md`。

## License
[MIT](LICENSE) © 2026 Pixboom

---

### 故障速查
| 现象 | 处理 |
|---|---|
| `liepin: command not found` | 前置第 3 步没装好;`npm i -g @viyzhu/liepin-cli`，确认 `npm bin -g` 在 PATH |
| 脚本报"定位 @viyzhu/liepin-cli 失败" | 同上;`pdf.mjs` 靠 `npm root -g` 找包 |
| 搜索/拉简历非零退出 | 多半反爬或被踢:停手、别连刷、重登 `liepin login`，降低频率 |
| 出 PDF 存成登录页 | 账号被踢，重登后再出 |
| 搜人/精筛时弹有头浏览器 | AI 绕过脚本裸调了 `liepin`，或没先登录。让它只用 `scripts/*.mjs`;并跑一次 `patch-headless.mjs` 当安全网 |
| 多对话/多岗同时搜 | 不支持并发:单账号单锁，靠 `_共享/搜索队列.md` 排队 |
