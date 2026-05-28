import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../api/exam';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

const SECTION_COLORS = {
  numerical: '#10b981',
  verbal:    '#6366f1',
  reasoning: '#f59e0b',
  coding:    '#ef4444',
  total:     '#FFD60A',
};

const DEMO_DATA = [
  { date: '20 May', attempt: 1, total_score: 38, numerical: 40, verbal: 60, reasoning: 20, coding: 25 },
  { date: '22 May', attempt: 2, total_score: 52, numerical: 60, verbal: 60, reasoning: 40, coding: 50 },
  { date: '24 May', attempt: 3, total_score: 61, numerical: 80, verbal: 60, reasoning: 60, coding: 50 },
  { date: '26 May', attempt: 4, total_score: 74, numerical: 80, verbal: 80, reasoning: 80, coding: 50 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#120c0c', border: '1px solid #2a1818', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <div style={{ color: '#777', marginBottom: '0.4rem', fontWeight: 700 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontWeight: 600 }}>
          <span style={{ textTransform: 'capitalize' }}>{p.dataKey === 'total_score' ? 'Total' : p.dataKey}</span>
          <span>{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = user?.isDemo === true;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSections, setShowSections] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setHistory(DEMO_DATA);
      setLoading(false);
      return;
    }
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [isDemo]);

  const best = history.length ? Math.max(...history.map(h => h.total_score)) : 0;
  const latest = history.length ? history[history.length - 1].total_score : 0;
  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.total_score, 0) / history.length) : 0;
  const trend = history.length >= 2 ? latest - history[history.length - 2].total_score : 0;

  return (
    <div style={st.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .p1{animation:fadeUp .4s ease both}
        .p2{animation:fadeUp .4s .1s ease both}
        .p3{animation:fadeUp .4s .2s ease both}
        .tog-btn{transition:all .15s}
        .tog-btn:hover{border-color:#FFD60A44!important;color:#FFD60A!important}
        .cta-p{transition:all .15s}
        .cta-p:hover{transform:translateY(-2px)}
      `}</style>

      <div style={st.container}>
        {/* Nav */}
        <div style={st.nav} className="p1">
          <div style={st.logoRow}>
            <div style={st.logoMark}>AI</div>
            <span style={st.logoName}>CrackIt</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate('/exam')} style={st.ghostBtn}>Take Exam →</button>
            <button onClick={() => navigate('/exam/leaderboard')} style={st.ghostBtn}>🏆 Leaderboard</button>
          </div>
        </div>

        {/* Header */}
        <div style={st.header} className="p1">
          <button onClick={() => navigate('/')} style={st.backBtn}>← Back</button>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#FFD60A', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.6rem' }}>
            PERFORMANCE HISTORY
          </div>
          <h1 style={st.title}>My Progress</h1>
          <p style={{ color: '#555', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            {isDemo ? 'Demo data — create an account to track real progress' : `${history.length} attempt${history.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #1a1010', borderTopColor: '#FFD60A', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#555', fontSize: '0.85rem' }}>Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={st.emptyBox} className="p2">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>No attempts yet</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Complete your first exam to start tracking progress.</p>
            <button className="cta-p" onClick={() => navigate('/exam')} style={st.retakeBtn}>Start Exam →</button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={st.statRow} className="prog-stat-row" className="p2">
              {[
                { label: 'Attempts', value: history.length, color: '#fff' },
                { label: 'Best Score', value: `${best}%`, color: '#FFD60A' },
                { label: 'Latest', value: `${latest}%`, color: latest >= 50 ? '#10b981' : '#ef4444' },
                { label: 'Average', value: `${avg}%`, color: '#6366f1' },
                { label: 'Trend', value: trend === 0 ? '—' : `${trend > 0 ? '+' : ''}${trend}%`, color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#666' },
              ].map(s => (
                <div key={s.label} style={st.statCard}>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={st.chartBox} className="p3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', margin: 0 }}>Score Over Time</h2>
                <button className="tog-btn" onClick={() => setShowSections(s => !s)} style={{ background: 'none', border: '1px solid #2a1818', color: '#666', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600 }}>
                  {showSections ? 'Hide sections' : 'Show sections'}
                </button>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1010" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} axisLine={{ stroke: '#1a1010' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '1rem' }} formatter={v => v === 'total_score' ? 'Total' : v.charAt(0).toUpperCase() + v.slice(1)} />
                  <Line type="monotone" dataKey="total_score" stroke="#FFD60A" strokeWidth={2.5} dot={{ fill: '#FFD60A', r: 4 }} activeDot={{ r: 6 }} name="total_score" />
                  {showSections && Object.keys(SECTION_COLORS).filter(k => k !== 'total').map(key => (
                    <Line key={key} type="monotone" dataKey={key} stroke={SECTION_COLORS[key]} strokeWidth={1.5} strokeDasharray="4 2" dot={{ fill: SECTION_COLORS[key], r: 3 }} activeDot={{ r: 5 }} name={key} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Attempts table */}
            <div style={st.tableBox} className="p3">
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', marginBottom: '1rem' }}>Attempt History</h2>
              <div style={{ background: '#0d0808', borderRadius: 8, overflow: 'hidden', border: '1px solid #1a1010' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 90px 1fr 80px 80px 80px 80px', padding: '0.55rem 1rem', background: '#0a0808', borderBottom: '1px solid #1a1010', fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span>#</span><span>Date</span><span>Total</span>
                  <span style={{ textAlign: 'right' }}>Numerical</span>
                  <span style={{ textAlign: 'right' }}>Verbal</span>
                  <span style={{ textAlign: 'right' }}>Reasoning</span>
                  <span style={{ textAlign: 'right' }}>Coding</span>
                </div>
                {[...history].reverse().map((h, i) => (
                  <div key={h.session_id || i} style={{ display: 'grid', gridTemplateColumns: '50px 90px 1fr 80px 80px 80px 80px', padding: '0.75rem 1rem', borderBottom: '1px solid #110a0a', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: '#444', fontWeight: 600 }}>{h.attempt}</span>
                    <span style={{ color: '#666' }}>{h.date}</span>
                    <span style={{ fontWeight: 900, color: h.total_score >= 50 ? '#FFD60A' : '#ef4444', fontSize: '1rem', letterSpacing: '-0.02em' }}>{h.total_score}%</span>
                    <SCell val={h.numerical} color={SECTION_COLORS.numerical} />
                    <SCell val={h.verbal} color={SECTION_COLORS.verbal} />
                    <SCell val={h.reasoning} color={SECTION_COLORS.reasoning} />
                    <SCell val={h.coding} color={SECTION_COLORS.coding} />
                  </div>
                ))}
              </div>
            </div>

            {isDemo && (
              <div style={{ background: 'rgba(255,214,10,0.05)', border: '1px solid rgba(255,214,10,0.15)', borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }} className="p3">
                <div>
                  <div style={{ color: '#FFD60A', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem' }}>This is demo data</div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>Create an account to track your real exam history and progress over time.</div>
                </div>
                <button className="cta-p" onClick={() => navigate('/login')} style={{ ...st.retakeBtn, fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>Create Account →</button>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <button className="cta-p" onClick={() => navigate('/exam')} style={st.retakeBtn}>🔁 Take Exam</button>
          <button className="cta-p" onClick={() => navigate('/')} style={st.ghostBtn}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}

function SCell({ val, color }) {
  return (
    <span style={{ textAlign: 'right', fontWeight: 600, color: val >= 50 ? color : '#555', fontSize: '0.8rem' }}>
      {val > 0 ? `${val}%` : '—'}
    </span>
  );
}

const st = {
  root: { minHeight: '100vh', background: '#0a0808', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoMark: { width: 30, height: 30, background: '#FFD60A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.72rem', color: '#000', boxShadow: '0 0 12px rgba(255,214,10,0.35)' },
  logoName: { fontWeight: 800, fontSize: '0.95rem', color: '#fff' },
  header: { marginBottom: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', padding: 0, marginBottom: '1rem', display: 'block' },
  title: { fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', margin: 0 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px', background: '#1a1010', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #1a1010' },
  statCard: { background: '#120c0c', padding: '1.25rem 1rem' },
  chartBox: { background: '#120c0c', border: '1px solid #1a1010', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' },
  tableBox: { marginBottom: '1.5rem' },
  emptyBox: { textAlign: 'center', padding: '4rem 2rem', background: '#120c0c', border: '1px solid #1a1010', borderRadius: 12, marginBottom: '2rem' },
  retakeBtn: { padding: '0.7rem 1.5rem', borderRadius: 8, background: '#FFD60A', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' },
  ghostBtn: { padding: '0.5rem 1rem', borderRadius: 7, background: 'transparent', border: '1px solid #2a1818', color: '#777', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' },
};
