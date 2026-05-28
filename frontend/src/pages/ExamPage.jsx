import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startExam, getQuestions, submitSection, completeExam, executeCode } from '../api/exam';
import { QUESTION_BANK } from '../data/questionBank';
import { CODING_PROBLEM_BANK } from '../data/codingProblems';

async function runCode(code, lang, stdin = '') {
  const data = await executeCode({ language: lang, code, stdin });
  return {
    stdout: (data.stdout || '').trim(),
    stderr: (data.stderr || '').trim(),
    exitCode: data.exit_code ?? -1,
  };
}

function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const SECTIONS = [
  { key: 'numerical', label: 'Numerical Ability',  duration: 20 * 60, color: '#10b981' },
  { key: 'verbal',    label: 'Verbal Ability',      duration: 20 * 60, color: '#6366f1' },
  { key: 'reasoning', label: 'Reasoning Ability',   duration: 25 * 60, color: '#f59e0b' },
  { key: 'coding',    label: 'Coding',              duration: 60 * 60, color: '#ef4444', isCoding: true },
];

const STATUS = { unanswered: 'unanswered', answered: 'answered', review: 'review', skipped: 'skipped' };
const STATUS_COLOR = { unanswered: '#2a1818', answered: '#10b981', review: '#f59e0b', skipped: '#ef4444' };

function initCodeState(problems) {
  const s = {};
  problems.forEach((p, i) => {
    s[i] = {
      language: 'python',
      codes: { ...p.starterCode },
      output: '',
      running: false,
      submitted: false,
      passedTests: 0,
      totalTests: p.testCases.length,
    };
  });
  return s;
}

export default function ExamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = user?.isDemo === true;

  const [phase, setPhase] = useState('instructions');
  const [sessionId, setSessionId] = useState(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statuses, setStatuses] = useState({});
  const [globalTimeLeft, setGlobalTimeLeft] = useState(60 * 60);
  const [sectionStart, setSectionStart] = useState(Date.now());
  const [completedSections, setCompletedSections] = useState([]);
  const [codeState, setCodeState] = useState({});
  const [activeProblems, setActiveProblems] = useState([]);
  const timerRef = useRef(null);
  const submitRef = useRef(null);
  const endExamRef = useRef(null);

  const section = SECTIONS[sectionIdx];
  const currentQ = questions[qIdx];

  const updateCode = (probIdx, field, value) => {
    setCodeState(s => {
      const prev = s[probIdx] || {};
      if (field === 'code') {
        return { ...s, [probIdx]: { ...prev, codes: { ...prev.codes, [prev.language]: value } } };
      }
      return { ...s, [probIdx]: { ...prev, [field]: value } };
    });
  };

  const handleStartExam = async () => {
    // Clear previous attempt's scores so result page starts fresh
    sessionStorage.removeItem('demoScores');
    ['numerical','verbal','reasoning','coding'].forEach(k => sessionStorage.removeItem(`review_${k}`));

    if (isDemo) {
      setSessionId('demo-session');
      setPhase('exam');
      loadSectionDemo(0);
      return;
    }
    try {
      const data = await startExam();
      setSessionId(data.session_id);
      setPhase('exam');
      await loadSection(0, data.session_id);
    } catch {
      // Backend unavailable or section mismatch — fall back to local question bank
      setSessionId('demo-session');
      setPhase('exam');
      loadSectionDemo(0);
    }
  };

  const loadSectionDemo = (idx) => {
    const sec = SECTIONS[idx];
    if (sec.isCoding) {
      const picked = pickRandom(CODING_PROBLEM_BANK, 2);
      setActiveProblems(picked);
      setCodeState(initCodeState(picked));
      setQuestions([]);
    } else {
      setQuestions(pickRandom(QUESTION_BANK[sec.key] || [], 5));
    }
    setQIdx(0); setAnswers({}); setStatuses({});
    setSectionStart(Date.now());
  };

  const loadSection = async (idx, sid) => {
    const sec = SECTIONS[idx];
    if (sec.isCoding) {
      const picked = pickRandom(CODING_PROBLEM_BANK, 2);
      setActiveProblems(picked);
      setCodeState(initCodeState(picked));
      setQuestions([]);
    } else {
      try {
        const qs = await getQuestions(sec.key);
        setQuestions(qs && qs.length > 0 ? qs : pickRandom(QUESTION_BANK[sec.key] || [], 5));
      } catch {
        setQuestions(pickRandom(QUESTION_BANK[sec.key] || [], 5));
      }
    }
    setQIdx(0); setAnswers({}); setStatuses({});
    setSectionStart(Date.now());
  };

  useEffect(() => {
    if (phase !== 'exam') return;
    setGlobalTimeLeft(60 * 60); // start 1-hour countdown when exam begins
    timerRef.current = setInterval(() => {
      setGlobalTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endExamRef.current?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]); // no sectionIdx — timer never resets between sections

  const selectAnswer = (opt) => {
    if (!currentQ) return;
    setAnswers(a => ({ ...a, [currentQ.id]: opt }));
    setStatuses(s => ({ ...s, [currentQ.id]: STATUS.answered }));
  };

  const toggleReview = () => {
    if (!currentQ) return;
    setStatuses(s => ({
      ...s,
      [currentQ.id]: s[currentQ.id] === STATUS.review
        ? (answers[currentQ.id] ? STATUS.answered : STATUS.unanswered)
        : STATUS.review,
    }));
  };

  const handleNext = () => {
    if (!currentQ) return;
    if (!answers[currentQ.id] && statuses[currentQ.id] !== STATUS.review)
      setStatuses(s => ({ ...s, [currentQ.id]: STATUS.skipped }));
    if (qIdx < questions.length - 1) setQIdx(q => q + 1);
  };

  const handlePrev = () => { if (qIdx > 0) setQIdx(q => q - 1); };

  const handleRunCode = async (probIdx) => {
    const snap = { ...codeState[probIdx] };
    const code = snap.codes?.[snap.language] || '';
    const problem = activeProblems[probIdx];
    setCodeState(s => ({ ...s, [probIdx]: { ...s[probIdx], running: true, output: '' } }));

    let out = 'Running sample test cases...\n\n';
    for (const tc of problem.testCases.slice(0, 2)) {
      try {
        const res = await runCode(code, snap.language, tc.input);
        const pass = res.stdout === tc.expected;
        out += `${tc.label}: ${pass ? 'PASS' : 'FAIL'}\n`;
        if (res.stderr) out += `  Compile/Runtime error:\n  ${res.stderr.slice(0, 300)}\n`;
        else if (!pass) out += `  Your output : "${res.stdout}"\n  Expected    : "${tc.expected}"\n`;
      } catch (e) { out += `${tc.label}: Error — ${e.message || 'check your connection'}\n`; }
    }
    setCodeState(s => ({ ...s, [probIdx]: { ...s[probIdx], running: false, output: out.trim() } }));
  };

  const handleSubmitCodingProblem = async (probIdx) => {
    const snap = { ...codeState[probIdx] };
    const code = snap.codes?.[snap.language] || '';
    const problem = activeProblems[probIdx];
    setCodeState(s => ({ ...s, [probIdx]: { ...s[probIdx], running: true, output: '' } }));

    let passed = 0;
    let out = `Submitting "${problem.title}"...\n\n`;
    for (const tc of problem.testCases) {
      try {
        const res = await runCode(code, snap.language, tc.input);
        const pass = res.stdout === tc.expected;
        if (pass) passed++;
        out += `${tc.label}: ${pass ? 'PASS' : 'FAIL'}\n`;
        if (!pass && !res.stderr) out += `  Got: "${res.stdout}"  Expected: "${tc.expected}"\n`;
        if (res.stderr) out += `  Error: ${res.stderr.slice(0, 200)}\n`;
      } catch (e) { out += `${tc.label}: Error — ${e.message || 'network issue'}\n`; }
    }
    out += `\nFinal: ${passed}/${problem.testCases.length} test cases passed`;

    setCodeState(s => ({
      ...s,
      [probIdx]: { ...s[probIdx], running: false, submitted: true, passedTests: passed, output: out },
    }));
  };

  const handleSubmitSection = useCallback(async (autoSubmit = false) => {
    const timeTaken = Math.floor((Date.now() - sectionStart) / 1000);
    const newCompleted = [...completedSections, section.key];
    setCompletedSections(newCompleted);

    if (isDemo) {
      const demoScores = JSON.parse(sessionStorage.getItem('demoScores') || '{}');

      if (section.isCoding) {
        const totalTests = activeProblems.reduce((sum, p) => sum + p.testCases.length, 0);
        const passed = Object.values(codeState).reduce((sum, cs) => sum + (cs.submitted ? cs.passedTests : 0), 0);
        const score = totalTests ? Math.round((passed / totalTests) * 100) : 0;
        demoScores.coding = { score, correct: passed, total: totalTests, timeTaken,
          breakdown: { medium: { correct: codeState[0]?.passedTests || 0, total: codeState[0]?.totalTests || 0 }, hard: { correct: codeState[1]?.passedTests || 0, total: codeState[1]?.totalTests || 0 } } };
      } else {
        const qs = questions;
        const correct = qs.filter(q => answers[q.id] === q.correct_answer).length;
        const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
        const bd = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
        qs.forEach(q => {
          const d = q.difficulty || 'medium';
          bd[d].total++;
          if (answers[q.id] === q.correct_answer) bd[d].correct++;
        });
        demoScores[section.key] = { score, correct, total: qs.length, timeTaken, breakdown: bd };
        sessionStorage.setItem(`review_${section.key}`, JSON.stringify({ questions: qs, answers: { ...answers } }));
      }

      sessionStorage.setItem('demoScores', JSON.stringify(demoScores));

      if (sectionIdx < SECTIONS.length - 1) {
        const nextIdx = sectionIdx + 1;
        setSectionIdx(nextIdx);
        loadSectionDemo(nextIdx);
      } else {
        setPhase('submitting');
        navigate('/exam/result/demo-session');
      }
      return;
    }

    // Always snapshot scores locally so result page works even if backend fails
    const _snap = JSON.parse(sessionStorage.getItem('demoScores') || '{}');
    if (section.isCoding) {
      const _total = activeProblems.reduce((s, p) => s + p.testCases.length, 0);
      const _passed = Object.values(codeState).reduce((s, cs) => s + (cs.submitted ? cs.passedTests : 0), 0);
      _snap.coding = { score: _total ? Math.round((_passed / _total) * 100) : 0, correct: _passed, total: _total, timeTaken };
    } else {
      const _qs = questions;
      const _correct = _qs.filter(q => answers[q.id] === q.correct_answer).length;
      const _score = _qs.length ? Math.round((_correct / _qs.length) * 100) : 0;
      const _bd = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
      _qs.forEach(q => { const d = q.difficulty || 'medium'; _bd[d].total++; if (answers[q.id] === q.correct_answer) _bd[d].correct++; });
      _snap[section.key] = { score: _score, correct: _correct, total: _qs.length, timeTaken, breakdown: _bd };
      sessionStorage.setItem(`review_${section.key}`, JSON.stringify({ questions: _qs, answers: { ...answers } }));
    }
    sessionStorage.setItem('demoScores', JSON.stringify(_snap));

    if (!section.isCoding) {
      const payload = questions.map(q => ({ question_id: q.id, user_answer: answers[q.id] || null, time_spent: 0 }));
      try { await submitSection({ session_id: sessionId, section: section.key, answers: payload, time_taken: timeTaken }); } catch {}
    }

    if (sectionIdx < SECTIONS.length - 1) {
      const nextIdx = sectionIdx + 1;
      setSectionIdx(nextIdx);
      await loadSection(nextIdx, sessionId);
    } else {
      setPhase('submitting');
      try { await completeExam(sessionId); } catch {}
      navigate('/exam/result/demo-session');
    }
  }, [answers, questions, activeProblems, sessionId, section, sectionIdx, sectionStart, completedSections, navigate, isDemo, codeState]);

  useEffect(() => { submitRef.current = handleSubmitSection; }, [handleSubmitSection]);

  const handleEndExamEarly = (skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('End exam now? Your progress on completed sections will be saved.')) return;
    clearInterval(timerRef.current);
    // Save current section partial answers if any
    if (!section?.isCoding && questions.length > 0) {
      const timeTaken = Math.floor((Date.now() - sectionStart) / 1000);
      const correct = questions.filter(q => answers[q.id] === q.correct_answer).length;
      const score = Math.round((correct / questions.length) * 100);
      const bd = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
      questions.forEach(q => { const d = q.difficulty || 'medium'; bd[d].total++; if (answers[q.id] === q.correct_answer) bd[d].correct++; });
      const stored = JSON.parse(sessionStorage.getItem('demoScores') || '{}');
      stored[section.key] = { score, correct, total: questions.length, timeTaken, breakdown: bd };
      sessionStorage.setItem(`review_${section.key}`, JSON.stringify({ questions, answers: { ...answers } }));
      sessionStorage.setItem('demoScores', JSON.stringify(stored));
    }
    navigate('/exam/result/demo-session');
  };

  useEffect(() => { endExamRef.current = () => handleEndExamEarly(true); }, [handleEndExamEarly]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const totalQs = section?.isCoding ? activeProblems.length : questions.length;
  const answeredCount = section?.isCoding
    ? Object.values(codeState).filter(cs => cs.submitted).length
    : questions.filter(q => answers[q.id]).length;

  if (phase === 'instructions') return <InstructionsScreen onStart={handleStartExam} />;

  if (phase === 'submitting') return (
    <div style={{ minHeight: '100vh', background: '#0a0808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #221414', borderTopColor: '#FFD60A', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: '0.65rem', color: '#FFD60A', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.5rem' }}>EXAM COMPLETE</div>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Calculating your results...</h2>
        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.4rem' }}>Hang tight, generating your snapshot.</p>
      </div>
    </div>
  );

  const submittedCoding = Object.values(codeState).filter(cs => cs.submitted).length;

  return (
    <div style={styles.root}>
      <style>{`
        .opt-btn { transition: background .1s, border-color .1s; }
        .opt-btn:hover { background: #1f1414 !important; border-color: #3a2020 !important; }
        .pal-btn { transition: opacity .1s; }
        .pal-btn:hover { opacity: 0.8; }
        .run-btn { transition: all .12s; }
        .run-btn:hover:not(:disabled) { filter: brightness(1.15); }
      `}</style>

      {/* Header */}
      <div style={styles.header} className="exam-header">
        <div style={styles.headerLogo}>
          <div style={styles.logoMark}>AI</div>
          <span style={styles.logoName}>CrackIt</span>
        </div>
        <div style={styles.headerCenter} className="exam-header-center">
          <span style={styles.examLabel}>EXAM IN PROGRESS</span>
          <span style={styles.sectionHeading}>{section.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handleEndExamEarly} style={{ background: 'none', border: '1px solid #2a1818', color: '#555', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit' }}>
            End Exam
          </button>
          <div style={{ ...styles.timerBox, color: globalTimeLeft < 300 ? '#ef4444' : globalTimeLeft < 600 ? '#f59e0b' : '#fff', borderColor: globalTimeLeft < 300 ? '#ef444455' : '#2a1a1a', background: globalTimeLeft < 300 ? 'rgba(239,68,68,0.1)' : '#1a1010' }}>
            {formatTime(globalTimeLeft)}
          </div>
        </div>
      </div>

      {/* Progress strip */}
      <div style={styles.progressStrip} className="section-strip">
        <span><b style={{ color: '#fff' }}>{answeredCount}</b> <span style={{ color: '#666' }}>{section?.isCoding ? 'submitted' : 'answered'}</span></span>
        <span><b style={{ color: '#fff' }}>{totalQs - answeredCount}</b> <span style={{ color: '#666' }}>remaining</span></span>
        {!section?.isCoding && <span><b style={{ color: '#FFD60A' }}>{qIdx + 1}</b> <span style={{ color: '#666' }}>current</span></span>}
        {section?.isCoding && <span style={{ color: '#666', fontSize: '0.78rem' }}>2 problems · Medium + Hard</span>}
      </div>

      {/* Section tabs */}
      <div style={styles.sectionStrip}>
        {SECTIONS.map((s, i) => {
          const isActive = i === sectionIdx;
          const isDone = completedSections.includes(s.key);
          let pct = 0;
          if (isDone) pct = 100;
          else if (isActive) {
            if (s.isCoding) pct = Math.round((submittedCoding / activeProblems.length) * 100);
            else pct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
          }
          return (
            <div key={s.key} style={{ ...styles.secTab, opacity: i > sectionIdx && !isDone ? 0.35 : 1 }}>
              <div style={styles.secTabRow}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#fff' : isDone ? '#555' : '#666' }}>
                  {isDone ? '✓ ' : ''}{s.label}
                </span>
                <span style={{ fontSize: '0.65rem', color: isActive ? s.color : '#444', fontFamily: 'monospace' }}>
                  {isActive ? (s.isCoding ? `${submittedCoding}/${activeProblems.length}` : `${answeredCount}/${questions.length}`) : isDone ? 'done' : '--'}
                </span>
              </div>
              <div style={{ height: 2, background: '#1a1010', borderRadius: 1, marginTop: '0.35rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: isDone ? '#10b981' : s.color, borderRadius: 1, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div style={styles.body} className="exam-body">
        {section?.isCoding ? (
          <CodingSection
            problems={activeProblems}
            codeState={codeState}
            updateCode={updateCode}
            onRun={handleRunCode}
            onSubmitProblem={handleSubmitCodingProblem}
            onSubmitSection={() => handleSubmitSection(false)}
          />
        ) : (
          <>
            <div style={styles.questionPanel} className="exam-question-panel">
              <div style={styles.qHeader}>
                <span style={styles.qNum}>Question {qIdx + 1} of {questions.length}</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ ...styles.tag, background: section.color + '18', color: section.color, border: `1px solid ${section.color}33` }}>{section.label}</span>
                  <span style={{ ...styles.tag, background: '#1a1010', color: '#888', border: '1px solid #2a1818' }}>{currentQ?.topic}</span>
                  {currentQ?.difficulty && (
                    <span style={{ ...styles.tag, background: currentQ.difficulty === 'hard' ? '#ef444418' : currentQ.difficulty === 'medium' ? '#f59e0b18' : '#10b98118', color: currentQ.difficulty === 'hard' ? '#ef4444' : currentQ.difficulty === 'medium' ? '#f59e0b' : '#10b981', border: `1px solid ${currentQ.difficulty === 'hard' ? '#ef444433' : currentQ.difficulty === 'medium' ? '#f59e0b33' : '#10b98133'}` }}>
                      {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.questionText}>
                {currentQ?.question_text.split('\n').map((line, i) => <p key={i} style={{ margin: '0.3rem 0' }}>{line}</p>)}
              </div>

              <div style={styles.options}>
                {currentQ?.options.map((opt) => {
                  const letter = opt[0];
                  const isSel = answers[currentQ.id] === letter;
                  return (
                    <button key={letter} className="opt-btn" onClick={() => selectAnswer(letter)} style={{ ...styles.optionBtn, background: isSel ? section.color + '18' : '#110a0a', border: `1px solid ${isSel ? section.color : '#221414'}` }}>
                      <span style={{ ...styles.optionLetter, background: isSel ? section.color : '#1f1010', color: isSel ? '#000' : '#666', fontWeight: isSel ? 900 : 600 }}>{letter}</span>
                      <span style={{ color: isSel ? '#fff' : '#ccc' }}>{opt.slice(3)}</span>
                    </button>
                  );
                })}
              </div>

              <div style={styles.actionRow}>
                <button onClick={handlePrev} disabled={qIdx === 0} style={{ ...styles.navBtn, opacity: qIdx === 0 ? 0.35 : 1 }}>← Prev</button>
                <div style={{ flex: 1 }} />
                <button onClick={toggleReview} style={{ ...styles.reviewBtn, background: statuses[currentQ?.id] === STATUS.review ? '#f59e0b18' : 'transparent', border: `1px solid ${statuses[currentQ?.id] === STATUS.review ? '#f59e0b' : '#2a1818'}`, color: statuses[currentQ?.id] === STATUS.review ? '#f59e0b' : '#666' }}>
                  {statuses[currentQ?.id] === STATUS.review ? '🔖 Marked' : '🔖 Review'}
                </button>
                {qIdx < questions.length - 1
                  ? <button onClick={handleNext} style={styles.nextBtn}>Next →</button>
                  : <button onClick={() => handleSubmitSection(false)} style={styles.submitBtn}>Submit Section</button>
                }
              </div>
            </div>

            <div style={styles.sidebar} className="exam-sidebar-panel">
              <div style={styles.sidebarHead}>
                <span>Palette</span>
                <span style={{ background: '#1a1010', border: '1px solid #2a1818', borderRadius: 20, padding: '0.15rem 0.5rem', fontSize: '0.65rem', color: '#FFD60A', fontWeight: 700 }}>
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div style={styles.palette}>
                {questions.map((q, i) => {
                  const st = statuses[q.id] || STATUS.unanswered;
                  return (
                    <button key={q.id} className="pal-btn" onClick={() => setQIdx(i)} style={{ ...styles.palBtn, background: STATUS_COLOR[st], boxShadow: i === qIdx ? '0 0 0 2px #fff' : 'none', fontWeight: i === qIdx ? 800 : 400 }}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div style={styles.legend}>
                {[['#10b981', 'Answered'], ['#f59e0b', 'Review'], ['#ef4444', 'Skipped'], ['#2a1818', 'Not visited']].map(([c, l]) => (
                  <div key={l} style={styles.legendRow}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.68rem', color: '#666' }}>{l}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleSubmitSection(false)} style={styles.submitSectionBtn}>Submit Section</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── CodingSection ────────────────────────────────────────────────
const LANG_LABELS = { python: 'Python 3', java: 'Java 15', c: 'C (GCC)', cpp: 'C++ 17' };

function CodingSection({ problems, codeState, updateCode, onRun, onSubmitProblem, onSubmitSection }) {
  const [activeProb, setActiveProb] = useState(0);
  const prob = problems[activeProb];
  const cs = codeState[activeProb] || {};
  const currentCode = cs.codes?.[cs.language] || '';

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      {/* Problem tabs bar */}
      <div className="coding-tabs" style={{ display: 'flex', background: '#0d0808', borderBottom: '1px solid #1a1010', padding: '0 0.75rem', alignItems: 'center', overflowX: 'auto' }}>
        {problems.map((p, i) => {
          const done = codeState[i]?.submitted;
          const isAct = activeProb === i;
          return (
            <button key={p.id} onClick={() => setActiveProb(i)} style={{ background: 'none', border: 'none', borderBottom: isAct ? '2px solid #FFD60A' : '2px solid transparent', color: isAct ? '#fff' : '#666', padding: '0.65rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: isAct ? 700 : 500, marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {done && <span style={{ color: '#10b981', fontSize: '0.8rem' }}>✓</span>}
              {p.id}: {p.title}
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: p.difficulty === 'hard' ? '#ef444418' : '#f59e0b18', color: p.difficulty === 'hard' ? '#ef4444' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {p.difficulty}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#444' }}>{p.timeHint}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={onSubmitSection} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '0.4rem 1.1rem', borderRadius: 6, margin: '0.4rem 0', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'inherit' }}>
          Finish Exam →
        </button>
      </div>

      {/* Split: statement + editor */}
      <div className="coding-split" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Problem statement */}
        <div className="coding-problem" style={{ width: '40%', borderRight: '1px solid #1a1010', overflowY: 'auto', padding: '1.5rem', background: '#0a0808', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{prob.title}</h2>
            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: prob.difficulty === 'hard' ? '#ef444418' : '#f59e0b18', color: prob.difficulty === 'hard' ? '#ef4444' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              {prob.difficulty}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#bbb', lineHeight: 1.8, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
            {prob.description}
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFD60A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Examples</div>
          {prob.examples.map((ex, i) => (
            <div key={i} style={{ background: '#120c0c', border: '1px solid #1f1212', borderRadius: 8, padding: '0.85rem', marginBottom: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ color: '#555', marginBottom: '0.35rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example {i + 1}</div>
              <div style={{ fontFamily: 'monospace', color: '#bbb', marginBottom: '0.2rem' }}>
                <span style={{ color: '#555' }}>Input: </span>{ex.input.replace(/\n/g, ' | ')}
              </div>
              <div style={{ fontFamily: 'monospace', color: '#10b981', marginBottom: '0.2rem' }}>
                <span style={{ color: '#555' }}>Output: </span>{ex.output}
              </div>
              {ex.note && <div style={{ color: '#555', fontSize: '0.72rem', marginTop: '0.25rem' }}>{ex.note}</div>}
            </div>
          ))}

          {cs.submitted && (
            <div style={{ background: cs.passedTests === cs.totalTests ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${cs.passedTests === cs.totalTests ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
              <div style={{ fontWeight: 800, color: cs.passedTests === cs.totalTests ? '#10b981' : '#ef4444', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                {cs.passedTests === cs.totalTests ? '✓ All tests passed!' : `${cs.passedTests}/${cs.totalTests} tests passed`}
              </div>
              <div style={{ color: '#666', fontSize: '0.78rem' }}>Score: {Math.round((cs.passedTests / cs.totalTests) * 100)}%</div>
            </div>
          )}
        </div>

        {/* Editor + console */}
        <div className="coding-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0808' }}>
          {/* Editor toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 1rem', borderBottom: '1px solid #1a1010', background: '#0d0808', flexShrink: 0 }}>
            <select
              value={cs.language || 'python'}
              onChange={e => updateCode(activeProb, 'language', e.target.value)}
              style={{ background: '#120c0c', border: '1px solid #2a1818', color: '#ccc', padding: '0.35rem 0.7rem', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button
              title="Reset to starter code"
              onClick={() => {
                const lang = codeState[activeProb]?.language || 'python';
                updateCode(activeProb, 'code', prob.starterCode[lang]);
              }}
              style={{ background: 'none', border: '1px solid #2a1818', color: '#555', padding: '0.35rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>
              Reset
            </button>
            <div style={{ flex: 1 }} />
            <button className="run-btn"
              onClick={() => onRun(activeProb)}
              disabled={cs.running}
              style={{ background: '#0f2a1a', border: '1px solid #10b98133', color: '#10b981', padding: '0.4rem 1.1rem', borderRadius: 6, cursor: cs.running ? 'default' : 'pointer', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit', opacity: cs.running ? 0.6 : 1 }}>
              {cs.running ? '...' : '▶ Run'}
            </button>
            <button className="run-btn"
              onClick={() => !cs.running && !cs.submitted && onSubmitProblem(activeProb)}
              disabled={cs.running || cs.submitted}
              style={{ background: cs.submitted ? '#0f2a1a' : '#FFD60A', border: 'none', color: cs.submitted ? '#10b981' : '#000', padding: '0.4rem 1.1rem', borderRadius: 6, cursor: cs.submitted || cs.running ? 'default' : 'pointer', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'inherit', opacity: cs.running ? 0.6 : 1 }}>
              {cs.submitted ? '✓ Submitted' : 'Submit'}
            </button>
          </div>

          {/* Code editor */}
          <textarea
            value={currentCode}
            onChange={e => updateCode(activeProb, 'code', e.target.value)}
            spellCheck={false}
            style={{ flex: 1, resize: 'none', background: '#0c0808', color: '#e2e8f0', fontFamily: "'Fira Code','Cascadia Code','Courier New',monospace", fontSize: '0.88rem', lineHeight: 1.7, padding: '1rem 1.25rem', border: 'none', outline: 'none', borderBottom: '1px solid #1a1010', tabSize: 4 }}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const ta = e.target;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const newCode = currentCode.substring(0, start) + '    ' + currentCode.substring(end);
                updateCode(activeProb, 'code', newCode);
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
              }
            }}
          />

          {/* Console */}
          <div style={{ height: 180, background: '#070505', borderTop: '1px solid #1a1010', padding: '0.6rem 1rem', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.4rem' }}>Console Output</div>
            {cs.running ? (
              <p style={{ color: '#FFD60A', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>Running...</p>
            ) : cs.output ? (
              <pre style={{ margin: 0, fontFamily: "'Fira Code','Courier New',monospace", fontSize: '0.8rem', color: '#aaa', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{cs.output}</pre>
            ) : (
              <p style={{ color: '#2a2a2a', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>Run your code to see output here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── InstructionsScreen ───────────────────────────────────────────
const SECTION_META_INST = [
  { key: 'numerical', label: 'Numerical Ability',  icon: '🔢', color: '#10b981', desc: '10 questions · 20 min' },
  { key: 'verbal',    label: 'Verbal Ability',      icon: '📖', color: '#6366f1', desc: '10 questions · 20 min' },
  { key: 'reasoning', label: 'Reasoning Ability',   icon: '🧩', color: '#f59e0b', desc: '10 questions · 25 min' },
  { key: 'coding',    label: 'Coding (IDE)',         icon: '💻', color: '#ef4444', desc: '2 problems · 60 min' },
];

function InstructionsScreen({ onStart }) {
  const circ = 2 * Math.PI * 72;
  return (
    <div style={is.root} className="inst-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .il  { animation: fadeUp .55s ease both; }
        .il2 { animation: fadeUp .55s .1s ease both; }
        .il3 { animation: fadeUp .55s .2s ease both; }
        .stat-c { transition: border-color .2s, transform .2s; }
        .stat-c:hover { border-color: #FFD60A44 !important; transform: translateY(-3px); }
        .start-b { transition: all .15s; }
        .start-b:hover { box-shadow: 0 0 32px rgba(255,214,10,0.5); transform: translateY(-2px); }
        .watermark {
          position: absolute; top: 50%; left: 40%; transform: translate(-50%,-50%);
          font-size: 18vw; font-weight: 900; color: rgba(255,255,255,0.018);
          letter-spacing: -0.05em; pointer-events: none; user-select: none;
          white-space: nowrap; font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="watermark">PLACEMENT</div>

      <div style={is.left} className="inst-left">
        <div style={is.logoRow} className="il">
          <div style={is.logoMark}>AI</div>
          <span style={is.logoName}>CrackIt</span>
        </div>
        <div style={is.hero}>
          <div style={is.badge} className="il">FREE CAMPUS PLACEMENT EXAM</div>
          <h1 style={is.title} className="il2 inst-title">
            <span style={{ color: '#FFD60A' }}>CrackIt</span><br />
            Placement<br />
            <span style={{ color: '#fff' }}>Exam</span>
          </h1>
          <p style={is.sub} className="il2 inst-sub">
            Full campus-style placement test with section-wise timers, a real code compiler
            for C/C++/Java/Python, difficulty analysis, and instant performance snapshot.
          </p>
        </div>
        <div style={is.statGrid} className="il3 inst-stat-grid">
          {[
            ['32', 'Total Questions', '10 Numerical · 10 Verbal\n10 Reasoning · 2 Coding'],
            ['~2 hrs', 'Exam Duration', 'Section timers · auto-submit\nwhen time runs out'],
            ['Easy/Med/Hard', 'Difficulty Mix', 'Questions graded by level\nfor weakness analysis'],
            ['Live Snapshot', 'Post-Exam', 'Weaker/stronger sections\nwith recommendations'],
          ].map(([v, l, d]) => (
            <div key={l} className="stat-c" style={is.statCard}>
              <div style={is.statV}>{v}</div>
              <div style={is.statL}>{l}</div>
              <div style={is.statD}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={is.right} className="inst-right">
        <div style={is.console} className="il">
          <div style={is.consoleHead}>
            <span style={is.consoleTitle}>Exam Overview</span>
            <span style={is.readyBadge}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 5 }} />
              Ready
            </span>
          </div>
          <p style={is.consoleSub}>Real compiler · Fresh questions</p>

          <div className="inst-svg" style={{ display: 'flex', justifyContent: 'center', margin: '1.75rem 0' }}>
            <svg width="160" height="160" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="72" fill="none" stroke="#1a1010" strokeWidth="14" />
              <circle cx="90" cy="90" r="72" fill="none" stroke="#FFD60A" strokeWidth="14"
                strokeDasharray={`${circ * 0.82} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 90 90)"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,214,10,0.5))' }}
              />
              <text x="90" y="84" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900" fontFamily="Inter,system-ui">32+</text>
              <text x="90" y="104" textAnchor="middle" fill="#666" fontSize="11" fontFamily="Inter,system-ui">questions ready</text>
            </svg>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            {SECTION_META_INST.map(sec => (
              <div key={sec.key} style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#ccc', fontWeight: 500 }}>{sec.icon} {sec.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'monospace' }}>{sec.desc}</span>
                </div>
                <div style={{ height: 4, background: '#1a1010', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: sec.color, borderRadius: 2, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>

          <button className="start-b" onClick={onStart} style={is.startBtn}>Start Exam →</button>
          <p style={is.startNote}>Timer starts immediately · No negative marking</p>
        </div>
      </div>
    </div>
  );
}

const is = {
  root: {
    minHeight: '100vh', background: '#0a0808', color: '#e2e8f0',
    fontFamily: "'Inter',system-ui,sans-serif",
    display: 'flex', position: 'relative', overflow: 'hidden',
  },
  left: {
    flex: 1, padding: '3rem 3.5rem', display: 'flex',
    flexDirection: 'column', justifyContent: 'space-between',
    position: 'relative', zIndex: 1,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.65rem' },
  logoMark: { width: 36, height: 36, background: '#FFD60A', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#000', boxShadow: '0 0 16px rgba(255,214,10,0.4)' },
  logoName: { fontWeight: 800, fontSize: '1.05rem', color: '#fff' },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem' },
  badge: { display: 'inline-block', padding: '0.3rem 0', marginBottom: '1.25rem', fontSize: '0.65rem', fontWeight: 800, color: '#FFD60A', textTransform: 'uppercase', letterSpacing: '0.14em' },
  title: { fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: '1.25rem', color: '#fff' },
  sub: { color: '#777', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 480 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.65rem', paddingBottom: '3rem' },
  statCard: { background: '#120c0c', border: '1px solid #221414', borderRadius: 10, padding: '1rem 0.9rem' },
  statV: { fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.2rem' },
  statL: { fontSize: '0.65rem', fontWeight: 700, color: '#FFD60A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' },
  statD: { fontSize: '0.65rem', color: '#555', lineHeight: 1.5, whiteSpace: 'pre-line' },
  right: { width: 380, background: '#0d0808', borderLeft: '1px solid #1a1010', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 },
  console: { display: 'flex', flexDirection: 'column', flex: 1 },
  consoleHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' },
  consoleTitle: { fontWeight: 800, fontSize: '1.1rem', color: '#fff' },
  readyBadge: { display: 'flex', alignItems: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 },
  consoleSub: { fontSize: '0.8rem', color: '#555', marginBottom: '0' },
  startBtn: { width: '100%', padding: '1rem', background: '#FFD60A', border: 'none', borderRadius: 8, color: '#000', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter',system-ui,sans-serif", letterSpacing: '-0.01em' },
  startNote: { textAlign: 'center', color: '#444', fontSize: '0.72rem', marginTop: '0.6rem' },
};

const styles = {
  root: { minHeight: '100vh', height: '100vh', background: '#0a0808', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.5rem', background: '#0d0808', borderBottom: '1px solid #1a1010', flexShrink: 0 },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  logoMark: { width: 30, height: 30, background: '#FFD60A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.72rem', color: '#000' },
  logoName: { fontWeight: 800, fontSize: '0.9rem', color: '#fff' },
  headerCenter: { textAlign: 'center' },
  examLabel: { display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#FFD60A', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.1rem' },
  sectionHeading: { fontSize: '0.95rem', fontWeight: 800, color: '#fff' },
  timerBox: { fontFamily: 'monospace', fontSize: '1.35rem', fontWeight: 900, padding: '0.35rem 0.85rem', borderRadius: 8, border: '1px solid', letterSpacing: '0.04em', minWidth: 90, textAlign: 'center' },
  progressStrip: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0.5rem 2rem', background: '#0a0808', borderBottom: '1px solid #150e0e', flexShrink: 0, fontSize: '0.85rem', gap: '1rem' },
  sectionStrip: { display: 'flex', background: '#0d0808', borderBottom: '1px solid #1a1010', flexShrink: 0, overflowX: 'auto' },
  secTab: { flex: 1, padding: '0.55rem 1.1rem', minWidth: 140, borderRight: '1px solid #1a1010' },
  secTabRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  questionPanel: { flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' },
  qNum: { fontSize: '0.82rem', color: '#666', fontWeight: 600 },
  tag: { padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.02em' },
  questionText: { fontSize: '1rem', color: '#e0e0e0', lineHeight: 1.8, marginBottom: '1.5rem', background: '#120c0c', border: '1px solid #1f1212', borderRadius: 8, padding: '1.25rem 1.5rem' },
  options: { display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' },
  optionBtn: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '0.95rem', fontFamily: 'inherit' },
  optionLetter: { width: 30, height: 30, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem' },
  actionRow: { display: 'flex', gap: '0.6rem', alignItems: 'center', paddingTop: '0.5rem' },
  navBtn: { padding: '0.6rem 1.1rem', borderRadius: 7, background: 'transparent', border: '1px solid #2a1818', color: '#666', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' },
  reviewBtn: { padding: '0.6rem 1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit' },
  nextBtn: { padding: '0.6rem 1.35rem', borderRadius: 7, background: '#FFD60A', border: 'none', color: '#000', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 800, fontFamily: 'inherit' },
  submitBtn: { padding: '0.6rem 1.35rem', borderRadius: 7, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'inherit' },
  sidebar: { width: 230, background: '#0d0808', borderLeft: '1px solid #1a1010', padding: '1rem', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  sidebarHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#ccc' },
  palette: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 },
  palBtn: { aspectRatio: '1', borderRadius: 5, cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'inherit', color: '#fff', border: 'none' },
  legend: { display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid #1a1010', paddingTop: '0.65rem' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  submitSectionBtn: { width: '100%', padding: '0.7rem', borderRadius: 7, marginTop: 'auto', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' },
};
