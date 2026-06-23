# AGENTS.md — 给非 Claude 的 AI 编码工具(Codex / Cursor / Copilot / Gemini CLI 等)

本文件是 `CLAUDE.md` 的镜像入口。Claude Code 会自动读 `CLAUDE.md` 并自动发现 `.claude/skills/`；
**其他工具通常不会自动发现 skill**,所以本工作区的"大脑"要靠你**手动读取**下面两份 SOP。

## 你必须先读的两份文件(本工作区的全部作业逻辑)
1. `.claude/skills/pxb-liepin/SKILL.md` —— 搜人/筛人主流程(两层循环、粗筛/精筛、提报、JD 迭代)。**搜任何人之前先读它。**
2. `.claude/skills/liepin-cli/SKILL.md` —— liepin CLI 命令参考。

再读 `CLAUDE.md` 拿背景与文件结构。判断标准只看各岗 `JD.md`。

## 与 Claude Code 的差异
- **skill 不会自动触发**:把上面两份当普通 SOP 文档,任务相关时主动 Read。
- **你自己从头串行跑,不用子代理**:整个流程单账号、单锁、串行,没有并行收益。直接你一个 agent 跑完搜→筛→提报的全过程,**每跑完一轮输出一行进度**给用户看(别闷头跑到底)。
- **机械活已脚本化,与工具无关**:所有 liepin 调用、去重、出 PDF 都通过 `.claude/skills/pxb-liepin/scripts/*.mjs`(Node,跨平台)。你只需按 SKILL 里给的 `node SC/xxx.mjs ...` 命令调用并读其输出。
- **路径**:命令里的相对路径相对工作区根目录;脚本目录 `SC = .claude/skills/pxb-liepin/scripts/`。

## 开干前的准备(都在对话里,先做完再抢锁/搜)
**第一步:确认/补全 JD。** 搜任何人之前先确保该岗有够用的 JD(判断只看它)。用户直接给就校验完整度(硬约束:预算/城市/经验/学历/年龄/目标人数 + 最看重的能力);**用户没 JD 或只有一句话→别急着搜,多轮提问补全**(做什么、最看重啥、预算、城市、招几个、对标公司/不要的背景),写进 `JD.md`,用户确认后再抢锁。一次问一两个。

**第二步:确认登录(首跑/换机/被踢的头号坑)。** 搜之前确认这台机器已登录猎聘——**你直接运行 `LIEPIN_HEADLESS=false liepin login`(PowerShell:`$env:LIEPIN_HEADLESS='false'; liepin login`),让用户扫弹出的二维码**(用户不用自己敲命令)。没登录就开干,liepin 会撞登录页弹有头浏览器又关掉。
- 不确定是否已登录 → 先问用户"这台机器登录过猎聘吗?",确认/登录成功**再**开干。
- 除这条 login 外**永不**裸跑 `liepin`、永不开有头浏览器;搜人/精筛全程无头,**过程中不该弹任何窗口**,弹了=没登录或有人裸调了 liepin,停手排查。
- 开搜时告诉用户**每轮约 10–20 分钟**(单账号串行+反爬抖动),别让他以为卡死。

## 红线(同 SKILL,任何工具都不许破)
单账号串行绝不并发调 liepin · 全程无头不弹窗 · 脚本非零退出即停 · 原始 JSON 不进上下文 · 简历只存本地不外发 · 只 `search`/`resume` 不 `greet`。

> 环境安装见仓库根 `README.md`。
