import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <motion.div 
          className="nav-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="nav-logo">Notely</Link>
          <div className="nav-links">
            <Link to="#features">Features</Link>
            <Link to="#pricing">Pricing</Link>
            <Link to="/app" className="nav-cta">Get Started</Link>
          </div>
        </motion.div>
      </nav>

      <div className="landing-container">
        <motion.header 
          className="landing-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-content">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Transform Your <span className="gradient-text">Notes</span><br />
              with AI-Powered Insights
            </motion.h1>
            <motion.div 
              className="hero-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="hero-description">Experience the future of note-taking with our intelligent platform that connects your thoughts and amplifies your productivity.</p>
              <div className="hero-actions">
                <Link to="/app" className="primary-button">
                  Start Free Trial
                  <span className="button-icon">→</span>
                </Link>
                <Link to="#demo" className="secondary-button">
                  Watch Demo
                  <span className="button-icon">▶</span>
                </Link>
              </div>
            </motion.div>
          </div>
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1M+</span>
              <span className="stat-label">Notes Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">User Rating</span>
            </div>
          </motion.div>
        </motion.header>

        <motion.section 
          id="pricing"
          className="pricing-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Choose Your Plan</h2>
          <div className="pricing-cards">
            {[
              {
                name: 'Free',
                price: '0',
                period: 'forever',
                features: [
                  'AI Community Note Connections',
                  'Up to 100 notes storage',
                  'Personal use only',
                  'Basic AI features'
                ],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Premium',
                price: '10',
                period: 'per month',
                features: [
                  'Unlimited note storage',
                  'Advanced AI features',
                  'Collaboration tools',
                  'Priority support',
                  'Custom organization'
                ],
                cta: 'Start Free Trial',
                popular: true
              }
            ].map((plan, index) => (
              <motion.div 
                key={plan.name}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <div className="price-tag">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/{plan.period}</span>
                </div>
                <ul className="feature-list">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/app" className={`pricing-cta ${plan.popular ? 'primary' : 'secondary'}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          id="features"
          className="features-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Why Choose Notely</h2>
          <div className="features-grid">
            {[
              {
                icon: '🔮',
                title: 'AI-Powered Insights',
                description: 'Our advanced AI analyzes your notes to surface connections and generate valuable insights automatically.'
              },
              {
                icon: '🔄',
                title: 'Real-time Sync',
                description: 'Your notes stay synchronized across all your devices, ensuring you never miss an important thought.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'Enterprise-grade encryption and local storage options keep your data secure and private.'
              },
              {
                icon: '🤝',
                title: 'Collaborative Features',
                description: 'Share and collaborate on notes with team members while maintaining granular access control.'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer 
          className="landing-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="footer-content">
            <div className="footer-cta">
              <h2>Ready to Transform Your Note-Taking?</h2>
              <p>Join thousands of users who have already revolutionized their workflow with Notely.</p>
              <Link to="/app" className="primary-button">
                Start Free Trial
                <span className="button-icon">→</span>
              </Link>
            </div>
            <div className="footer-info">
              <p>© 2023 Notely. All rights reserved.</p>
              <div className="footer-links">
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default Landing;