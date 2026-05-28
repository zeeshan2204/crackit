import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../api/exam';

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLOR = ['#FFD60A', '#aaa', '#cd7f32'];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={st.root}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .lb1 { animation: fadeUp .4s ease both; }
        .lb2 { animation: fadeUp .4s .1s ease both; }
        .lb3 { animation: fadeUp .4s .2s ease both; }
        .lb-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .lb-glow {
          position: fixed; top: -100px; right: -100px; pointer-events: none; z-index: 0;
          width: 500px; height: 400px;
          background: radial-gradient(ellipse at center, rgba(255,214,10,0.07) 0%, transparent 65%);
        }
        .row-hover { transition: background .12s; }
        .row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        .exam-cta { transition: all .15s; }
        .exam-cta:hover { box-shadow: 0 0 24px rgba(255,214,10,0.4); transform: translateY(-1px); }
      `}</style>
      <div className="lb-grid" />
      <div className="lb-glow" />

      <div style={st.container}>
        {/* Header */}
        <div style={st.header} className="lb1">
          <button onClick={() => navigate('/')} style={st.backBtn}>← Back</button>
          <div style={st.logoRow}>
            <div style={st.logoMark}>AI</div>
            <span style={st.logoName}>CrackIt</span>
          </div>
          <button className="exam-cta" onClick={() => navigate('/exam')} style={st.examBtn}>Take Exam →</button>
        </div>

        {/* Title */}
        <div style={st.titleBlock} className="lb1">
          <div style={st.titleBadge}>Global Rankings</div>
          <h1 style={st.title}>Leaderboard</h1>
          <p style={st.titleSub}>See how you stack up against other students.</p>
        </div>

        {loading ? (
          <div style={st.center}>
            <div style={{ width: 36, height: 36, border: '3px solid #1f1f1f', borderTopColor: '#FFD60A', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#888', fontSize: '0.88rem' }}>Loading rankings...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={st.empty} className="lb2">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>No entries yet</h2>
            <p style={{ color: '#888', marginBottom: '1.75rem', fontSize: '0.9rem' }}>Be the first to complete the exam!</p>
            <button className="exam-cta" onClick={() => navigate('/exam')} style={st.examBtn}>Start Exam →</button>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div style={st.podium} className="lb2">
                {[entries[1], entries[0], entries[2]].map((e, i) => {
                  const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const heights = [80, 110, 60];
                  const color = MEDAL_COLOR[actualRank - 1];
                  return e ? (
                    <div key={e.rank} style={st.podiumItem}>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{MEDAL[actualRank - 1]}</div>
                      <div style={st.podiumName}>{e.name.split(' ')[0]}</div>
                      <div style={{ color, fontWeight: 900, fontSize: '1.15rem', marginBottom: '0.4rem' }}>{e.total_score}%</div>
                      <div style={{ ...st.podiumBlock, height: heights[i], background: color, color: actualRank === 1 ? '#000' : '#fff' }}>
                        #{actualRank}
                      </div>
                    </div>
                  ) : <div key={i} />;
                })}
              </div>
            )}

            {/* Table */}
            <div style={st.table} className="lb3">
              <div style={st.tableHead}>
                <span style={{ width: 56 }}>Rank</span>
                <span style={{ flex: 1 }}>Name</span>
                <span style={st.col}>Numerical</span>
                <span style={st.col}>Verbal</span>
                <span style={st.col}>Reasoning</span>
                <span style={{ ...st.col, color: '#FFD60A' }}>Total</span>
                <span style={st.col}>Date</span>
              </div>

              {entries.map((e) => (
                <div key={e.rank} className="row-hover" style={{
                  ...st.tableRow,
                  borderLeft: e.rank <= 3 ? `3px solid ${MEDAL_COLOR[e.rank - 1]}` : '3px solid transparent',
                  background: e.rank <= 3 ? `${MEDAL_COLOR[e.rank - 1]}08` : 'transparent',
                }}>
                  <span style={{ width: 56, fontWeight: 700, color: e.rank <= 3 ? MEDAL_COLOR[e.rank - 1] : '#666' }}>
                    {e.rank <= 3 ? MEDAL[e.rank - 1] : `#${e.rank}`}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600, color: '#ccc', fontSize: '0.9rem' }}>{e.name}</span>
                  <ScoreCell val={e.numerical ?? e.aptitude} />
                  <ScoreCell val={e.verbal} />
                  <ScoreCell val={e.reasoning} />
                  <span style={{ ...st.cellBase, color: '#FFD60A', fontWeight: 800 }}>{e.total_score}%</span>
                  <span style={{ ...st.cellBase, color: '#777' }}>{e.date}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreCell({ val }) {
  const color = val >= 60 ? '#10b981' : val >= 40 ? '#f59e0b' : '#ef4444';
  return <span style={{ ...st.cellBase, color }}>{val}%</span>;
}

const st = {
  root: {
    minHeight: '100vh', background: '#0a0808', color: '#e2e8f0',
    fontFamily: "'Inter','Segoe UI',sans-serif", position: 'relative', overflow: 'hidden',
  },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 5rem', position: 'relative', zIndex: 1 },

  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoMark: {
    width: 28, height: 28, background: '#FFD60A', borderRadius: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 900, fontSize: '0.7rem', color: '#000',
    boxShadow: '0 0 12px rgba(255,214,10,0.35)',
  },
  logoName: { fontWeight: 800, fontSize: '0.95rem', color: '#fff' },
  examBtn: {
    background: '#FFD60A', border: 'none', color: '#000',
    padding: '0.5rem 1.1rem', borderRadius: 8,
    cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'inherit',
  },

  titleBlock: { marginBottom: '2.5rem' },
  titleBadge: {
    display: 'inline-block', padding: '0.25rem 0.75rem',
    border: '1px solid #2a2a2a', borderRadius: 20,
    fontSize: '0.68rem', fontWeight: 700, color: '#777',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
  },
  title: { fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: '0.35rem' },
  titleSub: { color: '#777', fontSize: '0.9rem' },

  center: { textAlign: 'center', padding: '5rem 2rem' },
  empty: {
    textAlign: 'center', padding: '4rem 2rem',
    background: '#111', border: '1px solid #1f1f1f', borderRadius: 12,
  },

  podium: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    gap: '1.5rem', marginBottom: '2.5rem',
    padding: '2rem 1.5rem 0', background: '#111',
    border: '1px solid #1f1f1f', borderRadius: 12,
    overflow: 'hidden',
  },
  podiumItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 },
  podiumName: {
    fontSize: '0.82rem', fontWeight: 600, color: '#ccc',
    marginBottom: '0.2rem', maxWidth: 85,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
  },
  podiumBlock: {
    width: '100%', borderRadius: '6px 6px 0 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 900, fontSize: '1.1rem',
  },

  table: { background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' },
  tableHead: {
    display: 'flex', padding: '0.65rem 1.25rem',
    background: '#0d0d0d', borderBottom: '1px solid #1a1a1a',
    fontSize: '0.65rem', fontWeight: 700, color: '#666',
    textTransform: 'uppercase', letterSpacing: '0.09em', alignItems: 'center',
  },
  tableRow: {
    display: 'flex', padding: '0.85rem 1.25rem',
    borderBottom: '1px solid #161616', alignItems: 'center',
  },
  col: { width: 88, textAlign: 'right' },
  cellBase: { width: 88, textAlign: 'right', fontSize: '0.88rem' },
};
