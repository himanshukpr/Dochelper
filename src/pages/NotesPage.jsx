import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "../context/FirebaseContextProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSync, FaPlus } from "react-icons/fa";

// Import extracted components
import AddNoteModal from "../components/NotePagecomponents/AddNoteModal";
import EditNoteModal from "../components/NotePagecomponents/EditNoteModal";
import NoteCard from "../components/NotePagecomponents/NoteCard";

function NotesPage() {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastSwap, setLastSwap] = useState(0); // Timestamp of last swap
  const cardRefs = useRef([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  const getNotes = async () => {
    try {
      setIsLoading(true);
      const data = await firebase.getNotes();
      setCards(data);
      console.log(data);
      // Initialize cardRefs with the right length
      cardRefs.current = Array(data.length).fill().map((_, i) => cardRefs.current[i] || React.createRef());
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to load notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (title, content) => {
    try {
      setIsLoading(true);
      await firebase.setNotes(title, content);
      await getNotes();
      setIsAddNoteModalOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      setIsLoading(true);
      await firebase.deleteNote(id);
      await getNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.note);
  };
  
  const handleSaveEdit = async () => {
    if (editingNote) {
      try {
        setIsLoading(true);
        await firebase.updateNote(editingNote, editTitle, editContent);
        setEditingNote(null);
        await getNotes();
      } catch (error) {
        console.error("Error updating note:", error);
        alert("Failed to update note. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  // Custom drag and drop functionality
  const handleDragStart = (index) => {
    setDraggedCard(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedCard === null || draggedCard === index) return;
    
    // Add a time-based threshold to prevent too frequent swaps
    const now = Date.now();
    if (now - lastSwap < 250) return; // Only swap every 250ms
    
    // Rearrange cards
    const newCards = [...cards];
    const draggedItem = newCards[draggedCard];
    newCards.splice(draggedCard, 1);
    newCards.splice(index, 0, draggedItem);
    
    // Update state
    setCards(newCards);
    setDraggedCard(index);
    setLastSwap(now);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e, index) => {
    // Store initial touch position
    const touch = e.touches[0];
    setLastTouch({ x: touch.clientX, y: touch.clientY });
    setDraggedCard(index);
  };

  const handleTouchMove = (e, index) => {
    if (draggedCard === null) return;
    
    const touch = e.touches[0];
    const currentTouch = { x: touch.clientX, y: touch.clientY };
    
    // Calculate movement distance
    const deltaX = Math.abs(currentTouch.x - lastTouch.x);
    const deltaY = Math.abs(currentTouch.y - lastTouch.y);
    
    // Only try to prevent default if we've moved a significant amount
    // This allows normal scrolling for small movements
    if (deltaX > 5 || deltaY > 5) {
      try {
        // Only attempt to prevent default - don't throw errors if we can't
        e.preventDefault();
      } catch (err) {
        // Silently ignore errors when preventDefault fails
      }
    }
    
    // Update last touch position
    setLastTouch(currentTouch);
    
    // Add a time-based threshold to prevent too frequent swaps
    const now = Date.now();
    if (now - lastSwap < 400) return; // Only swap every 400ms
    
    const elements = cardRefs.current.map(ref => ref.current);
    let targetIndex = -1;
    
    // Find the element we're currently hovering over
    for (let i = 0; i < elements.length; i++) {
      if (!elements[i]) continue;
      
      const rect = elements[i].getBoundingClientRect();
      
      // Only swap if we're clearly in the top or bottom half of another card
      // This makes it more predictable
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        // Determine if we're in the top or bottom half of the card
        const midY = rect.top + rect.height / 2;
        
        if (i !== draggedCard) {
          if (draggedCard < i && touch.clientY > midY) {
            targetIndex = i;
            break;
          } else if (draggedCard > i && touch.clientY < midY) {
            targetIndex = i;
            break;
          }
        }
      }
    }
    
    // Only perform swap if we found a valid target index
    if (targetIndex !== -1 && targetIndex !== draggedCard) {
      // Rearrange cards
      const newCards = [...cards];
      const draggedItem = newCards[draggedCard];
      newCards.splice(draggedCard, 1);
      newCards.splice(targetIndex, 0, draggedItem);
      
      // Update state
      setCards(newCards);
      setDraggedCard(targetIndex);
      setLastSwap(now);
    }
  };

  const handleTouchEnd = () => {
    setDraggedCard(null);
    setTouchStartY(null);
  };

  // Package all drag handlers for passing to NoteCard
  const dragHandlers = {
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  // Add event listeners with passive: false
  useEffect(() => {
    // Add non-passive touch event listeners to the container
    const container = document.querySelector('.notes-container');
    if (container) {
      const touchOptions = { passive: false };
      
      const touchMoveHandler = (e) => {
        if (draggedCard !== null) {
          e.preventDefault();
        }
      };
      
      container.addEventListener('touchmove', touchMoveHandler, touchOptions);

      return () => {
        container.removeEventListener('touchmove', touchMoveHandler, touchOptions);
      };
    }
  }, [draggedCard]);

  useEffect(() => {
    getNotes();
  }, []);

  // Ensure cardRefs array length matches cards length
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);
    cardRefs.current = Array(cards.length).fill().map((_, i) => cardRefs.current[i] || React.createRef());
  }, [cards.length]);

  return (
    <motion.div
      className="min-h-screen w-screen bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] flex flex-col items-center py-10 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back to Dashboard Button */}
      <motion.button
        onClick={() => navigate("/dashboard")}
        className="self-start mb-6 flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
        whileTap={{ scale: 0.95 }}
        aria-label="Back to Dashboard"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          whileHover={{
            scale: [1, 0.9, 1.1],
            transition: { duration: 0.3 },
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </motion.svg>
        Dashboard
      </motion.button>

      {/* Page Title and Action Buttons */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div className="w-1/4">
          {/* Empty div for spacing */}
        </div>
        <h1 className="text-4xl font-bold text-blue-600 text-center flex-grow">
          Notes
        </h1>
        <div className="flex gap-2 w-1/4 justify-end">
          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="bg-green-600 text-white font-bold rounded-lg px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition flex items-center shadow-lg"
            disabled={isLoading}
          >
            <FaPlus className="mr-2" /> Add Note
          </button>
          <button
            onClick={getNotes}
            disabled={isLoading}
            className={`text-blue-600 bg-blue-100 rounded-lg p-2 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            title="Refresh"
            aria-label="Refresh notes"
          >
            <FaSync size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Add Note Modal Component */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onAddNote={handleAddNote}
        isLoading={isLoading}
      />

      {/* Edit Note Modal Component */}
      <EditNoteModal
        isOpen={!!editingNote}
        noteId={editingNote}
        title={editTitle}
        content={editContent}
        onTitleChange={setEditTitle}
        onContentChange={setEditContent}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        isLoading={isLoading}
      />

      {/* Notes List as Container Cards with Rearrangeable Functionality */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6 overflow-auto notes-container">
        {cards.length === 0 ? (
          <p className="text-center text-gray-500">
            No notes available. Add a new note using the button above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((note, index) => (
              <NoteCard
                key={index}
                note={note}
                index={index}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                isDragging={draggedCard === index}
                isLoading={isLoading}
                dragHandlers={dragHandlers}
                cardRef={cardRefs.current[index]}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default NotesPage;
