import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import './Workspace.css';

const Workspace = forwardRef(({ children, setWorkspaceTransform }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setisSpacePressed] = useState(false);
  const [workspaceTransform, setInternalWorkspaceTransform] = useState({ x: 0, y: -100, scale: 1 });
  const containerRef = useRef(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const pinchDataRef = useRef({ initialDistance: 0, initialScale: 1, lastTouches: [] });



  const updateTransform = useCallback((newTransform) => {
    setInternalWorkspaceTransform(newTransform);
    setWorkspaceTransform(newTransform);
  }, [setWorkspaceTransform]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setisSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setisSpacePressed(false);
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
      containerRef.current.style.cursor = isDragging ? "grabbing" : (isSpacePressed ? "move" : "default");
    }
  }, [isDragging, isSpacePressed]);

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
    if (isSpacePressed) {
      if (e.target.closest('.note')) {
        return;
      }
      e.preventDefault();
      setIsDragging(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [isSpacePressed]);
  

  // Touch feedback for touch devices
  const handleTouchStart = useCallback(
    (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        // Single touch - start dragging
        setIsDragging(true);
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        // Two fingers - start pinch zoom
        const [touch1, touch2] = e.touches;
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        pinchDataRef.current = {
          initialDistance: distance,
          initialScale: workspaceTransform.scale,
          lastTouches: [touch1, touch2],
        };
      }
    },
    [workspaceTransform.scale]
  );

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging) {
        // Single touch - continue dragging
        const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
        const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
        requestAnimationFrame(() => {
          updateTransform((prev) => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        });
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        // Two fingers - pinch zoom
        const [touch1, touch2] = e.touches;
        const newDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scaleChange = newDistance / pinchDataRef.current.initialDistance;
        const newScale = Math.max(
          0.1,
          Math.min(pinchDataRef.current.initialScale * scaleChange, 3)
        );

        const boundingRect = containerRef.current.getBoundingClientRect();
        const centerX =
          (touch1.clientX + touch2.clientX) / 2 - boundingRect.left;
        const centerY =
          (touch1.clientY + touch2.clientY) / 2 - boundingRect.top;

        requestAnimationFrame(() => {
          updateTransform((prev) => {
            const scaleRatio = newScale / prev.scale;
            return {
              x: prev.x - (centerX - prev.x) * (scaleRatio - 1),
              y: prev.y - (centerY - prev.y) * (scaleRatio - 1),
              scale: newScale,
            };
          });
        });
      }
    },
    [isDragging, updateTransform]
  );

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    setIsDragging(false);
  }, []);



  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    if (isSpacePressed) {
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
  }, [isSpacePressed, updateTransform]);

  return (
    <div 
      ref={containerRef}
      className="workspace-container h-full w-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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