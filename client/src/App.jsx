import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [theme, setTheme] = useState('dark');
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({ completedLessons: [], passedQuizzes: [] });
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); // index or 'quiz'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Playground State
  const [pgTab, setPgTab] = useState('html');
  const [pgHtml, setPgHtml] = useState('<div class="card">\n  <h1>Hello World! 🌍</h1>\n  <p>Edit this code and hit Run!</p>\n</div>');
  const [pgCss, setPgCss] = useState('body {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #1a1a2e;\n  font-family: sans-serif;\n}\n.card {\n  background: #2d2d44;\n  padding: 2rem;\n  border-radius: 12px;\n  color: white;\n  text-align: center;\n}');
  const [pgJs, setPgJs] = useState('console.log("Playground ready!");');
  const iframeRef = useRef(null);
  
  // Certificate state
  const [certName, setCertName] = useState('');
  const certRef = useRef(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          axios.get(`${API_URL}/courses`),
          axios.get(`${API_URL}/progress`)
        ]);
        setCourses(coursesRes.data);
        setProgress({
          completedLessons: progressRes.data.completedLessons || [],
          passedQuizzes: progressRes.data.passedQuizzes || []
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-in');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [courses]); // re-run when courses load and render


  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const markLessonComplete = async (lessonId) => {
    try {
      const res = await axios.post(`${API_URL}/progress/lesson`, { lessonId });
      setProgress({
        completedLessons: res.data.progress.completedLessons || [],
        passedQuizzes: res.data.progress.passedQuizzes || []
      });
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const markQuizPassed = async (courseId) => {
    try {
      const res = await axios.post(`${API_URL}/progress/quiz`, { courseId });
      setProgress({
        completedLessons: res.data.progress.completedLessons || [],
        passedQuizzes: res.data.progress.passedQuizzes || []
      });
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const openCourse = (course) => {
    setActiveCourse(course);
    setIsModalOpen(true);
    setActiveLesson(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const runPlayground = () => {
    if (!iframeRef.current) return;
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${pgCss}</style>
      </head>
      <body>
        ${pgHtml}
        <script>${pgJs}</script>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'text/html' });
    iframeRef.current.src = URL.createObjectURL(blob);
  };

  useEffect(() => {
    runPlayground();
  }, []); // Run once on mount

  // Calculate Progress Stats
  let totalLessons = 0;
  courses.forEach(c => totalLessons += c.lessons.length);
  const totalQuizzes = courses.length;
  const completedL = progress.completedLessons.length;
  const passedQ = progress.passedQuizzes.length;
  const totalItems = totalLessons + totalQuizzes;
  const completedItems = completedL + passedQ;
  const overallPct = Math.round((completedItems / (totalItems || 1)) * 100) || 0;
  const allQuizzesPassed = passedQ > 0 && passedQ === totalQuizzes;

  const generateCertificate = () => {
    if (!certName.trim()) {
      alert("Please enter your name");
      return;
    }
    certRef.current.style.transform = 'scale(1.05)';
    certRef.current.style.boxShadow = '0 0 40px rgba(108,92,231,0.5)';
    setTimeout(() => {
      certRef.current.style.transform = 'scale(1)';
      certRef.current.style.boxShadow = 'none';
      window.print(); // Triggers real print/save as PDF dialog!
    }, 500);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    activeCourse.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === activeCourse.quiz.length) {
      markQuizPassed(activeCourse.id);
    }
  };

  return (
    <div>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C5CE7" />
                  <stop offset="100%" stopColor="#a29bfe" />
              </linearGradient>
          </defs>
      </svg>

      <nav className="navbar scrolled">
        <div className="nav-container">
          <a href="#home" className="nav-logo" onClick={(e) => {e.preventDefault(); scrollToSection('home');}}>
            <div className="logo-icon"><i className="fas fa-gem"></i></div>
            <span>Pixel<span className="logo-accent">Perfect</span></span>
          </a>
          <ul className="nav-links active" style={{display: 'flex', flexDirection: 'row', position: 'static', background: 'transparent', padding: 0, border: 'none'}}>
            <li><a href="#home" className="nav-link" onClick={(e) => {e.preventDefault(); scrollToSection('home');}}>Home</a></li>
            <li><a href="#courses" className="nav-link" onClick={(e) => {e.preventDefault(); scrollToSection('courses');}}>Courses</a></li>
            <li><a href="#playground" className="nav-link" onClick={(e) => {e.preventDefault(); scrollToSection('playground');}}>Playground</a></li>
            <li><a href="#progress" className="nav-link" onClick={(e) => {e.preventDefault(); scrollToSection('progress');}}>Progress</a></li>
            <li><a href="#certificate" className="nav-link" onClick={(e) => {e.preventDefault(); scrollToSection('certificate');}}>Certificate</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-theme" onClick={toggleTheme}>
              {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
          </div>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-bg-effects">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>
            <div className="hero-grid"></div>
        </div>
        <div className="container hero-content">
            <div className="hero-badge animate-in">
                <i className="fas fa-rocket"></i>
                <span>Learn. Build. Get Certified.</span>
            </div>
            <h1 className="hero-title animate-in">
                Become a <span className="gradient-text">Pixel Perfect</span><br/>
                Web Developer
            </h1>
            <p className="hero-subtitle animate-in">
                Master HTML, CSS, Bootstrap, JavaScript & more through interactive lessons, 
                hands-on projects, and earn your official certification.
            </p>
        </div>
      </section>

      <section className="section courses-section" id="courses">
        <div className="container">
          <div className="section-header animate-in">
            <span className="section-tag"><i className="fas fa-graduation-cap"></i> Learning Paths</span>
            <h2 className="section-title">Master These <span className="gradient-text">Technologies</span></h2>
          </div>
          <div className="courses-grid">
            {courses.map(course => {
              const totalItems = course.lessons.length + 1;
              const completedItems = course.lessons.filter(l => progress.completedLessons.includes(l.id)).length + 
                                     (progress.passedQuizzes.includes(course.id) ? 1 : 0);
              const progressPct = Math.round((completedItems / totalItems) * 100) || 0;
              return (
                <div key={course.id} className="course-card" onClick={() => openCourse(course)}>
                  <div className="course-icon" style={{background: 'rgba(255,255,255,0.05)', border: `1px solid ${course.accent}33`}} dangerouslySetInnerHTML={{__html: course.icon}}></div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-progress">
                    <div className="course-progress-fill" style={{width: `${progressPct}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Playground */}
      <section className="section playground-section" id="playground">
        <div className="container">
            <div className="section-header animate-in">
                <span className="section-tag"><i className="fas fa-code"></i> Live Playground</span>
                <h2 className="section-title">Code & See <span className="gradient-text">Instantly</span></h2>
            </div>
            <div className="playground-wrapper animate-in">
                <div className="playground-tabs">
                    <button className={`pg-tab ${pgTab === 'html' ? 'active' : ''}`} onClick={() => setPgTab('html')}><i className="fab fa-html5"></i> HTML</button>
                    <button className={`pg-tab ${pgTab === 'css' ? 'active' : ''}`} onClick={() => setPgTab('css')}><i className="fab fa-css3-alt"></i> CSS</button>
                    <button className={`pg-tab ${pgTab === 'js' ? 'active' : ''}`} onClick={() => setPgTab('js')}><i className="fab fa-js-square"></i> JS</button>
                    <button className="btn-primary btn-sm pg-run" onClick={runPlayground}><i className="fas fa-play"></i> Run</button>
                </div>
                <div className="playground-body">
                    <div className="playground-editors">
                        {pgTab === 'html' && <textarea value={pgHtml} onChange={(e) => setPgHtml(e.target.value)} spellCheck="false" style={{width: '100%', height: '100%', padding: '1rem', background: 'var(--bg)', color: 'var(--accent2)', border: 'none', resize: 'none'}}/>}
                        {pgTab === 'css' && <textarea value={pgCss} onChange={(e) => setPgCss(e.target.value)} spellCheck="false" style={{width: '100%', height: '100%', padding: '1rem', background: 'var(--bg)', color: 'var(--accent2)', border: 'none', resize: 'none'}}/>}
                        {pgTab === 'js' && <textarea value={pgJs} onChange={(e) => setPgJs(e.target.value)} spellCheck="false" style={{width: '100%', height: '100%', padding: '1rem', background: 'var(--bg)', color: 'var(--accent2)', border: 'none', resize: 'none'}}/>}
                    </div>
                    <div className="playground-preview">
                        <div className="preview-bar">
                            <span><i className="fas fa-eye"></i> Preview</span>
                        </div>
                        <iframe ref={iframeRef} sandbox="allow-scripts allow-modals" style={{width: '100%', height: '100%', border: 'none', background: '#fff'}}></iframe>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Progress */}
      <section className="section progress-section" id="progress">
        <div className="container">
            <div className="section-header animate-in">
                <span className="section-tag"><i className="fas fa-chart-line"></i> Dashboard</span>
                <h2 className="section-title">Your <span className="gradient-text">Progress</span></h2>
            </div>
            <div className="progress-dashboard animate-in">
                <div className="progress-overview">
                    <div className="progress-ring-card">
                        <div className="progress-ring-container">
                            <svg className="progress-ring" viewBox="0 0 120 120">
                                <circle className="progress-ring-bg" cx="60" cy="60" r="52"/>
                                <circle className="progress-ring-fill" cx="60" cy="60" r="52" style={{strokeDashoffset: 326.7 - (overallPct / 100) * 326.7}}/>
                            </svg>
                            <div className="progress-ring-text">
                                <span>{overallPct}%</span>
                                <small>Complete</small>
                            </div>
                        </div>
                        <h3>Overall Progress</h3>
                    </div>
                    <div className="progress-stats-grid">
                        <div className="pstat-card">
                            <i className="fas fa-book-open"></i>
                            <span>{completedL}</span>
                            <small>Lessons Done</small>
                        </div>
                        <div className="pstat-card">
                            <i className="fas fa-trophy"></i>
                            <span>{passedQ}</span>
                            <small>Quizzes Passed</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Certificate */}
      <section className="section certificate-section" id="certificate">
        <div className="container">
            <div className="section-header animate-in">
                <span className="section-tag"><i className="fas fa-award"></i> Certification</span>
                <h2 className="section-title">Earn Your <span className="gradient-text">Certificate</span></h2>
            </div>
            <div className="certificate-wrapper animate-in">
                <div className="cert-requirements">
                    <h3><i className="fas fa-list-check"></i> Requirements</h3>
                    <ul>
                        {courses.map(course => (
                          <li key={course.id} className={progress.passedQuizzes.includes(course.id) ? 'done' : ''}>
                              <i className={`fas ${progress.passedQuizzes.includes(course.id) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                              Pass {course.title} Quiz
                          </li>
                        ))}
                    </ul>
                </div>
                <div className="cert-preview">
                    <div className="cert-card" ref={certRef} style={{transition: 'all 0.5s'}}>
                        <div className="cert-border">
                            <div className="cert-inner">
                                <div className="cert-logo"><i className="fas fa-gem"></i></div>
                                <h2>Certificate of Achievement</h2>
                                <p className="cert-subtitle">PixelPerfect Academy</p>
                                <div className="cert-divider"></div>
                                <p className="cert-awarded">This certifies that</p>
                                <h1 className="cert-name" style={{fontSize: certName ? '1.8rem' : '1.2rem'}}>{certName || 'Your Name'}</h1>
                                <p className="cert-text">has successfully completed all courses and demonstrated proficiency</p>
                            </div>
                        </div>
                    </div>
                    {allQuizzesPassed ? (
                      <div className="cert-actions" style={{display: 'flex'}}>
                          <input type="text" placeholder="Enter your full name" className="cert-input" value={certName} onChange={(e) => setCertName(e.target.value)} />
                          <button className="btn-primary btn-lg" onClick={generateCertificate}><i className="fas fa-download"></i> Generate Certificate</button>
                      </div>
                    ) : (
                      <div className="cert-locked" style={{display: 'flex'}}>
                          <i className="fas fa-lock"></i>
                          <p>Complete all courses to unlock your certificate</p>
                          <div className="cert-locked-progress">
                              <div className="cert-locked-bar" style={{width: `${overallPct}%`}}></div>
                          </div>
                          <span>{overallPct}% Complete</span>
                      </div>
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* Modals and Lesson Views (from previous step) */}
      {isModalOpen && activeCourse && activeLesson === null && (
        <div className="modal-overlay active">
          <div className="modal">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            <div className="modal-header">
              <div className="modal-icon" dangerouslySetInnerHTML={{__html: activeCourse.icon}}></div>
              <div>
                <h2>{activeCourse.title}</h2>
                <p>{activeCourse.description}</p>
              </div>
            </div>
            <div className="modal-lessons">
              {activeCourse.lessons.map((lesson, idx) => (
                <div key={lesson.id} className={`lesson-item ${progress.completedLessons.includes(lesson.id) ? 'completed' : ''}`} onClick={() => setActiveLesson(idx)}>
                  <div className="lesson-check"><i className="fas fa-check"></i></div>
                  <div className="lesson-item-info">
                    <h4>{idx + 1}. {lesson.title}</h4>
                    <small>Lesson</small>
                  </div>
                </div>
              ))}
              <div className={`lesson-item ${progress.passedQuizzes.includes(activeCourse.id) ? 'completed' : ''}`} onClick={() => setActiveLesson('quiz')}>
                <div className="lesson-check"><i className="fas fa-check"></i></div>
                <div className="lesson-item-info">
                  <h4>Final Quiz</h4>
                  <small>Test your knowledge</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLesson !== null && activeCourse && (
        <div className="lesson-view active" style={{zIndex: 4000, background: 'var(--bg)'}}>
          <div className="lesson-topbar">
            <button className="btn-back" onClick={() => setActiveLesson(null)}><i className="fas fa-arrow-left"></i> Back</button>
            <h3>{activeLesson === 'quiz' ? 'Final Quiz' : activeCourse.lessons[activeLesson].title}</h3>
            {activeLesson !== 'quiz' && (
              <button 
                className="btn-primary btn-sm" 
                onClick={() => markLessonComplete(activeCourse.lessons[activeLesson].id)}
                disabled={progress.completedLessons.includes(activeCourse.lessons[activeLesson].id)}
              >
                {progress.completedLessons.includes(activeCourse.lessons[activeLesson].id) ? 'Completed' : 'Mark Complete'}
              </button>
            )}
          </div>
          <div className="lesson-body">
            {activeLesson !== 'quiz' ? (
              <div className="lesson-content" dangerouslySetInnerHTML={{__html: activeCourse.lessons[activeLesson].content}}></div>
            ) : (
              <div className="lesson-quiz">
                <h3><i className="fas fa-question-circle"></i> Quiz</h3>
                {progress.passedQuizzes.includes(activeCourse.id) ? (
                  <p>You have already passed this quiz!</p>
                ) : (
                  <div>
                    {activeCourse.quiz.map((q, qIndex) => (
                      <div key={qIndex} className="quiz-question">
                        <p>{qIndex + 1}. {q.question}</p>
                        <div className="quiz-options">
                          {q.options.map((opt, oIndex) => {
                            let className = "quiz-option";
                            if (quizSubmitted) {
                              if (oIndex === q.answer) className += " correct";
                              else if (quizAnswers[qIndex] === oIndex) className += " wrong";
                            }
                            return (
                              <label key={oIndex} className={className}>
                                <input 
                                  type="radio" 
                                  name={`q${qIndex}`} 
                                  value={oIndex}
                                  disabled={quizSubmitted}
                                  checked={quizAnswers[qIndex] === oIndex}
                                  onChange={() => setQuizAnswers(prev => ({...prev, [qIndex]: oIndex}))}
                                />
                                {opt}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!quizSubmitted ? (
                      <button className="btn-primary" onClick={handleQuizSubmit}>Submit Answers</button>
                    ) : (
                      <div style={{marginTop: '1rem'}}>
                        {quizScore === activeCourse.quiz.length ? (
                          <div style={{color: '#0c6'}}><h3><i className="fas fa-check-circle"></i> Perfect Score!</h3><p>You have passed the quiz for this course.</p></div>
                        ) : (
                          <div>
                            <h3 style={{color: '#f55'}}><i className="fas fa-times-circle"></i> Score: {quizScore}/{activeCourse.quiz.length}</h3>
                            <p>Review the materials and try again.</p>
                            <button className="btn-outline btn-sm" style={{marginTop: '1rem'}} onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>Retry Quiz</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
