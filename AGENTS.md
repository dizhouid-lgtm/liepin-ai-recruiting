# AGENTS.md — 给非 Claude 的 AI 编码工具(Codex / Cursor / Copilot / Gemini CLI 等)

本文件是 `CLAUDE.md` 的镜像入口。Claude Code 会自动读 `CLAUDE.md` 并自动发现 `.claude/skills/`；
**其他工具通常不会自动发现 skill**,所以本工作区的"大脑"要靠你**手动读取**下面两份 SOP。

## 你必须先读的两份文件(本工作区的全部作业逻辑)
1. `.claude/skills/pxb-liepin/SKILL.md` —— 搜人/筛人主流程(两层循环、粗筛/精筛、提报、JD 迭代)。**搜任何人之前先读它。**
2. `.claude/skills/liepin-cli/SKILL.md` —— liepin CLI 命令参考。

再读 `CLAUDE.md` 拿背景与文件结构。判断标准只看各岗 `JD.md`。

## 与 Claude Code 的差异(降级说明)
- **skill 不会自动触发**:把上面两份当普通 SOP 文档,任务相关时主动 Read。
- **subagent 派发**:SKILL 里"派 subagent 跑小循环"——若你的工具没有子代理,**降级成你自己串行跑**,逻辑不变(本来就是单账号串行)。
- **机械活已脚本化,与工具无关**:所有 liepin 调用、去重、出 PDF 都通过 `.claude/skills/pxb-liepin/scripts/*.mjs`(Node,跨平台)。你只需按 SKILL 里给的 `node SC/xxx.mjs ...` 命令调用并读其输出。
- **路径**:命令里的相对路径相对工作区根目录;脚本目录 `SC = .claude/skills/pxb-liepin/scripts/`。

## 红线(同 SKILL,任何工具都不许破)
单账号串行绝不并发调 liepin · 脚本非零退出即停 · 原始 JSON 不进上下文 · 简历只存本地不外发 · 只 `search`/`resume` 不 `greet`。

> 环境安装见仓库根 `README.md`。
