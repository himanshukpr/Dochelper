import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../context/FirebaseContextProvider';
import { FaSync, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TasklistPage = () => {
  const firebase = useFirebase();
  const [displayTask, setDisplayTask] = useState([]);
  const taskInputRef = useRef(null);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditTask, setCurrentEditTask] = useState({ id: '', task: '' });
  const editInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getData = async () => {
    // if (!firebase.user) return navigate('/signin');

    try {
      setIsLoading(true);
      setDisplayTask([]); // Clear the task list initially
      const result = await firebase.getTaskList();
      const taskSet = new Set();
      const uniqueTasks = [];
      result.forEach((element) => {
        if (element[0].user === firebase.user.email) {
          const taskKey = element[1];
          if (!taskSet.has(taskKey)) {
            taskSet.add(taskKey);
            uniqueTasks.push(element);
          }
        }
      });
      setDisplayTask(uniqueTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setData = async () => {
    try {
      const value = taskInputRef.current.value.trim();
      if (value) {
        setIsAdding(true);
        await firebase.setTaskList(value);
        await getData();
      } else {
        alert("Task cannot be empty!");
      }
      taskInputRef.current.value = '';
      taskInputRef.current.focus();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTasklistDelete = async (taskid) => {
    try {
      setIsDeleting(true);
      await firebase.deleteTaskList(taskid);
      await getData();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTask = (taskId, taskContent) => {
    setCurrentEditTask({ id: taskId, task: taskContent });
    setIsEditModalOpen(true);
    // Focus on the edit input after the modal is shown
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 100);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedTask = editInputRef.current.value.trim();
      if (!updatedTask) {
        alert("Task cannot be empty!");
        return;
      }
      
      setIsSaving(true);
      await firebase.updateTaskList(currentEditTask.id, updatedTask);
      setIsEditModalOpen(false);
      await getData();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <motion.div
      className="min-h-screen w-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] flex flex-col items-center py-10 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back to Dashboard Button */}
      <motion.button
        onClick={() => navigate('/dashboard')}
        className="self-start mb-6 flex items-center text-purple-600 hover:text-purple-800 focus:outline-none"
        // whileHover={{ scale: 1.1 }}
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
            transition: { duration: 0.3 }
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </motion.svg>
        Dashboard
      </motion.button>

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-purple-600 mb-4 text-center w-full max-w-3xl">
        Task List
      </h1>

      {/* Input and Buttons */}
      <div className="flex gap-3 items-center justify-center w-full max-w-3xl mb-6">
        <input
          type="text"
          ref={taskInputRef}
          placeholder="Add a new task"
          className="flex-grow border-2 border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          aria-label="New task input"
          disabled={isAdding}
        />
        <button
          onClick={setData}
          className={`bg-purple-400 text-white font-semibold rounded-lg px-6 py-3 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition flex items-center ${
            isAdding ? "opacity-70 cursor-not-allowed" : ""
          }`}
          aria-label="Add task"
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : (
            <>
              <FaPlus className="mr-2" /> Add
            </>
          )}
        </button>
        <button
          onClick={getData}
          className={`text-purple-600 bg-purple-100 rounded-lg p-3 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          title="Sync"
          aria-label="Sync tasks"
          disabled={isLoading}
        >
          <FaSync size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Task List */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6 overflow-y-auto max-h-96">
        {displayTask.length === 0 ? (
          <p className="text-center text-gray-500">No tasks available. Add a new task above.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <tbody>
              {displayTask.map((el, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200"
                >
                  <td className="px-4 py-3 text-gray-700">{el[0].task}</td>
                  <td className="px-4 py-3 text-right flex gap-3 justify-end">
                    <button
                      onClick={() => handleEditTask(el[1], el[0].task)}
                      className="p-1 bg-blue-200 rounded hover:bg-blue-300 transition-colors"
                      aria-label={`Edit task ${el[0].task}`}
                      disabled={isDeleting}
                      title="Edit task"
                    >
                      <FaEdit className="text-blue-700" />
                    </button>
                    <button
                      onClick={() => handleTasklistDelete(el[1])}
                      className="p-1 bg-red-200 rounded hover:bg-red-300 transition-colors"
                      aria-label={`Delete task ${el[0].task}`}
                      disabled={isDeleting}
                      title="Delete task"
                    >
                      <FaTrash className="text-red-700" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Edit Task</h2>
            <input
              type="text"
              ref={editInputRef}
              defaultValue={currentEditTask.task}
              className="w-full border-2 border-purple-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Edit task"
              disabled={isSaving}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className={`px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TasklistPage;
