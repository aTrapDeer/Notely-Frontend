import React, { useState } from 'react';
import './GPTWrite.css'; // We can reuse the same CSS

function GPTFinish({ onSelect, onClose, currentContent }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamedContent, setStreamedContent] = useState('');

    const handleFinish = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setStreamedContent('');
        let fullContent = currentContent; // Start with existing content

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finish-note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ 
                    prompt: `Please finish this note naturally: ${currentContent}` 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
                            fullContent += data.content;
                            setStreamedContent(fullContent);
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
            console.error('Error finishing note:', error);
            setError(error.message || 'Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gpt-options-overlay">
            <div className="gpt-options-window">
                <h3>AI will finish your note</h3>
                <form onSubmit={handleFinish}>
                    <div className="current-content">
                        <h4>Current Note Content:</h4>
                        <div className="preview-content">
                            {currentContent}
                        </div>
                    </div>
                    
                    {streamedContent && (
                        <div className="preview-content">
                            <h4>AI Completion:</h4>
                            {streamedContent.slice(currentContent.length)}
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
                            disabled={isLoading}
                            className="submit-button"
                        >
                            {isLoading ? 'Finishing...' : 'Finish Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GPTFinish;