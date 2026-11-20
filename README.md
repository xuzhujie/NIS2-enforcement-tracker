# NIS2 Enforcement Tracker

面向 EU NIS2 Directive (EU) 2022/2555 的 source-first 追踪器，重点记录：

- 27 个成员国的国家页转置状态与公开程序状态
- 欧委会公开的正式通知、理由意见和 CJEU 转交
- 国家战略入口、主管机关、CSIRT 和 SPOC
- 可回到官方原文的证据快照、历史快照和变更日志

## 本地运行

```bash
npm install
npm run dev
```

常用校验：

```bash
npm test
python3 -m unittest discover -s tests -v
npm run lint
npm run build
```

## 数据分层

`src/data/nis2.ts` 保存可随代码版本审阅的决定批次和 27 国登记簿构建逻辑；`src/data/countryProfiles.ts` 保存欧委会国家页核验到的国家节点资料。

- `current_status`：当前公开程序状态，区分 `notified` 和 `referred_to_cjeu`
- `transposition_state`：国家页显示的 `transposed`、`reasoned_opinion` 或 `not_yet_transposed`
- `national_measure`：只有官方来源明确列出具体国内措施时才填写；否则保持未提供
- `last_verified_at`：本项目复核日期；国家页自身的最后更新时间单独保存在 profile 证据中
- `public/data/updates.json`：自动监测的发现线索，不自动改写国家登记簿
- `public/data/history.json`：公开决定链条、登记簿快照和变更日志

缺失字段是有意的证据边界，不用推断值填充。任何国家状态或法律结论都应回到最新官方原文复核。

## 官方来源

项目以 [EUR-Lex NIS2 Directive](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)、[欧委会 NIS2 转置总览](https://digital-strategy.ec.europa.eu/en/policies/nis-transposition) 及各国欧委会国家页为主；公开决定链接保存在 `publicDecisions` 和 `history.json`。

## 自动监测

本地执行：

```bash
npm run check:updates
```

`.github/workflows/monitor.yml` 每天运行一次，也支持 `workflow_dispatch` 手动运行。它只抓取欧委会官方 RSS / 新闻页中的 NIS2 相关线索，并在规范化后的 `public/data/updates.json` 发生变化时提交；有变化时还会显式触发 Pages 部署。源站失败或没有相关结果时保留上一次有效文件，不会清空 feed。

自动 feed 是发现层：新动态进入后需要人工核验，才可以修改 `src/data/countryProfiles.ts`、`src/data/nis2.ts` 或历史文件。

## GitHub Pages 部署

`.github/workflows/deploy.yml` 会在 `main` 分支 push 或手动触发时：

1. 安装锁定依赖并运行 TypeScript / Python 测试
2. 构建 `dist`
3. 使用 GitHub Pages artifact 部署静态站点

在仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。工作流需要 `pages: write` 和 `id-token: write` 权限；默认的 GitHub Actions 权限应允许 monitor workflow 提交 `public/data/updates.json`。

Vite 已配置 `base: './'`，因此仓库页和自定义域名都可以使用相对资源路径。

## 目录速览

```text
src/components/        看板、国家矩阵、决定卡片、历史面板
src/data/               27 国数据、决定批次、指标计算
public/data/            运行时加载的动态 feed 与历史文件
scripts/check_updates.py 官方动态发现脚本
.github/workflows/      监测与 Pages 部署
tests/                  TypeScript 指标/导出测试与 Python feed 测试
```

## License / 使用边界

这是研究和合规运营辅助工具，不构成法律意见。公开程序状态、国家页状态与实体合规结论必须分开理解。
