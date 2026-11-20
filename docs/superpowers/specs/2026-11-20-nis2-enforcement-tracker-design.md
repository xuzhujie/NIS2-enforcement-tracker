# NIS2 Enforcement Tracker · 成员国转置与公开决定设计说明

## Intent / 目标

为 NIS2（Directive (EU) 2022/2555）建立一个官方来源优先的研究型执法追踪器，首要回答两件事：

1. 27 个成员国目前处于什么转置/欧委会程序状态；
2. 欧委会已经公开作出了哪些与转置相关的决定，以及这些决定如何沿时间线推进。

首个版本是可公开部署的静态前端登记簿，不把新闻摘要、国家自报状态和欧委会正式程序混成一个“合规结论”。每条状态都要能回到官方页面、发布日期、证据快照和最后核验时间。

## 用户与成功标准

主要用户是需要快速判断成员国监管路径、准备跨国合规计划或做政策研究的法务/合规/公共政策团队。成功标准：

- 首屏 10 秒内看懂 27 国分布、当前高风险国家和最近一次公开决定；
- 点击一个国家能看到转置状态、国家主管机关 / CSIRT / SPOC（若官方页未提供则明确显示“未提供”）、国家措施链接和欧委会程序历史；
- 按国家、当前状态、公开决定阶段筛选后，登记簿、时间线、指标和导出结果保持一致；
- 中文与 English 可切换，官方来源链接始终可见；
- UI 明确区分“已通知/状态页显示”与“欧委会正式认定已完全合规”，避免过度表述。

## Goals

- 复用 DSA/DMA 的系列化交付方式：深蓝渐变摘要头、指标带、紧凑筛选、驾驶舱、登记簿、时间线、统计图表、自动动态、规则速览和官方来源目录。
- 把“成员国矩阵”设为首屏核心组件，而不是普通案件卡片的替换品。
- 提供公开决定登记簿：正式通知、理由意见、CJEU 转交，含日期、国家集合、INFR 编号（已公开时）、原文链接与证据摘要。
- 为数据后续迁移到 SQLite/Postgres 保留清晰对象边界和稳定字段。
- 支持 Markdown / JSON / CSV 导出当前筛选视图。

## Non-goals

- 首版不做登录、权限、人工编辑后台或数据库写入。
- 首版不覆盖所有国家层面的 NIS2 监管处罚、行政罚款、执法决定或法院判决；“公开决定”首版限定为与成员国转置程序直接相关、由欧委会公开发布的程序决定。
- 首版不建立地理地图或实时 GIS 图层；国家矩阵用可访问的状态网格表达，避免引入地图依赖和视觉噪声。
- RSS/网页监测只负责发现官方动态，不自动改变人工核验的成员国状态或程序结论。

## Anti-goals / 失败形态

- 用“已转置”代替“已通知转置措施”，或把状态页信息写成欧委会已完成的合规审查。
- 把 23 国正式通知、19 国理由意见和 4 国 CJEU 转交重复计数成 46/27 个国家。
- 做成只有指标和装饰卡片、没有来源证据的营销页。
- 让图表、矩阵和登记簿展示不同的筛选结果，或在移动端出现横向溢出、不可操作的表格。

## Constraints

- 当前仓库为空，没有既有代码、构建脚本或锁文件；沿用相邻 DSA/DMA 的 React + Vite + TypeScript 方向。
- 使用 React + Vite，数据先放在 `src/data/` 的 TypeScript 静态登记簿；动态文件放在 `public/data/updates.json`。
- 仅添加必要依赖，优先使用 `lucide-react` 图标；状态矩阵不引入第三方地图。
- 默认中文，支持 English；语言选择写入 `localStorage`。
- 视觉基线：浅灰背景、深蓝渐变 hero、白色表面、紧凑但可读的 12–14px 辅助文字、8–12px 圆角、蓝/绿/琥珀/红/紫状态色。
- 数据日期以 `DATA_AS_OF` 集中管理；数据说明、状态语义和免责声明在页面可见。
- 所有对外状态都必须带 `source_url`、`source_type`、`last_verified_at`，并保留双语 `evidence_snapshot`。

## Approaches considered

### A. DSA/DMA 系列化骨架 + NIS2 国家矩阵（选定）

沿用相邻项目的 React/Vite、双语、顶部摘要、筛选、驾驶舱、登记簿、时间线、图表、自动动态和官方来源目录；将“案件卡片”改成国家状态记录，并在驾驶舱首屏加入 27 国矩阵。优点是用户已熟悉、组件可以复用、开发成本可控，也能承接后续 DSA/DMA/NIS2 系列化扩展。

### B. 国家矩阵/地图优先

把首屏全部交给欧洲地图或地理热力图，点击国家进入详情，公开决定作为侧栏。国家发现效率高，但引入地图交互和无障碍成本，且不利于展示证据字段和公开决定原文。

### C. 证据表格优先

以一张强审计表格承载全部国家和决定字段，驾驶舱只做摘要。核验效率高，适合后续数据迁移，但不够接近 DSA/DMA 的交付呈现，也削弱了首次访问的状态判断。

### Selected

选择 A，并吸收 B 的“国家矩阵”作为驾驶舱核心；不做地图。这样既保持系列化交付，又把 NIS2 最重要的成员国差异放到首屏。

## Information architecture

### 1. Hero / 摘要头

- 眉题：`欧盟委员会 · NIS2 Directive (EU) 2022/2555`；提供 EUR-Lex 正文链接。
- 标题：`NIS2 执法追踪器`。
- 副标题：说明“成员国转置 + 欧委会公开决定 + 官方来源核验”，不写成法律结论。
- 指标卡：
  - `27` 个成员国；
  - `23` 个当前标记为“已通知/状态页显示”；
  - `4` 个已公开转交 CJEU；
  - `3` 轮公开程序节点（正式通知、理由意见、转交）。
- 右上角提供 `中文 / EN` 和当前数据核验日期。

### 2. Filters / 筛选条

- 当前视图：全部、需关注、已通知/状态页、理由意见、CJEU 转交；
- 成员国：27 国；
- 公开决定阶段：全部、正式通知、理由意见、CJEU 转交；
- 清除筛选；
- 导出当前筛选：Markdown / JSON / CSV。

### 3. Tabs / 主视图

- `驾驶舱`：待关注国家、数据新鲜度、矩阵、公开决定摘要和最近动态；
- `成员国登记簿`：27 国表格/列表，支持按状态、国家和最近更新排序，点击展开详情；
- `公开决定`：正式通知、理由意见、CJEU 转交登记簿，按日期倒序；
- `时间线`：从 2024-10-17 法定转置期限到最新公开程序的统一事件流；
- `统计图表`：状态分布、程序阶段覆盖、按国家的公开事件数、时间节点规模。

### 4. Supporting sections / 辅助区

- 自动监测动态：官方 NIS2 页面 / Press Corner 动态 feed，明确“动态发现不等于状态变更”；
- NIS2 执法规则速览：转置期限、欧委会 Article 258 程序阶段、国家主管机关 / CSIRT / SPOC 的对象含义；
- 官方数据来源：EUR-Lex、欧委会 NIS2 policy、成员国转置总览、欧委会正式通知/理由意见/转交页面、ENISA 相关入口；
- 页脚免责声明：研究和合规运营辅助工具，不构成法律意见。

## Data model

文件结构以相邻 DSA/DMA 的 `src/data/cases.ts` / `dashboardMetrics.ts` 方式组织，但将对象分成国家和决定两类。

### `MemberStateRecord`

```ts
interface MemberStateRecord {
  id: string
  code: string
  name: Bilingual
  current_status: 'notified' | 'referred_to_cjeu' | 'unknown'
  status_label: Bilingual
  national_measure?: Bilingual
  national_measure_url?: string
  competent_authority?: Bilingual
  csirt?: Bilingual
  spoc?: Bilingual
  national_strategy_url?: string
  first_date: string
  latest_date: string
  latest_stage: Bilingual
  commission_case_ids: string[]
  source_url: string
  source_type: string[]
  evidence_snapshot: Bilingual
  last_verified_at: string
  notes?: Bilingual
  events: EventItem[]
}
```

`notified` 的产品文案固定为“已通知 / 欧委会状态页显示”，不使用“已完全合规”。国家页面没有提供某项信息时使用空值和 `未在官方页面提供`，不猜测。

### `PublicDecisionRecord`

```ts
interface PublicDecisionRecord {
  id: string
  decision_type: 'formal_notice' | 'reasoned_opinion' | 'cjeu_referral'
  date: string
  title: Bilingual
  countries: string[]
  infr_refs?: Array<{ country: string; value: string }>
  authority: Bilingual
  summary: Bilingual
  legal_basis: string[]
  source_url: string
  source_type: string[]
  evidence_snapshot: Bilingual
  last_verified_at: string
}
```

首版种子数据包含三条欧委会公开程序批次：2024-11-28 对 23 国发出正式通知、2025-05-07 对 19 国发出理由意见、2026-07-08 将爱尔兰、西班牙、法国和荷兰转交 CJEU；每条批次既作为决定登记，也映射到对应国家的 `events`，避免计数重复。当前状态只取最新公开程序结果；理由意见是历史事件/决定阶段，不作为 2026-11-20 的独立当前状态。

### Shared records

- `Bilingual`：`{ zh: string; en: string }`；
- `EventItem`：日期、双语标题、双语描述、事件类型；
- `OfficialSource`：名称、URL、用途说明；
- `UpdatesData`：`updated_at`、官方动态条目；
- `DashboardMetrics`：由国家与决定数据派生，不在多个组件重复计算。

## State semantics and counting rules

- 国家总数固定为 27；国家矩阵按 `current_status` 计数。
- 公开决定按批次计数，国家覆盖数另算；不能把批次和国家记录相加作为“案件总数”。
- `reasoned_opinion` 只作为国家历史事件和公开决定阶段保留；若最新公开材料显示已转交 CJEU，则国家当前状态只显示 `referred_to_cjeu`，理由意见作为历史事件。
- “已通知”表示公开状态页/材料显示已经通知转置措施或不再处于当前公开程序，不代表欧委会已完成实体合规审查。
- “需关注”是产品工作队列标签，不是法律风险评级：首版默认只包含 `referred_to_cjeu` 国家，以及有最新未解释公开事件的记录。
- 各统计组件使用同一份 `getDashboardMetrics(records, decisions)` 派生结果；过滤后的矩阵、登记簿、时间线和导出均使用同一个 `filteredMemberStates` / `filteredDecisions`。

### Filter propagation

- 当前状态筛选（全部 / 已通知 / CJEU 转交）只看 `current_status`。
- 公开决定阶段筛选（正式通知 / 理由意见 / CJEU 转交）看国家是否出现在该决定批次的 `countries` 中；因此一个已转交 CJEU 的国家也会在“理由意见”历史阶段筛选中出现。
- 国家登记簿、矩阵、时间线、统计图表和导出都使用同一套派生过滤结果；页面显示当前筛选的语义提示，避免用户误以为这是当前状态。

## Interaction and accessibility

- 矩阵卡片是键盘可聚焦按钮；点击或按 Enter 展开国家详情；展开内容包含状态、主管机关、CSIRT、SPOC、程序历史和官方来源。
- 状态颜色不作为唯一信息来源，始终同时显示文字标签和图标/符号。
- 所有外链使用新标签页、明确的官方来源文本和可见外链图标。
- 筛选控件有可见 label，移动端筛选条可换行；矩阵在窄屏按两列或一列重排，不出现横向滚动陷阱。
- 语言切换保存在 `localStorage`，切换不会丢失当前筛选状态。

## File / component inventory

预计创建以下结构：

```text
index.html
package.json
tsconfig*.json
vite.config.ts
src/
  App.tsx
  App.css
  index.css
  main.tsx
  data/
    nis2.ts
    dashboardMetrics.ts
  components/
    MemberStateMatrix.tsx
    MemberStateRow.tsx
    PublicDecisionCard.tsx
    Timeline.tsx
    Charts.tsx
    DashboardOverview.tsx
  lib/
    export.ts
public/data/updates.json
scripts/check_updates.py
tests/dashboard_metrics.test.ts
```

`App.tsx` 只负责语言、tab、筛选和页面组合；数据、派生指标、导出和展示组件分离，避免形成单体组件。若实现过程中 Vite 版本或 JSX 配置需要少量调整，以实际构建约束为准，不改变数据语义。

## Source policy and seed data

首版主要官方来源：

- EUR-Lex：NIS2 Directive 2022/2555 正文；
- 欧委会 NIS2 policy page；
- 欧委会 NIS2 transposition in EU countries page及其 27 个国家子页；
- 欧委会 2024-11-28 23 国 formal notice 页面；
- 欧委会 2026-07-08 Ireland / Spain / France / Netherlands CJEU referral 页面；
- ENISA 官方页面和国家网络安全机构入口（仅作为补充来源）。

公开决定日期和国家集合按官方原文录入；国家措施、主管机关、CSIRT、SPOC 只有在官方国家页或国家官方材料可核验时才填入。所有记录的 `last_verified_at` 统一集中管理，页面显示“数据核验截至”。

## Builder decisions left open

- 若官方国家页只给出主管机关名称而没有独立 CSIRT/SPOC 链接，保留文本并使用同一官方国家页作为来源；不为补齐卡片而推断机构。
- 国家详情优先使用可展开行/抽屉，不引入路由级详情页；首版只需支持当前页面工作流。
- 图表用 CSS 条形图和紧凑列表，不新增重量级图表库；这样与 DSA/DMA 的轻量交付一致。
- `evidence_snapshot` 使用双语的短事实摘要 + 官方原文链接，不复制长段落，不在首版维护网页存档附件。
- `DATA_AS_OF` 使用最后一次真实核验日期；本次首发默认 `2026-11-20`，后续更新数据时同步更新记录的 `last_verified_at`。
- 首版包含一个标准库实现的动态发现脚本和静态 `updates.json`；脚本只刷新动态列表，不改写主登记簿。部署自动化不是首版验收条件。
- 导出“当前筛选视图”定义为筛选后的国家与相关公开决定两部分：Markdown 输出摘要 + 两组记录，JSON 输出带 filters 的 `{ member_states, public_decisions }`，CSV 输出一行一个国家并保留 `decision_ids` / `decision_stages`。
- 首版验收范围是本地开发和 `npm run build`；不预设 GitHub Pages 或其他 hosting 目标，避免把部署环境选择混入产品数据和 UI 设计。

## Verification expectations

- `npm test`：派生指标在 27 国、4 国转交、3 批决定和筛选场景下稳定；
- `npm run build`：TypeScript 与 Vite 构建成功；
- 本地浏览器验证：桌面和移动端首屏、矩阵展开、状态筛选、公开决定筛选、语言切换和至少一个导出动作；
- 控制台无应用错误，无空白页，无框架错误覆盖层；
- 对照设计概念截图检查首屏布局、矩阵密度、颜色语义、字体层级、移动端重排和官方链接可见性。

