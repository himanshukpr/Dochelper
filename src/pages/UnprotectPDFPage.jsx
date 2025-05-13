import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUnlock } from 'react-icons/fi';

const UnprotectPDFPage = () => {
  const [file, setFile] = useState(null);
  const [isUnprotecting, setIsUnprotecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unprotectionResult, setUnprotectionResult] = useState(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUnprotectionResult(null); // Reset previous results
      setErrorMessage('');
    } else if (selectedFile) {
      alert('Please select a valid PDF file.');
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setUnprotectionResult(null); // Reset previous results
      setErrorMessage('');
    } else if (droppedFile) {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUnprotect = async () => {
    if (!file) return;
    
    // Validate password is provided
    if (!password) {
      alert('Please enter the PDF password');
      return;
    }
    
    setIsUnprotecting(true);
    setProgress(0);
    setErrorMessage('');
    
    try {
      // First check if backend is reachable
      await axios.get('http://localhost:8000/health', {
        timeout: 2000
      });

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('password', password);
      
      const response = await axios.post('http://localhost:8000/api/unprotect-pdf', formData, {
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

      // Handle successful unprotection
      setUnprotectionResult(response.data);
      setFile(null);
      setPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Unprotection failed:', error);
      let errorMsg = 'PDF unprotection failed';
      
      if (error.response) {
        // Handle specific error for incorrect password
        if (error.response.status === 401) {
          setErrorMessage('Incorrect password. Please try again.');
        } else {
          errorMsg = error.response.data?.error || 
                    error.response.data?.message || 
                    `Server error: ${error.response.status}`;
          setErrorMessage(errorMsg);
        }
      } else if (error.request) {
        errorMsg = 'Server is not responding. Please check:';
        errorMsg += '\n1. The server is running (node server.js)';
        errorMsg += '\n2. Your internet connection';
        setErrorMessage(errorMsg);
      } else {
        errorMsg = error.message;
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsUnprotecting(false);
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
            <div className="mb-8 text-center relative">
            <motion.button 
                  onClick={() => window.history.back()}
                  className="flex items-center text-teal-600 hover:text-teal-800"
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
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
               
              </div>
              <h1 className="text-4xl font-bold text-teal-600 mb-2">
                <FiUnlock className="inline mr-2" />
                Unprotect PDF
              </h1>
              <p className="text-lg text-teal-400">
                Remove password protection from your PDF documents
              </p>
            </div>

            {/* File Selection Section */}
            <div className="mb-6">
              <div 
                className="p-8 border-2 border-dashed border-teal-200 rounded-xl text-center cursor-pointer hover:bg-teal-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <svg className="w-12 h-12 mx-auto text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-teal-400 mt-2">Drag & drop password-protected PDF file here or click to browse</p>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-teal-600 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-teal-400 hover:text-teal-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Password Input */}
            {file && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-teal-600 mb-4">Enter PDF Password</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the PDF password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="relative w-full">
                <button
                  onClick={handleUnprotect}
                  disabled={!file || !password || isUnprotecting}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                    ${!file || !password ? 'bg-gray-300 cursor-not-allowed' : 
                      'bg-teal-500 hover:bg-teal-600'}`}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <FiUnlock className="h-5 w-5" />
                    {isUnprotecting ? `Removing protection... ${progress}%` : 'Remove Password Protection'}
                  </span>
                </button>
              </div>

              {/* Unprotection Result */}
              {unprotectionResult && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <h3 className="text-lg font-medium text-teal-700 mb-2">PDF Unprotected Successfully!</h3>
                  <p className="text-gray-700 mb-4">
                    Your PDF is now accessible without a password.
                  </p>
                  
                  <button
                    onClick={() => window.open(`http://localhost:8000/download?file=${encodeURIComponent(unprotectionResult.fullPath)}`, '_blank')}
                    className="w-full py-3 rounded-lg font-medium text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md flex items-center justify-center gap-2 mt-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Unprotected PDF
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

export default UnprotectPDFPage;