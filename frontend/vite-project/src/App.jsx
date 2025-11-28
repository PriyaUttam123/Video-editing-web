import { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'templates', label: 'Templates' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span>VideoEdit</span>Pro
          </div>
          
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsMenuOpen(false);
                }}
              >
                {link.label}
                <span className="nav-link-underline"></span>
              </a>
            ))}
          </div>
          
          <div className="auth-buttons">
            <button className="btn btn-outline">Login</button>
            <button className="btn btn-primary">Sign Up</button>
          </div>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </nav>
      
      <main>
        <ImageUpload />
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} VideoEditPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
