import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Components (Inline for simplicity or can be split)
const API_URL = 'http://localhost:5000/api';

function App() {
  const [theme, setTheme] = useState('dark');
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({ completedLessons: [], passedQuizzes: [] });
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); // index or 'quiz'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch courses and progress from backend
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          axios.get(`${API_URL}/courses`),
          axios.get(`${API_URL}/progress`)
        ]);
        setCourses(coursesRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const markLessonComplete = async (lessonId) => {
    try {
      const res = await axios.post(`${API_URL}/progress/lesson`, { lessonId });
      setProgress(res.data.progress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const markQuizPassed = async (courseId) => {
    try {
      const res = await axios.post(`${API_URL}/progress/quiz`, { courseId });
      setProgress(res.data.progress);
    } catch (error) {
      console.error("Error updating quiz progress:", error);
    }
  };

  const openCourse = (course) => {
    setActiveCourse(course);
    setIsModalOpen(true);
    setActiveLesson(null);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* SVG Defs */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C5CE7" />
                  <stop offset="100%" stopColor="#a29bfe" />
              </linearGradient>
          </defs>
      </svg>

      {/* Navbar */}
      <nav className="navbar scrolled">
        <div className="nav-container">
          <a href="#home" className="nav-logo" onClick={() => scrollToSection('home')}>
            <div className="logo-icon"><i className="fas fa-gem"></i></div>
            <span>Pixel<span className="logo-accent">Perfect</span></span>
          </a>
          <ul className="nav-links active" style={{display: 'flex', flexDirection: 'row', position: 'static', background: 'transparent', padding: 0, border: 'none'}}>
            <li><a href="#home" className="nav-link" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a href="#courses" className="nav-link" onClick={() => scrollToSection('courses')}>Courses</a></li>
            <li><a href="#playground" className="nav-link" onClick={() => scrollToSection('playground')}>Playground</a></li>
            <li><a href="#progress" className="nav-link" onClick={() => scrollToSection('progress')}>Progress</a></li>
            <li><a href="#certificate" className="nav-link" onClick={() => scrollToSection('certificate')}>Certificate</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-theme" onClick={toggleTheme}>
              {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-bg-effects">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>
            <div className="hero-grid"></div>
        </div>
        <div className="container hero-content">
            <div className="hero-badge animate-in visible">
                <i className="fas fa-rocket"></i>
                <span>Learn. Build. Get Certified.</span>
            </div>
            <h1 className="hero-title animate-in visible">
                Become a <span className="gradient-text">Pixel Perfect</span><br/>
                Web Developer
            </h1>
            <p className="hero-subtitle animate-in visible">
                Master HTML, CSS, Bootstrap, JavaScript & more through interactive lessons, 
                hands-on projects, and earn your official certification.
            </p>
        </div>
      </section>

      {/* Courses */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-header animate-in visible">
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

      {/* Playground component below... */}
      
      {/* Modal and Lesson View */}
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

      {/* View Lesson/Quiz */}
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
                        <p>{q.question}</p>
                        {/* Simplified quiz view for the demo */}
                        <button className="btn-outline btn-sm" onClick={() => markQuizPassed(activeCourse.id)}>Pass Quiz (Simulated)</button>
                      </div>
                    ))}
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
