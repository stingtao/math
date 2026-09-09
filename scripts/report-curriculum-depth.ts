import { readFile, writeFile } from "node:fs/promises";
import { curriculumStats, lessons, regions } from "../lib/curriculum.ts";
import { depthPacks, firstDepthPacks, round2DepthPacks, round3DepthPacks, getQuestionBank, lessonCoverage } from "../lib/curriculum-depth.ts";
import { ASSESSMENT_VERSION, isReasoningQuestion, selectBossQuestions } from "../lib/assessment-selection.ts";
import type { LessonDepthPack } from "../lib/curriculum-depth-types.ts";
import { validateDepthCurriculum } from "./validate-depth.ts";

const evidence = validateDepthCurriculum(lessons);
const matrix = lessons.map(lessonCoverage);
const baselineQuestions = lessons.reduce((count, lesson) => count + lesson.practice.length, 0);
const totals = (packs: LessonDepthPack[]) => ({ lessons: packs.length, objectives: packs.reduce((n, pack) => n + pack.objectives.length, 0), questions: packs.reduce((n, pack) => n + pack.questions.length, 0) });
const first = totals(firstDepthPacks);
const second = totals(round2DepthPacks);
const third = totals(round3DepthPacks);
const seededBosses = regions.map((region) => selectBossQuestions(region, "d3-coverage-report-v3"));
const tableCell = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");
const report = [
  "# 內容與能力覆蓋：三輪補強",
  "",
  "本報告以實際組裝的題庫產生。`practiced` 只表示具體能力有成對題目及指定認知要求的證據，不代表學生已精熟，亦不代表整門 AP／IB 課程完整。",
  "",
  "| 指標 | 第一輪結束 | 第二輪結束 | 第三輪結束 | 本輪增加 |",
  "| --- | ---: | ---: | ---: | ---: |",
  `| 課程 | ${lessons.length} | ${lessons.length} | ${lessons.length}（原 ID 保留） | 0 |`,
  `| 完整題庫 | ${baselineQuestions + first.questions} | ${baselineQuestions + first.questions + second.questions} | ${curriculumStats.questions} | ${third.questions} |`,
  `| 已建立題目證據的能力 | ${first.objectives} | ${first.objectives + second.objectives} | ${evidence.objectives} | ${third.objectives} |`,
  `| 已完成指定能力補強的課程 | ${first.lessons} | ${first.lessons + second.lessons} | ${evidence.lessons} | ${third.lessons} |`,
  `| 尚待逐能力審核的課程 | ${lessons.length - first.lessons} | ${lessons.length - first.lessons - second.lessons} | ${matrix.filter((row) => row.status === "baseline-only").length} | −${third.lessons} |`,
  "",
  `原題庫 ${baselineQuestions} 題保留；三輪合計新增 ${evidence.questions} 題。補強課單次練習仍為 6 題：3 道基礎題，加上 3 個能力各一道新題。每個新增能力每次抽一個變式，維持短練習長度。`,
  "",
  `本次固定種子驗證 ${seededBosses.filter((questions) => questions.some(isReasoningQuestion)).length}/${regions.length} 個 Boss 含圖表或推理題，且每課都有出題。自動測試另以多組種子檢查實際可達性及補救題來源。`,
  "",
  "## 第三輪的選課理由",
  "",
  "從尚未逐能力審核的課程，補充尺度與反推、代數推理、資料判斷及數學應用。G7 著重比例尺、有理數情境、不等式與非正式推論；G8 著重科學記號運算、代數解聯立、複合變換與擬合線；G9 著重可行解、完整因式分解、成長比較與殘差。G10–G12 延伸至幾何證明與建模、多項式根、無窮等比級數、弧度與矩陣系統、極限、最佳化、微積分基本定理及研究設計。",
  "",
  "新增的是每課三個有明確題目證據的能力切片；其餘延伸能力仍逐課列出，不將候選表格誤記為完整作圖、建構證明或閱讀所有原始統計輸出的能力。",
  "",
  "## 各年級題庫",
  "",
  "| 年級 | 課數 | 原題庫 | 第一輪新增 | 第二輪新增 | 第三輪新增 | 最新題庫 |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...[7, 8, 9, 10, 11, 12].map((grade) => {
    const gradeLessons = lessons.filter((lesson) => lesson.grade === grade);
    const before = gradeLessons.reduce((count, lesson) => count + lesson.practice.length, 0);
    const afterFirst = gradeLessons.reduce((count, lesson) => count + getQuestionBank(lesson, "depth-v1").length, 0);
    const afterSecond = gradeLessons.reduce((count, lesson) => count + getQuestionBank(lesson, "depth-v2").length, 0);
    const after = gradeLessons.reduce((count, lesson) => count + getQuestionBank(lesson).length, 0);
    return `| G${grade} | ${gradeLessons.length} | ${before} | ${afterFirst - before} | ${afterSecond - afterFirst} | ${after - afterSecond} | ${after} |`;
  }),
  "",
  "## 能力與題目證據",
  "",
  "每組兩題是不同數值或情境的同能力變式。舊題只有在實際測到同一能力時才建立關聯；未標記的舊題不會被自動視為等價變式。",
  ...depthPacks.flatMap((pack) => {
    const lesson = lessons.find((item) => item.slug === pack.lessonSlug)!;
    const row = lessonCoverage(lesson);
    return [
      "", `### ${row.introducedIn === "depth-v1" ? "第一輪" : row.introducedIn === "depth-v2" ? "第二輪" : "第三輪"} · G${lesson.grade} · ${lesson.title}`, "", `課程：\`${lesson.slug}\` · 狀態：指定能力已補強，仍有下列延伸缺口。`, "",
      "| 能力 | 認知要求 | 新題 ID | 狀態 |", "| --- | --- | --- | --- |",
      ...row.objectives.map((objective) => `| ${tableCell(objective.description)} | ${objective.requiredDemands.join(", ")} | ${objective.questionIds.join(", ")} | ${objective.status} |`),
      "", `仍待補強：${pack.remainingGaps.join("；")}`, "",
    ];
  }),
  "## 範圍與版本",
  "",
  "Common Core 的 73 個群組映射仍保留；逐能力完整率的分母尚未完成全庫審核，因此不提供誤導性的『全課綱完成率』。完整 JSON 列出全部 253 課，未審核者標記 baseline-only。",
  "",
  "AP Statistics 以 2026–27 版本判斷必修範圍。幾何分配、卡方適合度與斜率推論已從該版移除，不能當作新版必補缺口；原有延伸教材保留。[College Board 修訂說明](https://apcentral.collegeboard.org/courses/ap-statistics/future-revisions)",
  "",
  "AP Calculus BC 與 IB／Cambridge 延伸仍需分路線細審；本輪的微積分增加實作及解釋題，但不宣稱完整對齊考試。[AP Calculus BC 官方範圍](https://apcentral.collegeboard.org/courses/ap-calculus-bc)",
  "",
  "## 驗收與維護",
  "",
  "本機測試、瀏覽器操作與驗證邊界見[第一輪驗收](curriculum-depth-validation.md)、[第二輪驗收](curriculum-depth-round2-validation.md)及[第三輪與部署驗收](curriculum-depth-round3-validation.md)。",
  "",
  "新題接受原有全部格式檢查，另驗證能力對應、變式、解析、提示、表示法及保留的缺口。數學計算以獨立公式核對。",
  "",
  "`d1-` 使用第一輪題庫與選題規則；`d2-` 使用前兩輪合併題庫；`d3-` 使用三輪合併題庫；更早的未加前綴 ID 保留原題組。尚未完成的課程與 Boss 依原 ID 恢復。Review 明確區分 depth-v1／depth-v2／depth-v3，保留各版的原題、變式與選題種子。",
  "",
  "前兩輪完整題目內容及選題行為已分別保存為回歸基準，涵蓋 16 個種子、全部課程、Boss 的各補救位置，以及 Review／Demo。後續更動候選題或選題規則必須新增版本並保留舊版；不要重新產生基準來掩蓋不相容變動。",
  "",
  "新增內容先擴充題庫，再檢查各入口的可達性；不要直接增加單次練習長度。後續補強依 remainingGaps 及尚未審核的課程排序。",
  "",
  "重新產生：`npm run report:coverage`。檢查報告與題庫一致：`node --experimental-strip-types scripts/report-curriculum-depth.ts --check`。",
  "",
].join("\n");
for (const [path, content] of [
  [new URL("../docs/curriculum-depth-report.md", import.meta.url), report],
  [new URL("../docs/curriculum-depth-matrix.json", import.meta.url), JSON.stringify({ version: ASSESSMENT_VERSION, statistics: { ...curriculumStats, auditedLessons: evidence.lessons, auditedObjectives: evidence.objectives, addedQuestions: evidence.questions }, rounds: { "depth-v1": first, "depth-v2": second, "depth-v3": third }, lessons: matrix }, null, 2) + "\n"],
] as const) {
  if (process.argv.includes("--check")) {
    if (await readFile(path, "utf8") !== content) throw new Error(`Coverage report is stale: ${path.pathname}`);
  } else await writeFile(path, content);
}
console.log(`Coverage report ${process.argv.includes("--check") ? "verified" : "written"}: ${evidence.lessons} lesson slices, ${evidence.objectives} objectives, ${evidence.questions} added questions across three rounds.`);
