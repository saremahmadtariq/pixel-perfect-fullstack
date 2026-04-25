const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Database
const coursesData = [
  {
    id: "html",
    title: "HTML5 Fundamentals",
    description: "Learn the foundation of the web. Master semantic HTML, forms, and accessibility.",
    icon: "fab fa-html5",
    accent: "#E34F26",
    lessons: [
      {
        id: "html-1",
        title: "Introduction to HTML",
        content: "<h2>What is HTML?</h2><p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page semantically.</p><h3>Basic Structure</h3><p>Every HTML document has a basic structure:</p><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang=\"en\"&gt;\n&lt;head&gt;\n    &lt;meta charset=\"UTF-8\"&gt;\n    &lt;title&gt;Page Title&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n    &lt;h1&gt;My First Heading&lt;/h1&gt;\n    &lt;p&gt;My first paragraph.&lt;/p&gt;\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><p>The <code>&lt;!DOCTYPE html&gt;</code> declaration defines that this document is an HTML5 document.</p>"
      },
      {
        id: "html-2",
        title: "Semantic HTML",
        content: "<h2>Semantic Elements</h2><p>Semantic elements clearly describe their meaning to both the browser and the developer. Examples include:</p><ul><li><code>&lt;header&gt;</code> - Defines a header for a document or section</li><li><code>&lt;nav&gt;</code> - Defines a set of navigation links</li><li><code>&lt;main&gt;</code> - Specifies the main content of a document</li><li><code>&lt;article&gt;</code> - Defines an independent, self-contained content</li><li><code>&lt;section&gt;</code> - Defines a section in a document</li><li><code>&lt;footer&gt;</code> - Defines a footer for a document or section</li></ul>"
      }
    ],
    quiz: [
      {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"],
        answer: 0
      },
      {
        question: "Choose the correct HTML element for the largest heading:",
        options: ["<heading>", "<h6>", "<h1>", "<head>"],
        answer: 2
      }
    ]
  },
  {
    id: "css",
    title: "CSS3 Mastery",
    description: "Style your web pages with modern CSS. Learn Flexbox, Grid, and animations.",
    icon: "fab fa-css3-alt",
    accent: "#1572B6",
    lessons: [
      {
        id: "css-1",
        title: "CSS Selectors & Colors",
        content: "<h2>CSS Selectors</h2><p>CSS selectors are used to \"find\" (or select) the HTML elements you want to style.</p><ul><li><strong>Element Selector:</strong> <code>p { color: red; }</code></li><li><strong>ID Selector:</strong> <code>#myId { padding: 10px; }</code></li><li><strong>Class Selector:</strong> <code>.myClass { margin: 5px; }</code></li></ul>"
      },
      {
        id: "css-2",
        title: "Flexbox Layout",
        content: "<h2>Flexbox Basics</h2><p>The Flexible Box Layout Module, makes it easier to design flexible responsive layout structure without using float or positioning.</p><pre><code>.container {\n  display: flex;\n  justify-content: center; /* align horizontal */\n  align-items: center; /* align vertical */\n}</code></pre>"
      }
    ],
    quiz: [
      {
        question: "What does CSS stand for?",
        options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"],
        answer: 1
      },
      {
        question: "Which property is used to change the background color?",
        options: ["color", "bgcolor", "background-color"],
        answer: 2
      }
    ]
  },
  {
    id: "bootstrap",
    title: "Bootstrap 5",
    description: "Build responsive, mobile-first projects on the web with the world's most popular front-end component library.",
    icon: "fab fa-bootstrap",
    accent: "#7952B3",
    lessons: [
      {
        id: "bs-1",
        title: "Grid System",
        content: "<h2>Bootstrap Grid System</h2><p>Bootstrap's grid system uses a series of containers, rows, and columns to layout and align content. It's built with flexbox and is fully responsive.</p><pre><code>&lt;div class=\"container\"&gt;\n  &lt;div class=\"row\"&gt;\n    &lt;div class=\"col-sm\"&gt;One of three columns&lt;/div&gt;\n    &lt;div class=\"col-sm\"&gt;One of three columns&lt;/div&gt;\n    &lt;div class=\"col-sm\"&gt;One of three columns&lt;/div&gt;\n  &lt;/div&gt;\n&lt;/div&gt;</code></pre>"
      }
    ],
    quiz: [
      {
        question: "In Bootstrap, which class provides a responsive fixed width container?",
        options: [".container-fluid", ".container", ".container-fixed"],
        answer: 1
      }
    ]
  },
  {
    id: "js",
    title: "JavaScript Essentials",
    description: "Add interactivity to your site. Learn variables, functions, and DOM manipulation.",
    icon: "fab fa-js-square",
    accent: "#F7DF1E",
    lessons: [
      {
        id: "js-1",
        title: "Variables & Data Types",
        content: "<h2>Variables in JavaScript</h2><p>Use <code>let</code> and <code>const</code> to declare variables.</p><pre><code>const name = \"PixelPerfect\";\nlet score = 100;\nscore += 10; // score is now 110</code></pre>"
      },
      {
        id: "js-2",
        title: "Functions",
        content: "<h2>Defining Functions</h2><p>Functions are reusable blocks of code.</p><pre><code>function greet(name) {\n  return \"Hello, \" + name + \"!\";\n}\n\n// Arrow function syntax\nconst add = (a, b) => a + b;</code></pre>"
      }
    ],
    quiz: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        options: ["<script>", "<js>", "<javascript>", "<scripting>"],
        answer: 0
      },
      {
        question: "How do you declare a variable that cannot be reassigned?",
        options: ["var", "let", "const"],
        answer: 2
      }
    ]
  }
];

let userProgress = {
  completedLessons: [],
  passedQuizzes: []
};

// Routes
app.get('/api/courses', (req, res) => {
  res.json(coursesData);
});

app.get('/api/progress', (req, res) => {
  res.json(userProgress);
});

app.post('/api/progress/lesson', (req, res) => {
  const { lessonId } = req.body;
  if (!userProgress.completedLessons.includes(lessonId)) {
    userProgress.completedLessons.push(lessonId);
  }
  res.json({ success: true, progress: userProgress });
});

app.post('/api/progress/quiz', (req, res) => {
  const { courseId } = req.body;
  if (!userProgress.passedQuizzes.includes(courseId)) {
    userProgress.passedQuizzes.push(courseId);
  }
  res.json({ success: true, progress: userProgress });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
