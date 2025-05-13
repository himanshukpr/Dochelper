import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

/**
 * AddNoteModal component
 * A modal popup for adding new notes
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onAddNote - Function to call when adding a note
 * @param {boolean} props.isLoading - Whether a loading operation is in progress
 */
const AddNoteModal = ({ isOpen, onClose, onAddNote, isLoading }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and content for your note");
      return;
    }
    onAddNote(title, content);
  };
  
  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-4">Add New Note</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          placeholder="Title"
          disabled={isLoading}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded h-32"
          placeholder="Note content"
          disabled={isLoading}
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 flex items-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : (
              <>
                <FaPlus className="mr-1" /> Add Note
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddNoteModal; 