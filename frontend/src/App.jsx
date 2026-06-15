import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ComparePage from './pages/ComparePage';
import AboutPage from './pages/AboutPage';
import './index.css';

// Ensure we use the proper basename configured in Vite / package.json.
// When deployed, the subpath is /aipcvl
const basename = '/aipcvl';

function Navigation() {
  const location = useLocation();
  return (
    <nav className="top-nav">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>AIPCVL</h1>
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          评测任务
        </Link>
        <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>
          对比分析
        </Link>
        <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
          关于项目
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router basename={basename}>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
