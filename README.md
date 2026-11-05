<p align="center"><img src="apps/web/public/favicon-dark.svg" width="72" height="72" alt="WeFlow" /></p>

# WeFlow

个人使用的本地优先技术图文写作工具，基于 WeMD 独立维护。使用 Markdown 编写文章，预览后复制到微信公众号。

- 支持代码高亮、Mermaid、数学公式、表格及图片。
- 新文章默认使用「简洁技术」主题，也可手动切换已有主题。
- 文章保存在浏览器或所选本地文件夹；保留 Markdown 文件保存、语义 HTML 复制与 PNG 长图输出。
- 本阶段仅调整品牌与写作体验，AI 和 OSS 接入留到后续阶段。

## 本地运行

需要 Node.js 22 和 pnpm 9。

```sh
pnpm install --frozen-lockfile
pnpm dev:web
```

打开 http://localhost:5173 。支持安装为 PWA。生产构建运行 `pnpm --filter @wemd/web build`，桌面开发运行 `pnpm dev:desktop`。

### Windows 一键启动

安装 Node.js 22 和 pnpm 9 后，双击根目录的 `weflow.cmd` 即可后台启动 Web 服务；首次缺少依赖时会自动安装。也可以在 PowerShell 中运行：

```powershell
.\weflow.cmd start    # 启动（默认操作）
.\weflow.cmd stop     # 关闭
.\weflow.cmd restart  # 重启
.\weflow.cmd status   # 查看运行状态
```

启动后打开 http://localhost:5173 。关闭命令窗口不会停止服务，请使用 `stop` 关闭。重复启动不会创建多个实例；端口被其他程序占用时会报错。脚本仅管理由它启动的服务，日志保存在 `.tmp/weflow/stdout.log` 和 `.tmp/weflow/stderr.log`。安装或更新依赖仍可手动运行 `pnpm install --frozen-lockfile`。

## Docker

```sh
docker compose up -d --build
```

默认构建当前源码为 `weflow-web:local`，访问 http://localhost:8080 。本地文件夹模式需要 localhost 或 HTTPS，以及支持 File System Access 的 Chrome / Edge。

## 文档与反馈

- [写作与保存](docs/writing.md)
- [开发指南](CONTRIBUTING.md)
- [P0 基线](docs/p0-baseline.md)
- [P1 验收记录](docs/p1-verification.md)
- [个人仓库](https://github.com/liuzk233/WeFlow) · [问题反馈](https://github.com/liuzk233/WeFlow/issues)

## 版权与致谢

基于 WeMD，保留原始 Git 历史和 [MIT 版权声明](LICENSE) © WeMD Team。公众号深色预览参考 [wechatjs/mp-darkmode](https://github.com/wechatjs/mp-darkmode)。第三方依赖遵循各自许可证。
