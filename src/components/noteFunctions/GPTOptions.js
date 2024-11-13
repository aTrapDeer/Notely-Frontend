import React, { useState } from 'react';
import './GPTOptions.css';

function GPTOptions({ onSelect, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request to generate note:', { prompt });
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log('Received response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Parsed response data:', data);

      if (data.success) {
        onSelect(data.content);
        onClose();
      } else {
        setError(data.error || 'Failed to generate note content');
      }
    } catch (error) {
      console.error('Error generating note:', error);
      setError(error.message || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gpt-options-overlay">
      <div className="gpt-options-window">
        <h3>What would you like to write about?</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want GPT to write about..."
            rows={4}
          />
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="button-group">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !prompt.trim()}
              className="submit-button"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GPTOptions;
 