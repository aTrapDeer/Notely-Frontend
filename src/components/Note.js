import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import WorkspaceContext from './WorkspaceContext'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { debounce } from 'lodash';
import './Note.css';

const Note = ({ 
  note, 
  onDeleteClick, 
  onEdit, 
  workspaceRef, 
  zoomLevel
}) => {
  const { setDisableWorkspaceDrag } = useContext(WorkspaceContext);
  const noteRef = useRef(null);
  const editButtonRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editedNote, setEditedNote] = useState(note);
  const [isEditing, setIsEditing] = useState(false);
  
  const [size, setSize] = useState({ width: note.width || 300, height: note.height || 390 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const [position, setPosition] = useState({
    x: note.positionX || 0,
    y: note.positionY || 0,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeEdge, setActiveEdge] = useState(null);

  const debouncedEdit = useCallback(
    debounce((updatedNote) => {
      onEdit(updatedNote);
    }, 500),
    [onEdit]
  );

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    if (!isEditing && e.touches.length === 1) {
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      const { left, top, right, bottom } = noteRef.current.getBoundingClientRect();
      const grabAreaWidth = 30;
      const grabAreaHeight = 50;
  
      // Define the resize handle area
      const resizeHandleWidth = 25;
      const resizeHandleHeight = 25; // Match CSS height
      const isInResizeHandle = 
        clientX >= right - resizeHandleWidth && 
        clientY >= bottom - resizeHandleHeight;
  
      if (isInResizeHandle) {
        // Do not initiate dragging if in resize handle
        return;
      }
  
      const isInGrabArea =
        clientX - left < grabAreaWidth || 
        right - clientX < grabAreaWidth || 
        clientY - top < grabAreaHeight;
  
      if (isInGrabArea) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setOffset({
          x: (clientX - left) / zoomLevel,
          y: (clientY - top) / zoomLevel,
        });
        setDisableWorkspaceDrag(true); 
      }
    }
  }, [isEditing, zoomLevel, setDisableWorkspaceDrag]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches.length === 1 && workspaceRef && workspaceRef.current) {
      // Existing dragging logic
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      const { left, top } = workspaceRef.current.getBoundingClientRect();
      const workspaceX = (clientX - left) / zoomLevel;
      const workspaceY = (clientY - top) / zoomLevel;
      const newPosition = {
        x: workspaceX - offset.x,
        y: workspaceY - offset.y
      };
      setPosition({
        x: Math.round(newPosition.x),
        y: Math.round(newPosition.y)
      });
      debouncedEdit({ ...note, positionX: newPosition.x, positionY: newPosition.y });
    }
  
    if (isResizing && e.touches.length === 1 && workspaceRef && workspaceRef.current) {
      // Resizing logic
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      const { left, top } = workspaceRef.current.getBoundingClientRect();
      const newWidth = (clientX - left) / zoomLevel - position.x;
      const newHeight = (clientY - top) / zoomLevel - position.y;
      
      const minWidth = editButtonRef.current ? editButtonRef.current.offsetWidth + 20 : 100;
      const minHeight = editButtonRef.current ? editButtonRef.current.offsetHeight + 20 : 50;
  
      setSize({ 
        width: Math.max(minWidth, newWidth), 
        height: Math.max(minHeight, newHeight) 
      });
    }
  }, [isDragging, isResizing, workspaceRef, zoomLevel, offset, position, note, debouncedEdit, editButtonRef]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDisableWorkspaceDrag(false); 
    }
    if (isResizing) {
      setIsResizing(false);
      setDisableWorkspaceDrag(false); 
      onEdit({ ...note, width: size.width, height: size.height });
    }
  }, [isDragging, isResizing, setDisableWorkspaceDrag, onEdit, note, size]);

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setOffset({
      x: e.clientX - noteRef.current.getBoundingClientRect().left,
      y: e.clientY - noteRef.current.getBoundingClientRect().top,
    });
    setDisableWorkspaceDrag(true);
  }, [setDisableWorkspaceDrag]);

  const handleResizeMouseMove = useCallback((e) => {
    if (isResizing && workspaceRef && workspaceRef.current) {
      const { clientX, clientY } = e;
      const { left, top } = workspaceRef.current.getBoundingClientRect();
      const newWidth = (clientX - left) / zoomLevel - position.x;
      const newHeight = (clientY - top) / zoomLevel - position.y;
      
      // Get the minimum width based on the Edit Note button
      const minWidth = editButtonRef.current ? editButtonRef.current.offsetWidth + 20 : 100;
      const minHeight = editButtonRef.current ? editButtonRef.current.offsetHeight + 20 : 50;

      setSize({ 
        width: Math.max(minWidth, newWidth), 
        height: Math.max(minHeight, newHeight) 
      });
    }
  }, [isResizing, workspaceRef, zoomLevel, position, editButtonRef]);

  const handleResizeMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setDisableWorkspaceDrag(false);
      onEdit({ ...note, width: size.width, height: size.height });
    }
  }, [isResizing, size, note, onEdit, setDisableWorkspaceDrag]);

  const renderContent = (content, handleCheckboxChange) => {
    const renderCheckbox = (props) => {
      const { node } = props;
      const line = node.children[0].value;
      const isChecked = line.startsWith('[x]');
      const label = line.slice(3).trim();
      const index = node.position.start.line - 1; // Markdown lines are 1-indexed

      return (
        <div className="checkbox-item">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleCheckboxChange(index)}
            className="checkbox"
          />
          <span className={isChecked ? 'checkbox-label checked' : 'checkbox-label'}>
            {label}
          </span>
        </div>
      );
    };

    return (
      <div className="note-content">
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={solarizedlight}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            li: ({ node, ...props }) => {
              let content = '';
              if (node.children && node.children[0]) {
                if (node.children[0].type === 'paragraph') {
                  content = node.children[0].children[0].value;
                } else if (node.children[0].type === 'text') {
                  content = node.children[0].value;
                }
              }
              if (content && (content.startsWith('[ ]') || content.startsWith('[x]'))) {
                return renderCheckbox({ node, ...props });
              }
              return <li {...props} />;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const handleCheckboxChange = (index) => {
    const lines = note.content.split('\n');
    const line = lines[index];
    if (line.startsWith('- [ ]')) {
      lines[index] = line.replace('- [ ]', '- [x]');
    } else if (line.startsWith('- [x]')) {
      lines[index] = line.replace('- [x]', '- [ ]');
    }
    const updatedContent = lines.join('\n');
    const updatedNote = { ...note, content: updatedContent };
    onEdit(updatedNote);
    debouncedEdit(updatedNote);
  };
  
  const handleMouseDown = useCallback((event) => {
    if (!isEditing) {
      const { clientX, clientY } = event;
      const { left, top, right, bottom } = noteRef.current.getBoundingClientRect();
      const grabAreaWidth = 30; 
      const grabAreaHeight = 50; 

      const isInGrabArea =
        clientX - left < grabAreaWidth || 
        right - clientX < grabAreaWidth || // Right side
        clientY - top < grabAreaHeight; 

      if (isInGrabArea) {
        event.preventDefault();
        event.stopPropagation(); 
        setIsDragging(true);
        setOffset({
          x: (clientX - left) / zoomLevel,
          y: (clientY - top) / zoomLevel,
        });
        setDisableWorkspaceDrag(true);
      }
    }
  }, [isEditing, zoomLevel, setDisableWorkspaceDrag]);

  const handleMouseMove = useCallback((event) => {
    if (isDragging && workspaceRef && workspaceRef.current) {
      const { clientX, clientY } = event;
      const { left, top } = workspaceRef.current.getBoundingClientRect();
      const workspaceX = (clientX - left) / zoomLevel;
      const workspaceY = (clientY - top) / zoomLevel;
      const newPosition = { 
        x: workspaceX - offset.x, 
        y: workspaceY - offset.y 
      };
      setPosition({
        x: Math.round(newPosition.x),
        y: Math.round(newPosition.y)
      });
      debouncedEdit({ ...note, positionX: newPosition.x, positionY: newPosition.y });
    }
  }, [isDragging, workspaceRef, zoomLevel, offset, note, debouncedEdit]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDisableWorkspaceDrag(false);
    }
  }, [isDragging, setDisableWorkspaceDrag]);

  // Edge detection for cursor changes
  const handleMouseMoveEdgeDetection = useCallback(
    (e) => {
      if (!noteRef.current) return;

      const { clientX, clientY } = e;
      const { left, top, right, bottom } = noteRef.current.getBoundingClientRect();
      const edgeThreshold = 30;
      const topThreshold = 50;

      let newActiveEdge = null;

      if (clientY - top < topThreshold) {
        newActiveEdge = 'top';
      } else if (bottom - clientY < edgeThreshold) {
        newActiveEdge = 'bottom';
      } else if (clientX - left < edgeThreshold) {
        newActiveEdge = 'left';
      } else if (right - clientX < edgeThreshold) {
        newActiveEdge = 'right';
      }

      if (newActiveEdge !== activeEdge) {
        setActiveEdge(newActiveEdge);
        console.log('Active Edge:', newActiveEdge);
      }
    },
    [activeEdge]
  );

  // Reset active edge when mouse leaves the note
  const handleMouseLeave = useCallback(() => {
    setActiveEdge(null);
  }, []);

  // Unified event listeners for mouse and touch events
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isResizing) {
        handleResizeMouseMove(e);
      } else {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (isResizing) {
        handleResizeMouseUp(e);
      } else {
        handleMouseUp(e);
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); 
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleTouchMove); 
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp, handleTouchMove, handleTouchEnd, isResizing]);

  useEffect(() => {
    setSize({ width: note.width || 300, height: note.height || 390 });
    setPosition({ x: note.positionX || 0, y: note.positionY || 0 });
  }, [note]);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedNote({ ...note });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setEditedNote({ ...editedNote, [name]: value.split(',').map(tag => tag.trim()) });
    } else {
      setEditedNote({ ...editedNote, [name]: value });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editedNote);
    debouncedEdit(editedNote);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedNote(note);
  };

  const handleTagDelete = (index) => {
    const updatedTags = editedNote.tags.filter((_, i) => i !== index);
    setEditedNote({ ...editedNote, tags: updatedTags });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(note.id); 
  };

  const renderMarkdown = (content) => {
    return content.replace(/- \[ \]/g, '☐').replace(/- \[x\]/g, '☑');
  };

  return (
    <div
      ref={noteRef}
      className="note"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging
            ? 'grabbing'
            : activeEdge
              ? 'grab'
              : 'default',
        transform: isDragging ? 'rotate(5deg) scale(1.05)' : 'none',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        zIndex: isDragging ? 998 : 'auto', // Ensure this is lower than TopBar's z-index
        minWidth: '350px',
        maxWidth: '1000px',
        transformOrigin: 'top left',
        minHeight: '390px',
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: 'white',
        padding: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '5px',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMoveEdgeDetection}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`note-highlight note-highlight-top ${activeEdge === 'top' ? 'active' : ''}`} />
      <div className={`note-highlight note-highlight-left ${activeEdge === 'left' ? 'active' : ''}`} />
      <div className={`note-highlight note-highlight-right ${activeEdge === 'right' ? 'active' : ''}`} />
      <div className={`note-highlight note-highlight-bottom ${activeEdge === 'bottom' ? 'active' : ''}`} />

      {/* Bottom Drag Handle */}
      <div
        className="bottom-drag-handle"
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent triggering parent handlers
          if (!isEditing) {
            const { clientX, clientY } = e;
            const { left, top } = noteRef.current.getBoundingClientRect();

            setIsDragging(true);
            setOffset({
              x: (clientX - left) / zoomLevel,
              y: (clientY - top) / zoomLevel,
            });
            setDisableWorkspaceDrag(true);
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation(); // Prevent triggering parent handlers
          if (!isEditing && e.touches.length === 1) {
            const touch = e.touches[0];
            const { clientX, clientY } = touch;
            const { left, top } = noteRef.current.getBoundingClientRect();

            setIsDragging(true);
            setOffset({
              x: (clientX - left) / zoomLevel,
              y: (clientY - top) / zoomLevel,
            });
            setDisableWorkspaceDrag(true);
          }
        }}
      />

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="resize-handle"
        onMouseDown={handleResizeMouseDown}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);
          const touch = e.touches[0];
          setOffset({
            x: (touch.clientX - noteRef.current.getBoundingClientRect().left) / zoomLevel,
            y: (touch.clientY - noteRef.current.getBoundingClientRect().top) / zoomLevel,
          });
          setDisableWorkspaceDrag(true);
        }}
      />  

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="note-form">
          <input
            type="text"
            name="title"
            value={editedNote.title}
            onChange={handleEditChange}
            placeholder="Title"
            className="note-input"
          />

          <div className="tag-input">
            <input
              type="text"
              name="tags"
              value={editedNote.tags.join(', ')}
              onChange={handleEditChange}
              placeholder="Tags (comma-separated)"
              className="note-input"
            />
            <div className="tag-list">
              {editedNote.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="delete-tag"
                    onClick={() => handleTagDelete(index)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <textarea
            name="content"
            value={editedNote.content}
            onChange={handleEditChange}
            placeholder="Take a note..."
            className="note-textarea"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div>
            <label>
              <input
                type="radio"
                name="privacyType"
                value="global"
                checked={editedNote.privacyType === 'global'}
                onChange={handleEditChange}
              />
              Global (Public)
            </label>
            <label>
              <input
                type="radio"
                name="visibility"
                value="organization"
                checked={editedNote.visibility === 'organization'}
                onChange={handleEditChange}
              />
              Organization
            </label>
            {editedNote.visibility === 'organization' && (
              <input
                type="text"
                name="organization"
                value={editedNote.organization}
                onChange={handleEditChange}
                placeholder="Organization"
                className="note-input"
              />
            )}
            <label>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={editedNote.visibility === 'private'}
                onChange={handleEditChange}
              />
              Private
            </label>
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handleEditCancel}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <button 
            className="delete-note" 
            onClick={handleDeleteClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            X
          </button>
          <h1 className="note-title">{note.title}</h1>
          <div className="note-content" onClick={handleContentClick}>
            {renderContent(note.content, handleCheckboxChange)}
          </div>
          <p className="note-tags">{note.tags.join(', ')}</p>
          <p className="note-visibility">Visibility: {note.privacyType}</p>
          <button className="edit-note" onClick={handleEditClick} onMouseDown={(e) => e.stopPropagation()}>
            Edit Note
          </button>
        </>
      )}
    </div>
  );
};

export default Note;
