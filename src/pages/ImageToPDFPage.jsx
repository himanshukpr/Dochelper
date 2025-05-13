import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';

const ImageToPDFPage = () => {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState(null);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      alert('Please select only image files.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setConversionResult(null);  // Reset previous results
    }
    
    // Clear the input
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== droppedFiles.length) {
      alert('Please select only image files.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setConversionResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex, direction) => {
    const newFiles = [...files];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= files.length) return;
    
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    setProgress(0);
    
    try {
      // First check if backend is reachable
      await axios.get('http://localhost:8000/health', {
        timeout: 2000
      });

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
        formData.append(`order_${index}`, index);
      });
      
      formData.append('pageSize', pageSize);
      formData.append('orientation', orientation);
      
      const response = await axios.post('http://localhost:8000/api/image-to-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      // Handle successful conversion
      setConversionResult(response.data);
      setFiles([]);
    } catch (error) {
      console.error('Conversion failed:', error);
      let errorMessage = 'Image to PDF conversion failed';
      
      if (error.response) {
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Server is not responding. Please check:';
        errorMessage += '\n1. The server is running (node server.js)';
        errorMessage += '\n2. Your internet connection';
      } else {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] w-full">
      <div className="px-6 py-8 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div>
              <motion.button 
                onClick={() => window.history.back()}
                className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
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
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-indigo-600 mb-2">
                <FiFileText className="inline mr-2" />
                Image to PDF
              </h1>
              <p className="text-lg text-indigo-400">
                Convert your images to a PDF document
              </p>
            </div>

            {/* File Selection Section */}
            <div className="mb-6">
              <div 
                className="p-8 border-2 border-dashed border-indigo-200 rounded-xl text-center cursor-pointer hover:bg-indigo-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <svg className="w-12 h-12 mx-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-indigo-400 mt-2">Drag & drop image files here or click to browse</p>
                <p className="text-gray-500 text-sm mt-1">Supports JPG, PNG, BMP, GIF, WEBP</p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-indigo-600 mb-3">Selected Images ({files.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                      </div>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <button
                            onClick={() => moveFile(index, 'up')}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {index < files.length - 1 && (
                          <button
                            onClick={() => moveFile(index, 'down')}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                          title="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Settings */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-indigo-600 mb-3">PDF Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Page Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Size
                    </label>
                    <select 
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="a4">A4 (210 × 297 mm)</option>
                      <option value="letter">Letter (215.9 × 279.4 mm)</option>
                      <option value="legal">Legal (215.9 × 355.6 mm)</option>
                      <option value="a3">A3 (297 × 420 mm)</option>
                      <option value="a5">A5 (148 × 210 mm)</option>
                    </select>
                  </div>
                  
                  {/* Orientation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orientation
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="orientation"
                          value="portrait"
                          checked={orientation === 'portrait'}
                          onChange={() => setOrientation('portrait')}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          orientation === 'portrait'
                            ? 'bg-indigo-200 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          Portrait
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="orientation"
                          value="landscape"
                          checked={orientation === 'landscape'}
                          onChange={() => setOrientation('landscape')}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          orientation === 'landscape'
                            ? 'bg-indigo-200 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          Landscape
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="relative w-full">
                <button
                  onClick={handleConvert}
                  disabled={files.length === 0 || isConverting}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                    ${files.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 
                      'bg-indigo-500 hover:bg-indigo-600'}`}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-indigo-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <FiFileText className="h-5 w-5" />
                    {isConverting ? `Converting... ${progress}%` : 'Convert to PDF'}
                  </span>
                </button>
              </div>

              {/* Conversion Result */}
              {conversionResult && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-medium text-indigo-700 mb-2">Conversion Complete!</h3>
                  <p className="text-gray-600 mb-4">{conversionResult.message}</p>
                  
                  <button
                    onClick={() => window.open(`http://localhost:8000/download?file=${encodeURIComponent(conversionResult.fullPath)}`, '_blank')}
                    className="w-full py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 mt-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageToPDFPage;