import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <motion.header 
          className="landing-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Notely</h1>
          <motion.div 
            className="hero-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2>Your Community AI-Powered Note-Taking Service</h2>
            <p>Revolutionize your note-taking experience with AI-driven insights and seamless organization 🧠✍️</p>
            <Link to="/app" className="landing-button">Try For Free Now</Link>
          </motion.div>
        </motion.header>

        <motion.section 
          className="plan-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2>Choose Your Plan</h2>
          <div className="plan-cards">
            {['Free Version', 'Premium Version'].map((plan, index) => (
              <motion.div 
                key={plan} 
                className="plan-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>{plan}</h3>
                <p>{index === 0 ? 'Get started with limited access to our amazing features' : 'Unlock the full potential of NoteGenius'}</p>
                <ul>
                  {index === 0 ? 
                    ['AI Community Note Connections', 'Up to 100 notes storage', 'Personal use only'].map((feature, i) => (
                      <li key={i}>{feature}</li>
                    )) :
                    ['All AI features', 'Unlimited note storage', 'Collaboration tools', 'Unlimited Organizations', 'Priority support'].map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))
                  }
                </ul>
                <p className="price">{index === 0 ? 'Free' : '$10/month'}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="features-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2>Features That Set Us Apart</h2>
          <div className="feature-grid">
            {[
              { icon: '🔗', title: 'Smart Note Connections', description: 'Our AI-powered NLP system intelligently connects all your notes, creating a web of knowledge for deeper insights and easier recall.' },
              { icon: '🌍', title: 'Flexible Sharing Options', description: 'Share your brilliance with the world, your organization, or keep it private. You\'re in control of your knowledge.' },
              { icon: '💾', title: 'Local Storage Control', description: 'Keep your notes close and secure. Save locally to your machine for complete data control and offline access.' },
              { icon: '🧠', title: 'AI Training Management', description: 'Curate and manage the notes and data you\'ve used to train our AI, ensuring your digital brain evolves with you.' }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-item"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(98, 0, 234, 0.1)' }}
              >
                <span className="feature-icon">{feature.icon}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer 
          className="landing-footer"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p>Perfect for students 📚, businesses 💼, and personal use 🏠</p>
          <Link to="/app" className="landing-button primary">Start Your Free Trial Today!</Link>
        </motion.footer>
      </div>
    </div>
  );
}

export default Landing;