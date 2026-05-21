import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { useInterview } from "../hooks/useInterview";
import { getHistory, getStats } from "../api/problems";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const THEMES = {
  dark:  { bg: "#070a10", bg2: "#0f1320", bg3: "#161c2c", bg4: "#1e2438", border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.14)", text: "#e6edf3", text2: "#8b949e", text3: "#484f58", accent: "#58a6ff", green: "#3fb950", amber: "#d29922", red: "#f85149", purple: "#a371f7" },
  light: { bg: "#f0f4f8", bg2: "#ffffff", bg3: "#f0f4f8", bg4: "#dde3ea", border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.15)", text: "#1f2328", text2: "#57606a", text3: "#8c959f", accent: "#0969da", green: "#1a7f37", amber: "#9a6700", red: "#d1242f", purple: "#8250df" },
};

const diffColor  = (d, t) => d === "Easy" ? t.green : d === "Medium" ? t.amber : t.red;
const scoreColor = (s, t) => s >= 80 ? t.green : s >= 60 ? t.amber : t.red;
const fmtTime    = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const GLOBAL_CSS = (t, dk) => `
  *{box-sizing:border-box;margin:0;padding:0}
  textarea,input,button{font-family:inherit}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-thumb{background:${t.border2};border-radius:3px}
  ::-webkit-scrollbar-track{background:transparent}

  @keyframes dot-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(63,185,80,0.65); }
    50%     { box-shadow: 0 0 0 6px rgba(63,185,80,0); }
  }
  @keyframes fade-in {
    from { opacity:0; transform:translateY(5px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .logo-dot { animation: dot-pulse 2.2s ease-in-out infinite; border-radius: 50%; }

  .nav-item { transition: all .12s !important; }
  .nav-item:hover { background: rgba(88,166,255,0.08) !important; color: #58a6ff !important; }

  .new-btn { transition: all .2s; }
  .new-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(88,166,255,0.32); }

  .tab-item { transition: color .15s, border-color .15s; }
  .tab-item:hover { color: ${t.text} !important; }

  .code-btn { transition: filter .15s, transform .12s; }
  .code-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }

  .score-card { transition: transform .15s, box-shadow .2s; }
  .score-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.4); }

  .q-item { transition: all .12s; }
  .q-item:hover { background: ${dk ? "rgba(88,166,255,0.07)" : "rgba(9,105,218,0.06)"} !important; border-color: ${dk ? "rgba(88,166,255,0.22)" : "rgba(9,105,218,0.22)"} !important; }

  .hist-item { transition: border-color .12s, background .12s; }
  .hist-item:hover { border-color: ${t.border2} !important; }

  .lang-btn { transition: all .12s; }
  .lang-btn:hover { border-color: ${t.border2} !important; }

  .chat-send { transition: filter .15s; }
  .chat-send:hover { filter: brightness(1.12); }

  .header-btn { transition: background .15s, border-color .15s; }
  .header-btn:hover { background: ${dk ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)"} !important; }

  .fb-item { transition: background .12s; }
  .fb-item:hover { background: ${dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} !important; }
`;

export default function InterviewPage() {
  const { user, logout, updateTheme } = useAuth();
  const [themeMode, setThemeMode] = useState(user?.theme || "dark");
  const t  = THEMES[themeMode];
  const dk = themeMode === "dark";

  const [activeTab, setActiveTab]   = useState("problem");
  const [activeNav, setActiveNav]   = useState("interview");
  const [chatInput, setChatInput]   = useState("");
  const [history, setHistory]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [filterDiff, setFilterDiff] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobilePanel, setMobilePanel] = useState("problem");
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const iv = useInterview();

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next); updateTheme(next);
  };

  const loadHistory = async () => {
    if (iv.isDemo) { setHistory([{ id:1, problem:{ title:"Valid Parentheses", topic:"Stack", difficulty:"Easy" }, feedback:{ overall:96 }, language:"Python 3", createdAt:new Date(), timeTaken:492 }]); return; }
    try { const { data } = await getHistory(); setHistory(data.submissions); } catch {}
  };

  const loadStats = async () => {
    if (iv.isDemo) { setStats({ total:3, avgScore:78, scoreOverTime:[{ date:"Day 1",score:65 },{ date:"Day 2",score:78 },{ date:"Day 3",score:82 }], byTopic:[{ topic:"Arrays",count:2,avg:80 },{ topic:"Stack",count:1,avg:96 }] }); return; }
    try { const { data } = await getStats(); setStats(data); } catch {}
  };

  const handleNav = (nav) => {
    setActiveNav(nav);
    if (nav === "history")   { loadHistory(); setActiveTab("history"); }
    else if (nav === "analytics") { loadStats(); setActiveTab("analytics"); }
    else setActiveTab("problem");
  };

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || iv.chatLoading) return;
    setChatInput("");
    await iv.chat(q);
    chatBottomRef.current?.scrollIntoView({ behavior:"smooth" });
  };

  const handleEditorBeforeMount = (monaco) => {
    monaco.editor.defineTheme("interview-dark", {
      base: "vs-dark", inherit: true, rules: [],
      colors: {
        "editorLineNumber.foreground":       "#546e7a",
        "editorLineNumber.activeForeground": "#cdd9e5",
        "editorGutter.background":           "#1a2236",
        "editor.background":                 "#070a10",
        "editorLineHighlightBackground":     "#161c2c",
      },
    });
    monaco.editor.defineTheme("interview-light", {
      base: "vs", inherit: true, rules: [],
      colors: {
        "editorLineNumber.foreground":       "#7a8694",
        "editorLineNumber.activeForeground": "#1f2328",
        "editorGutter.background":           "#d8dee6",
        "editor.background":                 "#ffffff",
        "editorLineHighlightBackground":     "#f0f4f8",
      },
    });
  };

  const timerPct  = (iv.timerSec / (25 * 60)) * 100;
  const filteredQs = iv.problems.filter((q) => filterDiff === "All" || q.difficulty === filterDiff);

  const tag = (c) => ({
    fontFamily:"'DM Mono', monospace", fontSize:10, padding:"2px 8px",
    borderRadius:5, fontWeight:700,
    background:`${c}18`, color:c, border:`1px solid ${c}2e`,
  });

  const timerColor = timerPct < 25 ? t.red : timerPct < 50 ? t.amber : t.accent;

  return (
    <>
      <style>{GLOBAL_CSS(t, dk)}</style>

      <div style={{ fontFamily:"'DM Sans', sans-serif", background:t.bg, color:t.text, height:"100vh", display:"flex", flexDirection:"column", fontSize:14 }}>

        {/* ── HEADER ── */}
        <div style={{
          background: dk ? "rgba(15,19,32,0.85)" : "rgba(255,255,255,0.85)",
          backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
          borderBottom:`1px solid ${t.border}`,
          padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          height:52, flexShrink:0, position:"relative",
        }}>
          {/* gradient line under header */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 0%, rgba(88,166,255,0.25) 30%, rgba(163,113,247,0.25) 70%, transparent 100%)" }} />

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="logo-dot" style={{ width:8, height:8, background:t.green, flexShrink:0 }} />
            <span style={{
              fontFamily:"'DM Mono', monospace", fontWeight:700, fontSize:15,
              background:"linear-gradient(135deg, #58a6ff, #a371f7)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>InterviewAI</span>
            {iv.isDemo && <span style={{ fontSize:10, background:`${t.amber}1e`, color:t.amber, padding:"2px 7px", borderRadius:5, fontFamily:"'DM Mono', monospace", fontWeight:700, border:`1px solid ${t.amber}35` }}>DEMO</span>}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {iv.feedback && (
              <span style={{ ...tag(scoreColor(iv.feedback.overall, t)), fontSize:11, padding:"3px 9px" }}>
                Score: {iv.feedback.overall}/100
              </span>
            )}
            <span style={{
              fontFamily:"'DM Mono', monospace", fontSize:13, fontWeight:700,
              color: timerColor,
              background:`${timerColor}12`, border:`1px solid ${timerColor}25`,
              borderRadius:7, padding:"3px 9px",
            }}>{fmtTime(iv.timerSec)}</span>
            <span style={{ fontSize:13, color:t.text2 }}>{user?.name}</span>
            <button className="header-btn" onClick={toggleTheme} style={{ background:dk?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)", border:`1px solid ${t.border}`, color:t.text2, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:13 }}>
              {themeMode === "dark" ? "☀" : "☾"}
            </button>
            <button className="header-btn" onClick={logout} style={{ background:"transparent", border:`1px solid ${t.border}`, color:t.text2, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>Logout</button>
          </div>
        </div>

        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* ── SIDEBAR ── */}
          <div style={{
            width:218,
            background: dk ? "rgba(15,19,32,0.7)" : t.bg2,
            borderRight:`1px solid ${t.border}`,
            display: isMobile ? "none" : "flex", flexDirection:"column", flexShrink:0,
          }}>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", padding:"16px 14px 6px" }}>Navigation</div>

            {[
              { k:"interview",  label:"Interview",
                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> },
              { k:"history",    label:"History",
                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { k:"analytics",  label:"Analytics",
                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> },
            ].map((n) => {
              const a = activeNav === n.k;
              return (
                <div key={n.k} className="nav-item" onClick={() => handleNav(n.k)} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
                  cursor:"pointer", fontSize:13,
                  color: a ? t.accent : t.text2,
                  background: a ? `linear-gradient(90deg, ${t.accent}14, transparent)` : "transparent",
                  borderLeft: `2px solid ${a ? t.accent : "transparent"}`,
                  marginBottom:1,
                }}>
                  {n.icon}{n.label}
                </div>
              );
            })}

            <div style={{ margin:"12px 12px 4px" }}>
              <button className="new-btn" onClick={() => setShowPicker(true)} style={{
                width:"100%", padding:"9px 0",
                background:"linear-gradient(135deg, #58a6ff, #a371f7)",
                color:"#fff", border:"none", borderRadius:10,
                fontSize:13, fontWeight:700, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>
                <span style={{ fontSize:16 }}>+</span> New Problem
              </button>
            </div>

            {iv.isDemo && (
              <div style={{
                background:`${t.amber}12`, border:`1px solid ${t.amber}35`,
                borderRadius:8, padding:"6px 12px",
                fontSize:11, color:t.amber, margin:"4px 12px 10px", textAlign:"center",
                fontWeight:500,
              }}>Demo · data not saved</div>
            )}

            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", padding:"10px 14px 6px" }}>Your Stats</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, padding:"0 12px 14px" }}>
              {[
                { val:"12",  label:"Solved",   color:t.accent  },
                { val:"74%", label:"Avg Score", color:t.green   },
                { val:"5",   label:"Streak",   color:t.amber   },
                { val:"18m", label:"Avg Time",  color:t.purple  },
              ].map((s) => (
                <div key={s.label} style={{
                  background: dk ? "rgba(255,255,255,0.03)" : t.bg3,
                  border:`1px solid ${t.border}`, borderRadius:9, padding:"9px 10px",
                }}>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:18, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:10, color:t.text3, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Tab bar */}
            <div style={{
              background: dk ? "rgba(15,19,32,0.6)" : t.bg2,
              borderBottom:`1px solid ${t.border}`,
              display:"flex", padding:"0 16px", flexShrink:0,
            }}>
              {[
                { k:"problem",   l:"Problem" },
                { k:"feedback",  l:"AI Feedback" },
                { k:"history",   l:"History" },
                { k:"analytics", l:"Analytics" },
              ].map((tb) => {
                const a = activeTab === tb.k;
                return (
                  <div key={tb.k} className="tab-item" onClick={() => {
                    setActiveTab(tb.k);
                    if (tb.k === "analytics") loadStats();
                    else if (tb.k === "history") loadHistory();
                  }} style={{
                    padding:"12px 16px", fontSize:12.5,
                    fontFamily:"'DM Mono', monospace",
                    color: a ? t.accent : t.text2,
                    borderBottom:`2px solid ${a ? t.accent : "transparent"}`,
                    cursor:"pointer", userSelect:"none",
                    textShadow: a ? `0 0 12px ${t.accent}55` : "none",
                    position:"relative",
                  }}>
                    {tb.l}
                  </div>
                );
              })}
            </div>

            {/* ── PROBLEM + EDITOR ── */}
            {activeTab === "problem" && iv.currentQ && (
              <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>

                {/* Mobile panel toggle */}
                {isMobile && (
                  <div style={{ display:"flex", background:t.bg2, borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
                    {[["problem","Problem"],["editor","Editor"]].map(([k,l]) => (
                      <button key={k} onClick={() => setMobilePanel(k)} style={{
                        flex:1, padding:"10px", border:"none",
                        background: mobilePanel===k ? `${t.accent}14` : "transparent",
                        color: mobilePanel===k ? t.accent : t.text2,
                        borderBottom:`2px solid ${mobilePanel===k ? t.accent : "transparent"}`,
                        fontFamily:"'DM Mono', monospace", fontSize:12, cursor:"pointer",
                        fontWeight: mobilePanel===k ? 700 : 400,
                      }}>{l}</button>
                    ))}
                  </div>
                )}

                <div style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? undefined : "1fr 1fr", flex:1, overflow:"hidden" }}>

                {/* Left — problem */}
                {(!isMobile || mobilePanel === "problem") && (
                <div style={{ flex: isMobile ? 1 : undefined, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
                  <div style={{ padding:"10px 16px", background:t.bg2, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                    <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase" }}>Problem</span>
                    <div style={{ display:"flex", gap:5 }}>
                      <span style={tag(t.accent)}>{iv.currentQ.topic}</span>
                      <span style={tag(diffColor(iv.currentQ.difficulty, t))}>{iv.currentQ.difficulty}</span>
                    </div>
                  </div>

                  <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 12px" }}>
                    <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:10, lineHeight:1.45, letterSpacing:"-0.01em" }}>
                      {iv.currentQ.title}
                    </div>
                    <div style={{ fontSize:13, color:t.text2, lineHeight:1.8, marginBottom:14 }}>
                      {iv.currentQ.description}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:4 }}>
                      {(iv.currentQ.examples || []).map((ex, i) => (
                        <div key={i} style={{
                          flex:"1 1 200px",
                          background: dk ? "rgba(255,255,255,0.03)" : t.bg3,
                          border:`1px solid ${t.border}`, borderRadius:9,
                          padding:"10px 13px",
                          fontFamily:"'DM Mono', monospace", fontSize:12,
                        }}>
                          <div style={{ color:t.text3, fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>Example {i+1}</div>
                          <div style={{ color:t.text2 }}>Input: {ex.input}</div>
                          <div style={{ color:t.green, marginTop:3 }}>Output: {ex.output}</div>
                          {ex.explanation && <div style={{ color:t.text3, fontSize:11, marginTop:2 }}>// {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>
                    {(iv.currentQ.constraints || []).length > 0 && (
                      <div style={{ marginTop:14 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:t.text2, marginBottom:7 }}>Constraints</div>
                        {iv.currentQ.constraints.map((c, i) => (
                          <div key={i} style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:t.text3, marginBottom:4 }}>› {c}</div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop:20, padding:"11px 14px", borderRadius:9, background: dk ? "rgba(88,166,255,0.05)" : "rgba(9,105,218,0.05)", border:`1px dashed ${t.accent}30` }}>
                      <div style={{ fontSize:11, color:t.text3, lineHeight:1.7 }}>
                        <span style={{ color:t.accent, fontWeight:700 }}>💡 Approach</span><br/>
                        Clarify the problem → walk through examples → code → test edge cases. Stuck? Ask the AI Interviewer in the Feedback tab.
                      </div>
                    </div>
                  </div>

                  {/* Timer bar */}
                  <div style={{ padding:"8px 16px", background:t.bg2, borderTop:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                    <span style={{ fontFamily:"'DM Mono', monospace", fontSize:14, fontWeight:700, color:timerColor, minWidth:48 }}>{fmtTime(iv.timerSec)}</span>
                    {iv.timerPaused && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9, fontWeight:700, color:t.amber, background:`${t.amber}18`, border:`1px solid ${t.amber}40`, borderRadius:4, padding:"1px 5px", letterSpacing:"0.08em" }}>PAUSED</span>}
                    <div style={{ flex:1, height:3, background:t.bg4, borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${timerPct}%`, background:`linear-gradient(90deg, ${timerColor}, ${timerPct < 25 ? "#ff7875" : timerPct < 50 ? "#ffcc00" : t.purple})`, borderRadius:2, transition:"width 1s linear", boxShadow:`0 0 6px ${timerColor}60` }} />
                    </div>
                    <button
                      title={iv.timerPaused ? "Resume timer" : "Pause timer"}
                      style={{ background:iv.timerPaused?`${t.amber}18`:"transparent", border:`1px solid ${iv.timerPaused?t.amber+"50":"transparent"}`, color:iv.timerPaused?t.amber:t.text2, borderRadius:5, cursor:"pointer", padding:"2px 7px", fontSize:13, lineHeight:1, transition:"all .12s" }}
                      onClick={() => iv.setTimerPaused((p) => !p)}
                    >
                      {iv.timerPaused ? "▶" : "⏸"}
                    </button>
                  </div>
                </div>
                )}

                {/* Right — Monaco editor */}
                {(!isMobile || mobilePanel === "editor") && (
                <div style={{ flex: isMobile ? 1 : undefined, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                  <div style={{ padding:"6px 10px", background:t.bg2, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    {["python","javascript","java"].map((l) => (
                      <button key={l} className="lang-btn" onClick={() => iv.changeLang(l)} style={{
                        padding:"3px 10px", borderRadius:6,
                        border:`1px solid ${iv.lang===l ? t.border2 : t.border}`,
                        background: iv.lang===l ? (dk?"rgba(88,166,255,0.10)":t.bg3) : "transparent",
                        color: iv.lang===l ? t.accent : t.text2,
                        fontFamily:"'DM Mono', monospace", fontSize:11, cursor:"pointer",
                        fontWeight: iv.lang===l ? 600 : 400,
                      }}>
                        {l === "python" ? "Python 3" : l === "javascript" ? "JavaScript" : "Java"}
                      </button>
                    ))}
                    <div style={{ flex:1 }} />
                    {[
                      { v:"normal", label:"↺ Reset", fn: () => iv.setCode(iv.currentQ.starterCode?.[iv.lang] || iv.currentQ.starter_code?.[iv.lang] || "") },
                      { v:"run",    label:"▶ Run",    fn: () => iv.run() },
                      { v:"submit", label: iv.submitting ? "…" : "→ Submit", fn: () => iv.submit().then(() => setActiveTab("feedback")), disabled: iv.submitting },
                    ].map(({ v, label, fn, disabled }) => {
                      const c = v==="run" ? t.green : v==="submit" ? t.accent : t.text2;
                      return (
                        <button key={v} className="code-btn" onClick={fn} disabled={disabled} style={{
                          padding:"4px 11px", borderRadius:6,
                          border:`1px solid ${c}35`, background:`${c}12`,
                          color:c, fontFamily:"'DM Mono', monospace", fontSize:11,
                          cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                          fontWeight: v!=="normal" ? 600 : 400,
                        }}>{label}</button>
                      );
                    })}
                  </div>

                  <Editor
                    height="100%"
                    language={iv.lang === "python" ? "python" : iv.lang === "javascript" ? "javascript" : "java"}
                    value={iv.code}
                    onChange={(v) => iv.setCode(v || "")}
                    beforeMount={handleEditorBeforeMount}
                    theme={themeMode === "dark" ? "interview-dark" : "interview-light"}
                    options={{ fontSize:13, minimap:{enabled:false}, scrollBeyondLastLine:false, tabSize:4, wordWrap:"on", lineNumbers:"on", renderLineHighlight:"line" }}
                  />

                  <div style={{ height:90, background:t.bg2, borderTop:`1px solid ${t.border}`, padding:"9px 14px", overflowY:"auto", flexShrink:0 }}>
                    {iv.output.length === 0
                      ? <span style={{ fontFamily:"'DM Mono', monospace", fontSize:11.5, color:t.text3 }}>// Run to test · Submit for AI feedback</span>
                      : iv.output.map((o, i) => (
                          <div key={i} style={{ fontFamily:"'DM Mono', monospace", fontSize:11.5, marginBottom:3, color:{ success:t.green, warn:t.amber, error:t.red, info:t.text2 }[o.type] || t.text2 }}>{o.text}</div>
                        ))}
                  </div>
                </div>
                )}
              </div>
            </div>
            )}

            {/* ── FEEDBACK ── */}
            {activeTab === "feedback" && (
              <div style={{ flex:1, overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:14 }}>
                {!iv.feedback ? (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10, color:t.text3, padding:60 }}>
                    <div style={{ color:t.border2 }}>
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l2.4 6L21 10l-6 3L12 19l-2.4-6L3 10l6-3L12 2z"/>
                        <path d="M19 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z"/>
                        <path d="M5 4l.6 1.4 1.4.6-1.4.6L5 8l-.6-1.4L3 6l1.4-.6L5 4z"/>
                      </svg>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:t.text2 }}>No feedback yet</div>
                    <div style={{ fontSize:13 }}>Submit your solution to get AI evaluation</div>
                  </div>
                ) : (
                  <>
                    {/* Score cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                      {[["correctness","Correctness"],["efficiency","Efficiency"],["readability","Readability"],["edgeCases","Edge Cases"]].map(([k,l]) => {
                        const v = iv.feedback.scores?.[k] ?? iv.feedback[k];
                        const c = scoreColor(v, t);
                        return (
                          <div key={k} className="score-card" style={{
                            background: dk ? "rgba(255,255,255,0.03)" : t.bg2,
                            border:`1px solid ${t.border}`,
                            borderRadius:12, padding:"14px 10px", textAlign:"center",
                            borderTop:`3px solid ${c}`,
                            boxShadow: dk ? `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)` : "0 2px 12px rgba(0,0,0,0.07)",
                          }}>
                            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:26, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
                            <div style={{ fontSize:10, color:t.text3, marginTop:4 }}>/100</div>
                            <div style={{ fontSize:11, color:t.text2, marginTop:5, fontWeight:500 }}>{l}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px" }}>
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Summary</div>
                      <div style={{ fontSize:13, color:t.text, lineHeight:1.75 }}>{iv.feedback.summary}</div>
                    </div>

                    <div style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px" }}>
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:11 }}>Detailed Review</div>
                      {(iv.feedback.strengths || []).map((s, i) => (
                        <div key={i} className="fb-item" style={{ display:"flex", gap:10, padding:"8px 11px", borderRadius:8, background: dk?"rgba(63,185,80,0.05)":"rgba(26,127,55,0.05)", borderLeft:`3px solid ${t.green}`, marginBottom:7, fontSize:12.5, color:t.text2, lineHeight:1.55, boxShadow:`inset 0 0 0 1px ${t.green}15` }}>
                          <span style={{ color:t.green, fontWeight:700, flexShrink:0 }}>✓</span> {s}
                        </div>
                      ))}
                      {(iv.feedback.improvements || []).map((s, i) => (
                        <div key={i} className="fb-item" style={{ display:"flex", gap:10, padding:"8px 11px", borderRadius:8, background: dk?"rgba(210,153,34,0.05)":"rgba(154,103,0,0.05)", borderLeft:`3px solid ${t.amber}`, marginBottom:7, fontSize:12.5, color:t.text2, lineHeight:1.55, boxShadow:`inset 0 0 0 1px ${t.amber}15` }}>
                          <span style={{ color:t.amber, fontWeight:700, flexShrink:0 }}>⚠</span> {s}
                        </div>
                      ))}
                    </div>

                    {/* Chat */}
                    <div style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px" }}>
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>AI Interviewer Chat</div>
                      <div style={{ maxHeight:220, overflowY:"auto", paddingRight:4 }}>
                        {iv.chatMessages.map((m, i) => (
                          <div key={i} style={{ display:"flex", gap:8, marginBottom:10, justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                            {m.role === "ai" && (
                              <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,rgba(88,166,255,0.2),rgba(163,113,247,0.2))", border:`1px solid rgba(88,166,255,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.accent, flexShrink:0, fontWeight:700 }}>AI</div>
                            )}
                            <div style={{
                              maxWidth:"80%", padding:"8px 12px",
                              borderRadius: m.role==="user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                              background: m.role==="user"
                                ? (dk ? "linear-gradient(135deg,rgba(88,166,255,0.18),rgba(163,113,247,0.12))" : "rgba(9,105,218,0.10)")
                                : (dk ? "rgba(255,255,255,0.05)" : t.bg3),
                              border:`1px solid ${m.role==="user" ? t.accent+"30" : t.border}`,
                              fontSize:12.5, color:t.text, lineHeight:1.65,
                            }}>{m.text}</div>
                          </div>
                        ))}
                        {iv.chatLoading && (
                          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                            <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,rgba(88,166,255,0.2),rgba(163,113,247,0.2))", border:`1px solid rgba(88,166,255,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.accent, flexShrink:0, fontWeight:700 }}>AI</div>
                            <div style={{ padding:"8px 12px", borderRadius:"3px 12px 12px 12px", background: dk?"rgba(255,255,255,0.05)":t.bg3, border:`1px solid ${t.border}`, fontSize:12.5, color:t.text3, fontStyle:"italic" }}>Thinking…</div>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <input
                          style={{ flex:1, background: dk?"rgba(255,255,255,0.04)":t.bg3, border:`1px solid ${t.border}`, borderRadius:9, padding:"8px 12px", color:t.text, fontSize:12.5, outline:"none", fontFamily:"'DM Sans', sans-serif", transition:"border-color .15s" }}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key==="Enter" && sendChat()}
                          placeholder="Ask a follow-up question…"
                        />
                        <button className="chat-send" onClick={sendChat} style={{ padding:"8px 16px", background:"linear-gradient(135deg,#58a6ff,#a371f7)", border:"none", borderRadius:9, color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>Send</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── HISTORY ── */}
            {activeTab === "history" && (
              <div style={{ flex:1, overflowY:"auto", padding:18 }}>
                <div style={{ marginBottom:14, fontSize:16, fontWeight:700, color:t.text }}>Session History</div>
                {history.length === 0 && <div style={{ color:t.text3, fontSize:13 }}>No submissions yet. Start solving!</div>}
                {history.map((h) => (
                  <div key={h.id} className="hist-item" style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"12px 14px", marginBottom:9 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:700, color:t.text, marginBottom:4 }}>{h.problem?.title}</div>
                        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:t.text3 }}>
                          {h.language} · {Math.floor((h.timeTaken||0)/60)}m {(h.timeTaken||0)%60}s · {new Date(h.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:5 }}>
                        <span style={tag(scoreColor(h.feedback?.overall||0, t))}>{h.feedback?.overall||0}%</span>
                        <span style={tag(diffColor(h.problem?.difficulty, t))}>{h.problem?.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === "analytics" && (
              <div style={{ flex:1, overflowY:"auto", padding:18 }}>
                <div style={{ marginBottom:16, fontSize:16, fontWeight:700, color:t.text }}>Performance Analytics</div>
                {!stats ? (
                  <div style={{ color:t.text3, fontSize:13 }}>Loading stats…</div>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
                      {[["Total Solved", stats.total, t.accent], ["Avg Score", `${stats.avgScore}%`, t.green]].map(([l,v,c]) => (
                        <div key={l} style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px", borderTop:`3px solid ${c}` }}>
                          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:24, fontWeight:700, color:c }}>{v}</div>
                          <div style={{ fontSize:11, color:t.text3, marginTop:4 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:16, marginBottom:12 }}>
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Score Over Time</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={stats.scoreOverTime}>
                          <XAxis dataKey="date" tick={{ fontSize:10, fill:t.text3 }} />
                          <YAxis domain={[0,100]} tick={{ fontSize:10, fill:t.text3 }} />
                          <Tooltip contentStyle={{ background:t.bg3, border:`1px solid ${t.border}`, borderRadius:8, fontSize:12 }} />
                          <Line type="monotone" dataKey="score" stroke={t.accent} strokeWidth={2.5} dot={{ fill:t.accent, r:3.5, strokeWidth:0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background: dk?"rgba(255,255,255,0.02)":t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:16 }}>
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, fontWeight:700, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>By Topic</div>
                      {stats.byTopic.map((tp) => (
                        <div key={tp.topic} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <div style={{ fontSize:12.5, color:t.text, width:140 }}>{tp.topic}</div>
                          <div style={{ flex:1, height:6, background:t.bg4, borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${tp.avg}%`, background:`linear-gradient(90deg, ${scoreColor(tp.avg,t)}, ${scoreColor(tp.avg,t)}99)`, borderRadius:3, transition:"width .5s ease", boxShadow:`0 0 6px ${scoreColor(tp.avg,t)}50` }} />
                          </div>
                          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:t.text2, width:38, textAlign:"right" }}>{tp.avg}%</div>
                          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:t.text3 }}>×{tp.count}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PROBLEM PICKER MODAL ── */}
      {showPicker && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
          onClick={(e) => e.target === e.currentTarget && setShowPicker(false)}
        >
          <div style={{
            background: dk ? "rgba(14,18,30,0.95)" : t.bg2,
            border:`1px solid ${t.border2}`,
            borderRadius:18, padding:24, width:440, maxHeight:"68vh", overflowY:"auto",
            backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
            boxShadow: dk ? "0 28px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(88,166,255,0.06)" : "0 20px 60px rgba(0,0,0,0.15)",
            animation:"fade-in .2s ease",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Choose a Problem</div>
              <button onClick={() => setShowPicker(false)} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${t.border}`, color:t.text2, cursor:"pointer", fontSize:16, width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
            </div>

            <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
              {["All","Easy","Medium","Hard"].map((d) => {
                const c = d==="Easy"?t.green:d==="Medium"?t.amber:d==="Hard"?t.red:undefined;
                const a = filterDiff === d;
                return (
                  <button key={d} onClick={() => setFilterDiff(d)} style={{
                    padding:"4px 13px", borderRadius:6,
                    border:`1px solid ${a ? (c||t.accent)+"55" : t.border}`,
                    background: a ? `${c||t.accent}14` : "transparent",
                    color: a ? (c||t.accent) : t.text2,
                    fontSize:11, cursor:"pointer", fontFamily:"'DM Mono', monospace",
                    fontWeight: a ? 700 : 400, transition:"all .12s",
                  }}>{d}</button>
                );
              })}
            </div>

            {filteredQs.map((q) => (
              <div key={q.id} className="q-item" onClick={() => { iv.loadQuestion(q); setActiveTab("problem"); setShowPicker(false); }} style={{
                background: dk?"rgba(255,255,255,0.03)":t.bg3,
                border:`1px solid ${t.border}`, borderRadius:9,
                padding:"10px 13px", marginBottom:7,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{q.title}</div>
                  <div style={{ fontSize:11, color:t.text3, fontFamily:"'DM Mono', monospace", marginTop:2 }}>{q.topic}</div>
                </div>
                <span style={tag(diffColor(q.difficulty, t))}>{q.difficulty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
