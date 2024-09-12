import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import OptionsWindow from './noteFunctions/OptionsWindow';
import './NoteForm.css';

const mdParser = new MarkdownIt();

function NoteForm({ onSubmit, userDetails, workspaceTransform, onSimilarNotes, similarNotes }) {
    const [noteText, setNoteText] = useState('');
    const [debouncedNoteText, setDebouncedNoteText] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [showOptionsWindow, setShowOptionsWindow] = useState(false);
    const [state, setState] = useState({
        title: '',
        tags: [],
        visibility: 'global',
        organization: '',
        id: Math.random() * 10,
    });
    const editorRef = useRef(null);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Debounced function to update noteText
    const debouncedSetNoteText = useCallback(
        debounce((text) => {
            setDebouncedNoteText(text);
            if (userDetails && userDetails['USER#'] && state.visibility === 'global') {
                axios.post(`${process.env.REACT_APP_BACKEND_URL}/vectorize_and_search`, {
                    content: text,
                    userId: userDetails['USER#']
                })
                .then(response => {
                    const similarNotes = response.data.similar_notes;
                    onSimilarNotes(similarNotes);
                    if (similarNotes.length > 0) {
                        setRecommendation(similarNotes[0].content);
                    }
                })
                .catch(error => {
                    console.error('Error in vectorization and search:', error);
                });
            }
        }, 500),
        [userDetails, state.visibility, onSimilarNotes]
    );

    // Effect to send note content to backend for vectorization and similarity search
    useEffect(() => {
        if (debouncedNoteText && state.visibility === 'global') {
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/vectorize_and_search`, { 
                content: debouncedNoteText,
                userId: userDetails['USER#']
            })
            .then(response => {
                onSimilarNotes(response.data.similar_notes);
            })
            .catch(error => {
                console.error('Error in vectorization and search:', error);
            });
        }
    }, [debouncedNoteText, state.visibility, userDetails, onSimilarNotes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTagDelete = (index) => {
        setState({ ...state, tags: state.tags.filter((_, i) => i !== index) });
    };
      
    const handleTagChange = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (newTag && !state.tags.includes(newTag)) {
                setState(prevState => ({
                    ...prevState,
                    tags: [...prevState.tags, newTag]
                }));
                e.target.value = '';
            }
        }
    };

    const getSliderPosition = () => {
        switch (state.visibility) {
            case 'global':
                return 0;
            case 'organization':
                return 100;
            case 'private':
                return 200;
            default:
                return 0;
        }
    };

    const handleVisibilityChange = (visibility) => {
        setState({ ...state, visibility });
        // Calculate target position based on the newly selected option
        const sliderOptions = document.querySelectorAll('.slider-option');
        const activeIndex = [...sliderOptions].findIndex(option => option.classList.contains('active'));
        const targetPosition = activeIndex * 100; // Assuming each option takes up 1/3 of the width

        // Update slider-background style
        const sliderBackground = document.querySelector('.slider-background');
        sliderBackground.style.transform = `translateX(${targetPosition}%)`;
    };

    const handleEditorChange = ({ text }) => {
        const lines = text.split('\n');
        const updatedLines = lines.map(line => {
            if (line.trim().startsWith('/todo')) {
                return line.replace('/todo', '- [ ]');
            }
            return line;
        });
        let updatedText = updatedLines.join('\n');
        
        if (text.endsWith('\n')) {
            const lastTwoLines = updatedLines.slice(-2);
            if (lastTwoLines[0]?.startsWith('- [ ]')) {
                if (lastTwoLines[0] === '- [ ] ' || lastTwoLines[0] === '- [ ]') {
                    updatedText = updatedText.slice(0, -(lastTwoLines[0].length + 1)) + '\n\n';
                } else {
                    updatedText += '- [ ] ';
                }
            }
        }

        setNoteText(updatedText);
        debouncedSetNoteText(updatedText);

        if (updatedText !== text) {
            setTimeout(() => {
                editorRef.current.setText(updatedText);
            }, 0);
        }
        
        const lastLine = updatedLines[updatedLines.length - 1];
        const words = lastLine.split(' ');
        const lastWord = words[words.length - 1];

        if (lastWord === '/') {
            setShowOptionsWindow(true);
        } else if (lastWord.startsWith('/') && lastWord !== '/todo') {
            setShowOptionsWindow(true);
        } else {
            setShowOptionsWindow(false);
        }
    };

    const renderHTML = (text) => {
        return mdParser.render(text)
            .replace(/<li>\[ \]/g, '<li class="checkbox-item"><input type="checkbox" disabled>')
            .replace(/<li>\[x\]/g, '<li class="checkbox-item"><input type="checkbox" checked disabled>')
            .replace(/<\/li>/g, '</li>');
    };

    const handleOptionSelect = (option) => {
        let updatedText = noteText;
        const lines = updatedText.split('\n');
        const lastLine = lines[lines.length - 1];
        const words = lastLine.split(' ');
        const lastWord = words[words.length - 1];

        switch (option) {
            case 'checkbox':
            case 'todo':
                if (lastWord.startsWith('/')) {
                    words[words.length - 1] = '- [ ] ';
                    lines[lines.length - 1] = words.join(' ');
                    updatedText = lines.join('\n');
                }
                break;
            // Add more cases for other options
        }
        setNoteText(updatedText);
        setShowOptionsWindow(false);
        editorRef.current.setText(updatedText);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!noteText.trim()) {
            console.error('Note content is empty');
            return;
        }
        
        const noteData = {
            userId: userDetails['USER#'],
            noteId: uuidv4(),
            title: state.title,
            tags: state.tags,
            content: noteText,
            privacyType: state.visibility,
            organization: state.organization,

            positionX: workspaceTransform.x,
            positionY: workspaceTransform.y
        };
        console.log("Testing note data post")
        console.log(noteData)
        onSubmit(noteData);
        
        setState({
            title: '',
            tags: [],
            visibility: 'private',
            organization: '',
            id: Math.random() * 10,
        });
        setNoteText('');
    };

    return (
        <div className="create-notes w-full max-w-4xl mx-auto mt-40"> {/* Increased top margin significantly */}
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    name="title"
                    className="border-2 border-blue-200 p-2 rounded"
                    onChange={handleChange}
                    value={state.title}
                />
                
                <div className="tag-input">
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        name="tags"
                        className="border-2 border-blue-200 p-2 rounded w-full"
                        onKeyDown={handleTagChange}
                    />
                    <div className="tag-list mt-2 flex flex-wrap">
                        {state.tags.map((tag, index) => (
                            <span key={index} className="tag bg-blue-100 px-2 py-1 rounded mr-2 mb-2">
                                {tag}
                                <button
                                    type="button"
                                    className="delete-tag ml-2 text-red-500"
                                    onClick={() => handleTagDelete(index)}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {showOptionsWindow && (
                    <OptionsWindow
                        onSelect={(option) => {
                            const updatedNoteContent = noteText.replace('@/', `@/${option}`);
                            setNoteText(updatedNoteContent);
                            setShowOptionsWindow(false);
                        }}
                    />
                )}

                <div className="relative">
                    <MdEditor
                        ref={editorRef}
                        value={noteText}
                        style={{ height: '400px' }}
                        renderHTML={renderHTML}
                        onChange={handleEditorChange}
                    />
                    {similarNotes.length > 0 && (
                        <div className="recommendations mt-4 bg-gray-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Similar Notes:</h3>
                            <ul className="space-y-4">
                                {similarNotes.map((note, index) => (
                                    <li key={index} className="bg-white p-3 rounded shadow">
                                        <h4 className="font-medium">{note.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            Similarity: {(note.similarity * 100).toFixed(2)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {showOptionsWindow && (
                        <OptionsWindow
                        onSelect={handleOptionSelect}
                        showOptionsWindow={showOptionsWindow}
                        />
                    )}
                </div>
                
                <div className="content-type">
                    <div className="slider-container">
                        <div
                            className={`slider-option ${state.visibility === 'global' ? 'active' : ''}`}
                            onClick={() => handleVisibilityChange('global')}
                        >
                            <span className="slider-label">Global (Public)</span>
                        </div>
                        <div
                            className={`slider-option ${state.visibility === 'organization' ? 'active' : ''}`}
                            onClick={() => handleVisibilityChange('organization')}
                        >
                            <span className="slider-label">Organization</span>
                        </div>
                        <div
                            className={`slider-option ${state.visibility === 'private' ? 'active' : ''}`}
                            onClick={() => handleVisibilityChange('private')}
                        >
                            <span className="slider-label">Private</span>
                        </div>
                        <div className="slider-background" style={{ transform: `translateX(${getSliderPosition()}%)` }}></div>
                    </div>
                    {state.visibility === 'organization' && (
                        <input
                            type="text"
                            placeholder="Organization"
                            name="organization"
                            className="organization-input"
                            onChange={handleChange}
                            value={state.organization}
                        />
                    )}
                </div>

                <button type="submit" className="note-button">
                    Add Note
                </button>
            </form>
        </div>
    );
}

export default NoteForm;