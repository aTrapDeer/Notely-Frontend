import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Landing from './pages/landing';
import reportWebVitals from './reportWebVitals';
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';  
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/app" 
          element={
            <Authenticator>
              {({ signOut, user }) => (
                user ? <App signOut={signOut} user={user} /> : <Navigate to="/" />
              )}
            </Authenticator>
          } 
        />
      </Routes>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();