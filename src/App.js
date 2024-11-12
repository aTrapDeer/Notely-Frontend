// App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from "./aws-exports";
import './notely.css';
import './ui/dropdown-menu.tsx';
import TopBar from './components/Topbar';
import Workspace from './components/Workspace';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import useNotes from './components/useNotes';
import DeleteConfirmation from './components/popups/DeleteConfirmation';
import './components/noteFunctions/RopeOptions.css';
import ReactDOM from 'react-dom';
Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [theme, setTheme] = useState('light');
  const [userDetails, setUserDetails] = useState(null);
  const [workspaceTransform, setWorkspaceTransform] = useState({ x: 0, y: 0, scale: 1 });
  const workspaceRef = useRef(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, noteId: null });
  const [similarNotes, setSimilarNotes] = useState([]);
  const { notes, handleSubmit, handleDelete, handleEdit } = useNotes(userDetails);
  // State to hold all rope paths
  const [ropes, setRopes] = useState([]);
  
  // const [ropePath, setRopePath] = useState(null);
  // const ropeRef = useRef(null);

  const handleSimilarNotes = (notes) => {
    setSimilarNotes(notes);
    ////console.log('Similar notes:', notes);
  };

  const handleDeleteClick = (noteId) => {
    ////console.log('Delete clicked for note:', noteId);
    setDeleteConfirmation({ isOpen: true, noteId });
  };
  const handleDeleteConfirm = () => {
    ////console.log('Delete confirmed for note:', deleteConfirmation.noteId);
    if (deleteConfirmation.noteId) {
      handleDelete(deleteConfirmation.noteId);
      setDeleteConfirmation({ isOpen: false, noteId: null });
    }
  };
  
  const handleDeleteCancel = () => {
    //console.log('Delete cancelled');
    setDeleteConfirmation({ isOpen: false, noteId: null });
  };

  useEffect(() => {
    if (user && user.signInDetails && user.signInDetails.loginId) {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { loginId: user.signInDetails.loginId })
        .then(response => {
          //console.log('User details:', response.data.user);
          setUserDetails(response.data.user);
        })
        .catch(error => console.log('Error during login:', error));
    }
  }, [user]);

  useEffect(() => {
    // Force light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  // Generate ropes for each note pair
  useEffect(() => {
    if (notes.length > 0 && workspaceRef.current) {
      const newRopes = [];
      const processedPairs = new Set(); // To avoid duplicate ropes

      notes.forEach(note => {
        if (note.linkedNoteId) {
          const linkedNote = notes.find(n => n.id === note.linkedNoteId);
          if (linkedNote) {
            // Create a unique key for the pair to prevent duplicates
            const pairKey = [note.id, linkedNote.id].sort().join('-');
            if (!processedPairs.has(pairKey)) {
              const from = {
                x: note.positionX + (note.width || 300) / 2,
                y: note.positionY,
              };
              const to = {
                x: linkedNote.positionX + (linkedNote.width || 300) / 2,
                y: linkedNote.positionY + (linkedNote.height || 390),
              };

              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // Adjust control points based on distance to simulate elasticity
              const controlPointOffset = Math.min(100, distance / 2);

              const path = `M${from.x},${from.y} C${from.x},${from.y - controlPointOffset} ${to.x},${to.y + controlPointOffset} ${to.x},${to.y}`;

              console.log(`Creating rope from note ${note.id} to note ${linkedNote.id}: ${path}`);

              newRopes.push(path);
              processedPairs.add(pairKey);
            }
          } else {
            console.warn(`Linked note with id ${note.linkedNoteId} not found for note ${note.id}`);
          }
        }
      });

      console.log(`Total ropes generated: ${newRopes.length}`);
      setRopes(newRopes);
    }
  }, [notes, workspaceRef]);

  const handleNoteSubmit = (noteData) => {
    handleSubmit(noteData, workspaceTransform);
  };


return (
  <div className="App h-screen flex flex-col">
    <TopBar signOut={signOut} />
    <div className="flex-grow overflow-hidden relative" style={{ paddingBottom: '60px' }}>
      {/* Added paddingBottom to accommodate the toolbar height when collapsed */}
      
      <NoteForm
            onSubmit={handleNoteSubmit}
            userDetails={userDetails}
            workspaceTransform={workspaceTransform}
            onSimilarNotes={handleSimilarNotes}
            similarNotes={similarNotes}  // Pass similarNotes to NoteForm
          /> 

      <Workspace setWorkspaceTransform={setWorkspaceTransform} ref={workspaceRef}>
        <div className="space-y-20">
                  {/* Render the rope */}
      {ropes.length > 0 && (
            <svg className="rope-svg">
              {ropes.map((path, index) => (
                <path key={index} d={path} stroke="brown" strokeWidth="2" fill="none" />
              ))}
            </svg>
          )} 
          <NoteList 
            notes={notes} 
            onDelete={handleDelete}
            onEdit={handleEdit}
            workspaceRef={workspaceRef}
            onDeleteClick={handleDeleteClick}
            zoomLevel={workspaceTransform.scale}
            allNotes={notes}
            
          />
        </div>
      </Workspace>
    </div>
    {ReactDOM.createPortal(
      <DeleteConfirmation 
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />,
      document.body
    )}
  </div>
);
}

export default withAuthenticator(App);