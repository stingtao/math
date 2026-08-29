import Image from "next/image";
import type { LessonDefinition } from "@/lib/curriculum";
import { getLessonExperience, type LessonScene } from "@/lib/lesson-experience";
import { useEnterAction } from "./useEnterAction";

const colors: Record<LessonDefinition["accent"], { main: string; soft: string }> = {
  blue: { main: "#2474ed", soft: "#dcecff" },
  teal: { main: "#158f82", soft: "#d7f1ec" },
  coral: { main: "#e15f4f", soft: "#ffe2dc" },
  violet: { main: "#7557d9", soft: "#e8e1ff" },
  gold: { main: "#c07a00", soft: "#fff0bd" },
};

export function LessonMissionStory({ lesson }: { lesson: LessonDefinition }) {
  const experience = getLessonExperience(lesson);
  return <div className={`lesson-mission-story accent-${lesson.accent}`}>
    <div className="lesson-mission-copy">
      <span className="section-kicker">{experience.kicker}</span>
      <h2>{experience.title}</h2>
      <p>{experience.problem}</p>
      <div className="lesson-mission-model"><small>MISSION MODEL</small><strong>{experience.model}</strong></div>
    </div>
    {experience.image ? <div className="mission-scene-image">
      <Image src={experience.image} alt={experience.imageAlt ?? ""} fill sizes="(max-width: 980px) 100vw, 52vw" priority={false} />
      <div className="mission-image-signals"><span>{experience.signalA}</span><strong>{experience.signalB}</strong></div>
    </div> : <MissionScene scene={experience.scene} accent={lesson.accent} signalA={experience.signalA} signalB={experience.signalB} title={`${lesson.title}: ${experience.title}`} />}
  </div>;
}

export function LessonMissionThumbnail({ lesson }: { lesson: LessonDefinition }) {
  const experience = getLessonExperience(lesson);
  return <div className="lesson-mission-thumbnail">
    <MissionScene scene={experience.scene} accent={lesson.accent} signalA={experience.signalA} signalB={experience.signalB} title={`${lesson.title} application`} compact />
    <small>{experience.kicker}</small>
  </div>;
}

export function LessonHistory({ lesson, busy, errorMessage, onComplete }: { lesson: LessonDefinition; busy: boolean; errorMessage: string; onComplete: () => void }) {
  const { history, scene } = getLessonExperience(lesson);
  useEnterAction(onComplete, !busy);
  return <div className={`stage-card history-stage-card accent-${lesson.accent}`}>
    <div className="history-stage-copy">
      <span className="section-kicker">WHY THIS IDEA EXISTS · {history.era}</span>
      <h2>{history.title}</h2>
      <p>{history.story}</p>
      <strong>{history.connection}</strong>
      <a href={history.sourceUrl} target="_blank" rel="noreferrer">Read the history source <span aria-hidden="true">↗</span></a>
    </div>
    <HistoryScene scene={scene} title={history.title} />
    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
    <div className="stage-footer"><span>Practice complete. Finish to save rewards.</span><button className="primary-button mission-primary-cta" type="button" disabled={busy} aria-busy={busy} aria-keyshortcuts="Enter" onClick={onComplete}>{busy ? "Saving…" : "Complete lesson"} <span aria-hidden="true">→</span></button></div>
  </div>;
}

function MissionScene({ scene, accent, signalA, signalB, title, compact = false }: { scene: LessonScene; accent: LessonDefinition["accent"]; signalA: string; signalB: string; title: string; compact?: boolean }) {
  const tone = colors[accent];
  const isRoute = scene === "navigation" || scene === "motion";
  const isStructure = scene === "habitat" || scene === "systems";
  const isSignal = scene === "risk" || scene === "growth";
  return <svg className={`mission-scene scene-${scene} ${compact ? "compact" : ""}`} viewBox="0 0 560 340" role="img" aria-label={title}>
    <title>{title}</title>
    <rect x="8" y="8" width="544" height="324" rx="30" fill="#fff9ee" stroke="#17364b" strokeWidth="4" />
    <circle cx="440" cy="76" r="38" fill="#ffc742" stroke="#17364b" strokeWidth="4" />
    <path d="M10 244 Q120 190 218 239 T550 225 V330 H10Z" fill="#e98758" />
    <path d="M10 279 Q128 232 245 276 T550 260 V330 H10Z" fill="#c85f43" opacity=".72" />
    {isRoute && <>
      <g opacity=".42" stroke="#17364b" strokeWidth="2"><path d="M82 56V260M122 56V260M162 56V260M202 56V260M242 56V260M282 56V260M322 56V260"/><path d="M62 80H340M62 120H340M62 160H340M62 200H340M62 240H340"/></g>
      <path d={scene === "motion" ? "M76 226 C145 221 173 79 324 101" : "M78 224 L145 184 L217 145 L315 88"} fill="none" stroke={tone.main} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(286 71)"><rect x="0" y="20" width="58" height="34" rx="10" fill="#f7f9fb" stroke="#17364b" strokeWidth="4"/><path d="M13 20L24 4H41L48 20" fill={tone.soft} stroke="#17364b" strokeWidth="4"/><circle cx="14" cy="58" r="9" fill="#17364b"/><circle cx="46" cy="58" r="9" fill="#17364b"/></g>
    </>}
    {isStructure && <>
      <path d="M93 230V140Q93 89 144 89H232Q283 89 283 140V230Z" fill={tone.soft} stroke="#17364b" strokeWidth="5" />
      <path d="M188 90V230M96 171H281" stroke={tone.main} strokeWidth="5" />
      <path d="M311 205L386 130L461 205Z" fill="#dcecff" stroke="#17364b" strokeWidth="5" />
      <path d="M386 130V205" stroke={tone.main} strokeWidth="5" strokeDasharray="8 7" />
    </>}
    {scene === "resources" && <>
      <g transform="translate(76 86)"><rect width="238" height="126" rx="20" fill="white" stroke="#17364b" strokeWidth="5"/><path d="M60 3V123M119 3V123M178 3V123" stroke="#17364b" strokeWidth="4"/><rect x="4" y="4" width="173" height="118" rx="15" fill={tone.soft}/><path d="M60 3V123M119 3V123M178 3V123" stroke="#17364b" strokeWidth="4"/></g>
      <g transform="translate(350 113)" fill={tone.main} stroke="#17364b" strokeWidth="4"><circle cx="30" cy="25" r="20"/><circle cx="82" cy="25" r="20"/><circle cx="30" cy="77" r="20"/><circle cx="82" cy="77" r="20"/></g>
    </>}
    {scene === "numbers" && <>
      <path d="M76 164H390" stroke="#17364b" strokeWidth="6" strokeLinecap="round"/><path d="M224 134V194" stroke="#17364b" strokeWidth="6"/><circle cx="155" cy="164" r="13" fill="#e15f4f" stroke="white" strokeWidth="5"/><circle cx="327" cy="164" r="13" fill={tone.main} stroke="white" strokeWidth="5"/><path d="M164 130Q242 67 319 130" fill="none" stroke={tone.main} strokeWidth="6" strokeDasharray="10 8"/>
    </>}
    {scene === "proof" && <>
      <path d="M92 211L222 82L345 211Z" fill={tone.soft} stroke="#17364b" strokeWidth="5" strokeLinejoin="round"/>
      <path d="M222 82V211M167 139L180 151L198 126" fill="none" stroke={tone.main} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M245 128H400M245 161H372M245 194H417" stroke="#17364b" strokeWidth="4" strokeLinecap="round"/>
      <g fill={tone.main}><circle cx="235" cy="128" r="6"/><circle cx="235" cy="161" r="6"/><circle cx="235" cy="194" r="6"/></g>
    </>}
    {scene === "signal" && <>
      <path d="M76 213V80M76 147H421" stroke="#17364b" strokeWidth="5" strokeLinecap="round"/>
      <path d="M83 146C115 80 154 80 187 146S259 212 293 146S365 80 414 145" fill="none" stroke={tone.main} strokeWidth="8" strokeLinecap="round"/>
      <path d="M151 83V211M292 83V211" stroke="#17364b" strokeWidth="3" strokeDasharray="8 7" opacity=".45"/>
      <circle cx="187" cy="146" r="9" fill="#ffc742" stroke="#17364b" strokeWidth="4"/>
    </>}
    {scene === "orbit" && <>
      <ellipse cx="247" cy="151" rx="151" ry="78" fill="none" stroke={tone.main} strokeWidth="7"/>
      <circle cx="188" cy="151" r="16" fill="#ffc742" stroke="#17364b" strokeWidth="4"/>
      <circle cx="306" cy="151" r="6" fill="#17364b"/>
      <g transform="translate(364 115) rotate(18)"><rect x="0" y="0" width="47" height="27" rx="7" fill="white" stroke="#17364b" strokeWidth="4"/><path d="M-31 5H0M47 5H78M-31 22H0M47 22H78" stroke={tone.main} strokeWidth="7"/></g>
      <path d="M188 151L397 128" stroke="#17364b" strokeWidth="3" strokeDasharray="8 7"/>
    </>}
    {scene === "accumulation" && <>
      <path d="M75 220V70M75 220H420" stroke="#17364b" strokeWidth="5" strokeLinecap="round"/>
      {[112, 148, 184, 220, 256, 292, 328].map((x, index) => <rect key={x} x={x} y={190 - index * 14} width="32" height={30 + index * 14} fill={tone.soft} stroke={tone.main} strokeWidth="2"/>)}
      <path d="M82 204C142 197 195 178 241 145S329 88 407 80" fill="none" stroke={tone.main} strokeWidth="8" strokeLinecap="round"/>
      <path d="M112 230H360" stroke="#17364b" strokeWidth="3" strokeDasharray="8 7"/>
    </>}
    {scene === "network" && <>
      <g stroke="#17364b" strokeWidth="6"><path d="M120 112L235 76L351 121L399 208L258 224L120 112M235 76L258 224M351 121L120 112"/></g>
      <g stroke="white" strokeWidth="5"><circle cx="120" cy="112" r="18" fill={tone.main}/><circle cx="235" cy="76" r="18" fill="#ffc742"/><circle cx="351" cy="121" r="18" fill={tone.main}/><circle cx="399" cy="208" r="18" fill="#e15f4f"/><circle cx="258" cy="224" r="18" fill={tone.main}/></g>
      <path d="M270 201L258 224L286 218" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </>}
    {isSignal && <>
      <path d="M93 226V98M93 226H352" stroke="#17364b" strokeWidth="6" strokeLinecap="round"/>
      {scene === "growth" ? <path d="M112 209C167 200 194 178 223 147S288 95 337 67" fill="none" stroke={tone.main} strokeWidth="8" strokeLinecap="round"/> : <g fill={tone.main} stroke="white" strokeWidth="4"><circle cx="132" cy="182" r="10"/><circle cx="171" cy="158" r="10"/><circle cx="207" cy="171" r="10"/><circle cx="251" cy="123" r="10"/><circle cx="297" cy="135" r="10"/><circle cx="331" cy="87" r="10"/></g>}
      <path d="M404 215V119M385 137Q404 116 423 137M370 112Q404 76 438 112" fill="none" stroke="#17364b" strokeWidth="6" strokeLinecap="round"/>
    </>}
    <g className="mission-scene-label"><rect x="52" y="267" width="204" height="42" rx="13" fill="#17364b"/><text x="67" y="294" fill="white">{signalA}</text><rect x="271" y="267" width="237" height="42" rx="13" fill={tone.main}/><text x="286" y="294" fill="white">{signalB}</text></g>
  </svg>;
}

function HistoryScene({ scene, title }: { scene: LessonScene; title: string }) {
  const symbols: Record<LessonScene, string> = { numbers: "−2 + 5", resources: "3/4", systems: "x + 4 = 9", navigation: "(x, y)", habitat: "△", risk: "P(A)", growth: "2ⁿ", motion: "dy/dx", proof: "∵ → ∴", signal: "sin θ", orbit: "r(θ)", accumulation: "∫ f(x)dx", network: "V → E" };
  return <svg className="history-scene" viewBox="0 0 560 250" role="img" aria-label={`A historical manuscript connects to the modern model ${symbols[scene]}: ${title}`}>
    <rect x="8" y="8" width="544" height="234" rx="28" fill="#f5ead2" stroke="#17364b" strokeWidth="4"/>
    <path d="M66 54Q89 34 112 54V199Q89 181 66 199ZM112 54Q164 30 217 55V199Q164 175 112 199Z" fill="#fff9e8" stroke="#17364b" strokeWidth="4"/>
    <path d="M86 90H190M86 118H190M86 146H166" stroke="#ae8f61" strokeWidth="5" strokeLinecap="round"/>
    <path d="M242 127H328" stroke="#17364b" strokeWidth="6" strokeLinecap="round"/><path d="M313 111L330 127L313 143" fill="none" stroke="#17364b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="354" y="61" width="149" height="132" rx="21" fill="white" stroke="#17364b" strokeWidth="4"/>
    <text x="428" y="137" textAnchor="middle" fill="#2474ed" fontSize="28" fontWeight="800">{symbols[scene]}</text>
  </svg>;
}
