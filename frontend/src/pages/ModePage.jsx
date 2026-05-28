import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ModePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>PrepPortal</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Hero */}
      <main style={styles.main}>
        <h1 style={styles.title}>Choose Your Practice Mode</h1>
        <p style={styles.subtitle}>
          Sharpen your skills with AI-powered interviews or full-length placement exam simulations.
        </p>

        <div style={styles.cards}>
          {/* Mock Interview Card */}
          <div style={styles.card} onClick={() => navigate('/interview')}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              🤖
            </div>
            <h2 style={styles.cardTitle}>Mock Interview</h2>
            <p style={styles.cardDesc}>
              Practice coding problems with real-time AI feedback on correctness, efficiency,
              and code quality. Perfect for technical interview prep.
            </p>
            <ul style={styles.featureList}>
              <li>✓ Coding problems (Easy / Medium / Hard)</li>
              <li>✓ Multi-language: Python, Java, JavaScript</li>
              <li>✓ Instant AI evaluation & score</li>
              <li>✓ AI chat for hints & explanations</li>
              <li>✓ Analytics dashboard</li>
            </ul>
            <button style={{ ...styles.cardBtn, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              Start Interview →
            </button>
          </div>

          {/* Placement Exam Card */}
          <div style={{ ...styles.card, ...styles.examCard }} onClick={() => navigate('/exam')}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
              📝
            </div>
            <h2 style={styles.cardTitle}>Placement Exam</h2>
            <p style={styles.cardDesc}>
              Full-length campus placement exam simulator with 4 sections — Verbal, Reasoning,
              Aptitude, and Coding. Timed sections with auto-submit.
            </p>
            <ul style={styles.featureList}>
              <li>✓ 4 sections · 74+ questions · ~3 hours</li>
              <li>✓ Section-wise timer with auto-submit</li>
              <li>✓ Mark for Review feature</li>
              <li>✓ Question navigator palette</li>
              <li>✓ Percentile ranking & leaderboard</li>
            </ul>
            <button style={{ ...styles.cardBtn, background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
              Start Exam →
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Questions', value: '100+' },
            { label: 'Sections', value: '4' },
            { label: 'Languages', value: '4' },
            { label: 'AI-powered', value: '✓' },
          ].map(s => (
            <div key={s.label} style={styles.statBox}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    background: 'rgba(0,0,0,0.3)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoIcon: { fontSize: '1.5rem' },
  logoText: { fontSize: '1.25rem', fontWeight: 700, color: '#fff' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { fontSize: '0.9rem', color: '#94a3b8' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#e2e8f0', padding: '0.4rem 1rem', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem',
    transition: 'background 0.2s',
  },
  main: {
    maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem 3rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem', fontWeight: 800, color: '#fff',
    marginBottom: '1rem', letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '1.1rem', color: '#94a3b8', maxWidth: '540px',
    margin: '0 auto 3rem', lineHeight: 1.6,
  },
  cards: {
    display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '2rem',
    width: '340px', textAlign: 'left',
    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
    backdropFilter: 'blur(10px)',
  },
  examCard: {
    border: '1px solid rgba(245,158,11,0.3)',
    boxShadow: '0 0 30px rgba(245,158,11,0.08)',
  },
  cardIcon: {
    width: '56px', height: '56px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.75rem', marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.4rem', fontWeight: 700, color: '#fff',
    marginBottom: '0.75rem',
  },
  cardDesc: {
    fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6,
    marginBottom: '1.25rem',
  },
  featureList: {
    listStyle: 'none', padding: 0, margin: '0 0 1.75rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  cardBtn: {
    width: '100%', padding: '0.75rem', borderRadius: '10px',
    border: 'none', color: '#fff', fontWeight: 600,
    fontSize: '0.95rem', cursor: 'pointer',
    transition: 'opacity 0.2s', letterSpacing: '0.01em',
  },
  statsRow: {
    display: 'flex', gap: '1.5rem', justifyContent: 'center',
    marginTop: '3rem', flexWrap: 'wrap',
  },
  statBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '1rem 2rem',
    minWidth: '100px',
  },
  statValue: { fontSize: '1.75rem', fontWeight: 800, color: '#fff' },
  statLabel: { fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' },
};
