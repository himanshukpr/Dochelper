import React from "react";
import { motion } from "framer-motion";

/**
 * EditNoteModal component
 * A modal popup for editing existing notes
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {string} props.noteId - ID of the note being edited
 * @param {string} props.title - Current title of the note
 * @param {string} props.content - Current content of the note
 * @param {Function} props.onTitleChange - Function to call when title changes
 * @param {Function} props.onContentChange - Function to call when content changes
 * @param {Function} props.onSave - Function to call when saving the note
 * @param {Function} props.onCancel - Function to call when canceling the edit
 * @param {boolean} props.isLoading - Whether a loading operation is in progress
 */
const EditNoteModal = ({ 
  isOpen, 
  noteId, 
  title, 
  content, 
  onTitleChange, 
  onContentChange, 
  onSave, 
  onCancel, 
  isLoading 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-4">Edit Note</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          placeholder="Title"
          disabled={isLoading}
        />
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded h-32"
          placeholder="Note content"
          disabled={isLoading}
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={`px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditNoteModal; 