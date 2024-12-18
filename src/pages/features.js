import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Features.css';

const FeatureSection = ({ title, description, features, reversed }) => (
  <motion.div 
    className={`feature-section ${reversed ? 'reversed' : ''}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className="feature-content">
      <h2>{title}</h2>
      <p className="feature-description">{description}</p>
      <ul className="feature-list">
        {features.map((feature, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <span className="feature-bullet">•</span>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
    </div>
    <div className="feature-visual">
      <div className={`feature-card ${reversed ? 'right' : 'left'}`}>
        <div className="feature-icon">{title.split(' ')[0]} 🚀</div>
      </div>
    </div>
  </motion.div>
);

function Features() {
  const featureSections = [
    {
      title: "AI-Powered Writing",
      description: "Experience the future of note-taking with our advanced AI writing assistance that helps you capture and develop your ideas effortlessly.",
      features: [
        "Smart completion suggestions as you type",
        "AI-powered content generation and ideation",
        "Context-aware writing recommendations",
        "Automatic grammar and style improvements"
      ]
    },
    {
      title: "Intelligent Organization",
      description: "Keep your thoughts organized with our intuitive workspace management and smart organization features.",
      features: [
        "Visual workspace board for spatial organization",
        "Drag-and-drop note arrangement",
        "Automatic note categorization",
        "Custom tagging and filtering system"
      ]
    },
    {
      title: "Smart Connections",
      description: "Discover hidden insights and relationships between your notes with our intelligent connection features.",
      features: [
        "Automatic note linking suggestions",
        "Related content recommendations",
        "Knowledge graph visualization",
        "Cross-reference detection"
      ]
    },
    {
      title: "Powerful Search",
      description: "Find exactly what you're looking for with our advanced search capabilities and intelligent filtering.",
      features: [
        "Natural language search queries",
        "Content-aware search results",
        "Real-time search suggestions",
        "Advanced filtering options"
      ]
    },
    {
      title: "Seamless Integration",
      description: "Import and manage your notes from various sources with our comprehensive integration features.",
      features: [
        "One-click note importing",
        "Support for multiple file formats",
        "Third-party app integration",
        "Automatic content organization"
      ]
    }
  ];

  return (
    <div className="features-page">
      <nav className="landing-nav">
        <motion.div 
          className="nav-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="nav-logo">Notely</Link>
          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/app" className="nav-cta">Get Started</Link>
          </div>
        </motion.div>
      </nav>

      <motion.div 
        className="features-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1>
          Powerful Features for
          <span className="gradient-text"> Smarter Note-Taking</span>
        </h1>
        <p>Discover how Notely transforms your note-taking experience with cutting-edge AI and intuitive organization tools.</p>
        <Link to="/app" className="cta-button">
          Try Notely Free
          <span className="arrow">→</span>
        </Link>
      </motion.div>

      <div className="features-container">
        {featureSections.map((section, index) => (
          <FeatureSection 
            key={index}
            {...section}
            reversed={index % 2 !== 0}
          />
        ))}
      </div>

      <motion.div 
        className="features-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Ready to Transform Your Note-Taking?</h2>
        <p>Join thousands of users who have already revolutionized their workflow with Notely.</p>
        <div className="cta-buttons">
          <Link to="/app" className="primary-button">
            Start Free Trial
            <span className="button-icon">→</span>
          </Link>
          <Link to="/pricing" className="secondary-button">
            View Pricing
            <span className="button-icon">↗</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Features;
