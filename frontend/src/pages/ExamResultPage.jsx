import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult, getAiFeedback } from '../api/exam';
import { useAuth } from '../context/AuthContext';

const SECTION_META = {
  numerical: { label: 'Numerical Ability',  color: '#10b981', icon: '🔢' },
  verbal:    { label: 'Verbal Ability',      color: '#6366f1', icon: '📖' },
  reasoning: { label: 'Reasoning Ability',   color: '#f59e0b', icon: '🧩' },
  coding:    { label: 'Coding',              color: '#ef4444', icon: '💻' },
};

const SECTION_RECS = {
  numerical: [
    'Practice ratio, proportion, and percentage problems daily.',
    'Focus on speed math — aim for mental calculations without pen.',
    'Work through TCS/Infosys previous year quantitative papers.',
  ],
  verbal: [
    'Read one editorial daily and note unfamiliar words.',
    'Do 10 fill-in-the-blank exercises every day for fluency.',
    'Review subject-verb agreement, tense rules, and voice change.',
  ],
  reasoning: [
    'Solve at least 5 number series problems per day.',
    'Draw diagrams for blood relation and seating arrangement Qs.',
    'Practice syllogisms using Venn diagram technique.',
  ],
  coding: [
    'Solve one easy + one medium problem on LeetCode daily.',
    'Master DP patterns: LCS, LIS, 0/1 Knapsack.',
    'Practice coding in timed sessions — 20 min per medium problem.',
  ],
};

const DIFF_COLOR = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

const PASS_CUTOFF = 50;

function buildFromStorage(raw, sessionId, setResult, setLoading) {
  const scores = JSON.parse(raw);
  const sections = Object.entries(scores).map(([sec, d]) => ({
    section: sec, total: d.total, correct: d.correct,
    score: d.score, time_taken: d.timeTaken, breakdown: d.breakdown || null,
  }));
  const avg = sections.length
    ? Math.round(sections.reduce((a, s) => a + s.score, 0) / sections.length) : 0;
  setResult({
    session_id: sessionId,
    sections,
    total_score: avg,
    time_taken: Object.fromEntries(sections.map(s => [s.section, s.time_taken])),
    passed: avg >= PASS_CUTOFF,
  });
  setLoading(false);
}

export default function ExamResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = user?.isDemo === true;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [openReview, setOpenReview] = useState(null);

  useEffect(() => {
    if (sessionId === 'demo-session') {
      const stored = sessionStorage.getItem('demoScores');
      if (stored) { buildFromStorage(stored, 'demo-session', setResult, setLoading); }
      else { setResult({ session_id: 'demo-session', sections: [], total_score: 0, time_taken: {}, passed: false }); setLoading(false); }
      return;
    }
    getResult(sessionId)
      .then(r => {
        // If backend returns empty/zero sections (question bank mismatch), fall back to local snapshot
        const hasData = r.sections && r.sections.length > 0 && r.sections.some(s => s.total > 0);
        if (!hasData) {
          const stored = sessionStorage.getItem('demoScores');
          if (stored) { buildFromStorage(stored, sessionId, setResult, setLoading); return; }
        }
        setResult(r);
        setLoading(false);
      })
      .catch(() => {
        const stored = sessionStorage.getItem('demoScores');
        if (stored) { buildFromStorage(stored, sessionId, setResult, setLoading); return; }
        setError('Could not load result. Please try again.');
        setLoading(false);
      });
  }, [sessionId]);

  const buildTemplateFeedback = () => {
    const weak = [...sections].sort((a, b) => a.score - b.score)[0];
    const strong = [...sections].sort((a, b) => b.score - a.score)[0];
    const SMETA = { numerical: 'Numerical', verbal: 'Verbal', reasoning: 'Reasoning', coding: 'Coding' };
    return (
      `**Overall Assessment**\nYour score of ${result.total_score}% shows ${result.total_score >= 50 ? 'a solid foundation' : 'room for significant improvement'}. ${result.passed ? 'You cleared the cutoff — now sharpen your weak areas.' : 'Focus on basics and retake the exam in a week.'}\n\n` +
      `**Your Strengths**\n• ${SMETA[strong?.section] || 'N/A'} is your best section at ${strong?.score}% — keep it consistent.\n• Your attempt completion rate shows good exam temperament.\n\n` +
      `**Focus Areas**\n• ${SMETA[weak?.section] || 'N/A'} (${weak?.score}%) needs urgent attention — practice 10 questions daily.\n• Work on time management — each question should take under 90 seconds.\n\n` +
      `**7-Day Study Plan**\nDay 1: Revise ${SMETA[weak?.section]} fundamentals\nDay 2: Practice 20 easy ${SMETA[weak?.section]} questions\nDay 3: Attempt 15 medium questions mixed sections\nDay 4: Take a mock sectional test\nDay 5: Review mistakes, focus on hard questions\nDay 6: Full timed practice run\nDay 7: Rest & light revision before retake`
    );
  };

  const handleGetFeedback = async () => {
    setAiLoading(true);
    try {
      const { feedback } = await getAiFeedback({
        total_score: result.total_score,
        passed: result.passed,
        sections: sections.map(s => ({ section: s.section, score: s.score, correct: s.correct, total: s.total })),
      });
      setAiFeedback(feedback);
    } catch {
      // API unavailable — use local template so user always gets feedback
      setAiFeedback(buildTemplateFeedback());
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (s) => {
    if (!s) return '0s';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #221414', borderTopColor: '#FFD60A', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#666', fontSize: '0.88rem' }}>Loading results...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a0808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => navigate('/exam')} style={st.retakeBtn}>Go Back</button>
      </div>
    </div>
  );

  const sections = result.sections || [];
  const passed = result.total_score >= PASS_CUTOFF;

  const totalCorrect = sections.reduce((s, x) => s + (x.correct || 0), 0);
  const totalQs = sections.reduce((s, x) => s + (x.total || 0), 0);
  const accuracy = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;
  const totalTimeSecs = Object.values(result.time_taken || {}).reduce((a, v) => a + (v || 0), 0);

  // Stronger / weaker section
  const sortedBySections = [...sections].sort((a, b) => b.score - a.score);
  const strongest = sortedBySections[0];
  const weakest = sortedBySections[sortedBySections.length - 1];

  // Weak sections (< 40%)
  const weakSections = sections.filter(s => s.score < 40);

  // Aggregate difficulty breakdown across MCQ sections
  const diffAgg = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
  let hasDiffData = false;
  sections.forEach(s => {
    if (s.breakdown) {
      hasDiffData = true;
      Object.entries(s.breakdown).forEach(([diff, bd]) => {
        if (diffAgg[diff]) {
          diffAgg[diff].correct += bd.correct || 0;
          diffAgg[diff].total += bd.total || 0;
        }
      });
    }
  });

  // Difficulty-based recs
  const diffRecs = [];
  if (hasDiffData) {
    const easyAcc = diffAgg.easy.total ? Math.round((diffAgg.easy.correct / diffAgg.easy.total) * 100) : 100;
    const medAcc = diffAgg.medium.total ? Math.round((diffAgg.medium.correct / diffAgg.medium.total) * 100) : 100;
    const hardAcc = diffAgg.hard.total ? Math.round((diffAgg.hard.correct / diffAgg.hard.total) * 100) : 100;
    if (easyAcc < 70) diffRecs.push({ level: 'easy', acc: easyAcc, msg: 'Core fundamentals need revision. Easy questions should be your sure-shot points — review basics first.' });
    if (medAcc < 55) diffRecs.push({ level: 'medium', acc: medAcc, msg: 'Medium questions are your growth zone. Aim for 5 medium problems daily across weak sections.' });
    if (hardAcc < 40) diffRecs.push({ level: 'hard', acc: hardAcc, msg: 'Hard questions require pattern recognition. Study advanced techniques and attempt after fundamentals improve.' });
  }

  return (
    <div style={st.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .r1{animation:fadeUp .45s ease both}
        .r2{animation:fadeUp .45s .1s ease both}
        .r3{animation:fadeUp .45s .2s ease both}
        .r4{animation:fadeUp .45s .3s ease both}
        .r5{animation:fadeUp .45s .4s ease both}
        .watermark-r {
          position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
          font-size:22vw; font-weight:900; color:rgba(255,255,255,0.015);
          letter-spacing:-0.05em; pointer-events:none; user-select:none;
          white-space:nowrap; font-family:'Inter',sans-serif; z-index:0;
        }
        .retake-btn { transition: all .15s; }
        .retake-btn:hover { box-shadow: 0 0 20px rgba(255,214,10,0.4); transform: translateY(-1px); }
        .sec-bar-fill { transition: width 1.2s ease; }
        .diff-bar { transition: width 1s ease; }
        .cta-s { transition: all .15s; }
        .cta-s:hover { transform: translateY(-2px); }
      `}</style>
      <div className="watermark-r">{passed ? 'PASS' : 'FAIL'}</div>

      <div style={st.container}>
        {/* Nav */}
        <div style={st.nav} className="r1">
          <div style={st.logoRow}>
            <div style={st.logoMark}>AI</div>
            <span style={st.logoName}>CrackIt</span>
          </div>
          <button onClick={() => navigate('/exam/leaderboard')} style={st.lbBtn}>🏆 Leaderboard</button>
        </div>

        {/* Hero */}
        <div style={st.heroBlock} className="r1">
          <div style={st.reportBadge}>PERFORMANCE REPORT</div>
          <h1 style={st.heroTitle}>Your Placement Snapshot</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem', marginBottom: '1.25rem' }}>
            {passed
              ? 'Great effort! You crossed the cutoff. Focus on weak areas to go further.'
              : 'You did not clear the cutoff this time. Use the analysis below to bounce back.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="retake-btn" onClick={() => navigate('/exam')} style={st.retakeBtn}>Retake Exam →</button>
            <button onClick={() => navigate('/')} style={st.ghostBtn}>← Home</button>
          </div>
        </div>

        {/* Stronger / Weaker section highlight */}
        {sections.length >= 2 && (
          <div style={st.swRow} className="r2 sw-row">
            <div style={{ ...st.swCard, borderTop: `3px solid #10b981` }}>
              <div style={st.swBadge}>STRONGEST SECTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{SECTION_META[strongest?.section]?.icon}</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{SECTION_META[strongest?.section]?.label || strongest?.section}</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.03em', lineHeight: 1 }}>{strongest?.score}%</div>
              <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.3rem' }}>{strongest?.correct}/{strongest?.total} correct</div>
            </div>
            <div style={{ ...st.swCard, borderTop: `3px solid #ef4444` }}>
              <div style={{ ...st.swBadge, color: '#ef4444' }}>WEAKEST SECTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{SECTION_META[weakest?.section]?.icon}</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{SECTION_META[weakest?.section]?.label || weakest?.section}</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ef4444', letterSpacing: '-0.03em', lineHeight: 1 }}>{weakest?.score}%</div>
              <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.3rem' }}>{weakest?.correct}/{weakest?.total} correct · needs focus</div>
            </div>
          </div>
        )}

        {/* 3 stat boxes */}
        <div style={st.statRow} className="r2 stat-row-3">
          <div style={st.statBox}>
            <div style={st.statMain}>{totalCorrect}<span style={{ fontSize: '1.5rem', color: '#444' }}>/{totalQs}</span></div>
            <div style={st.statLabel}>Questions correct</div>
          </div>
          <div style={st.statBox}>
            <div style={{ ...st.statMain, color: accuracy >= 50 ? '#FFD60A' : '#ef4444' }}>{accuracy}%</div>
            <div style={st.statLabel}>Overall accuracy</div>
          </div>
          <div style={st.statBox}>
            <div style={st.statMain}>{formatTime(totalTimeSecs)}</div>
            <div style={st.statLabel}>Total time taken</div>
          </div>
        </div>

        {/* Section breakdown */}
        <div style={st.block} className="r3">
          <h2 style={st.blockTitle}>Section Breakdown</h2>
          <div style={st.breakdownList}>
            {sections.map(sec => {
              const meta = SECTION_META[sec.section] || { label: sec.section, color: '#666', icon: '📊' };
              const cls = sec.score >= 70 ? 'strong' : sec.score >= 40 ? 'avg' : 'weak';
              const clsColor = { strong: '#10b981', avg: '#f59e0b', weak: '#ef4444' }[cls];
              const clsLabel = { strong: 'Strong', avg: 'Average', weak: 'Weak' }[cls];
              return (
                <div key={sec.section} style={st.breakRow} className="break-row">
                  <div style={st.breakLabel} className="break-label">
                    <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                    <div>
                      <div style={{ color: '#ccc', fontWeight: 600, fontSize: '0.88rem' }}>{meta.label}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: clsColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{clsLabel}</div>
                    </div>
                  </div>
                  <div style={st.breakRight}>
                    <div style={st.breakBarBg}>
                      <div className="sec-bar-fill" style={{ height: '100%', borderRadius: 3, width: `${sec.score}%`, background: sec.score >= 40 ? meta.color : '#ef4444' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sec.score >= 40 ? meta.color : '#ef4444', minWidth: 70, textAlign: 'right' }}>
                      {sec.correct}/{sec.total} ({sec.score}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty performance */}
        {hasDiffData && (
          <div style={st.block} className="r3">
            <h2 style={st.blockTitle}>Difficulty Analysis</h2>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>How you performed across difficulty levels — identifies where your preparation gaps are.</p>
            <div style={st.diffGrid} className="diff-grid">
              {['easy', 'medium', 'hard'].map(diff => {
                const bd = diffAgg[diff];
                const acc = bd.total ? Math.round((bd.correct / bd.total) * 100) : null;
                const color = DIFF_COLOR[diff];
                return (
                  <div key={diff} style={{ ...st.diffCard, borderTop: `2px solid ${color}` }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{diff}</div>
                    {acc !== null ? (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.3rem' }}>{acc}%</div>
                        <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.75rem' }}>{bd.correct}/{bd.total} correct</div>
                        <div style={{ height: 5, background: '#1a1010', borderRadius: 3, overflow: 'hidden' }}>
                          <div className="diff-bar" style={{ height: '100%', width: `${acc}%`, background: color, borderRadius: 3 }} />
                        </div>
                        <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: acc >= 70 ? '#10b981' : acc >= 45 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                          {acc >= 70 ? 'Proficient' : acc >= 45 ? 'Needs practice' : 'Critical gap'}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#444', fontSize: '0.8rem' }}>No data</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weak areas with recommendations */}
        {weakSections.length > 0 && (
          <div style={st.block} className="r4">
            <h2 style={st.blockTitle}>Your Weak Areas — Action Plan</h2>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Prioritize these sections: {weakSections.map(s => SECTION_META[s.section]?.label || s.section).join(' · ')}
            </p>
            <div style={st.weakGrid} className="weak-grid">
              {weakSections.map(sec => {
                const meta = SECTION_META[sec.section] || { label: sec.section, color: '#ef4444', icon: '📊' };
                const recs = SECTION_RECS[sec.section] || ['Review core concepts and practice regularly.'];
                return (
                  <div key={sec.section} style={{ ...st.weakCard, borderTop: `2px solid ${meta.color}` }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{meta.icon}</div>
                    <div style={{ color: meta.color, fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{meta.label}</div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.75rem' }}>{sec.correct}/{sec.total} correct</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {recs.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                          <span style={{ color: meta.color, fontWeight: 900, fontSize: '0.75rem', marginTop: '0.1rem', flexShrink: 0 }}>→</span>
                          <span style={{ color: '#888', fontSize: '0.78rem', lineHeight: 1.55 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Difficulty-level recs */}
        {diffRecs.length > 0 && (
          <div style={st.block} className="r5">
            <h2 style={st.blockTitle}>Difficulty-Level Recommendations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {diffRecs.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#120c0c', border: `1px solid ${DIFF_COLOR[rec.level]}22`, borderLeft: `3px solid ${DIFF_COLOR[rec.level]}`, borderRadius: 8, padding: '0.9rem 1.1rem' }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: DIFF_COLOR[rec.level], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{rec.level}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: DIFF_COLOR[rec.level], lineHeight: 1 }}>{rec.acc}%</div>
                  </div>
                  <div style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6 }}>{rec.msg}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        <div style={st.block} className="r5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={st.blockTitle}>AI Performance Analysis</h2>
              <p style={{ color: '#555', fontSize: '0.82rem', marginTop: '-0.75rem' }}>Personalized feedback & study plan powered by AI</p>
            </div>
            {!aiFeedback && (
              <button
                onClick={handleGetFeedback}
                disabled={aiLoading}
                style={{ background: aiLoading ? '#1a1010' : 'linear-gradient(135deg,#FFD60A,#f59e0b)', border: 'none', color: '#000', padding: '0.65rem 1.35rem', borderRadius: 8, cursor: aiLoading ? 'default' : 'pointer', fontWeight: 800, fontSize: '0.88rem', fontFamily: 'inherit', opacity: aiLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {aiLoading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid #33333388', borderTopColor: '#FFD60A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Generating...</>
                ) : '✨ Get AI Feedback'}
              </button>
            )}
          </div>

          {!aiFeedback && !aiLoading && (
            <div style={{ background: '#120c0c', border: '1px dashed #2a1818', borderRadius: 10, padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
              <p style={{ color: '#555', fontSize: '0.88rem' }}>Click the button above to get a personalized AI study plan based on your performance.</p>
            </div>
          )}

          {aiFeedback && (
            <div style={{ background: '#0f0c0c', border: '1px solid #2a1818', borderRadius: 10, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#FFD60A,#f59e0b,#10b981)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem' }}>🤖</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFD60A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Coach Feedback</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: '#ccc', lineHeight: 1.8 }}>
                {aiFeedback.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '0.2rem 0', color: line.startsWith('**') ? '#FFD60A' : '#bbb', fontWeight: line.startsWith('**') ? 800 : 400, fontSize: line.startsWith('**') ? '0.92rem' : '0.86rem' }}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
              <button onClick={() => setAiFeedback('')} style={{ marginTop: '1rem', background: 'none', border: '1px solid #2a1818', color: '#555', padding: '0.35rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>
                Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Answer Review */}
        {['numerical','verbal','reasoning'].some(k => sessionStorage.getItem(`review_${k}`)) && (
          <div id="answer-review" style={st.block} className="r5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ ...st.blockTitle, marginBottom: '0.25rem' }}>Review Your Answers</h2>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                  See where you went wrong — correct answers highlighted in green.
                </p>
              </div>
              <div style={{ fontSize: '0.72rem', background: '#10b98115', color: '#10b981', border: '1px solid #10b98133', borderRadius: 6, padding: '0.3rem 0.75rem', fontWeight: 700 }}>
                ✓ Answers Available
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['numerical', 'verbal', 'reasoning'].map(secKey => {
                const raw = sessionStorage.getItem(`review_${secKey}`);
                if (!raw) return null;
                const { questions: qs, answers: ans } = JSON.parse(raw);
                const meta = SECTION_META[secKey];
                const isOpen = openReview === secKey;
                const correct = qs.filter(q => ans[q.id] === q.correct_answer).length;
                return (
                  <div key={secKey} style={{ border: '1px solid #1a1010', borderRadius: 10, overflow: 'hidden' }}>
                    {/* Accordion Header */}
                    <button
                      onClick={() => setOpenReview(isOpen ? null : secKey)}
                      style={{ width: '100%', background: '#120c0c', border: 'none', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{meta.label}</span>
                        <span style={{ fontSize: '0.72rem', background: correct === qs.length ? '#10b98122' : '#ef444422', color: correct === qs.length ? '#10b981' : '#ef4444', border: `1px solid ${correct === qs.length ? '#10b98144' : '#ef444444'}`, borderRadius: 5, padding: '0.15rem 0.5rem', fontWeight: 700 }}>
                          {correct}/{qs.length} correct
                        </span>
                      </div>
                      <span style={{ color: '#555', fontSize: '0.85rem', fontWeight: 700 }}>{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {/* Questions */}
                    {isOpen && (
                      <div style={{ background: '#0d0808', borderTop: '1px solid #1a1010' }}>
                        {qs.map((q, qi) => {
                          const studentAns = ans[q.id];
                          const isCorrect = studentAns === q.correct_answer;
                          const isSkipped = !studentAns;
                          return (
                            <div key={q.id} style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #110a0a' }}>
                              {/* Question header */}
                              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 800, color: isSkipped ? '#555' : isCorrect ? '#10b981' : '#ef4444', fontSize: '0.9rem', flexShrink: 0, marginTop: '0.1rem' }}>
                                  {isSkipped ? '○' : isCorrect ? '✓' : '✗'}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#444', fontSize: '0.7rem', fontWeight: 700 }}>Q{qi + 1}</span>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: DIFF_COLOR[q.difficulty] || '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.difficulty}</span>
                                    <span style={{ fontSize: '0.62rem', color: '#444', fontWeight: 600 }}>{q.topic}</span>
                                  </div>
                                  <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{q.question_text}</p>
                                </div>
                              </div>

                              {/* Options */}
                              <div className="review-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', paddingLeft: '1.5rem' }}>
                                {q.options.map(opt => {
                                  const letter = opt[0];
                                  const isStudentChoice = letter === studentAns;
                                  const isRightAnswer = letter === q.correct_answer;
                                  let bg = 'transparent';
                                  let border = '1px solid #1a1010';
                                  let color = '#555';
                                  if (isRightAnswer) { bg = '#10b98115'; border = '1px solid #10b98155'; color = '#10b981'; }
                                  if (isStudentChoice && !isCorrect) { bg = '#ef444415'; border = '1px solid #ef444455'; color = '#ef4444'; }
                                  return (
                                    <div key={letter} style={{ background: bg, border, borderRadius: 6, padding: '0.4rem 0.65rem', fontSize: '0.78rem', color, fontWeight: isRightAnswer || (isStudentChoice && !isCorrect) ? 700 : 400, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                      {isRightAnswer && <span style={{ color: '#10b981', fontSize: '0.7rem' }}>✓</span>}
                                      {isStudentChoice && !isCorrect && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>✗</span>}
                                      <span>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {isSkipped && (
                                <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.5rem', paddingLeft: '1.5rem', fontStyle: 'italic' }}>
                                  Not attempted — correct answer: {q.correct_answer}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={st.ctaRow} className="r5 cta-row">
          <button className="cta-s" onClick={() => navigate('/exam')} style={st.retakeBtn}>🔁 Retake Exam</button>
          {['numerical','verbal','reasoning'].some(k => sessionStorage.getItem(`review_${k}`)) && (
            <button className="cta-s" onClick={() => { document.getElementById('answer-review')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ ...st.ghostBtn, borderColor: '#10b98155', color: '#10b981' }}>📋 Review Answers</button>
          )}
          <button className="cta-s" onClick={() => navigate('/progress')} style={st.ghostBtn}>📈 My Progress</button>
          <button className="cta-s" onClick={() => navigate('/exam/leaderboard')} style={st.ghostBtn}>🏆 Leaderboard</button>
          <button className="cta-s" onClick={() => navigate('/')} style={st.ghostBtn}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}

const st = {
  root: { minHeight: '100vh', background: '#0a0808', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif", position: 'relative', overflow: 'hidden' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', position: 'relative', zIndex: 1 },

  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoMark: { width: 30, height: 30, background: '#FFD60A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.72rem', color: '#000', boxShadow: '0 0 12px rgba(255,214,10,0.35)' },
  logoName: { fontWeight: 800, fontSize: '0.95rem', color: '#fff' },
  lbBtn: { background: 'transparent', border: '1px solid #2a1818', borderRadius: 7, color: '#FFD60A', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' },

  heroBlock: { marginBottom: '2rem' },
  reportBadge: { fontSize: '0.62rem', fontWeight: 800, color: '#FFD60A', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' },
  heroTitle: { fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#fff' },
  retakeBtn: { padding: '0.7rem 1.5rem', borderRadius: 8, background: '#FFD60A', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' },
  ghostBtn: { padding: '0.7rem 1.25rem', borderRadius: 8, background: 'transparent', border: '1px solid #2a1818', color: '#777', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' },

  swRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1010', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #1a1010' },
  swCard: { background: '#120c0c', padding: '1.5rem 1.75rem' },
  swBadge: { fontSize: '0.6rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' },

  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#1a1010', borderRadius: 10, overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid #1a1010' },
  statBox: { background: '#120c0c', padding: '1.5rem 1.75rem' },
  statMain: { fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 },
  statLabel: { fontSize: '0.72rem', color: '#555', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 },

  block: { marginBottom: '2.5rem' },
  blockTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' },

  breakdownList: { display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  breakRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  breakLabel: { display: 'flex', alignItems: 'center', gap: '0.6rem', width: 220, flexShrink: 0 },
  breakRight: { flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' },
  breakBarBg: { flex: 1, height: 7, background: '#1a1010', borderRadius: 4, overflow: 'hidden' },

  diffGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' },
  diffCard: { background: '#120c0c', border: '1px solid #1a1010', borderRadius: 10, padding: '1.25rem' },

  weakGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' },
  weakCard: { background: '#120c0c', border: '1px solid #1a1010', borderRadius: 10, padding: '1.25rem' },

  ctaRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
};
