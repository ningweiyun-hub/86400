# 86,400 — 專案規則

時間覺察 App。**一個檔案就是整個產品**：`index.html`。

## 不可違反

1. **前端單檔、無建置、無相依。** 不要引入框架、打包工具或 npm 套件。
   唯一的前端外部資源是 Google Fonts 的 `<link>`。雙擊 `index.html` 可瀏覽靜態流程，
   完整 AI 流程則透過 `api/` 內的零相依 Vercel Functions 運作。共用伺服器程式可放
   `server/`；任何 API key 都只能讀取伺服器端環境變數，絕不可出現在 `index.html`。
   同目錄的 `sw.js` 只做離線快取（http/https）；`file://` 開檔不用它。
2. **資料只存在 localStorage**（key `86400.v1`），沒有帳號、沒有雲端。
   改動資料結構時要在 `migrateState()` / `load()` 裡寫相容處理，不能讓舊資料炸掉。
   匯入備份走同一條遷移路徑。
3. **視覺一律走 CSS 變數**，不要寫死顏色。整組色票由 `applyPressure()`
   每秒依壓力寫進 `:root`；寫死的 hex 會在深夜不跟著變色。
4. **回歸驗證**：改完至少要開瀏覽器實際跑一次，確認 console 沒有錯誤、
   重新整理後資料還在。「看起來對」不算驗證過。

## After Hours（現行皮膚）

配色與動態由 `p`（今天過掉多少）驅動 —— 白天霓虹綠、傍晚琥珀、深夜熱紅。

```
raw = clamp((今天過掉的小時數 - 9) / 14, 0, 1)
p   = raw ^ 2.2          // 09:00 前 0，約 20:00 到 0.5，午夜 1.0
夜間強度關掉 → p 恆為 0
```

- 色階在 **OKLCH** 上內插（`STOPS` / `ramp()`），不要改成 sRGB，中段會變濁。
- 倒數四階段：靜止 → 閃爍(p>0.55) → 呼吸(p>0.8) → 抖動(已過 95%)。
- 進度條是**炸彈引線**：炸彈固定在左端，火花由右往左燒回來。
- **「夜間強度」開關是這個方向唯一的煞車，不能拿掉，也不能只關一半。**
  關掉時顏色、閃爍、抖動、火花放大、文案全部要回到平靜狀態。
- 尊重 `prefers-reduced-motion`。

## 文案語氣

- 介面文字只有**正體中文與英文**，絕不出現日文。
- 不說「浪費時間」—— 沒追蹤的時間叫**未命名時間**。
- **焦慮與情緒勒索是產品核心**：倒數升溫、引線、寵物存亡，就是要讓人坐立難安、覺得「不做會對不起牠／對不起今天」。
- 未完成的 Anchor、已開始卻沒結束的時段，午夜結算時會炸掉引線上的寵物——這是刻意的壓力，不是要淡化的 bug。
- Worth It 仍可評「很值得」給休息／發呆；評價自由，任務後果不自由。
- 不跟別人比較、沒有雲端排行榜。

> 「夜間強度」是唯一允許使用者整組關掉視覺升溫的煞車；寵物存亡機制不隨它關閉。
> 上面那條「夜間強度」開關對顏色／閃爍／抖動不可協商。

## 檔案地圖（`index.html` 內的區塊註解）

| 區塊 | 內容 |
|---|---|
| `After Hours tokens` | CSS 變數、keyframes、掃描線與暗角 |
| `1. 語言字典` | `T` 中英對照、`CATS` 類別 |
| `2. 狀態` | `DEFAULTS`、`load()`（含舊資料相容）、`save()` |
| `3. 小工具` | 時間格式化、`stats()` |
| `After Hours：壓力模型` | `ramp()` `pressure()` `applyPressure()` `catTone()` |
| `4. 動作` | 區塊的建立／排定／開始／結束、示範資料、匯出 |
| `5. 畫面` | 各分頁與面板的 render 函式 |
| `6. Render` | `render()`、事件委派、`heartbeat()`、PWA |

## Vercel API

- `api/plan.js`：將自由輸入目標轉為本週方向與今天唯一行動。
- `api/next-action.js`：依完成狀態與晚間回顧產生下一個唯一行動。
- `server/pace.js`：共用驗證、OpenAI Responses API 與 Structured Outputs schema。
- 前端只呼叫同網域 `/api/*`，不得寫死 localhost 或公開 API key。
- `OPENAI_API_KEY` 只設在 Vercel Project Settings 或未提交的本機環境檔。
- 保留 `backend/` 的 Fluxzero 版本作遷移參考，不納入 Vercel 部署。

## 資料模型

```
S = { lang, tab, disp, tick, night, onboarded, wake, sleep, cats[],
      days:{ 'YYYY-MM-DD': { anchor:{text,state,setAt,doneAt}, blocks[], tomorrow[] } },
      activeId, nextWeek[], notif{}, demo, fired{} }
```

一個 block 有三種狀態：**已排定**（`startedAt` 為 null）、**進行中**
（`S.activeId` 指到它）、**已結束**（有 `endedAt`）。
block 本體只存在 `days` 裡，`activeId` 只存 id —— 不要再把進行中的區塊
另外存一份，之前那樣做在重新整理後兩份會脫鉤，紀錄會遺失。

## 驗收用的預覽

`index.html?preview=23:40` 會把時鐘固定在指定時刻，用來檢查各個壓力階段。
UI 上沒有入口，這不是產品功能（handoff 註明 DEMO 列不可上線）。

## 設計來源

`design_handoff/`：`README.md` 是規格與語氣守則，`PrototypeNeon.dc.html`
是 After Hours 原型（採用），`Prototype86400.dc.html` 是舊的 Industry 版本
（資訊架構與文案仍以它為準）。原型是參考，不是要照抄的程式碼。
