import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/auth";

const T = {
  dark:  { bg: "#070a10", card: "rgba(14,18,30,0.82)", border: "rgba(255,255,255,0.07)", text: "#e6edf3", text2: "#8b949e", accent: "#58a6ff", green: "#3fb950", input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.10)" },
  light: { bg: "#eef2f7", card: "rgba(255,255,255,0.88)", border: "rgba(0,0,0,0.07)", text: "#1f2328", text2: "#57606a", accent: "#0969da", green: "#1a7f37", input: "rgba(0,0,0,0.03)", inputBorder: "rgba(0,0,0,0.10)" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  @keyframes grid-drift {
    from { background-position: 0 0; }
    to   { background-position: 32px 32px; }
  }
  @keyframes float-text {
    0%,100% { transform: translateY(0px) rotate(-1.5deg); }
    50%     { transform: translateY(-18px) rotate(1.5deg); }
  }
  @keyframes orb-drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(-18px,-28px) scale(1.06); }
    66%      { transform: translate(14px, 18px) scale(0.94); }
  }
  @keyframes dot-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(63,185,80,0.6); }
    50%     { box-shadow: 0 0 0 6px rgba(63,185,80,0); }
  }
  @keyframes card-in {
    from { opacity:0; transform: translateY(14px) scale(0.98); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }

  .a-card { animation: card-in 0.4s cubic-bezier(.22,1,.36,1) forwards; }

  .a-input { transition: border-color .2s, box-shadow .2s, background .2s !important; }
  .a-input:focus {
    border-color: #58a6ff !important;
    box-shadow: 0 0 0 3px rgba(88,166,255,0.14) !important;
    background: rgba(88,166,255,0.03) !important;
    outline: none !important;
  }

  .a-submit { transition: transform .18s, box-shadow .18s, filter .18s; }
  .a-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(88,166,255,0.38);
    filter: brightness(1.08);
  }
  .a-submit:active:not(:disabled) { transform: translateY(0); box-shadow: none; }

  .a-google { transition: background .15s, border-color .15s, transform .15s; }
  .a-google:hover {
    background: rgba(255,255,255,0.07) !important;
    border-color: rgba(255,255,255,0.22) !important;
    transform: translateY(-1px);
  }

  .a-demo { transition: background .18s, border-color .18s, transform .18s, box-shadow .18s; }
  .a-demo:hover {
    background: rgba(63,185,80,0.07) !important;
    border-color: rgba(63,185,80,0.75) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(63,185,80,0.18);
  }

  .a-tab { transition: all .18s; }
  .a-tab:hover { opacity: .85; }

  .a-orb {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: orb-drift 9s ease-in-out infinite;
  }
  .a-dot { animation: dot-pulse 2.2s ease-in-out infinite; border-radius: 50%; }

  .a-theme-btn { transition: background .15s, border-color .15s; }
  .a-theme-btn:hover { background: rgba(255,255,255,0.09) !important; }
`;

export default function AuthPage() {
  const [mode, setMode]     = useState("dark");
  const [tab, setTab]       = useState("login");
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const t = T[mode];
  const dk = mode === "dark";

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fn = tab === "login" ? loginUser : registerUser;
      const { data } = await fn(form);
      login(data.user, { accessToken: data.access_token, refreshToken: data.refresh_token });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  };

  const inputSt = {
    width: "100%", padding: "10px 13px",
    background: t.input, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: t.text, fontSize: 14,
    outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
  };
  const labelSt = { fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 6, display: "block" };

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: dk
          ? "radial-gradient(ellipse 80% 60% at 20% 10%, #0c1525 0%, #070a10 55%, #0a0710 100%)"
          : "radial-gradient(ellipse 80% 60% at 20% 10%, #dbe8ff 0%, #eef2f7 55%, #f0ebff 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", padding: 20,
      }}>

        {/* Animated dot grid — both modes */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage: dk
            ? "radial-gradient(circle, rgba(88,166,255,0.13) 1.5px, transparent 1.5px)"
            : "radial-gradient(circle, rgba(9,105,218,0.09) 1.5px, transparent 1.5px)",
          backgroundSize:"36px 36px",
          animation:"grid-drift 14s linear infinite",
        }} />

        {/* Ambient orbs */}
        {dk ? <>
          <div className="a-orb" style={{ width:600,height:600, top:"-160px",left:"-160px", background:"radial-gradient(circle, rgba(88,166,255,0.18) 0%, transparent 65%)", filter:"blur(50px)" }} />
          <div className="a-orb" style={{ width:420,height:420, bottom:"-100px",right:"-80px", background:"radial-gradient(circle, rgba(163,113,247,0.16) 0%, transparent 65%)", filter:"blur(45px)", animationDelay:"-4s" }} />
          <div className="a-orb" style={{ width:260,height:260, top:"38%", right:"15%",       background:"radial-gradient(circle, rgba(63,185,80,0.13) 0%, transparent 65%)",  filter:"blur(35px)", animationDelay:"-7s" }} />
          <div className="a-orb" style={{ width:200,height:200, top:"20%", left:"30%",        background:"radial-gradient(circle, rgba(163,113,247,0.09) 0%, transparent 65%)", filter:"blur(40px)", animationDelay:"-11s" }} />
        </> : <>
          <div className="a-orb" style={{ width:600,height:600, top:"-160px",left:"-160px", background:"radial-gradient(circle, rgba(9,105,218,0.14) 0%, transparent 65%)",   filter:"blur(60px)" }} />
          <div className="a-orb" style={{ width:420,height:420, bottom:"-100px",right:"-80px", background:"radial-gradient(circle, rgba(130,80,223,0.10) 0%, transparent 65%)", filter:"blur(55px)", animationDelay:"-4s" }} />
          <div className="a-orb" style={{ width:240,height:240, top:"36%", right:"16%",       background:"radial-gradient(circle, rgba(26,127,55,0.09) 0%, transparent 65%)",   filter:"blur(40px)", animationDelay:"-7s" }} />
        </>}

        {/* Floating code keywords — both modes */}
        {[
          { text:"function twoSum(nums, target)", x:"4%",  y:"11%", size:11, delay:"0s",   dur:"22s", op:0.13 },
          { text:"return dp[i][j]",               x:"70%", y:"6%",  size:12, delay:"-6s",  dur:"26s", op:0.11 },
          { text:"O(n log n)",                    x:"80%", y:"66%", size:14, delay:"-3s",  dur:"19s", op:0.13 },
          { text:"while (lo <= hi) {",            x:"3%",  y:"70%", size:11, delay:"-10s", dur:"28s", op:0.10 },
          { text:"stack.push(node)",              x:"54%", y:"88%", size:11, delay:"-5s",  dur:"24s", op:0.11 },
          { text:"{ } => [ ]",                    x:"18%", y:"84%", size:16, delay:"-14s", dur:"30s", op:0.09 },
          { text:"BFS  /  DFS",                   x:"66%", y:"24%", size:12, delay:"-8s",  dur:"20s", op:0.12 },
          { text:"class Solution:",               x:"8%",  y:"44%", size:11, delay:"-17s", dur:"32s", op:0.09 },
          { text:"if n == 0: return 0",           x:"74%", y:"46%", size:10, delay:"-2s",  dur:"25s", op:0.10 },
          { text:"HashMap<K, V>",                 x:"34%", y:"4%",  size:12, delay:"-9s",  dur:"23s", op:0.11 },
        ].map((f, i) => (
          <div key={i} style={{
            position:"absolute", left:f.x, top:f.y,
            fontFamily:"'DM Mono', monospace", fontSize:f.size,
            color: dk ? `rgba(88,166,255,${f.op})` : `rgba(9,105,218,${f.op * 0.65})`,
            pointerEvents:"none", userSelect:"none", whiteSpace:"nowrap",
            animation:`float-text ${f.dur} ease-in-out infinite`,
            animationDelay:f.delay,
          }}>{f.text}</div>
        ))}

        {/* Theme toggle */}
        <button
          className="a-theme-btn"
          style={{
            position:"fixed", top:16, right:16,
            background: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border:`1px solid ${t.border}`, backdropFilter:"blur(10px)",
            borderRadius:9, padding:"6px 12px",
            color:t.text2, cursor:"pointer", fontSize:12,
            fontFamily:"'DM Sans', sans-serif", display:"flex", alignItems:"center", gap:5,
          }}
          onClick={() => setMode(m => m === "dark" ? "light" : "dark")}
        >
          {dk
            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light</>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark</>
          }
        </button>

        {/* Card */}
        <div
          className="a-card"
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            borderRadius: 22,
            padding: "40px 36px",
            width: "100%", maxWidth: 420,
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            boxShadow: dk
              ? "0 0 0 1px rgba(88,166,255,0.06), 0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 0 0 1px rgba(0,0,0,0.05), 0 24px 60px rgba(0,0,0,0.10)",
            position: "relative",
          }}
        >
          {/* Gradient top-edge highlight */}
          <div style={{
            position:"absolute", top:0, left:"15%", right:"15%", height:1,
            background:"linear-gradient(90deg, transparent, rgba(88,166,255,0.55), rgba(163,113,247,0.55), transparent)",
            borderRadius:"0 0 50% 50%",
          }} />

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div className="a-dot" style={{ width:9, height:9, background:t.green, flexShrink:0 }} />
            <span style={{
              fontFamily:"'DM Mono', monospace", fontSize:20, fontWeight:700,
              background:"linear-gradient(135deg, #58a6ff 20%, #a371f7 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>InterviewAI</span>
            <span style={{
              fontSize:10, fontFamily:"'DM Mono', monospace", fontWeight:700,
              background:"linear-gradient(135deg,rgba(88,166,255,0.18),rgba(163,113,247,0.18))",
              border:"1px solid rgba(88,166,255,0.2)", borderRadius:5,
              padding:"2px 7px", color:t.text2, letterSpacing:"0.05em",
            }}>BETA</span>
          </div>

          <p style={{ fontSize:13, color:t.text2, marginBottom:28, lineHeight:1.55 }}>
            {tab === "login" ? "Welcome back — let's practice." : "Create your account to get started."}
          </p>

          {/* Tabs */}
          <div style={{
            display:"flex",
            background: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border:`1px solid ${t.border}`, borderRadius:12, padding:3, marginBottom:24,
          }}>
            {[["login","Sign in"],["register","Register"]].map(([k,l]) => (
              <button key={k} className="a-tab" onClick={() => setTab(k)} style={{
                flex:1, padding:"8px 0", borderRadius:9, border:"none",
                background: tab===k
                  ? (dk ? "linear-gradient(135deg,rgba(88,166,255,0.14),rgba(163,113,247,0.10))" : t.card)
                  : "transparent",
                color: tab===k ? t.accent : t.text2,
                fontFamily:"'DM Sans', sans-serif", fontSize:13,
                fontWeight: tab===k ? 600 : 400, cursor:"pointer",
                boxShadow: tab===k ? (dk ? "0 0 0 1px rgba(88,166,255,0.18)" : "0 1px 5px rgba(0,0,0,0.10)") : "none",
              }}>{l}</button>
            ))}
          </div>

          {error && (
            <div style={{
              background:"rgba(248,81,73,0.09)", border:"1px solid rgba(248,81,73,0.28)",
              borderRadius:10, padding:"9px 13px", fontSize:12.5,
              color:"#f85149", marginBottom:16,
              display:"flex", alignItems:"center", gap:8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {error}
            </div>
          )}

          <form onSubmit={submit}>
            {tab === "register" && (
              <div style={{ marginBottom:16 }}>
                <label style={labelSt}>Full name</label>
                <input name="name" value={form.name} onChange={handle} className="a-input" style={inputSt} placeholder="Rahul Sharma" required />
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <label style={labelSt}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="a-input" style={inputSt} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: tab==="login" ? 0 : 4 }}>
              <label style={labelSt}>Password</label>
              <div style={{ position:"relative" }}>
                <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handle} className="a-input" style={{ ...inputSt, paddingRight:36 }} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.text2, padding:0, display:"flex", alignItems:"center", opacity:0.7 }}>
                  {showPwd
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            {tab === "login" && (
              <div style={{ textAlign:"right", margin:"8px 0 16px" }}>
                <button type="button" style={{ background:"none", border:"none", color:t.accent, fontSize:11, cursor:"pointer", padding:0, fontFamily:"'DM Sans', sans-serif", opacity:0.85 }}
                  onClick={() => setError("Password reset is not yet available. Please contact support.")}>
                  Forgot Password?
                </button>
              </div>
            )}
            {tab !== "login" && <div style={{ height:16 }} />}
            <button type="submit" className="a-submit" disabled={loading} style={{
              width:"100%", padding:"11px", border:"none", borderRadius:11,
              background:"linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)",
              color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
              letterSpacing:"0.01em", display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            }}>
              {loading
                ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Please wait…</>
                : tab === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"14px 0 0" }}>
            <div style={{ flex:1, height:1, background:t.border }} />
            <span style={{ fontSize:11, color:t.text3, letterSpacing:"0.06em", userSelect:"none" }}>or</span>
            <div style={{ flex:1, height:1, background:t.border }} />
          </div>

          <button className="a-demo" onClick={() => { loginAsDemo(); navigate("/"); }} style={{
            width:"100%", padding:"8px",
            background:"transparent",
            border:`1px solid ${t.green}45`, borderRadius:10,
            color:t.green, fontSize:12, fontWeight:500,
            cursor:"pointer", marginTop:10, fontFamily:"'DM Sans', sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            opacity:0.85,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Try Demo — No signup needed
          </button>

          <p style={{ textAlign:"center", fontSize:11, color:t.text2, marginTop:10, opacity:0.55 }}>
            Demo mode · data won't be saved
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
