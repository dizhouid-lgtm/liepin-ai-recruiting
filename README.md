# Pixboom 招聘工作区 — 安装与接入

一套"用猎聘搜人 / 筛人"的 AI 作业工作区。一个 AI 编码助手当"大脑",读这里的 SOP，
驱动猎聘 CLI 搜人、按岗位 JD 筛人、出 PDF 交付。**沟通/面试不在本流程**（归 HR）。

依赖分两层。**第一层(引擎)对所有人一样;第二层(大脑)按你用的 AI 工具分支。**

---

## 第一层:引擎(所有人必装,与用什么 AI 无关)

| # | 装什么 | 怎么装 / 验证 |
|---|--------|---------------|
| 1 | **Node.js ≥ 20** | 官网装 LTS。验证 `node -v` |
| 2 | **Chrome 或 Edge** | 常规安装即可(CLI 用它驱动猎聘)。装在默认位置会自动检测;找不到再设环境变量 `CHROME_PATH` 指向浏览器可执行文件 |
| 3 | **猎聘 CLI** | `npm i -g @viyzhu/liepin-cli`。验证 `liepin help` |
| 4 | **登录猎聘(招聘者账号)** | 你需要**自己的猎聘 R 端账号**。首次:`LIEPIN_HEADLESS=false liepin login`(Windows PowerShell:`$env:LIEPIN_HEADLESS='false'; liepin login`),扫码登录。登录态存在你本机,**不随本包附带**。被踢后重登同此命令 |

> ⚠️ 第 4 步是真门槛:没有猎聘招聘者账号,后面一切跑不起来。本包不含、也不该含任何人的登录态。
>
> mac/Linux 用反斜杠的地方换成正斜杠;设环境变量用 `KEY=值 命令` 或 `export KEY=值`。脚本本身跨平台。

装完自检(不需登录):
```bash
node .claude/skills/pxb-liepin/scripts/dedup.mjs stats _共享/模板/去重台账模板.csv
node .claude/skills/pxb-liepin/scripts/lock.mjs acquire 自检 && node .claude/skills/pxb-liepin/scripts/lock.mjs release
```
能打印台账计数、能占锁又释放,即引擎就绪。

---

## 第二层:大脑(按你的 AI 工具二选一)

这套工作区的价值在于一个 AI 助手**读 SOP、做判断**(挑人、对 JD、迭代)。选你用的:

### 分支 A — 用 Claude Code(零改造,推荐)
1. 把整个 `pixboom-recruiting/` 文件夹作为工作目录用 Claude Code 打开。
2. `CLAUDE.md` 和 `.claude/skills/`(pxb-liepin、liepin-cli)会被**自动发现**。
3. 直接说"给 <岗位> 搜人 / 下一轮 / 开简历给我看",它会自动调用 `pxb-liepin` skill 跑流程。

> 也可把两个 skill 拷到全局 `~/.claude/skills/`(Win:`%USERPROFILE%\.claude\skills\`)跨工作区复用;但工作区内放着更内聚。

### 分支 B — 用别的 AI 编码工具(Codex / Cursor / Copilot / Gemini CLI 等)
这些工具**不会自动发现 `.claude/skills/`**,需要手动把 SOP 喂给它:
1. 用该工具打开 `pixboom-recruiting/` 文件夹。
2. 入口是仓库根的 **`AGENTS.md`**(Codex/Cursor/部分 Copilot 会自动读;不自动读的,首条消息让它"先读 AGENTS.md 和那两份 SKILL.md")。
3. `AGENTS.md` 会指引它读 `.claude/skills/pxb-liepin/SKILL.md`(主流程)+ `liepin-cli/SKILL.md`(命令),把它们当作业手册。
4. **降级点**:若该工具没有子代理,SKILL 里"派 subagent 跑小循环"就由它自己串行跑——逻辑不变(本就单账号串行)。

> 机械活已全部脚本化(`scripts/*.mjs`),与 AI 工具无关。无论 A/B,AI 只是按 SKILL 给出的 `node ... ` 命令调用脚本、读输出、做判断。

---

## 跑起来之后:第一次搜人
1. 复制 `_共享/模板/` 三件到一个新岗位文件夹(改名,如 `机械工程师/`),建空 `待定/`。照 `JD模板.md` 填该岗 JD(公司素材见 `CLAUDE.md`)。
2. 告诉 AI:"按 `pxb-liepin` 给 `机械工程师` 搜人"。
3. 它会:抢锁 → 搜一页登台账 → 粗筛挑 ~10 → 精筛按 JD 判 → 攒够一批出 PDF 到 `待定/` → 你复核拍板 → 入池 + 回写 JD,下一轮更准。

## 文件结构 / 治理
见 `CLAUDE.md`。简言:**判断只看各岗 `JD.md`;通用背景/结构在 `CLAUDE.md`;作业程序在 `pxb-liepin` skill;机械脚本在 `scripts/`。**

## 隐私
简历只存本地、不外发、不传任何外部服务。本包不含真实候选人数据;岗位文件夹由你按 `_共享/模板/` 现建。

## 换公司用
本流程与脚本**岗位中立、公司无关**。换公司只改 `CLAUDE.md`「关于 Pixboom」一节 + 各岗 `JD.md` 即可。

---
### 故障速查
| 现象 | 处理 |
|---|---|
| `liepin: command not found` | 第一层第 3 步没装好;`npm i -g @viyzhu/liepin-cli`,确认 `npm bin -g` 在 PATH |
| 脚本报"定位 @viyzhu/liepin-cli 失败" | 同上;`pdf.mjs` 靠 `npm root -g` 找包 |
| 搜索/拉简历非零退出 | 多半反爬或被踢:停手、别连刷、重登 `liepin login`,降低频率 |
| 出 PDF 存成登录页 | 账号被踢,重登后再出 |
| 多对话/多岗同时搜 | 不支持并发:单账号单锁,靠 `_共享/搜索队列.md` 排队 |
