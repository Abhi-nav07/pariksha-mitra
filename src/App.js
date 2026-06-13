import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('home');
  const [lang, setLang] = useState('en');

  // Doubt Solver State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock Test State
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [mcqs, setMcqs] = useState([]);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Current Affairs State
  const [affairs, setAffairs] = useState('');
  const [affairsLoading, setAffairsLoading] = useState(false);

  // Weak Topic Tracker State
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pariksha-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pariksha-history', JSON.stringify(history));
  }, [history]);

  const content = {
    en: {
      title: '📚 Pariksha Mitra',
      subtitle: 'UPSC AI Study Buddy — Free & Smart',
      switchLang: 'हिंदी में बदलें',
      home: 'Doubt Solver',
      test: 'Mock Test',
      affairs: 'Current Affairs',
      tracker: 'Topic Tracker',
      heading: '🤔 Ask Your Question',
      placeholder: 'Ask any UPSC related question...',
      button: '🚀 Get Answer',
      thinking: '⏳ Thinking...',
      answerTitle: '💡 Answer:',
      error: 'Something went wrong. Please try again.',
      topicLabel: '📝 Enter Topic for Mock Test',
      topicPlaceholder: 'e.g. Fundamental Rights, Indian History...',
      generateBtn: '🎯 Generate MCQs',
      generating: '⏳ Generating...',
      submitBtn: '✅ Submit Test',
      scoreText: 'Your Score',
      retryBtn: '🔄 Try Again',
      affairsTitle: "📰 Today's Current Affairs",
      affairsBtn: "🔄 Load Today's Affairs",
      affairsFetching: '⏳ Fetching...',
      trackerTitle: '📊 Your Topic Performance',
      noHistory: 'No tests taken yet! Go to Mock Test and start practicing.',
      clearBtn: '🗑️ Clear History',
      weak: '😟 Weak',
      average: '🙂 Average',
      strong: '💪 Strong',
      attempts: 'attempts',
      bestScore: 'Best Score',
    },
    hi: {
      title: '📚 परीक्षा मित्र',
      subtitle: 'UPSC AI स्टडी बडी — फ्री और स्मार्ट',
      switchLang: 'Switch to English',
      home: 'सवाल पूछो',
      test: 'मॉक टेस्ट',
      affairs: 'करेंट अफेयर्स',
      tracker: 'टॉपिक ट्रैकर',
      heading: '🤔 अपना सवाल पूछो',
      placeholder: 'UPSC से जुड़ा कोई भी सवाल पूछो...',
      button: '🚀 जवाब पाओ',
      thinking: '⏳ सोच रहा हूँ...',
      answerTitle: '💡 जवाब:',
      error: 'कुछ गलत हो गया। कृपया दोबारा कोशिश करें।',
      topicLabel: '📝 मॉक टेस्ट के लिए टॉपिक डालो',
      topicPlaceholder: 'जैसे: मौलिक अधिकार, भारतीय इतिहास...',
      generateBtn: '🎯 MCQ बनाओ',
      generating: '⏳ बना रहा हूँ...',
      submitBtn: '✅ टेस्ट जमा करो',
      scoreText: 'आपका स्कोर',
      retryBtn: '🔄 फिर कोशिश करो',
      affairsTitle: '📰 आज के करेंट अफेयर्स',
      affairsBtn: '🔄 आज के अफेयर्स लाओ',
      affairsFetching: '⏳ ला रहा हूँ...',
      trackerTitle: '📊 आपकी टॉपिक परफॉर्मेंस',
      noHistory: 'अभी तक कोई टेस्ट नहीं दिया! मॉक टेस्ट पर जाएं और अभ्यास शुरू करें।',
      clearBtn: '🗑️ हिस्ट्री साफ करो',
      weak: '😟 कमज़ोर',
      average: '🙂 ठीक-ठाक',
      strong: '💪 मज़बूत',
      attempts: 'बार',
      bestScore: 'बेस्ट स्कोर',
    }
  };

  const t = content[lang];

  const callGroq = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const result = await callGroq(
        `You are an expert UPSC tutor. Answer in ${lang === 'hi' ? 'Hindi' : 'English'} only. Keep it simple and clear.\n\nQuestion: ${question}`
      );
      setAnswer(result);
    } catch (error) {
      setAnswer(t.error);
    }
    setLoading(false);
  };

  const generateMCQs = async () => {
    if (!topic.trim()) return;
    setTestLoading(true);
    setMcqs([]);
    setSelected({});
    setScore(null);
    try {
      const prompt = `Generate exactly ${numQuestions} MCQs on "${topic}" for UPSC exam in ${lang === 'hi' ? 'Hindi' : 'English'}.
Return ONLY a JSON array like this, no extra text:
[
  {
    "question": "Question here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) option1"
  }
]`;
      const result = await callGroq(prompt);
      const clean = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setMcqs(parsed);
    } catch (error) {
      alert(
        lang === 'hi'
          ? 'MCQ बनाने में गलती हुई। दोबारा कोशिश करें।'
          : 'Failed to generate MCQs. Please try again.'
      );
    }
    setTestLoading(false);
  };

  const submitTest = () => {
    let correct = 0;
    mcqs.forEach((mcq, i) => {
      if (selected[i] === mcq.answer) correct++;
    });
    const finalScore = correct;
    setScore(finalScore);

    // Save to history
    const percentage = Math.round((finalScore / mcqs.length) * 100);
    const existing = history.find(h => h.topic.toLowerCase() === topic.toLowerCase());
    if (existing) {
      setHistory(history.map(h =>
        h.topic.toLowerCase() === topic.toLowerCase()
          ? {
              ...h,
              attempts: h.attempts + 1,
              bestScore: Math.max(h.bestScore, percentage),
              lastScore: percentage,
            }
          : h
      ));
    } else {
      setHistory([...history, {
        topic,
        attempts: 1,
        bestScore: percentage,
        lastScore: percentage,
        date: new Date().toLocaleDateString(),
      }]);
    }
  };

  const fetchAffairs = async () => {
    setAffairsLoading(true);
    setAffairs('');
    try {
      const today = new Date().toDateString();
      const result = await callGroq(
        `Give me 10 important current affairs for UPSC aspirants for today (${today}).
Write in ${lang === 'hi' ? 'Hindi' : 'English'}.
Format each point as:
- [Topic]: [Brief explanation in 2-3 lines]
Focus on: Indian politics, economy, international relations, science & technology, environment.`
      );
      setAffairs(result);
    } catch (error) {
      setAffairs(t.error);
    }
    setAffairsLoading(false);
  };

  const getLevel = (score) => {
    if (score >= 80) return { label: t.strong, color: '#16a34a' };
    if (score >= 50) return { label: t.average, color: '#f97316' };
    return { label: t.weak, color: '#dc2626' };
  };

  const sortedHistory = [...history].sort((a, b) => a.bestScore - b.bestScore);

  return (
    <div className="app">

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="header-right">
          <button
            className="lang-btn"
            onClick={() => {
              setLang(lang === 'en' ? 'hi' : 'en');
              setAnswer('');
              setQuestion('');
              setMcqs([]);
              setScore(null);
              setAffairs('');
            }}
          >
            {t.switchLang}
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="tabs">
        <button className={`tab ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>{t.home}</button>
        <button className={`tab ${page === 'test' ? 'active' : ''}`} onClick={() => setPage('test')}>{t.test}</button>
        <button className={`tab ${page === 'affairs' ? 'active' : ''}`} onClick={() => setPage('affairs')}>{t.affairs}</button>
        <button className={`tab ${page === 'tracker' ? 'active' : ''}`} onClick={() => setPage('tracker')}>{t.tracker}</button>
      </div>

      {/* Main */}
      <div className="main">

        {/* Doubt Solver Page */}
        {page === 'home' && (
          <div className="card">
            <h2>{t.heading}</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
              placeholder={t.placeholder}
              className="textarea"
            />
            <button onClick={askQuestion} disabled={loading} className={`ask-btn ${loading ? 'disabled' : ''}`}>
              {loading ? t.thinking : t.button}
            </button>
            {answer && (
              <div className="answer-box">
                <h3>{t.answerTitle}</h3>
                <p>{answer}</p>
              </div>
            )}
          </div>
        )}

        {/* Mock Test Page */}
        {page === 'test' && (
          <div className="card">
            <h2>{t.topicLabel}</h2>
            <div className="topic-row">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                className="topic-input"
              />
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="num-select"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
              <button onClick={generateMCQs} disabled={testLoading} className={`ask-btn ${testLoading ? 'disabled' : ''}`}>
                {testLoading ? t.generating : t.generateBtn}
              </button>
            </div>

            {mcqs.length > 0 && (
              <div className="mcq-list">
                {mcqs.map((mcq, i) => (
                  <div key={i} className="mcq-item">
                    <p className="mcq-question">{i + 1}. {mcq.question}</p>
                    <div className="options">
                      {mcq.options.map((opt, j) => (
                        <button
                          key={j}
                          className={`option-btn
                            ${selected[i] === opt ? 'selected' : ''}
                            ${score !== null
                              ? opt === mcq.answer ? 'correct' : selected[i] === opt ? 'wrong' : ''
                              : ''
                            }`}
                          onClick={() => { if (score === null) setSelected({ ...selected, [i]: opt }); }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {score === null ? (
                  <button onClick={submitTest} className="ask-btn" style={{ marginTop: '20px' }}>
                    {t.submitBtn}
                  </button>
                ) : (
                  <div className="score-box">
                    <h2>
                      {t.scoreText}: {score} / {mcqs.length}{' '}
                      {score === mcqs.length ? '🎉' : score >= 3 ? '👍' : '💪'}
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                      {lang === 'en' ? 'Result saved to Topic Tracker!' : 'नतीजा टॉपिक ट्रैकर में सेव हो गया!'}
                    </p>
                    <button
                      onClick={() => { setMcqs([]); setSelected({}); setScore(null); setTopic(''); }}
                      className="ask-btn"
                    >
                      {t.retryBtn}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Current Affairs Page */}
        {page === 'affairs' && (
          <div className="card">
            <h2>{t.affairsTitle}</h2>
            <button
              onClick={fetchAffairs}
              disabled={affairsLoading}
              className={`ask-btn ${affairsLoading ? 'disabled' : ''}`}
              style={{ marginTop: 0 }}
            >
              {affairsLoading ? t.affairsFetching : t.affairsBtn}
            </button>
            {affairs && (
              <div className="answer-box" style={{ marginTop: '20px' }}>
                <p>{affairs}</p>
              </div>
            )}
          </div>
        )}

        {/* Topic Tracker Page */}
        {page === 'tracker' && (
          <div className="card">
            <div className="tracker-header">
              <h2>{t.trackerTitle}</h2>
              {history.length > 0 && (
                <button className="clear-btn" onClick={() => setHistory([])}>
                  {t.clearBtn}
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="no-history">
                <p>📭 {t.noHistory}</p>
              </div>
            ) : (
              <div className="tracker-list">
                {sortedHistory.map((item, i) => {
                  const level = getLevel(item.bestScore);
                  return (
                    <div key={i} className="tracker-item">
                      <div className="tracker-left">
                        <p className="tracker-topic">{item.topic}</p>
                        <p className="tracker-meta">
                          {item.attempts} {t.attempts} · {t.bestScore}: {item.bestScore}%
                        </p>
                      </div>
                      <div className="tracker-right">
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${item.bestScore}%`, background: level.color }}
                          />
                        </div>
                        <span className="level-label" style={{ color: level.color }}>
                          {level.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;