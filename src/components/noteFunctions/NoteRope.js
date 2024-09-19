// NoteForm.js

const [ropeQuery, setRopeQuery] = useState('');
const [ropeOptions, setRopeOptions] = useState([]);
const [showRopeOptions, setShowRopeOptions] = useState(false);
const [selectedRopeNote, setSelectedRopeNote] = useState(null);

const handleEditorChange = ({ text }) => {
  setNoteText(text);
  debouncedSetNoteText(text);

  // Detect '/rope' command
  const ropeCommandMatch = text.match(/\/rope\s+(.*)$/);
  if (ropeCommandMatch) {
    const query = ropeCommandMatch[1].trim();
    setRopeQuery(query);
    if (query.length > 0) {
      // Fetch matching notes from the backend
      fetchMatchingNotes(query);
      setShowRopeOptions(true);
    } else {
      setShowRopeOptions(false);
    }
  } else {
    setShowRopeOptions(false);
  }
};

const fetchMatchingNotes = useCallback(
  debounce(async (query) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/search_notes`, {
        params: {
          userId: userDetails['USER#'],
          query,
        },
      });
      setRopeOptions(response.data.notes);
    } catch (error) {
      console.error('Error fetching matching notes:', error);
    }
  }, 300),
  [userDetails]
);
