// Note.js
import React, { useRef, useState, useEffect, useCallback, useContext, createPortal } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import WorkspaceContext from './WorkspaceContext'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { FaExpand, FaCompress } from 'react-icons/fa'; // Import icons
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { debounce } from 'lodash';
import './Note.css';

const Note = ({ 
  note, 
  onDeleteClick, 
  onEdit, 
  workspaceRef, 
  zoomLevel,
  allNotes
}) => {
  const { setDisableWorkspaceDrag } = useContext(WorkspaceContext);
  const noteRef = useRef(null);
  const editButtonRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editedNote, setEditedNote] = useState(note);
  const [isEditing, setIsEditing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false); 
  const [size, setSize] = useState({ width: note.width || 300, height: note.height || 390 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const [position, setPosition] = useState({
    x: note.positionX || 0,
    y: note.positionY || 0,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeEdge, setActiveEdge] = useState(null);
  const [prevState, setPrevState] = useState(null); // To store previous position and size

  const debouncedEdit = useCallback(
    debounce((updatedNote) => {
      onEdit(updatedNote);
    }, 500),
    [onEdit]
  );

  const toggleMaximize = () => {
    if (!isMaximized) {
      // Save current state before maximizing
      setPrevState({
        position: { ...position },
        size: { ...size }
      });

      // Calculate center position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const newWidth = viewportWidth * 0.9; // 90% of viewport
      const newHeight = viewportHeight * 0.9; // 90% of viewport

      // Calculate new position to center the note
      const newX = (viewportWidth - newWidth) / 2;
      const newY = (viewportHeight - newHeight) / 2;

      setPosition({ x: newX, y: newY });
      setSize({ width: newWidth, height: newHeight });
      setIsMaximized(true);
    } else {
      if (prevState) {
        // Restore previous state
        setPosition(prevState.position);
        setSize(prevState.size);
        setIsMaximized(false);
        setPrevState(null);
      }
    }

    // Prevent workspace drag when toggling maximize
    setDisableWorkspaceDrag(true);
    setTimeout(() => setDisableWorkspaceDrag(false), 300); // Re-enable after transition
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMaximized && e.key === 'Escape') {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMaximized]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    if (!isEditing && e.touches.length === 1 && !isMaximized) { 
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      const { left, top, right, bottom } = noteRef.current.getBoundingClientRect();
      const grabAreaWidth = 30;
      const grabAreaHeight = 50;
  
      // Define the resize handle area
      const resizeHandleWidth = 25;
      const resizeHandleHeight = 15;
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
        setIsDragging(true);
        setOffset({
          x: (clientX - left) / zoomLevel,
          y: (clientY - top) / zoomLevel,
        });
        setDisableWorkspaceDrag(true); 
      }
    }
  }, [isEditing, zoomLevel, setDisableWorkspaceDrag, isMaximized]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches.length === 1 && workspaceRef && workspaceRef.current && !isMaximized) {
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

    if (isResizing && e.touches.length === 1 && workspaceRef && workspaceRef.current && !isMaximized) {
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
  }, [isDragging, isResizing, workspaceRef, zoomLevel, offset, position, note, debouncedEdit, editButtonRef, isMaximized]);

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
    if (!isMaximized) { 
      e.stopPropagation();
      setIsResizing(true);
      setDisableWorkspaceDrag(true);
    }
  }, [isMaximized, setDisableWorkspaceDrag]);

  const handleResizeMouseMove = useCallback((e) => {
    if (isResizing && workspaceRef && workspaceRef.current && !isMaximized) {
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
  }, [isResizing, workspaceRef, zoomLevel, position, editButtonRef, isMaximized]);


  useEffect(() => {
    const handleResize = () => {
      if (isMaximized) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const newWidth = viewportWidth * 0.9; // 90% of viewport
        const newHeight = viewportHeight * 0.9; // 90% of viewport
  
        // Recalculate center position
        const newX = (viewportWidth - newWidth) / 2;
        const newY = (viewportHeight - newHeight) / 2;
  
        setPosition({ x: newX, y: newY });
        setSize({ width: newWidth, height: newHeight });
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);
  




  const handleResizeMouseUp = useCallback(() => {
    if (isResizing && !isMaximized) {
      setIsResizing(false);
      setDisableWorkspaceDrag(false); 
      onEdit({ ...note, width: size.width, height: size.height });
    }
  }, [isResizing, setDisableWorkspaceDrag, onEdit, note, size, isMaximized]);

  const renderContent = (content, handleCheckboxChange) => {
    const renderCheckbox = (props) => {
      const { node } = props;
      const line = node.children[0].value;
      const isChecked = line.startsWith('[x]');
      const label = line.slice(3).trim();
      const index = node.position.start.line - 1; // Markdown lines are 1-indexed
    
      return (
        <div className="checkbox-item" key={`checkbox-${index}`}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleCheckboxChange(index)}
            className="checkbox checkbox-primary no-animation"
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <span className={`checkbox-label ${isChecked ? 'checked' : ''}`}>
            {label}
          </span>
        </div>
      );
    };

  // Create a portal for the maximized note
  const MaximizedNote = (
    <div className="note maximized" /* existing maximized styles */>
      {/* Header Buttons */}
      <div className="note-header-buttons">
        <button 
          className="maximize-button" 
          onClick={toggleMaximize}
          aria-label={isMaximized ? 'Minimize Note' : 'Maximize Note'}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {isMaximized ? <FaCompress /> : <FaExpand />}
        </button>

        <button 
          className="delete-note" 
          onClick={handleDeleteClick}
          aria-label="Delete Note"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          &times;
        </button>
      </div>
</div>
  );
  
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
    if (!isEditing && !isMaximized) {
      const { clientX, clientY } = event;
      const { left, top, right, bottom } = noteRef.current.getBoundingClientRect();
      const grabAreaWidth = 30; 
      const grabAreaHeight = 50; 

      const isInGrabArea =
        clientX - left < grabAreaWidth || 
        right - clientX < grabAreaWidth || // Right side
        clientY - top < grabAreaHeight; 

      if (isInGrabArea) {
         event.stopPropagation(); 
        setIsDragging(true);
        setOffset({
          x: (clientX - left) / zoomLevel,
          y: (clientY - top) / zoomLevel,
        });
      }
    }
  }, [isEditing, zoomLevel, isMaximized]);
  
  const handleSubmit = (e) => {    
    if (!editedNote.title.trim()) {
      alert('Title cannot be empty.');
      return;
    }

    if (!editedNote.content.trim()) {
      alert('Content cannot be empty.');
      return;
    }

    onEdit(editedNote);
    debouncedEdit(editedNote);
    setIsEditing(false);
  };
  
  const handleMouseMove = useCallback((event) => {
    if (isDragging && workspaceRef && workspaceRef.current && !isMaximized) {
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
  }, [isDragging, workspaceRef, zoomLevel, offset, note, debouncedEdit, isMaximized]);


  const handleMouseUp = useCallback(() => {
    if (isDragging && !isMaximized) {
      setIsDragging(false);
    }
  }, [isDragging, isMaximized]);

// Existing function
const handleMouseMoveEdgeDetection = useCallback(
  (e) => {
    if (isMaximized) {
      setActiveEdge(null);
      return;
    }

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
      //console.log('Active Edge:', newActiveEdge);
    }
  },
  [activeEdge, isMaximized]
);


// **Add this function below**
const handleMouseLeave = useCallback(() => {
  setActiveEdge(null);
}, []);

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
    if (!isMaximized) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleMouseMoveEdgeDetection);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      document.addEventListener('touchmove', handleTouchMove); 
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleMouseMoveEdgeDetection);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.removeEventListener('touchmove', handleTouchMove); 
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp, handleTouchMove, handleTouchEnd, isResizing, isMaximized]);

  useEffect(() => {
    setSize({ width: note.width || 300, height: note.height || 390 });
    setPosition({ x: note.positionX || 0, y: note.positionY || 0 });
  }, [note]);

  useEffect(() => {
    if (!isMaximized) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
    } else {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp, isMaximized]);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedNote({...note});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setEditedNote({...editedNote, [name]: value.split(',').map(tag => tag.trim())});
    } else {
      setEditedNote({...editedNote, [name]: value});
    }
  };



  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedNote(note);
  };

  const handleTagDelete = (index) => {
    const updatedTags = editedNote.tags.filter((_, i) => i !== index);
    setEditedNote({...editedNote, tags: updatedTags});
  };

  const handleVisibilityChange = (type) => {
    setEditedNote({ ...editedNote, privacyType: type });
  };
  
  const getSliderPosition = () => {
    switch (editedNote.privacyType) {
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


  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(note.id); 
  };

  const renderMarkdown = (content) => {
    return content.replace(/- \[ \]/g, '☐').replace(/- \[x\]/g, '☑');
  };

// Function to render the maximized note via Portal
const MaximizedNote = () => {
  return ReactDOM.createPortal(
    <div className="note maximized">
      {/* Header Buttons */}
      <div className="note-header-buttons">
        <button 
          className="maximize-button" 
          onClick={toggleMaximize}
          aria-label={isMaximized ? 'Minimize Note' : 'Maximize Note'}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {isMaximized ? <FaCompress /> : <FaExpand />}
        </button>

        <button 
          className="delete-note" 
          onClick={handleDeleteClick}
          aria-label="Delete Note"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          &times;
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="note-edit-form">
          {/* Edit Form Header */}
          <div className="edit-form-header">
            <input
              type="text"
              name="title"
              value={editedNote.title}
              onChange={handleEditChange}
              placeholder="Title"
              className="title-edit-input"
              required
            />
          </div>

          {/* Edit Form Body */}
          <div className="edit-form-body">
            {/* Tags Edit Input */}
            <div className="tag-edit-input">
              <input
                type="text"
                name="tags"
                value={editedNote.tags.join(', ')}
                onChange={handleEditChange}
                placeholder="Tags (comma-separated)"
                className="tags-edit-input"
              />
              <div className="tag-list">
                {editedNote.tags.map((tag, index) => (
                  <span key={index} className="tag-edit">
                    {tag}
                    <button
                      type="button"
                      className="delete-tag-edit"
                      onClick={() => handleTagDelete(index)}
                      aria-label={`Delete tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Textarea */}
            <textarea
              name="content"
              value={editedNote.content}
              onChange={handleEditChange}
              placeholder="Take a note..."
              className="note-edit-textarea"
              required
              onKeyDown={(e) => e.stopPropagation()}
            />

            {/* Edit Form Footer: Privacy Options */}
            <div className="edit-form-footer">
              <div className="slider-container">
                <div
                  className={`slider-option ${editedNote.privacyType === 'global' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('global')}
                >
                  <span className="slider-label">Global (Public)</span>
                </div>
                <div
                  className={`slider-option ${editedNote.privacyType === 'organization' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('organization')}
                >
                  <span className="slider-label">Organization</span>
                </div>
                <div
                  className={`slider-option ${editedNote.privacyType === 'private' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('private')}
                >
                  <span className="slider-label">Private</span>
                </div>
                <div className="slider-background" style={{ transform: `translateX(${getSliderPosition()}%)` }}></div>
              </div>
              {editedNote.privacyType === 'organization' && (
                <input
                  type="text"
                  name="organization"
                  value={editedNote.organization}
                  onChange={handleEditChange}
                  placeholder="Organization"
                  className="organization-edit-input"
                  required
                />
              )}
            </div>
            <div className="edit-buttons">
              <button type="button" className="edit-cancel-button" onClick={handleEditCancel}>
                Cancel
              </button>
              <button type="submit" className="edit-save-button">
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <h1 className="note-title">{note.title}</h1>
          <div className="note-content" onClick={handleContentClick}>
            {renderContent(note.content, handleCheckboxChange)}
          </div>
          <div className="note-tags">
            {note.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div 
            className="note-visibility" 
            data-visibility={note.privacyType.charAt(0).toUpperCase() + note.privacyType.slice(1)}
          >
            {note.privacyType.charAt(0).toUpperCase() + note.privacyType.slice(1)}
          </div>
          <button 
            className="edit-note" 
            onClick={handleEditClick} 
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Edit Note"
          >
            Edit Note
          </button>
        </>
      )}
    </div>,
    document.body
  );
};

return (
  <>

    <div
      ref={noteRef}
      className={`note ${isMaximized ? 'maximized' : ''}`}
      style={{
        position: 'absolute', 
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isMaximized ? 9998 : (isDragging ? 998 : 'auto'), 
        cursor: isDragging
            ? 'grabbing'
            : activeEdge
              ? 'grab'
              : 'default',
        transform: isDragging ? 'rotate(5deg) scale(1.05)' : 'none',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, width 0.3s ease, height 0.3s ease',
        minWidth: '350px', // Ensure minWidth for non-maximized
        maxWidth: '2000px',
        transformOrigin: 'center',
        minHeight: '390px', 
        backgroundColor: 'white',
        padding: '10px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '5px',
        overflow: 'visible',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMoveEdgeDetection}
      onMouseLeave={handleMouseLeave}
    >
      {/* Highlight Areas */}
      {!isMaximized && (
        <>
          <div className={`note-highlight note-highlight-top ${activeEdge === 'top' ? 'active' : ''}`} />
          <div className={`note-highlight note-highlight-left ${activeEdge === 'left' ? 'active' : ''}`} />
          <div className={`note-highlight note-highlight-right ${activeEdge === 'right' ? 'active' : ''}`} />
          <div className={`note-highlight note-highlight-bottom ${activeEdge === 'bottom' ? 'active' : ''}`} />
        </>
      )}

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          ref={resizeRef}
          className="resize-handle"
          onMouseDown={handleResizeMouseDown}
          onTouchStart={(e) => {
            if (!isMaximized) {
              e.stopPropagation();
              setIsResizing(true); 
              const touch = e.touches[0];
              setOffset({
                x: (touch.clientX - noteRef.current.getBoundingClientRect().left) / zoomLevel,
                y: (touch.clientY - noteRef.current.getBoundingClientRect().top) / zoomLevel,
              });
              setDisableWorkspaceDrag(true);
            }
          }}
        />  
      )}

      {/* Bottom Drag Handle */}
      {!isMaximized && (
        <div
          className="bottom-drag-handle"
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!isEditing && !isMaximized) {
              const { clientX, clientY } = e;
              const { left, top } = noteRef.current.getBoundingClientRect();

              setIsDragging(true);
              setOffset({
                x: (clientX - left) / zoomLevel,
                y: (clientY - top) / zoomLevel,
              });
            }
          }}
          onTouchStart={(e) => {
            if (!isEditing && e.touches.length === 1 && !isMaximized) {
              const touch = e.touches[0];
              const { clientX, clientY } = touch;
              const { left, top } = noteRef.current.getBoundingClientRect();

              setIsDragging(true);
              setOffset({
                x: (clientX - left) / zoomLevel,
                y: (clientY - top) / zoomLevel,
              });
            }
          }}            
        />
      )}

      {/* Header Buttons: Maximize/Minimize and Delete */}
      <div className="note-header-buttons">
        <button 
          className="maximize-button" 
          onClick={toggleMaximize}
          aria-label={isMaximized ? 'Minimize Note' : 'Maximize Note'}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation
          onTouchStart={(e) => e.stopPropagation()} // Prevent drag initiation on touch devices
        >
          {isMaximized ? <FaCompress /> : <FaExpand />}
        </button>

        <button 
          className="delete-note" 
          onClick={handleDeleteClick}
          aria-label="Delete Note"
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation
          onTouchStart={(e) => e.stopPropagation()} // Prevent drag initiation on touch devices
        >
          &times;
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="note-edit-form">
          {/* Edit Form Header */}
          <div className="edit-form-header">
            <input
              type="text"
              name="title"
              value={editedNote.title}
              onChange={handleEditChange}
              placeholder="Title"
              className="title-edit-input"
              required
            />
          </div>

          {/* Edit Form Body */}
          <div className="edit-form-body">
            {/* Tags Edit Input */}
            <div className="tag-edit-input">
              <input
                type="text"
                name="tags"
                value={editedNote.tags.join(', ')}
                onChange={handleEditChange}
                placeholder="Tags (comma-separated)"
                className="tags-edit-input"
              />
              <div className="tag-list">
                {editedNote.tags.map((tag, index) => (
                  <span key={index} className="tag-edit">
                    {tag}
                    <button
                      type="button"
                      className="delete-tag-edit"
                      onClick={() => handleTagDelete(index)}
                      aria-label={`Delete tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Textarea */}
            <textarea
              name="content"
              value={editedNote.content}
              onChange={handleEditChange}
              placeholder="Take a note..."
              className="note-edit-textarea"
              required
              onKeyDown={(e) => e.stopPropagation()}
            />

            {/* Edit Form Footer: Privacy Options */}
            <div className="edit-form-footer">
              <div className="slider-container">
                <div
                  className={`slider-option ${editedNote.privacyType === 'global' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('global')}
                >
                  <span className="slider-label">Global (Public)</span>
                </div>
                <div
                  className={`slider-option ${editedNote.privacyType === 'organization' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('organization')}
                >
                  <span className="slider-label">Organization</span>
                </div>
                <div
                  className={`slider-option ${editedNote.privacyType === 'private' ? 'active' : ''}`}
                  onClick={() => handleVisibilityChange('private')}
                >
                  <span className="slider-label">Private</span>
                </div>
                <div className="slider-background" style={{ transform: `translateX(${getSliderPosition()}%)` }}></div>
              </div>
              {editedNote.privacyType === 'organization' && (
                <input
                  type="text"
                  name="organization"
                  value={editedNote.organization}
                  onChange={handleEditChange}
                  placeholder="Organization"
                  className="organization-edit-input"
                  required
                />
              )}
            </div>
            <div className="edit-buttons">
              <button type="button" className="edit-cancel-button" onClick={handleEditCancel}>
                Cancel
              </button>
              <button type="submit" className="edit-save-button">
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <h1 className="note-title">{note.title}</h1>
          <div className="note-content" onClick={handleContentClick}>
            {renderContent(note.content, handleCheckboxChange)}
          </div>
          <div className="note-tags">
            {note.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div 
            className="note-visibility" 
            data-visibility={note.privacyType.charAt(0).toUpperCase() + note.privacyType.slice(1)}
          >
            {note.privacyType.charAt(0).toUpperCase() + note.privacyType.slice(1)}
          </div>
          <button 
            className="edit-note" 
            onClick={handleEditClick} 
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Edit Note"
          >
            Edit Note
          </button>
        </>
      )}
    </div>

    {/* Render the maximized note via Portal */}
    {isMaximized && MaximizedNote()}
  </>
);
};

export default Note; 