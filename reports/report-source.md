# Math 未成年人網路服務法規與產品合規稽核

**涵蓋地區：** 美國、歐盟／EEA、英國  
**查核基準日：** 2026-08-30  
**服務：** `math.stingtao.info`（Grade 7–12 線上數學學習服務）  
**性質：** 產品與技術合規差距分析；不是個案法律意見。

## 研究問題與方法

本報告回答：面向 18 歲以下學生的網路服務，依美國、歐盟／EEA 與英國規範，服務提供者應考量哪些義務；現有產品與程式設計已產生哪些風險；以及在負責人同意後，應依何種順序修正。

研究採兩條工作流：第一，閱讀服務程式碼、資料庫 schema、政策文字、第三方載入、公開互動、帳號與刪除流程；第二，核對主管機關、法規原文與官方指引。法律結論區分為「高度可能適用」、「條件式適用」與「目前不觸發但應設計防線」，避免把尚需營運事實或律師確認的規範誤列為確定義務。

## 執行摘要

### 決策結論

目前不宜把服務宣稱為已具備美國與歐洲未成年人合規。即使帳號頁要求使用者自我勾選 13 歲以上，服務仍明確面向 Grade 7–12，七年級可能包含 12 歲學生；未登入者也可瀏覽與張貼公開回饋，而 Google AdSense 會在年齡、地區與同意判斷前於全站載入。這使「13+ 條款」無法單獨消除兒童導向、實際知情、追蹤技術、未成年人廣告與兒少安全風險。[[EN01]]

建議先採保守的「未成年人一律無廣告、公開留言先暫停或事前審核」策略，並由產品負責人選擇下列營運模式之一：

1. **建議方案 A：青少年帳號。** 美國與英國僅允許 13 歲以上建立保存型帳號；歐盟／EEA 採一致的 16 歲門檻。低於門檻者僅使用不建帳號、不追蹤、不含廣告與公開互動的匿名學習模式。
2. **方案 B：兒童／家庭／學校模式。** 正式服務低於上述門檻者，另建可驗證家長同意或合格校方授權、監護與教師角色、權利請求、同意撤回、學校契約、無廣告與嚴格資料生命週期。法務與營運成本顯著較高。

### 四項上線阻斷風險

1. **廣告與追蹤在判斷前發生。** `AdUnit` 位於全站根 layout，2.5 秒後載入 AdSense，僅固定標示 teen treatment，沒有 CMP、地區判斷、拒絕／撤回或未滿 13 歲的 child treatment。COPPA 2025 修法要求對第三方廣告揭露另取得可驗證家長同意；EU／UK 對非必要儲存與存取技術通常要求事前同意；Google 的年齡處理參數本身不取代法律義務。[[EN02]]
2. **年齡與實際受眾矛盾。** 首頁以 Grade 7–12 招攬使用者；帳號只靠未驗證的 13+ 勾選；未登入服務、廣告與 UGC 不受該勾選保護。COPPA 會查看內容、視覺、動畫、獎勵、受眾與實際知情，而不只看條款文字。
3. **公開 UGC 缺乏兒少安全治理。** 任何訪客可立即公開 3–600 字回饋；無事前審核、檢舉、作者刪除、申訴、速率限制或完整個資／傷害內容偵測。這不僅是隱私與安全問題，也可能讓服務落入 DSA「online platform」或英國 Online Safety Act 的 user-to-user 服務分析。
4. **權利、保存與家長／學校治理缺口。** 目前無資料匯出、更正、限制、反對、家長代行、校方管理、同意版本、資料保存期限與排程清除；帳號刪除亦無法連結或刪除公開回饋。

### 現有正面控制

- Google `sub` 以 HMAC 假名化，不保存 Google 姓名、email 或照片。
- Session 原始 token 只在安全 cookie，資料庫僅存雜湊；學習狀態回應使用 private/no-store。
- 排行榜預設關閉，公開時使用每週隨機身分，沒有公開個人檔案、搜尋、私訊或回覆。
- 不保存學生作答原文或圖表方程式；相機、麥克風與定位權限被關閉。
- 帳號刪除要求新 Google credential，主要學習表透過關聯刪除。
- 無真實貨幣、購買或 loot box；已有 reduced-motion、ARIA 與鍵盤操作等無障礙基礎。

## 服務事實與資料流

### 已觀察產品事實

- 面向 Grade 7–12、55 個地區、253 個課程的英語數學學習服務。
- Google 登入後保存 HMAC 衍生識別、時區、年齡聲明時間，以及細緻的學習表現、複習、獎勵、排行榜與遊戲化狀態。
- 未登入可使用 demo，狀態主要存於 `sessionStorage`；全站仍載入 AdSense。
- 公開排行榜為 opt-in，公開回饋不需登入且立即發布。
- 部署於 Cloudflare Workers／D1，使用 Google Identity Services 與 Google AdSense。

### 個資性質判斷

HMAC 後的 Google subject、learner UUID、session hash 與教育表現紀錄並非真正匿名。服務可使用相同金鑰與登入事件持續連結同一人，因此在 GDPR／UK GDPR 下屬「假名化個人資料」；在 COPPA 下，cookies、IP 位址及可跨時間辨識使用者的 persistent identifier 也可能是個人資訊。政策文字不應再以「anonymous」概括這些紀錄。

## 年齡與營運通路矩陣

| 使用者／通路 | 建議最低做法 | 主要法規理由 |
|---|---|---|
| 美國未滿 13 歲，直接使用 | 不建立保存型帳號、不載入廣告或第三方追蹤；若要保存資料，建 COPPA 家長通知、可驗證同意、家長權利與刪除 | COPPA／COPPA Rule；州兒童隱私與設計法可能另適用 |
| 美國 13–17 歲，直接使用 | 無廣告或至少禁止定向廣告；年齡帶、清楚兒少通知、預設高隱私、權利與保存控制 | 州隱私法、兒少設計法、消費者保護、教育情境規範 |
| 美國 K–12 學校採用 | 獨立學校模式、校方授權與直接控制、契約／DPA、禁止商業廣告與不相容用途、校方刪除／匯出 | FERPA school official 條件、COPPA school authorization、SOPIPA 與各州學生資料法 |
| EU／EEA 低於會員國 Article 8 年齡 | 若以同意為法律基礎，須家長授權及合理驗證；跨國服務建議採 16 歲一致門檻，或逐國維護 13–16 矩陣 | GDPR Articles 5, 6, 8, 12, 25, 35；各國實施法 |
| EU／EEA 所有未滿 18 歲 | 高隱私／安全預設、兒少清楚通知、最小化、DPIA；若屬 online platform，禁止在合理確定未成年時用 profiling 投放廣告 | GDPR；DSA Articles 14, 26, 28；Commission 未成年人保護指引 |
| 英國未滿 18 歲 | 依 Children’s Code 15 項標準進行 DPIA、最佳利益、高隱私預設、最小化、關閉通常不必要的分享／profiling／nudges | UK GDPR、Data Protection Act 2018、ICO Children’s Code |
| 英國可能由兒童使用的 user-to-user 服務 | 完成 child access assessment；若 likely accessed by children，完成風險評估、保護、紀錄與定期重評 | Online Safety Act 2023、Ofcom Protection of Children Codes |

註：GDPR Article 8 的 13–16 年齡只在「直接提供資訊社會服務且以 consent 為處理基礎」時直接適用；它不等於所有個資處理都能僅靠家長同意，也不排除兒童最佳利益、透明度、資料最小化、合法基礎與契約能力規則。

## 美國法規分析

### COPPA 與 2025 修法

COPPA 適用於面向未滿 13 歲兒童的線上服務，以及對自己正向未滿 13 歲兒童收集個資有 actual knowledge 的一般受眾服務。判斷兒童導向會考量題材、視覺、動畫角色、音樂、兒童活動、廣告、受眾證據等。Grade 7、遊戲化星星／愛心／徽章／動畫與學習內容，使本服務至少有 mixed-audience 分析風險。

主要義務包括：直接且線上的家長通知、先取得可驗證家長同意、只收集合理必要資料、允許家長查閱與刪除、維持合理安全、只保存達成特定目的所需期間。2025 最終修法於 2025-04-22 刊登、2025-06-23 生效，一般強制合規日為 2026-04-22；對向第三方揭露用於 targeted advertising 等目的要求與基本服務同意分開的 opt-in。Rule 亦擴大受保護資料，並要求書面資訊安全與保留／刪除政策、供應商書面安全保證及明確的刪除時程。[[EN03]]

FTC 2026 年 age-verification 執法政策提供很窄的安全港方向：純為年齡判斷、迅速刪除、不為其他目的、供應商有書面限制、通知與安全，才可能不因該年齡資料本身先受罰；它不是 child-directed 服務避開 COPPA 的通行證。

**本服務差距：** 目前 13+ 勾選只發生在帳號頁、未做 mixed-audience neutral age screen，也未阻止未登入者在判斷前接觸 AdSense；無家長通知、VPC、家長權利與同意撤回；保存期限未落地。

### 教育科技、FERPA 與學校授權

FTC 對 edtech 明確指出：服務不能以參加課程為條件要求兒童接受不必要蒐集；學校依教育情境代替家長授權時，資料只能用於學校授權的教育目的，不得轉作商業廣告或其他不相容用途。FERPA 的 school official exception 通常要求服務執行校方本來會使用員工的機構功能、受校方對教育紀錄之直接控制、使用與再揭露符合限制，且校方須在年度通知中說明相關標準。PPRA 另可能要求接受聯邦教育資金的學校，就敏感主題調查與為行銷蒐集學生資訊提供家長通知、檢視或退出。[[EN04]]

**本服務差距：** 無學校／教師／監護角色、名冊治理、直接控制、學校 DPA、刪除／匯出 SLA 或教育用途隔離；因此不應先用現有消費者帳號承接學校採用。學生或校方合約也不當然能使家長受仲裁條款拘束。

### 代表性州法

州法適用高度依使用者所在州、營收／資料量、是否出售／分享、是否以 K–12 目的設計、是否與學校簽約及產品是否屬 social media／online service 而異，正式上線前需維護州別登錄表。

- **California SOPIPA。** 對 operator 已實際知情其服務主要為 K–12 學校目的而設計、行銷與使用的產品設定嚴格限制，包括不得依 K–12 資料定向廣告、出售學生資料、建立非 K–12 目的個人檔案，並須有 subprocessor 契約、合理安全與校方要求刪除安排。學校部署屬高風險，且沒有一般營收門檻。
- **California CCPA／CPRA。** 若達 covered business 門檻，對 13–15 歲未成年人出售／分享個資須 youth opt-in，未滿 13 歲須家長 opt-in；同時需完整 notice、權利請求、敏感個資與承包商治理。2026 門檻包括年營收 2,662.5 萬美元、處理 100,000 名消費者／家庭資料或 50% 以上營收來自 sale/share 等。本服務是否達門檻需營運數據確認，但前端宜預留 GPC、opt-out 與同意證據。
- **California Age-Appropriate Design Code。** 不能描述為「整部法律被擋」或「全部可執行」。2026-03-12 第九巡迴撤銷對 coverage、age estimation 及整體剩餘條款的全面禁令，但維持 data-use、dark-pattern restrictions 與原 DPIA 相關部分的初步禁令，並發回續審。若達 CCPA business 門檻，須由加州律師就當時可執行條款重新確認。
- **Colorado SB24-041／CPA minors。** 對實際知情或故意忽視未滿 18 歲使用的線上服務要求 reasonable care 與 heightened-risk assessment；targeted ads、sale、重大 profiling、次要用途、過長保留、顯著延長使用的設計及 precise geolocation 原則上需相應 consent。2025-10-01 已生效，且條文不依一般營收／資料量門檻；Grade 7–12 定位使本服務具有高適用風險。
- **Connecticut CTDPA minors。** 對未滿 18 歲 targeted ads、sale、profiling、延長使用設計、geolocation 與 impact assessment 設定加強規則；2026-07-01 擴充已生效，州檢察長公開表示正積極執法。對只有 13–17 歲且未達一般門檻的交互作用仍建議取得 Connecticut 法律意見。
- **Illinois SOPPA／New York Education Law §2-d。** 學校模式須簽書面契約、禁止廣告／行銷與出售、限制再利用與 subprocessors，並提供校方與家長存取、刪除、事件通知及安全治理；紐約另要求 NIST CSF 對齊與 least privilege。學校模式不得等到有第一份校約才補設計。
- **Maryland MODPA／Kids Code。** MODPA 在規模門檻成立時，對已知／應知未滿 18 歲者禁止 targeted ads／sale 並要求敏感資料嚴格必要；Kids Code 對可能由兒童使用且達門檻的產品要求 DPIA、高隱私預設、最小化、profiling／geolocation／dark-pattern 限制。相關訴訟仍在進行，檢索未見截至基準日全面停止執行的禁令。
- **Texas SCOPE。** 針對 online social service 的年齡、家長工具與未成年人限制具有條件與豁免，且部分條款曾遭訴訟。本服務很可能可主張明確教育目的、主要內容由供應商選定且互動僅附帶的豁免；仍應保存正式 scope memo，並避免把回饋擴成論壇、DM 或社交 feed。[[EN05]]
- **Colorado Privacy Act 兒童修法與其他州。** 多州已把 13–17 歲納入敏感資料、同意、定向廣告、出售、profiling 或設計義務。實際生效日與門檻不同；在沒有完整州別工程前，採「所有未成年人不做廣告 profiling／出售／分享、預設高隱私」是成本較低且風險較小的共同底線。

## 歐盟／EEA 法規分析

### GDPR

服務若向 EU／EEA 個人提供服務或監控其行為，即使營運者不在 EU，也可能受到 GDPR 域外適用。應完成資料盤點、每一目的之 Article 6 法律基礎、透明度、資料最小化、正確性、保存限制、安全、處理者合約、跨境傳輸、資料主體權利與問責文件。面向兒童的資訊需清楚、易取得、適齡。

本服務蒐集的學習答題正誤、mastery、streak、XP、排名、複習到期與獎勵紀錄，是可連結至帳號的教育表現個資；即使假名化仍受 GDPR。個人化學習與排名應說明邏輯與影響；若不產生法律或同等重大效果，通常不等於 Article 22 禁止的 solely automated decision，但仍需公平、透明與可退出。[[EN06]]

對兒童的 age assurance 應風險相稱、最小侵入、不把年齡證件資料轉作其他用途。由於服務系統性處理未成年人學習行為、使用第三方廣告並含公開 UGC，建議在 EU 上線前完成 Article 35 DPIA；若處理高風險無法降低，需考慮主管機關事前諮詢。

非 EU 營運者若受 Article 3(2) 管轄，通常需依 Article 27 指定 EU 代表；向美國／台灣或其他第三國傳輸資料需有適當機制與 Transfer Impact Assessment。Cloudflare、Google 及任何監測／支援供應商均應列入處理者／接收者清單。

### ePrivacy 與同意管理

對非必要 cookies、local storage 或類似裝置資訊儲存／存取技術，EU ePrivacy 規則通常要求使用前取得有效同意。AdSense 在 CMP、地區與選擇前自動載入，為重大差距。若保留 EU／UK 廣告，Google 另要求受認證的 TCF CMP；但 CMP 與 Google 設定只能協助執行，不能取代營運者對合法基礎、兒少設計與供應商治理的責任。

### Digital Services Act

若公開回饋或排行榜構成代使用者儲存並向公眾傳播資訊，服務可能成為 hosting service 或 online platform；若散布只是主要教育服務的 minor and purely ancillary feature，則需進一步法律判斷。只要屬 online platform 且可由未成年人使用，DSA Article 28 要求高水準的隱私、安全與保護；當平台合理確定使用者是未成年人時，不得以 profiling 個資投放廣告。面向或主要由未成年人使用時，條款也要適齡可理解。

Commission 2025 未成年人保護指引進一步說明：private-by-default、有效封鎖／檢舉、兒少安全的 recommender、適度 age assurance、降低 addictive design、cyberbullying、有害內容與商業操弄。雖然不是每一項都直接等於獨立罰則，Commission 會用它評估 Article 28 的遵循。Micro／small enterprise 對部分 platform 義務可能有豁免，且 public feedback 若只是主要教育服務的 minor and purely ancillary feature，平台分類仍需法律確認；因此本報告將 DSA 列為條件式，而不是直接斷言必然適用。[[EN07]]

**範圍降低建議：** 將公開回饋改為私人客服／審核佇列，移除不必要的公開傳播功能；排行榜維持 opt-in、每週假名並讓未成年人可完全退出與刪除別名。

### EU AI Act

現況僅用 AI 協助製作靜態教材，沒有在執行期用 AI 評量學生、決定入學／分級、監考或推斷情緒，因此目前沒有明顯觸發 Annex III 教育高風險 AI。未來若加入自動分流、正式成績評量、招生、作弊監控或學習情緒辨識，必須在需求階段重新做 AI Act 分類；教育場所 emotion recognition 原則上屬禁止做法，醫療或安全用途例外有限。執行時程已受 2026 AI Omnibus 調整，任何 AI 功能上線前應重新核對 Commission 最新時間表。[[EN08]]

## 英國法規分析

### UK GDPR 與 Children’s Code

ICO Children’s Code 適用於 likely to be accessed by under-18s 的 information society services，官方明確包含 educational websites；非英國業者若處理英國兒童也可能適用。其 15 項標準涵蓋兒童最佳利益、DPIA、年齡適當、透明度、資料有害使用、高隱私預設、最小化、資料分享、定位、家長控制、profiling、nudges、連網玩具與工具。[[EN09]]

英國在以 consent 為法律基礎直接提供線上服務時，兒童自行同意年齡為 13；低於 13 歲需具家長責任者同意，並應以風險相稱方式驗證。這不代表 13–17 歲可視同成人；Children’s Code 仍以未滿 18 歲為設計對象。

### Online Safety Act

若公開回饋使產品成為 user-to-user service，須分析 child access assessment。若回饋只能評論服務提供者的教材／服務，可能適用 Schedule 1 limited-functionality exemption；一般第三方 SaaS 不能只因「教育」而自動沿用學校／教育提供者豁免。若未獲豁免且服務 likely to be accessed by children，Ofcom 要求 children’s risk assessment、保護措施、紀錄與重評。移除立即公開 UGC 可顯著降低風險。[[EN10]]

### DUAA 2025

Data (Use and Access) Act 2025 的資料保護修正已於 2026-06-19 全部分階段生效，但沒有取代 UK GDPR、DPA 2018 或 PECR。產品需提供可用的資料保護投訴機制，原則上 30 日內確認收到並在不無故延遲下處理；若未來使用 solely automated significant decisions，也需提供告知、陳述、人工介入與 contest 保障。[[EN11]]

### PECR

與 EU ePrivacy 相似，非必要 storage/access technologies 通常必須在使用前取得有效同意。現有 AdSense 全站載入與缺少撤回控制不符合保守遵循設計。

## 其他跨域義務

### 廣告

Google 的 `data-tag-for-age-treatment="2"` 代表 teen treatment，主要關閉個人化與再行銷，並不適用於未滿 13 歲兒童，也不會替網站取得 COPPA 家長同意、EU／UK cookie consent 或履行州法義務。child-directed request 應使用 child treatment，但最佳產品決策仍是所有未成年人頁面完全不載入廣告或廣告 SDK。

### 資安與事件處理

現有 HMAC、session hash、安全 cookie、no-store 與 server-side XP 驗證是良好基礎。需補：公開及登入端點速率限制、請求大小限制、有效 bot 防護、嚴格 CSRF／Fetch Metadata、縮小 CSP、日誌 allowlist／redaction、HMAC 金鑰版本與輪替、撤銷所有 session、定期清除過期紀錄、供應商安全審查與兒少事件回應。GDPR 個資外洩可能涉及 72 小時主管機關通知；美國另有州別 breach law 與學校契約通知義務。

### 無障礙

面向公立學校採購時，美國 ADA Title II／Section 504／Section 508 契約要求可能把 WCAG 義務傳導給供應商；DOJ 2026 延期後，人口 50,000 以上公共實體期限為 2027-04-26，較小實體及 special districts 為 2028-04-26。EU Accessibility Act 是否直接適用取決於服務分類與微型企業豁免。產品宜把 WCAG 2.2 AA 當共同工程基線。現有 6 秒自動換題無暫停／永久關閉、部分 modal focus 管理、autofocus 與遊戲化壓力需改善。[[EN12]]

## 風險與義務對照

| 優先級 | 現況 | 主要義務／風險 | 建議控制 |
|---|---|---|---|
| P0 | AdSense 全站、判斷前載入 | COPPA 第三方廣告同意；EU/UK 裝置存取同意；DSA 未成年人 profiling ads | 立即停用未成年人及未知年齡流量的廣告；成人保留時建 age/geo/consent gating |
| P0 | Grade 7 招攬但只在登入自我勾選 13+ | child-directed/mixed audience、actual knowledge、Article 8 age matrix、Children’s Code | 決定方案 A/B；任何第三方前先做資料最小化 age band＋country 判斷 |
| P0 | 公開回饋立即發布 | 個資外洩、霸凌／自傷／招攬、DSA/OSA 範圍、消費者保護 | 暫停公開；改 pre-moderation、檢舉、下架、刪除、申訴、rate limit |
| P0 | 政策稱 anonymous | 透明度不準確、假名化資料仍可連結 | 改為 pseudonymous；清楚說明 Google credential 會到本站但不留 profile claims |
| P1 | 無家長／學校治理 | COPPA VPC、FERPA／SOPIPA、學校直接控制與刪除 | 建 guardian/school 模式與同意 ledger；未完成前不承接名冊或正式校用 |
| P1 | 無保存表與自動刪除 | COPPA／GDPR storage limitation、CCPA notice | 逐資料類型定期限與排程清除；備份與供應商同步 |
| P1 | 權利只有刪帳 | GDPR/UK GDPR/CCPA/COPPA 家長權利 | 建 access/export/correct/delete/restrict/object/withdrawal 與代理驗證流程 |
| P1 | 隱私通知資訊不足 | controller/operator、目的／法律基礎、接收者、轉移、權利、DPO/代表 | 重寫成人版與兒少短版 notice；保存版本與接受證據 |
| P1 | CSP、CSRF、rate limit、日誌治理不足 | reasonable security、privacy by design、breach exposure | 安全 hardening、監測與事件 runbook；秘密輪替與 session revoke |
| P2 | streak、reward、XP、排名、auto-advance | Children’s Code／DSA addictive design、dark patterns、a11y | 關閉自動前進、低壓模式、streak 寬容、排行榜易退出且刪除公開身分 |
| P2 | 目前沒有完整自動化合規測試 | 控制易回歸 | E2E 驗證第三方阻擋、同意撤回、刪除、保留、UGC、a11y、未成年人預設 |
| P3 | 未維護州別／國別適用性 | 法律快速變動、部署市場擴張 | 法規 register、每季審查、上線 gate、律師 sign-off、供應商年度審查 |

## 建議開發計畫（待批准）

### Phase 0：立即風險收斂（1–2 週）

1. 從全站根 layout 移除 AdSense；至少在未成年、未知年齡、學習、帳號、隱私與條款頁完全不載入。
2. 將公開回饋切換成停用或 private pending 狀態；後端預設不得直接公開。
3. 將「anonymous」政策文字改成「pseudonymous」並提供真實營運者、隱私與兒少安全聯絡管道。
4. 暫停任何學校名冊、教師監控或低於門檻的保存型帳號承諾。

### Phase 1：年齡、同意與資料治理（2–6 週）

1. 落實方案 A 或 B；建立 age band、country/region、政策版本、聲明／同意來源、actor、目的、時間與撤回的 consent ledger，不保存完整生日，除非風險證明必要。
2. 建立兒少短版 notice、完整版 privacy/cookie notice、terms/UGC rules、processor/subprocessor 列表、資料跨境與代表資訊。
3. 建 rights center：存取、JSON 匯出、更正、刪除、限制、反對／opt-out、同意撤回；家長／校方代理需有相稱驗證。
4. 建資料保存排程。建議產品起點：過期 sessions 即清；idempotency 30–90 天；細部答題紀錄自最後活動 12 個月；帳號總進度至帳號刪除或最後活動 24 個月；週排行榜別名 8–12 週；回饋解決後 12 個月。實際期限須由目的、契約與律師確認。
5. 建 vendor DPA、SCC/transfer assessment、ROPA、DPIA/children’s impact assessment、安全事件與政府請求流程。

### Phase 2：安全互動、廣告與 UX（4–8 週）

1. 若保留公開回饋：pre-moderation、內容安全、rate limit、bot、檢舉、緊急下架、作者刪除、申訴、稽核記錄與兒少升級流程。
2. 廣告只供可驗證成人且在適當地區 consent 後載入；EU/UK 使用 Google-certified CMP，US 支援 GPC／適用州 opt-out。未成年人維持無廣告。
3. 強化 CSP、CSRF、session revoke、secret rotation、log redaction、資料庫清理與監控。
4. 提供 auto-advance 關閉、低壓模式、streak 寬容、非競賽預設；完成 WCAG 2.2 AA 瀏覽器與輔具測試。

### Phase 3：上線治理

1. 建立美國州別、EU 會員國、UK 適用性與生效日 register；每季重查，重大產品變更先過 compliance gate。
2. 學校採用前完成 school DPA、FERPA/SOPIPA/州學生資料 addendum、刪除／匯出 SLA、subprocessor notice 與可稽核校方控制。
3. 建自動化測試：未同意不得載入第三方、未成年人不得出現廣告、同意撤回、刪除與保存、UGC 審核、權利請求、a11y。

## 需要產品負責人批准的決策

1. 選擇 **A 青少年帳號**（建議）或 **B 兒童／家庭／學校模式**。
2. 同意所有未滿 18 歲使用者無廣告，或提出可接受的成人限定廣告範圍。
3. 同意公開回饋先暫停／private moderation，或永久移除公開 UGC。
4. 確定首波市場：僅美國、僅特定州、EU/EEA、UK；未被正式納入的地區應先阻止帳號與資料處理。
5. 確定是否在下一階段承接學校客戶；若是，需將校用治理拆成獨立里程碑。

## 限制與不確定性

- 本報告為產品與技術風險稽核，不建立律師—客戶關係，也不取代各州／各國律師意見。
- 州兒童隱私、age-appropriate design、社群媒體與平台法規在 2025–2026 年持續生效、修法與訴訟；特別是 California AADC、Texas SCOPE 等，須在上線前重新核對。
- CCPA、Colorado 等一般隱私法常有營收、資料量、small-business 或處理活動門檻；未取得本服務公司實體、營收、使用者分布、供應商契約與實際 production logs，故以條件式適用表達。
- DSA／UK OSA 是否適用取決於公開回饋與排行榜是否屬向公眾傳播使用者資訊的核心或非純輔助功能；建議由當地律師確認。
- GDPR Article 8 年齡只處理 consent-based online service 的特定問題；若採 contract、legitimate interests 或 legal obligation，仍須分別證明必要性、公平性、兒童最佳利益與適當保障。

## 來源帳冊

### 美國：聯邦

1. FTC, *FTC Finalizes Changes to Children’s Privacy Rule* (2025-01-16). https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data
2. 16 C.F.R. Part 312, Children’s Online Privacy Protection Rule. https://www.law.cornell.edu/cfr/text/16/part-312
3. FTC, *Complying with COPPA: Frequently Asked Questions*. https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
4. FTC, *COPPA Rule: A Six-Step Compliance Plan*. https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
5. FTC, *COPPA Policy Statement on Age Verification Technologies* (2026-02). https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-issues-coppa-policy-statement-incentivize-use-age-verification-technologies-protect-children
6. FTC, *Policy Statement on Education Technology and COPPA* (2022). https://www.ftc.gov/legal-library/browse/policy-statement-federal-trade-commission-education-technology-childrens-online-privacy-protection
7. U.S. Department of Education, FERPA school official exception FAQ. https://studentprivacy.ed.gov/faq/i-want-use-online-tool-or-application-part-my-course-however-i-am-worried-it-violation-ferpa
8. FTC, *FTC Files Amicus Brief Saying COPPA Can’t Force Parents into Arbitration* (2024). https://www.ftc.gov/news-events/news/press-releases/2024/08/ftc-files-amicus-brief-saying-coppa-cant-force-parents-arbitration
9. FTC, Disney COPPA order (2025). https://www.ftc.gov/news-events/news/press-releases/2025/12/court-approves-order-requiring-disney-pay-10-million-settle-ftc-allegations-firm-enabled-unlawful

### 美國：州與無障礙

10. California Attorney General, *Ready for School: Recommendations for the Ed Tech Industry*. https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/ready-for-school-1116.pdf
11. California Privacy Protection Agency, CCPA Statute effective 2026-01-01. https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf
12. California Attorney General, legal advisory on application of existing California laws to AI (student data discussion). https://oag.ca.gov/system/files/attachments/press-docs/Legal%20Advisory%20-%20Application%20of%20Existing%20CA%20Laws%20to%20Artificial%20Intelligence.pdf
13. California Attorney General, KOPIPA enforcement release. https://oag.ca.gov/node/613897
14. Texas Attorney General, SCOPE Act consumer privacy overview. https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint/consumer-privacy-rights/securing-children-online-through-parental-empowerment
15. Colorado Attorney General, Colorado Privacy Act resources. https://coag.gov/resources/colorado-privacy-act/
16. U.S. Department of Justice, ADA Title II web/mobile accessibility small entity guide. https://www.ada.gov/resources/small-entity-compliance-guide/
17. U.S. Section 508, *Request Accessibility Information*. https://www.section508.gov/buy/request-accessibility-information/
18. Colorado General Assembly, SB24-041. https://www.leg.colorado.gov/bills/sb24-041
19. Connecticut General Statutes, Chapter 743jj (2026 supplement). https://www.cga.ct.gov/2026/sup/chap_743jj.htm
20. Illinois SOPPA. https://my.ilga.gov/Legislation/ILCS/Articles?ActID=3806&Chapter=SCHOOLS&ChapterID=17&MajorTopic=EDUCATION
21. New York Education Law §2-d. https://www.nysenate.gov/legislation/laws/EDN/2-D
22. Maryland Kids Code §§14-4804–4806. https://mgaleg.maryland.gov/2026RS/Statute_Web/gcl/14-4804.pdf
23. Ninth Circuit, *NetChoice v. Bonta*, 2026-03-12. https://law.justia.com/cases/federal/appellate-courts/ca9/25-2366/25-2366-2026-03-12.html

### 歐盟／EEA

24. Regulation (EU) 2016/679 (GDPR). https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679
25. European Commission, children’s data safeguards. https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en
26. EDPB, Children topic page. https://www.edpb.europa.eu/topics/key-gdpr-concepts/children_en
27. EDPB, Statement 1/2025 on Age Assurance. https://www.edpb.europa.eu/system/files/2025-04/edpb_statement_20250211ageassurance_v1-2_en.pdf
28. Regulation (EU) 2022/2065 (Digital Services Act). https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng
29. European Commission, *Guidelines on the protection of minors online* (2025). https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors
30. European Commission, official DSA minors guidelines, OJ C/2025/5519. https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AC_202505519
31. Directive 2002/58/EC (ePrivacy Directive). https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058
32. EDPB, Guidelines 2/2023 on technical scope of ePrivacy Article 5(3). https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en
33. CJEU, *Planet49*, C-673/17. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A62017CJ0673
34. Regulation (EU) 2024/1689 (AI Act). https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689
35. European Commission, current AI Act timeline. https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
36. Directive (EU) 2019/882 (European Accessibility Act). https://eur-lex.europa.eu/eli/dir/2019/882/oj

### 英國

37. ICO, *Introduction to the Children’s Code*. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code
38. ICO, services covered by Children’s Code. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/services-covered-by-this-code/
39. ICO, *Age appropriate design: a code of practice for online services*. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
40. ICO, *How do the lawful bases apply to children’s personal information?* https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/how-do-the-lawful-bases-apply-to-children-s-personal-information/
41. ICO, DUAA overview and changes. https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations/
42. Ofcom, *Protection of children duties under the Online Safety Act*. https://www.ofcom.org.uk/online-safety/protecting-children/protection-of-children-duties-under-the-online-safety-act
43. UK Government, Online Safety Act collection. https://www.gov.uk/government/collections/online-safety-act
44. ICO, storage and access technologies guidance. https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/
45. Online Safety Act 2023 explanatory notes, Schedule 1. https://www.legislation.gov.uk/ukpga/2023/50/notes/division/6/index.htm

### 廣告與平台

46. Google AdSense Help, age-restricted treatment. https://support.google.com/adsense/answer/9007197?hl=en-GB
47. Google AdSense Help, AdSense TFAT child/teen examples. https://support.google.com/adsense/answer/9009582?hl=en
48. Google AdSense Help, CMP requirements for EEA and UK. https://support.google.com/adsense/answer/13554116?hl=en-GB
49. Google AdSense Help, EU user consent policy implementation. https://support.google.com/adsense/answer/7670013?hl=en-GB

### 程式碼與服務證據

50. `/Users/sting/projects/math/app/layout.tsx` — 全站載入 `AdUnit`。
51. `/Users/sting/projects/math/app/components/AdUnit.tsx` — 2.5 秒後載入 AdSense；固定 teen-treatment `2`。
52. `/Users/sting/projects/math/app/components/GoogleSignIn.tsx` — 13+ 自我勾選與 Google 登入。
53. `/Users/sting/projects/math/app/api/auth/google/route.ts` — 後端只檢查 `ageConfirmed` boolean。
54. `/Users/sting/projects/math/app/api/feedback/route.ts`、`app/components/FeedbackBoard.tsx`、`lib/store.ts`、`lib/privacy.ts` — 未登入公開回饋、即時發布與有限過濾。
55. `/Users/sting/projects/math/db/schema.ts` — learner、session、學習、leaderboard、feedback 資料結構。
56. `/Users/sting/projects/math/app/components/LegalPage.tsx` — 現有隱私與條款。
57. `/Users/sting/projects/math/worker/index.ts`、`lib/security.ts`、`lib/http.ts` — 安全標頭、session、同源檢查。
