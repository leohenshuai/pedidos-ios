# 订货单 iOS 应用

WKWebView 壳 + 内置网页（`Pedidos/Web/`，已拆分为 `pedidos.html` + `css/app.css` + `js/*.js`；
拆分后可用 `python3 tools/smoke_web.py` 做冒烟检查，CI 构建前也会跑）。
未签名 IPA，需用 TrollStore / AltStore / Sideloadly 等重签后安装。

## 构建（手动触发）

构建只通过 GitHub Actions 手动触发：仓库 → Actions → “Build unsigned IPA” → Run workflow。
推代码到 `main` 不会再自动构建，也不需要再提交 “Trigger final build” 空提交。
成功后 IPA 会作为构建产物（artifact）和 Release 附件发布。

## 版本与更新检查

- 对外版本号只有一处来源：`project.yml` 的 `MARKETING_VERSION`（当前 1.7）。
- build 号用 Actions 的 `run_number`，打包时写入 `CFBundleVersion`。
- Release 标签为 `v<版本>.<build>`，如 `v1.7.93`，标题 “Pedidos 1.7 (build 93)”。
- App 内更新检查（`ContentView.swift` 的 `checkUpdate`）读取最新 Release 标签：新格式取最后一段数字作 build 号与本机比较；旧格式 `build-N` 标签兼容处理。跳过的版本按 build 号记录。
- 旧的 `build-N` Release 不再产生；已有的如需清理，在 GitHub 网页 Releases 页面手动删除。

## 数据与备份

- 数据保存在 App 的 Documents/订货单/pedidos_data.json，在“文件”App → 我的 iPhone → 订货单 里可见。
- 自动恢复点在同目录的 `backups/` 下；设置页可导出全部备份、查看恢复点、导入备份。
- 设置页“导出到「文件」App”会把当前数据直接写成 `Documents/订货单/pedidos_export_<时间>.json`。

## AI 密钥

- AI 密钥在 App 内只保存在 iOS 钥匙串（Keychain，service `com.pedidos.app`、account `ai-key`），不写进 localStorage 或数据文件；浏览器里打开时仍保存在本机 localStorage。
- 旧版本存在 localStorage 里的密钥，升级后首次启动会自动迁进钥匙串并从 localStorage 清除。

## status 分支

CI 每次构建后会把构建日志摘要强制推送到 `status` 分支的 `STATUS.txt`（含 prep/build/pack 结果和 IPA 字节数/md5），只保留最新一次。不再保存 IPA 分片；IPA 本体在 Actions 产物和 Release 里。
