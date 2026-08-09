# Handoff: 86,400 — 時間覺察 App（P0 / MVP）

## Overview
86,400 is a time-awareness app built on one metaphor: every local calendar day you receive 86,400 seconds, and they cannot be paused, saved, or carried into tomorrow. The countdown is an entry point, not the product — the value is the daily loop:

1. See how many seconds are left today.
2. Set one **Today Anchor** (the single thing worth doing well today).
3. **Spend the Next** — name the next 15 / 30 / 60 / custom minutes.
4. Answer **Worth It** when that block ends.
5. Read the **Time Receipt** at night; review the week in **Insights**.

Tone rules that the UI must not break: never red alarm states, never the words "wasted time" (untracked time is **未命名時間 / unnamed time**), no streaks, no penalties, no comparison with other users, no productivity score. Rest, play and doing nothing can all be rated "very worth it".

## About the Design Files
The files in this bundle are **design references written in HTML** — prototypes that show the intended look, copy and behavior. They are not production code to copy. Recreate them in the target codebase's environment (React Native / SwiftUI / Kotlin / web) using its established patterns, component library and navigation. If no codebase exists yet, pick the framework that fits the product (the design assumes iOS and Android phone targets plus home-screen widgets) and implement there.

`Prototype86400.dc.html` and `86400.dc.html` use a small in-house template runtime (`support.js`). Read them as markup + a logic class; do not port the runtime.

## Fidelity
**High fidelity.** Colors, type, spacing and copy are final-intent. Layout should be recreated closely; the countdown, block timer and receipt numbers are live in the prototype and driven by the device clock.

## Screens / Views

### 1. Today (default tab)
Purpose: see the remaining seconds, set/track the Anchor, start the next named block.
Layout: single scroll column, 20px horizontal padding, 56px top inset (status bar), 96px bottom inset (tab bar).
Components, top to bottom:
- **App bar** — "86,400" (Barlow Condensed 600 / 16px / letter-spacing .16em) + today's date (Barlow 400 / 10.5px, 45% ink). Right: a 中 / EN segmented pair, 1px border, active segment filled #1d1f20 with #f2f2f3 text.
- **Countdown hero** — two adopted variants (the "tick map" variant was cut):
  - `pure` (default): kicker "今天剩下" (Barlow Condensed 600 / 10px / .18em, #416180); the number at Barlow Condensed 600 / 104px / line-height .82, letter-spacing -.03em, tabular-nums; sub-line "≈ 9 小時 29 分 · 已過 60.4%" (12px, 55% ink); a 1px rule where the elapsed portion is #1d1f20 and the remainder is rgba(29,31,32,.16). Never turns red.
  - `column`: a 54×250px hairline column with 10.4px repeating rules; elapsed portion filled rgba(29,31,32,.07); a #5980a6 1px "now" line at the elapsed percentage, extending 7px past both edges. Number at 56px beside it.
- **Today Anchor card** — `.blueprint` frame (1px border, square corners, four "+" registration marks). Kicker "TODAY ANCHOR" + status on the right (進行中 / 已完成 / 不再重要). Prompt line "如果今天只能好好完成一件事，會是什麼？" (11.5px, 50% ink). Text input: no box, 1px bottom rule, Barlow 500 / 18px. Two buttons: 標記完成 (secondary) and 不再重要了 (ghost). Footnote: "沒完成不會扣分，也不會中斷任何紀錄。"
- **Spend the Next launcher** (when no block is running) — label "把下一段時間留給……" then four buttons in a flex row, gap 8px: 15 / 30 / 60 (flex 1) and 自訂 (flex 1.3).
- **Running block card** (when a block is running) — same blueprint frame, inverted: background #1d2d3d, text #f2f2f3, marks at 50% paper. Kicker "進行中" in #b5d9fd, category + end time on the right. Block name 19px. Remaining seconds at Barlow Condensed 600 / 46px, tabular-nums. 1px progress rule in #b5d9fd. Sentence: "今天還剩 42,800 秒，其中接下來 1,540 秒留給閱讀。" Buttons: 提前結束 (paper fill) and 延長 15 分 (outline). **No pause button anywhere.**
- **Named time list** — header row "今日已命名時間" + total (H:MM). Each row: 5×26px category swatch, name (13.5px/500) over "HH:MM–HH:MM · category" (10.5px, 48% ink), right column duration + Worth It rating (very-worth-it in #416180, others 45% ink). Final row is **unnamed time**: swatch rgba(29,31,32,.09), label 未命名時間, sub-line "不代表浪費，只是今天沒有留下紀錄。"

### 2. Time Receipt
Purpose: the day's settlement; the long-term reason to return.
Three explored layouts (pick one; the prototype ships B's information order on a white card):
- **A "thermal paper"** — white card on #e9e9ea, 8px scalloped tear edges top and bottom (radial-gradient), all figures in ui-monospace, dashed 1px rgba(29,31,32,.35) separators. Sections: header (TIME RECEIPT / 86,400 / date · timezone), ANCHOR + state, one line per named block, totals (已命名時間 / 未命名時間 / 今天還剩), WORTH IT counts, BEST MOMENT quote, footer "未命名不代表浪費 / 只是今天沒有留下紀錄".
- **B "spec sheet"** — #1d2d3d field, #f2f2f3 text, #b5d9fd kickers; 86,400 at 64px; a three-cell stat row (已命名 / 未命名 / 命名次數) split by 1px rules; blueprint Anchor card; a 12px stacked bar of where the time went, then a category list; best-moment quote; the same footer sentence.
- **C "plain data"** — paper ground, two stat boxes (已命名時間 / 未命名時間), a per-block list with rating and duration, and "明天想多留一點時間給".
In-app the receipt is previewable all day marked 進行中, and finalized at midnight.

### 3. Insights (weekly)
- Header 本週回顧 + date range.
- Blueprint card: seven bars, "每天的已命名時間", weekday labels; today's bar in #5980a6 with a bolder label.
- Two stat boxes: 完成 Today Anchor 的天數 (5/7) and 已命名時間總量 (7:20).
- "被評為「很值得」的比例" — 3 rows, 9px track rgba(29,31,32,.06), fill from the steel ramp, right-aligned percentage. Footnote: this is the user's own rating, never compared with other people.
- 一週最值得的三個片刻 — quote + "date · category · duration".
- 下週想多留時間給哪個面向 — selectable chips.

### 4. Settings
Rows separated by 1px rules: 時區 (auto-detected, editable), 顯示模式 (segmented: 純秒數 / 時分秒 / 時與分), 秒數跳動 toggle (off = minute-level updates), 時間類別, a notification group (max 3 proactive prompts a day, each independently switchable), Widget privacy, 隱私與資料管理, then 重新執行初次設定 and 刪除全部資料.

### 5. Onboarding (4 steps, ≤2 minutes, everything but time zone skippable)
1. "你今天收到 86,400 秒。" + the promise that the app never asks you to log every second and never judges waste.
2. Time zone / usual wake / usual sleep (reminders only — they never change the 86,400).
3. Life categories as multi-select chips (工作 副業 通勤 休息 學習 關係 健康 玩樂).
4. Countdown display choice (live samples) + ticking-seconds toggle.

### 6. Lock screen & widgets
- **Lock screen**: clock, then three hairline cells (剩下 / ANCHOR / 進行中) and a larger 86,400 cell with quick 15 / 30 / 60 and 看今日收據. Anchor text can be hidden ("已設定 · 內容已隱藏").
- **iOS small 2×2**: paper — seconds left + Anchor; ink — running block, remaining seconds, 1px progress rule.
- **iOS medium 4×2**: seconds left + "已過 60.4% · 21:14 更新" + quick 15/30/60, divided 1px, right column Anchor + named/unnamed totals.
- **Android 4×2**: same content, explicitly labelled "分鐘級更新 · 21:14".
Widgets must state their refresh time or use minute-level figures when the OS cannot tick per second; every tap lands directly on the matching action.

## Interactions & Behavior
- **Main countdown**: recompute from the wall clock on every tick and on foreground/resume — never keep a background counter. Accuracy after resume ≤1s. Rolls to a new day at local midnight without relaunch. Works offline. No pause, no borrow, no carry-over.
- **Ticking off**: when 秒數跳動 is off, the number updates once a minute (floor to the minute).
- **Spend the Next**: sheet from the bottom over a rgba(29,45,61,.45) scrim. Duration chips (15/30/60/custom slider 1–240), name field with four suggestion chips, category chips, "與今天的 Anchor 有關" toggle, and a live preview sentence. Start is reachable within two primary actions from Today.
- **Running block**: one at a time; end early or +15 min; ending opens Worth It. A block crossing midnight auto-ends at 23:59:59.
- **Worth It**: four options (很值得 / 還不錯 / 不太值得 / 中途改變了), optional one-line note, "下次還想留時間給這件事" toggle, Save or Skip. Skipping still keeps the time record. Ratings are editable later and never derived from the activity name.
- **Language**: 中 / EN switch swaps every string, including block names, categories, receipt rows and past-receipt entries.
- Transitions are quiet: no bounce, no confetti, no color alarm. Sheets slide up; state changes are instant.

## State Management
```
lang            'zh' | 'en'
tab             'today' | 'receipt' | 'insights' | 'settings'
sheet           null | 'spend' | 'worth' | 'onboarding'
now             epoch ms, ticked every 1s from the wall clock
disp            'sec' | 'hms' | 'hm'
tick            boolean (ticking seconds)
anchor          { text, state: 'doing' | 'done' | 'dropped' }
active          null | { name, category, plannedSec, endAt }
worth           null | rating, worthNote, again:boolean
onboarding      step 0-3, picked categories[]
```
Persisted entities (see PRD §10): User, Day, Anchor, TimeBlock, WorthItReview, TimeReceipt, Category, NotificationSetting. Local-first with sync; one running block per account across devices; deleting a block updates every derived statistic.

## Design Tokens
Design system: **Industry** — steel-blue wireframe on a light technical ground. Take values from its stylesheet variables (`var(--color-*)`, `var(--font-*)`, `var(--space-*)`) rather than the literals below where possible.

Color
- ground `#f2f2f3`; canvas behind cards `#e4e4e5` / `#e9e9ea`; receipt paper `#ffffff`
- ink `#1d1f20`; secondary ink rgba(29,31,32,.55); tertiary rgba(29,31,32,.42)
- hairline rgba(29,31,32,.16); light fill rgba(29,31,32,.07)
- accent `#5980a6`; accent deep (text on paper) `#416180`; accent tint `#eef6ff`
- dark field `#1d2d3d`; lock screen `#16222e`; on-dark accent `#b5d9fd`; on-dark text `#f2f2f3`
- category ramp: 工作 `#1d2d3d` · 副業 `#416180` · 通勤 `#749dc4` · 休息 `#b5d9fd` · 學習 `#597ea3` · 關係 `#94bce3` · 健康 `#8fa8bd` · 玩樂 `#d6ebff`
- **No red, amber or any alarm color exists in this product.**

Type
- headings & all figures: Barlow Condensed 600 — 104 / 70 / 62 / 46 / 44 / 34 / 25 / 22 / 17 px, tabular-nums on every number
- kickers: Barlow Condensed 600 / 9–10px / letter-spacing .16–.20em / uppercase
- body: Barlow 400–500 — 19 / 16 / 14 / 13.5 / 12.5 / 11.5 / 10.5 px, line-height 1.4–1.8
- receipt variant A only: ui-monospace / SF Mono / Menlo at 9.5–11px

Geometry
- radius 0 everywhere (square corners are the system's signature); 1px borders
- spacing rhythm 6 / 8 / 10 / 14 / 18 / 22 / 26 / 28 px
- blueprint frame = 1px border + four "+" registration marks at the corners
- shadows only on the receipt paper: 0 3px 10px rgba(43,43,45,.12)
- min tap target 44px; slide-up sheets have 40px bottom padding

## Assets
No bitmap assets. Icons are drawn as 13px hairline boxes/bars in the tab bar — replace with Lucide at stroke-width 1.5 (square/receipt/bar-chart/circle). Fonts: Barlow and Barlow Condensed (Google Fonts).

## Files
- `Prototype86400.dc.html` — the interactive phone prototype: Today, Spend the Next, running block, Worth It, Receipt, Insights, Settings, Onboarding. Live countdown from the device clock.
- `86400.dc.html` — the design canvas: the prototype plus the countdown variants (1c 純秒數, 1d 日課柱), three Time Receipt layouts (1e–1g), lock screen (1h) and widgets (1i).
- `i18n.js` — the zh→en dictionary and the DOM translation pass.
- `industry.css` — the Industry design-system stylesheet (tokens + component classes).
- `ios-frame.jsx` — the device bezel used for presentation only; not part of the product.
- `support.js` — the template runtime; reference only, do not port.
- `PRD.md` — not bundled: attach the original Chinese PRD (86,400 產品需求文件) alongside this folder; §7 P0, §10 data model, §11 edge cases and §12 tone rules are the source of truth for anything this README leaves open.

## Open questions carried from the PRD
Product name, default countdown display, custom categories in MVP, open-ended blocks, shareable receipt cards, minimum widget refresh per platform, account-free local mode, back-dating limits, week start day, and iOS-first vs both platforms.

---

# Addendum: "After Hours" — the adopted visual direction

This supersedes the Industry (steel-blue wireframe) styling described above for the countdown surfaces. Industry remains the reference for the *information architecture*, the copy and the receipt/insights structure; **After Hours** is the skin that ships. The two prototypes in this bundle are both current: `Prototype86400.dc.html` (Industry) and `PrototypeNeon.dc.html` (After Hours, the adopted one).

## The idea
The palette and the motion are driven by **how much of today is gone**. Daytime is calm and still; as the day burns down the interface heats up, brightens, grows and finally shakes. This is a deliberate reversal of PRD §12 ("never manufacture anxiety") — the product now uses pressure as its core mechanic. Because of that, §13.4's counter-metrics (seconds-display opt-out rate, notification opt-out rate, reported time anxiety) are the guardrails, and Settings carries a single **夜間強度 / Night intensity** switch that disables the whole escalation.

## Pressure model
```
elapsedHours = local hours elapsed today
raw          = clamp((elapsedHours - 9) / 14, 0, 1)
pressure p   = raw ^ 2.2          // 0 before 09:00, ~0.5 by 20:00, 1.0 at midnight
if (nightIntensity == off) p = 0
```
Everything below is a function of `p` — color, glow, type size, and which animation runs. Interpolate the palette in **OKLCH**, not sRGB, or the mid-range goes muddy.

## Palette ramp (OKLCH stops, interpolated by p)
| p | background | accent (neon) |
| --- | --- | --- |
| 0.00 | `oklch(0.16 0.028 158)` | `oklch(0.86 0.20 148)` — neon green |
| 0.55 | `oklch(0.15 0.050 55)` | `oklch(0.84 0.17 72)` — amber |
| 1.00 | `oklch(0.12 0.100 15)` | `oklch(0.70 0.26 20)` — hot red |

Derived surfaces: hero panel = background lightened `+0.02 + p*0.02` with chroma `×(1+p)`; tab bar = background darkened `-0.03`; sheets = background `+0.015`. Text is `#e9edf4` on dark, `#0b0f14` on neon fills. Glow: small `0 0 (4+p*14)px accent/(0.25+p*0.55)`, hero `0 0 (8+p*46)px accent/(0.2+p*0.7)`. Scanlines (1px black every 3px) at opacity `p*0.16`; a top vignette at `p*0.55`.

## The four countdown stages
The number's size runs `92 + p*22` px (Chakra Petch 700, tabular-nums) and its color flips from paper to the accent past `p > 0.45`. That size is a **target, not a guarantee**: glyph count drops in steps while the size grows smoothly, so on narrow phones the two peak together in the early evening and the number outgrows the hero. Since the hero is `overflow:hidden`, that shows up as a silently truncated digit rather than a broken layout, so the number is measured against the hero width and clamped when it will not fit. Fit wins over size; the late-day 110–114px is untouched wherever there is room.

| Stage | Trigger | Number | Motion |
| --- | --- | --- | --- |
| 1 Still | elapsed < 55% | 92px, paper ink, no glow | none |
| 2 Flicker | elapsed > 55% | ~105px, accent | `n-flick 7s linear infinite` — a brief dip every 7s, like a failing tube |
| 3 Breathe | elapsed > 80% | ~111px | `n-breathe 2.6s ease-in-out infinite` — opacity 1 → .72 → 1 |
| 4 Shake | elapsed ≥ 95% (≈22:48) | ~114px | `n-shake .22s linear infinite` (±3px, all four directions) **+** `n-breathe 1.1s` |

## The fuse
The progress bar is a **bomb fuse**, not a progress bar.
- The bomb sits at the **left** end: a 20px circle, `radial-gradient(circle at 34% 32%, #232a33, #0a0d12 75%)`, 1px accent rim, inset bottom shadow, plus a 10×4px rope stub on its right edge.
- The fuse runs to the right: unburnt rope = `repeating-linear-gradient(115deg, paper/0.16→0.26 0 3px, paper/0.34→0.54 3px 6px)`, width = **remaining** percent of the day.
- Burnt-out tail on the right is a flat 3px `rgba(233,237,244,.1)`.
- The flame sits at the burn point (left edge of the remaining rope, i.e. `left: remaining%`) and burns **right → left**: an outer flare `(24→56px)`, a white-cored spark `(7→21px)` with a `(10→54)px` glow, and three embers drifting up-right on `n-ember` loops.
- Bomb motion: `n-bombpulse 1.4s` (scale 1 → 1.12) past `p > 0.75`; `n-rattle .22s` (±2.5px, all directions) at stage 4, in sync with the number.

## Keyframes
```css
@keyframes n-breathe  {0%,100%{opacity:1} 50%{opacity:.72}}
@keyframes n-flick    {0%,92%,100%{opacity:1} 94%{opacity:.55} 96%{opacity:1} 98%{opacity:.7}}
@keyframes n-shake    {0%,100%{translate:0 0} 12%{translate:-3px 2px} 25%{translate:3px -2px} 38%{translate:-2px -3px} 50%{translate:2px 3px} 62%{translate:-3px -1px} 75%{translate:3px 1px} 88%{translate:-1px 3px}}
@keyframes n-rattle   { /* same path at ±2.5px */ }
@keyframes n-bombpulse{0%,100%{scale:1} 50%{scale:1.12}}
@keyframes n-spark    {0%,100%{scale:1;opacity:1} 40%{scale:1.45;opacity:.75} 70%{scale:.85;opacity:1}}
@keyframes n-ember    {0%{translate:0 0;scale:1;opacity:.9} 100%{translate:14px -11px;scale:.2;opacity:0}}
@keyframes n-flare    {0%,100%{opacity:.55} 50%{opacity:.9}}
@keyframes n-creep    {0%{translate:0 -100%} 100%{translate:0 100%}}
```
Respect `prefers-reduced-motion`: drop stages 2–4 to a static state and freeze the spark.

## Type
- Display and all figures: **Chakra Petch** 600/700, tabular-nums, letter-spacing −0.02em; kickers at 9–9.5px / letter-spacing 0.20–0.24em / uppercase.
- Body: **IBM Plex Sans** 300–500, 10–20px.
- Both from Google Fonts. Square corners throughout (radius 0) except circles.

## Mood copy (drives the line under the countdown)
The line is **not** a fixed string: each skin supplies its own five-key mood table (`early` / `mid` /
`late` / `end` / `fuse`) in both languages, and the equipped skin decides which voice is heard. The
thresholds below are the engine; the sentences are Anxiety Neon's, the default skin. `fuse` overrides
the `p` bands, and because stage 4 requires Night intensity on, turning that switch off returns the
line to `early`.

| p | key | zh | en |
| --- | --- | --- | --- |
| < 0.25 | `early` | 今天還很寬——但寬不代表可以欠著。 | The day is still wide — wide is not permission to owe. |
| < 0.60 | `mid` | 一半以上已經過去了。引線上的牠還在看你。 | More than half is spent. Whoever sits on the fuse is still watching. |
| < 0.85 | `late` | 天色在走了。再不收尾，午夜會算帳。 | The light is going. Finish now, or midnight will collect. |
| ≥ 0.85 | `end` | 今天不會結轉。沒做完的，會炸掉一個陪伴你的理由。 | Today does not roll over. What you leave open can blow up a reason that stayed with you. |
| stage 4 | `fuse` | 引線快燒完了。牠還在等你。剩下的就是全部了。 | The fuse is almost gone. They are still waiting. Whatever is left is all there is. |

## Widgets & lock screen (After Hours)
Same pressure curve on the home screen; see turn 5 in `86400.dc.html`.
- **iOS small 2×2** (170px): seconds left, "Xh Ym · HH:MM 更新", a compact fuse (14px bomb, 18→30px flare), and one line of Anchor.
- **iOS medium 4×2** (352×170): left column countdown + fuse; 1px divider; right column Anchor + quick 15/30/60.
- **Android 4×2**: same content, explicitly labelled "分鐘級更新 · HH:MM", full-width fuse, and a filled 今日收據 button.
- **Lock screen / Live Activity**: clock, three hairline cells (剩下 / ANCHOR / 進行中), then a bordered card with a 60px countdown, an 18px-bomb fuse and quick actions. Anchor text collapses to "已設定 · 內容已隱藏".
- Widgets advance the fuse at **minute** granularity and must print their refresh time; only in-app and the Live Activity tick per second. **Open question: whether stage-4 shake should run on the home screen at all — a widget that shakes all evening is a likely uninstall.**

## Demo affordance
The neon prototype has a `DEMO` row (現在 / 09:30 / 15:00 / 20:30 / 23:40) that forces the clock so every stage can be reviewed without waiting. It is a prototype-only control — do not ship it.

The shipped build has no DEMO row. Review runs on query parameters with no UI entry, none of which
write to `localStorage`: `?preview=HH:MM` pins the clock, `?theme=<id>` previews a skin without
buying it, and `?memorial=1` opens the midnight settle.

## Files added by this addendum
- `PrototypeNeon.dc.html` — the After Hours phone prototype (adopted).
- `86400.dc.html` — the design canvas. Turn 5 = widgets & lock screen, turn 4 = the four countdown stages, turn 3 = four fuse treatments (3a adopted; 3d is a character-on-the-charge concept that needs three-state character art, ~200×200 transparent, before it can be built), turn 2 = After Hours screens at three times of day, turn 1 = the superseded Industry exploration.

---

# Addendum — Design system (dual visual systems)

Two renderings of one 16-section design system, added after a review of the shipped `index.html`.
The content, structure and section numbering are identical; only the prose language differs.

- `DesignSystem.dc.html` — English.
- `DesignSystemZH.dc.html` — 正體中文. This is the authoring language for anything that becomes UI copy.
- Both need `support.js`, which the Files list above named but which was never actually in this
  folder; it is included now, so the older `.dc.html` prototypes resolve it too. The runtime fetches
  React and Babel from unpkg, so rendering needs network access — without it the page stays blank
  apart from static markup.

`Shop.dc.html` was already in this folder but never listed: it is the handoff for the shop, the
companions and the memorial objects, and it is the source for anything the design system defers.

## What the sections describe

| Sections | Status |
| --- | --- |
| §01–§09, §16 | **Shipped.** Read from `index.html`. Where the written concept disagreed with the code, the code won. |
| §10–§13, §15 | **Target.** iOS and Android specs. No native build exists — instructions for one, not a description of one. |
| §14 | **Unbuilt.** There is no widget code in the product. Not validated against a running tile. |

## Corrections this addendum makes to the sections above

These supersede the earlier After Hours addendum wherever they conflict.

1. **Stage gating is `p`, not elapsed time.** Stages 2 and 3 fire at `p > 0.55` (≈19:40) and
   `p > 0.8` (≈21:39). Reading those as "55% / 80% elapsed" puts stage 2 at 13:12, more than six
   hours early. Only stage 4 reads raw elapsed percentage (≥ 95%, ≈22:48), and it additionally
   requires Night intensity on.
2. **Hero chroma is `C ×(1 + 0.8p)`**, not `×(1 + p)`. The `×(1 + p)` multiplier belongs to the
   field/card token, which the earlier spec never listed.
3. **The fuse tail is a gradient**, `linear-gradient(to left, ink/.04, ink/.13)`, and follows the
   skin's ink token — not a flat `rgba(233,237,244,.1)`.
4. **Flame sizes**: flare 22→48px, spark 9→17px, spark glow 10→28px, each gaining +16 / +6 / +12px
   at stage 4.
5. **The bomb is only the default fuse head.** An equipped companion replaces it with a 26px glyph
   on the same anchor, with the same pulse and rattle.
6. **Radius 0 has two deliberate exceptions**, not one: Shop *and* every memorial surface.
7. **Memorials are chosen, not routed.** Three forms plus an opt-out (`pot` / `urn` / `headstone` /
   `none`), a one-time locale suggestion that Settings then owns, 18 purchasable memorial skins, and
   a revival loop at three consecutive Anchor days. There is no ancestral tablet, no memorial-hall
   object and no sharing anywhere in the product. See §16.
8. **The memorial ground is warm ash** — `#0B0B0A` / `#E6E3DC` / `#C4B8A5`, glows cleared — not the
   cold cyan the concept called for. It is a fixed palette that ignores the equipped theme.

## Still open

- Final memorial art: three forms × three states each (~200×200). Everything shipping is the hatched
  construction placeholder.
- Whether the five-region memorial concept is dropped or reworked into more purchasable forms; as
  written it conflicts with the shipped chosen-form model.
- Widgets: no code exists, so the memorial has no home-screen presence.
- Whether a light skin such as Quiet Literati should get a light memorial ground.
