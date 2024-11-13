import React, { useState } from 'react';
import './GPTOptions.css';

function GPTOptions({ onSelect, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamedContent, setStreamedContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStreamedContent('');
    let fullContent = ''; // Track the complete content

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              fullContent += data.content; // Add to full content
              setStreamedContent(fullContent); // Show in preview
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        });
      }

      // Once streaming is complete, update the note and close
      onSelect(fullContent);
      onClose();
    } catch (error) {
      console.error('Error generating note:', error);
      setError(error.message || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Add touch event handlers
  const handleOverlayTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="gpt-options-overlay" 
      onTouchMove={handleOverlayTouch}
      onClick={(e) => {
        if (e.target.className === 'gpt-options-overlay') {
          onClose();
        }
      }}
    >
      <div className="gpt-options-window" onClick={e => e.stopPropagation()}>
        <h3>What would you like to write about?</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want GPT to write about..."
            rows={4}
          />
          {streamedContent && (
            <div className="preview-content">
              {streamedContent}
            </div>
          )}
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
 