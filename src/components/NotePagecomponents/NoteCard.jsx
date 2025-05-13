import React from "react";
import { FaEdit, FaTrash, FaGripLines } from "react-icons/fa";

/**
 * NoteCard component
 * Displays a single note card with drag and drop functionality
 * 
 * @param {Object} props - Component props
 * @param {Object} props.note - Note data object
 * @param {number} props.index - Index of the note in the list
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.isDragging - Whether the card is currently being dragged
 * @param {boolean} props.isLoading - Whether a loading operation is in progress
 * @param {Object} props.dragHandlers - Object containing drag event handlers
 * @param {Function} props.dragHandlers.onDragStart - Handler for drag start event
 * @param {Function} props.dragHandlers.onDragOver - Handler for drag over event
 * @param {Function} props.dragHandlers.onDragEnd - Handler for drag end event
 * @param {Function} props.dragHandlers.onTouchStart - Handler for touch start event
 * @param {Function} props.dragHandlers.onTouchMove - Handler for touch move event
 * @param {Function} props.dragHandlers.onTouchEnd - Handler for touch end event
 * @param {React.Ref} props.cardRef - React ref for the card element
 */
const NoteCard = ({ 
  note, 
  index, 
  onEdit, 
  onDelete, 
  isDragging, 
  isLoading,
  dragHandlers,
  cardRef
}) => {
  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={() => dragHandlers.onDragStart(index)}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
      onTouchStart={(e) => dragHandlers.onTouchStart(e, index)}
      onTouchMove={(e) => dragHandlers.onTouchMove(e, index)}
      onTouchEnd={dragHandlers.onTouchEnd}
      className={`bg-blue-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
        isDragging ? "opacity-60 border-4 border-blue-500 z-10 scale-105 shadow-2xl" : ""
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <h3 className="text-xl font-semibold text-blue-700 truncate max-w-[calc(100%-80px)]" title={note.title}>
          {note.title}
        </h3>
        <div className="flex items-center space-x-2 shrink-0">
          <button 
            onClick={() => onEdit(note)}
            className="p-1 bg-blue-200 rounded hover:bg-blue-300 transition-colors"
            disabled={isLoading}
            title="Edit note"
          >
            <FaEdit className="text-blue-700" />
          </button>
          <button 
            onClick={() => onDelete(note.id)}
            className="p-1 bg-red-200 rounded hover:bg-red-300 transition-colors"
            disabled={isLoading}
            title="Delete note"
          >
            <FaTrash className="text-red-700" />
          </button>
          <div className="touch-handle p-1 bg-blue-200 rounded">
            <FaGripLines className="text-blue-600" />
          </div>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap break-words">{note.note}</p>
    </div>
  );
};

export default NoteCard;