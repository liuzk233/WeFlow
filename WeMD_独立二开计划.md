# WeFlow 独立二次开发计划（基于 WeMD）

> 用途：作为 Codex 的开发任务说明。以 [WeMD](https://github.com/tenngoxars/WeMD) 当前源码为基座，开发**个人使用的 AI 技术图文写作工具 WeFlow**。独立公有仓库已创建：[liuzk233/WeFlow](https://github.com/liuzk233/WeFlow)，Git 远程地址为 `https://github.com/liuzk233/WeFlow.git`。

## 1. 目标与边界

- **写作主导权在作者**：作者提供选题、观点和提纲；AI 负责按需扩写、润色、审阅，不擅自修改技术结论。
- **写作体验**：Markdown、代码高亮、Mermaid、表格；简洁公众号排版与预览。
- **图片流程**：优先复用阿里云 OSS 图床；后续接入 AI 封面和文章配图。
- **发布流程**：先保留“复制富文本 → 粘贴微信公众号后台”，暂不开发公众号发布 API。
- **仓库策略**：在 `liuzk233/WeFlow` 完全独立维护，**不 Fork、不提交上游 PR、不同步上游更新**；保留现有 Git 历史和原始 MIT 版权声明。

## 2. 阶段任务

### P0｜建立独立项目与运行基线

- [x] 从 `tenngoxars/WeMD` 克隆源码，保留 Git 历史。
- [x] 创建独立公有仓库 `liuzk233/WeFlow`。
- [x] 删除原 `origin`，将 `origin` 设置为 `https://github.com/liuzk233/WeFlow.git`（不要配置 `upstream`）。
- [x] 使用 Node.js 22、pnpm 9 安装依赖，启动 Web 端。
- [x] 运行现有 lint、test、build，记录基线问题；不为通过检查而随意改业务逻辑。
- [x] 审查 GitHub Actions、官方服务域名、发布配置和密钥使用方式；停用不需要的自动发布任务。

> P0 本地验收已完成：标题、代码块、表格、Mermaid、三张内嵌本地图片的编辑、预览、刷新恢复和富文本复制均已验证。公众号后台验收仍未执行。检查过程、环境限制和外部依赖见 [docs/p0-baseline.md](docs/p0-baseline.md)。

初始化示例（从源码克隆到本地目录 `D:\0_workspace\1_project\WeFlow`；若该目录已包含源码及 Git 历史，跳过克隆和切换目录步骤）：

```bash
git clone https://github.com/tenngoxars/WeMD.git WeFlow
cd WeFlow
git remote remove origin
git remote add origin https://github.com/liuzk233/WeFlow.git
git push -u origin main

corepack enable
pnpm install
pnpm dev:web        # http://localhost:5173
```

### P1｜品牌与个人写作体验

- [x] 修改应用名称、页面标题、图标和 README；保留原 `LICENSE` 及必要的第三方声明。
- [x] 保留现有 Markdown、公众号兼容渲染、预览和复制能力。
- [x] 默认使用一套简洁技术主题，验证代码块、表格、Mermaid 和图片显示。
- [x] 检查文章本地保存、恢复与导出流程。

> P1 实现与本地验证已完成，详见 [docs/p1-verification.md](docs/p1-verification.md)。公众号后台草稿、Windows 系统目录选择器及 Electron 安装实机检查仍待验收；当前不进入 P2/P3。

### P2｜AI 辅助写作与 OSS

- [ ] 复用现有 AI API 配置和选区改写能力；优先支持“选区润色 / 扩写 / 精简 / 全文审阅”。
- [ ] AI 修改必须由用户确认应用，保留撤销能力；不要自动覆盖整篇文章。
- [ ] 配置并验证阿里云 OSS 上传、图片粘贴、URL 插入和预览。
- [ ] **不要把 OSS 长期密钥或 AI Key 提交到仓库**；如果浏览器端上传，后续优先改用受限权限或临时凭证。

### P3｜后续扩展（当前不做）

- [ ] AI 生成封面、章节插画，并上传 OSS、插入 Markdown。
- [ ] AI 给出插图位置建议；技术架构图优先采用 Mermaid 等可编辑格式。
- [ ] 可选：文章管理 API、公众号草稿箱同步。仅在真实需要时启动。

## 3. 每阶段验收

- [x] `pnpm dev:web` 可正常启动，基础编辑与预览可用。
- [x] `pnpm --filter @wemd/web build` 通过；受影响模块的 lint/test 通过。
- [ ] 复制一篇包含**标题、代码块、表格、Mermaid、3 张图片**的文章到公众号后台，保存草稿、重新打开并检查样式和图片。
- [x] 每个功能独立提交，提交说明清楚；不破坏原有功能。

## 4. 给 Codex 的执行要求

1. **先阅读**仓库的 `README.md`、`CONTRIBUTING.md`、根目录 `package.json` 和相关源码，确认实际结构，不要凭计划猜测实现。
2. **先执行 P0，再执行 P1**；不要一次性实现 P2/P3。每阶段先说明拟修改文件，再进行小范围改动。
3. 保持现有架构（`apps/web`、`apps/electron`、`apps/server`、`packages/core`）；没有必要不要大规模重构或重命名 workspace 包。
4. 除首次获取基座源码外，不访问、推送或提交 PR 到 WeMD 上游；远程仓库推送只针对我明确配置并授权的个人仓库 `liuzk233/WeFlow`（`https://github.com/liuzk233/WeFlow.git`）。
5. 完成一阶段后，列出：改动文件、运行命令、测试结果、遗留问题及下一步建议。

**当前状态：P0 已完成，P1 实现及本地验证已完成；继续完成 P1 外部验收，不进入 P2/P3。**
