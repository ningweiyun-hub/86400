# Code Review — 86,400

**日期**：2026-08-09 ｜ **對象**：`index.html`（2867 行）、`sw.js` ｜ **commit**：`6710b49`

> **狀態（2026-08-09 當天更新）**：P0／P2／P3／P4 都已修好並驗證，見本次 commit。
> **只剩 P1「商店經濟被測試碼鎖死」未修 —— 那是刻意保留的測試便利，上線前務必拿掉。**
> 下面保留原始的問題描述當作紀錄。

驗證方式：本機 `python3 -m http.server` 起站，在瀏覽器實際載入、注入狀態、讀 computed
style 與 `load()` 的真實回傳值。下面每一條都是跑出來的，不是看程式碼猜的。

**先講好消息**：乾淨載入零 console 錯誤；255 處 `esc()`，使用者輸入的逸出很徹底
（`activeLine()` 唯一沒在函式內逸出的地方，兩個呼叫點都補上了）；`namedUnionSec()`
的區間合併寫得正確；`activeId` 只存 id 不存副本，跟 CLAUDE.md 的規定一致；
`endBlock()` 用 block 自己的 `endAt` 夾住，分頁被節流時也不會寫進隔天。

---

## P0 — 存檔會被靜默清空

`index.html:710-717` + `index.html:1050`

```js
function load(){
  try{ ... return migrateState(JSON.parse(raw)); }
  catch(e){ return migrateState({}); }        // ← 什麼都不說，直接給空白狀態
}
```

`migrateState` 第 1050 行假設 `s.days[k]` 一定是物件：

```js
Object.keys(s.days).forEach(k => (s.days[k].blocks || []).forEach(...))
```

**實測**：存檔裡放一天 `null`，`migrateState` 丟
`Cannot read properties of null (reading 'blocks')`；`load()` 吞掉，回傳
`days: []`、`onboarded: false`。截斷的 JSON（寫到一半沒電、超出配額）結果一樣。
接著任何一次 `save()` 就把原始位元組永久蓋掉。

沒有雲端、沒有自動備份，這是這個 App 最嚴重的一條。三個修法可以疊：

1. `migrateState` 裡 `if(!s.days[k] || typeof s.days[k] !== 'object'){ delete s.days[k]; return; }`
   —— 壞掉一天不該賠上全部。
2. `load()` 的 catch 裡，把壞掉的原始字串搬到 `86400.v1.broken`，再回傳空狀態。
   救得回來就還有機會。
3. catch 觸發時要讓人看見（一行提示），現在是完全無聲的。

---

## P1 — 商店經濟被測試碼鎖死

`index.html:1055-1057`

```js
if(typeof s.coins !== 'number' || s.coins < 0) s.coins = 400;
// 測試階段：既有存檔金幣低於預設時補到 400，方便開商店
if(s.coins < 400) s.coins = 400;
```

**實測**：把金幣寫成 60、`save()`、再走一次 `load()` → 回傳 **400**。

花掉的錢重新整理就回來，所有寵物與主題實際上都是免費的。完成任務給的 15/30 金幣
也就沒有意義了 —— 而金幣是「做完事情」唯一的正向回饋，這條等於把整個獎勵迴圈拆掉。
上線前要刪掉第二行；想保留測試方便的話，改成掛在 `?preview=` 那個開關底下。

---

## P2 — 淺色主題「文人」有文字看不見

render 函式裡有 **53 處**寫死 `rgba(233,237,244,…)`（深色 `--ink` `#e9edf4` 的
RGB 值），**淺色對應是 0 處**。`SKINS` 裡 `literati` 是 `light: true`，
`applyPressure()` 會把 `--ink` 翻成 `#1c1a17`，但這 53 處不跟著翻。

**實測**（裝備 literati，只看「今天」一頁，就有 5 個可見元素踩到）：

| 文字 | 算出來的顏色 |
|---|---|
| Anchor 的「編輯」按鈕 | `rgba(233,237,244,0.5)` |
| 進行中區塊的「工作 · 12:49」 | `rgba(233,237,244,0.55)` |
| 「秒」 | `rgba(233,237,244,0.6)` |
| 「今天還剩 41,421 秒，其中接下來…」 | `rgba(233,237,244,0.6)` |
| 「不代表浪費——但空白也不會救下引線上的牠」 | `rgba(233,237,244,0.4)` |

米白底配 50% 不透明的近白色 = 幾乎讀不到。收據、洞察、商店頁還沒逐頁掃，數字只會更多。

這正是專案 CLAUDE.md「不可違反 #3」在講的事。修法是把這 53 處換成既有的 token
（`var(--ink-55)` / `var(--ink-48)` / `var(--ink-42)` / `var(--hair)`），
`applyPressure()` 第 799-818 行已經幫兩種明暗都定義好了 —— 是機械式的取代，
不需要新增任何變數。這條建議在賣 literati（45 金幣）之前先修掉。

---

## P3 — 通知一輩子只響一次

`index.html:2745`、`2762`、`2802`

```js
let lastDay = dayKey();      // 只在載入時算一次
...
if(dayKey() !== lastDay){ ... S.fired = {}; ... }   // 只有頁面「開著跨過午夜」才會跑
```

`S.fired` 存進 localStorage 但**沒有日期戳**。關掉 App 過夜、隔天再開：`lastDay`
一開始就等於今天，重置那段永遠不進去，而 `S.fired.wake` 還是昨天留下的 `true`。

**實測**：`{wake:true,three:true,sleep:true}` 存檔後重新 `load()` → 原封不動回來。

也就是三個提醒各自在人生中響過一次之後就再也不響了。修法：把 `fired` 改成
`{ day:'YYYY-MM-DD', keys:{} }`，`fire()` 時先比對日期；或在
`catchUpPetSettlement()` 裡順手 `if(S.firedDay !== dayKey()){ S.fired = {}; S.firedDay = dayKey(); }`。

附帶一提：`three` 的觸發窗只有 60 秒（`left <= 10800 && left > 10740`），
分頁在背景時瀏覽器會把 `setInterval` 節流到大約一分鐘一次，這個窗本來就容易整個跳過。
`wake` / `sleep` 用 `hm === S.wake` 精確比對分鐘，同樣的問題。改成「>= 目標時刻且今天還沒發過」
會穩很多。

---

## P4 — 陣亡寵物的日期會顛倒

`index.html:1212`、`1202-1214`、`1228-1232`

`explodeCompanion()` 收好屍體之後呼叫 `startCompanion('bomb', dayKey())`，
新陪伴的 `startedOn` 是**今天**。但 `catchUpPetSettlement()` 是照日期由舊到新
補算的，所以關掉 App 三天再打開、其中兩天有沒收尾的任務時：

- 第一隻：`startedOn` 正常 → `endedOn` = 三天前 ✅
- 第二隻：`startedOn` = **今天** → `endedOn` = **兩天前** ❌

櫃子裡的紀念卡就會出現「開始日期晚於結束日期」。修法：`settlePetDay(k)` 裡把
`k` 傳下去當新陪伴的起始日，而不是 `dayKey()`。

同一段還有個體感問題：三天沒開就一次炸三隻，但 `showPetToast` 只會留下最後一句，
前面兩隻無聲消失。以「情緒勒索是核心」來說，這裡反而是把該有的重量弄丟了 ——
補算完之後給一張總結（這幾天走了誰）大概更符合設計意圖。

---

## 值得知道，但不見得要動

**本機帳戶只是 UI 閘門**（`index.html:1284-1331`）。`hashPass` 是 32-bit FNV-1a，
可瞬間暴力破解；`account.session` 存在 localStorage 裡；資料本體是明文。CLAUDE.md
自己註明「密碼只保護這台裝置上的存檔」，方向是對的 —— 只要登入畫面的文案別暗示
「加密／安全」就好。另外兩件事值得考慮：`exportBackup()` 匯出的 JSON 含
`passHash` 與 `salt`；忘記密碼沒有任何救援路徑（只剩清除全部資料）。

**`stats()` 對過去的日子用 `passed = 86400`**（`index.html:898`），所以昨天的收據
「未命名時間」= 86400 − 已命名，通常是 22 小時左右（含睡覺）。如果這是刻意的
（「一天就是 86,400 秒」）就沒事，只是想確認一下不是漏掉的分支。

**`stripDemo()` 不清 `S.petSettled`**（`index.html:970-988`）。示範資料開過再關掉，
那幾天仍被標記為已結算 —— 如果之後補記那幾天的真實任務，寵物不會結算。很邊角。

**Service Worker** 沒問題。HTML 走網路優先、`updateViaCache:'none'`、
`controllerchange` 觸發一次 reload，都是對的。唯一小事：`ASSETS` 把 `sw.js` 放進
Cache Storage，但 fetch handler 對 `sw.js` 也是網路優先，所以那份快取永遠用不到。

---

## 建議順序

1. **P0** 存檔清空 —— 這條會弄丟她自己的資料，其他都可以等。
2. **P1** 金幣地板 —— 一行刪除，但整個獎勵迴圈靠它。
3. **P3** 通知 —— 小改動，目前是完全壞的。
4. **P2** 淺色主題 —— 53 處機械式取代，量大但不需要判斷。
5. **P4** 寵物日期 —— 顯示層的小 bug。
