// WorkspaceContext.js
import React, { createContext } from 'react';

const WorkspaceContext = createContext({
  setDisableWorkspaceDrag: () => {},
  minScale: 0.25,  // Minimum zoom level
  maxScale: 3,     // Maximum zoom level
});

export default WorkspaceContext;
