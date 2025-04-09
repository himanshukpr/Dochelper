import { useState, useRef } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiGitMerge } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FileItem = ({ file, index, moveFile, removeFile }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'FILE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'FILE',
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveFile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-3 bg-purple-50 rounded-lg transition-all hover:bg-purple-100 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-purple-600 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
      </div>
      <button
        onClick={() => removeFile(index)}
        className="text-purple-400 hover:text-purple-600 transition-colors"
      >
        ×
      </button>
    </div>
  );
};

const PDFMergePage = () => {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedPdfPath, setMergedPdfPath] = useState(null);
  const fileInputRef = useRef(null);

  const moveFile = (dragIndex, hoverIndex) => {
    const draggedItem = files[dragIndex];
    const newFiles = [...files];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(hoverIndex, 0, draggedItem);
    setFiles(newFiles);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file => file.type === 'application/pdf');
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsMerging(true);
    setProgress(0);
    
    try {
      // First check if backend is reachable
      await axios.get('http://localhost:8000/health', {
        timeout: 2000
      });

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('pdfs', file);
        formData.append(`order_${index}`, index.toString());
      });
      
      const response = await axios.post('http://localhost:8000/api/merge-pdfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      // Handle successful merge
      const { data } = response;
      if (!data.mergedPdfPath) {
        throw new Error('Merge completed but no file path returned');
      }
      
      setMergedPdfPath(data.mergedPdfPath);
      
      // Request PDF download through server
      const downloadUrl = `http://localhost:8000/download?file=${encodeURIComponent(data.mergedPdfPath)}`;
      const downloadWindow = window.open(downloadUrl, '_blank');
      
      if (!downloadWindow) {
        throw new Error('Popup blocked - please allow popups for this site');
      }

      setFiles([]); // Clear files after merge
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    } catch (error) {
      console.error('Merge failed:', error);
      let errorMessage = 'Merge failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'Server is not responding. Please check:';
        errorMessage += '\n1. The server is running (node server.js)';
        errorMessage += '\n2. Your internet connection';
      } else {
        // Other errors
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsMerging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input on error too
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] w-full">
        <div className="px-6 py-8 w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Header */}
              <div className="mb-8 text-center relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                  <motion.button 
                    onClick={() => window.history.back()}
                    className="flex items-center text-purple-600 hover:text-purple-800"
                    whileHover={{
                      transition: { staggerChildren: 0.1 }
                    }}
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
                    <span>Dashboard</span>
                  </motion.button>
                </div>
                <h1 className="text-4xl font-bold text-purple-600 mb-2">
                  <FiGitMerge className="inline mr-2" />
                  Merge PDF Files
                </h1>
                <p className="text-lg text-purple-400">
                  Upload and merge multiple PDF files
                </p>
              </div>

              {/* File Selection Section */}
              <div className="mb-6">
                <div 
                  className="p-8 border-2 border-dashed border-purple-200 rounded-xl text-center cursor-pointer hover:bg-purple-50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    multiple
                    className="hidden"
                  />
                  <svg className="w-12 h-12 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-purple-400 mt-2">Drag & drop PDF files here or click to browse</p>
                </div>
              </div>

              {/* File List Section */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-purple-600 mb-4">Selected Files ({files.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <FileItem 
                      key={index}
                      file={file}
                      index={index}
                      moveFile={moveFile}
                      removeFile={removeFile}
                    />
                  ))}
                </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="relative w-full">
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2 || isMerging}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                      ${files.length < 2 ? 'bg-gray-300 cursor-not-allowed' : 
                        'bg-purple-400 hover:bg-purple-500'}`}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <FiGitMerge className="h-5 w-5" />
                      {isMerging ? `Merging... ${progress}%` : 'Merge PDFs'}
                    </span>
                  </button>
                </div>

                {mergedPdfPath && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => window.open(`http://localhost:8000/download?file=${encodeURIComponent(mergedPdfPath)}`, '_blank')}
                      className="w-full py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Merged PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DndProvider>
  );
};

export default PDFMergePage;
