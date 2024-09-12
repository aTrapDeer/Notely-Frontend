import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';

const Workspace = forwardRef(({ children, setWorkspaceTransform }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [workspaceTransform, setInternalWorkspaceTransform] = useState({ x: 0, y: -100, scale: 1 });
  const containerRef = useRef(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });



  const updateTransform = useCallback((newTransform) => {
    setInternalWorkspaceTransform(newTransform);
    setWorkspaceTransform(newTransform);
  }, [setWorkspaceTransform]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        setIsAltPressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        setIsAltPressed(false);
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = isDragging ? "grabbing" : (isAltPressed ? "move" : "default");
    }
  }, [isDragging, isAltPressed]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      requestAnimationFrame(() => {
        updateTransform(prev => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      });
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDragging, updateTransform]);

  const handleMouseDown = useCallback((e) => {
    if (isAltPressed) {
      e.preventDefault();
      setIsDragging(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [isAltPressed]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    if (isAltPressed) {
      e.preventDefault();
      const zoom = 1 - e.deltaY * 0.001;
      const boundingRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - boundingRect.left;
      const mouseY = e.clientY - boundingRect.top;

      requestAnimationFrame(() => {
        updateTransform(prev => {
          const newScale = Math.max(0.1, Math.min(prev.scale * zoom, 3));
          const scaleChange = newScale / prev.scale;
          return {
            x: prev.x - (mouseX - prev.x) * (scaleChange - 1),
            y: prev.y - (mouseY - prev.y) * (scaleChange - 1),
            scale: newScale
          };
        });
      });
    }
  }, [isAltPressed, updateTransform]);

  return (
    <div 
      ref={containerRef}
      className="workspace-container h-full w-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div
        ref={ref}
        className="workspace min-h-full flex flex-col items-center pt-4" 
        style={{
          transform: `translate(${workspaceTransform.x}px, ${workspaceTransform.y}px) scale(${workspaceTransform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default Workspace;