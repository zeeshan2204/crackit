import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/auth";

export default function AuthPage() {
  const [tab, setTab]       = useState("login");
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fn = tab === "login" ? loginUser : registerUser;
      const { data } = await fn(form);
      login(data.user, { accessToken: data.access_token, refreshToken: data.refresh_token });
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
        : Array.isArray(detail) ? detail.map(d => d.msg).join(', ')
        : 'Something went wrong'
      );
    } finally { setLoading(false); }
  };

  return (
    <div style={s.root} className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .auth-glow {
          position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
          width: 900px; height: 500px; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at center, rgba(255,214,10,0.12) 0%, transparent 70%);
        }

        .inp { transition: border-color .15s, box-shadow .15s; }
        .inp:focus { border-color: #FFD60A !important; outline: none; box-shadow: 0 0 0 3px rgba(255,214,10,0.1) !important; }

        .btn-main { transition: all .15s; }
        .btn-main:hover:not(:disabled) { background: #FFD60A; color: #000; box-shadow: 0 0 24px rgba(255,214,10,0.4); }

        .btn-tab { transition: color .15s; }
        .btn-tab-active { border-bottom: 2px solid #FFD60A !important; color: #fff !important; }
        .btn-tab:hover { color: #ccc; }

        .btn-demo { transition: all .15s; }
        .btn-demo:hover { border-color: #FFD60A; color: #FFD60A; box-shadow: 0 0 12px rgba(255,214,10,0.15); }

        .stat-box { transition: border-color .2s, transform .2s; }
        .stat-box:hover { border-color: #FFD60A44 !important; transform: translateY(-2px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
      `}</style>

      <div className="auth-grid" />
      <div className="auth-glow" />

      {/* Left panel */}
      <div style={s.left} className="auth-left">
        <div style={s.brand}>
          {/* Logo */}
          <div style={s.logoRow} className="fade-up">
            <div style={s.logoMark}>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#000' }}>AI</span>
            </div>
            <span style={s.logoName}>CrackIt</span>
          </div>

          {/* Tagline */}
          <div className="fade-up-2">
            <h1 style={s.tagline}>Land Your<br /><span style={s.taglineAccent}>Dream Job.</span></h1>
            <p style={s.taglineSub}>Full-stack campus placement simulator trusted by engineering students preparing for top IT companies.</p>
          </div>

          {/* Stats */}
          <div style={s.stats} className="fade-up-3">
            {[
              ["100+", "Questions"],
              ["4", "Sections"],
              ["~3 hrs", "Full Exam"],
              ["Live", "Percentile"],
            ].map(([v, l]) => (
              <div key={l} className="stat-box" style={s.stat}>
                <span style={s.statV}>{v}</span>
                <span style={s.statL}>{l}</span>
              </div>
            ))}
          </div>

          {/* Section pills */}
          <div style={s.pills} className="fade-up-3">
            {[
              { label: "Verbal", color: "#6366f1" },
              { label: "Reasoning", color: "#f59e0b" },
              { label: "Aptitude", color: "#10b981" },
              { label: "Coding", color: "#ef4444" },
            ].map(p => (
              <span key={p.label} style={{ ...s.pill, borderColor: p.color + "44", color: p.color, background: p.color + "11" }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        <p style={s.leftFooter}>© 2025 CrackIt · Built for placement prep</p>
      </div>

      {/* Right panel — form */}
      <div style={s.right} className="auth-right">
        <div style={s.card} className="fade-up">
          <h2 style={s.cardTitle}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={s.cardSub}>
            {tab === "login" ? "Sign in to continue your prep." : "Join thousands of students preparing today."}
          </p>

          {/* Tabs */}
          <div style={s.tabs}>
            {[["login","Sign in"], ["register","Register"]].map(([k, l]) => (
              <button key={k} className={`btn-tab${tab===k?" btn-tab-active":""}`}
                onClick={() => { setTab(k); setError(""); }}
                style={s.tab}>
                {l}
              </button>
            ))}
          </div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={submit}>
            {tab === "register" && (
              <div style={s.field}>
                <label style={s.label}>Full name</label>
                <input name="name" value={form.name} onChange={handle}
                  className="inp" style={s.inp} placeholder="Rahul Sharma" required />
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="inp" style={s.inp} placeholder="you@example.com" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input name="password" type={showPwd?"text":"password"} value={form.password}
                  onChange={handle} className="inp"
                  style={{ ...s.inp, paddingRight: 44 }} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={s.eyeBtn}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-main" disabled={loading}
              style={{ ...s.btnMain, opacity: loading ? 0.65 : 1 }}>
              {loading ? "Please wait…" : tab==="login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <div style={s.divider}>
            <div style={s.divLine} />
            <span style={s.divTxt}>or</span>
            <div style={s.divLine} />
          </div>

          <button className="btn-demo"
            onClick={() => { loginAsDemo(); navigate("/"); }}
            style={s.btnDemo}>
            ⚡ Try Demo — No signup needed
          </button>
          <p style={s.demoNote}>All features · data resets on reload</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex", minHeight: "100vh", position: "relative",
    fontFamily: "'Inter',system-ui,sans-serif",
    background: "#0a0808", color: "#fff", overflow: "hidden",
  },

  /* ── Left ── */
  left: {
    width: "48%", borderRight: "1px solid #1a1010",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "3rem 3.5rem", position: "relative", zIndex: 1,
    background: "#0d0808",
  },
  brand: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "2.5rem" },

  logoRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  logoMark: {
    width: 40, height: 40, background: "#FFD60A",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 20px rgba(255,214,10,0.4)",
  },
  logoName: { fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" },

  tagline: { fontSize: "3.2rem", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1rem" },
  taglineAccent: { color: "#FFD60A" },
  taglineSub: { fontSize: "0.9rem", color: "#555", lineHeight: 1.7, maxWidth: 360 },

  stats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  stat: {
    border: "1px solid #221414", borderRadius: 10, padding: "1rem 1.1rem",
    display: "flex", flexDirection: "column", gap: "0.15rem",
    background: "#120c0c",
  },
  statV: { fontSize: "1.6rem", fontWeight: 900, color: "#FFD60A", letterSpacing: "-0.03em" },
  statL: { fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.07em" },

  pills: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  pill: {
    padding: "0.3rem 0.75rem", borderRadius: 20, border: "1px solid",
    fontSize: "0.75rem", fontWeight: 600,
  },
  leftFooter: { fontSize: "0.72rem", color: "#444" },

  /* ── Right ── */
  right: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2rem 2.5rem", position: "relative", zIndex: 1,
  },
  card: { width: "100%", maxWidth: 400 },
  cardTitle: { fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.3rem" },
  cardSub: { color: "#888", fontSize: "0.87rem", marginBottom: "2rem" },

  tabs: { display: "flex", borderBottom: "1px solid #1a1a1a", marginBottom: "1.75rem" },
  tab: {
    background: "none", border: "none", borderBottom: "2px solid transparent",
    color: "#666", padding: "0.5rem 1rem 0.6rem", cursor: "pointer",
    fontSize: "0.88rem", fontWeight: 600, marginBottom: "-1px",
    fontFamily: "inherit",
  },

  err: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#ef4444", borderRadius: 6, padding: "0.6rem 0.9rem",
    fontSize: "0.82rem", marginBottom: "1.25rem",
  },

  field: { marginBottom: "1.1rem" },
  label: {
    display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#777",
    marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em",
  },
  inp: {
    width: "100%", padding: "0.75rem 1rem",
    background: "#120c0c", border: "1px solid #221414",
    borderRadius: 8, color: "#fff", fontSize: "0.9rem",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem",
  },

  btnMain: {
    width: "100%", padding: "0.85rem", marginTop: "0.5rem",
    background: "#fff", color: "#000", border: "none",
    borderRadius: 8, fontWeight: 800, fontSize: "0.95rem",
    cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
  },

  divider: { display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" },
  divLine: { flex: 1, height: "1px", background: "#1a1a1a" },
  divTxt: { color: "#555", fontSize: "0.72rem" },

  btnDemo: {
    width: "100%", padding: "0.8rem",
    background: "transparent", border: "1px solid #221414",
    borderRadius: 8, color: "#666", fontSize: "0.88rem",
    fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
  },
  demoNote: { textAlign: "center", color: "#555", fontSize: "0.72rem", marginTop: "0.6rem" },
};
