import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMinimize2 } from 'react-icons/fi';

const PDFCompressPage = () => {
  const [file, setFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCompressionResult(null); // Reset previous results
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
      setCompressionResult(null); // Reset previous results
    } else if (droppedFile) {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCompressionLevelChange = (e) => {
    setCompressionLevel(e.target.value);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    setProgress(0);
    
    try {
      // First check if backend is reachable
      await axios.get('http://localhost:8000/health', {
        timeout: 2000
      });

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('compressionLevel', compressionLevel);
      
      const response = await axios.post('http://localhost:8000/api/compress-pdf', formData, {
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

      // Handle successful compression
      setCompressionResult(response.data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Compression failed:', error);
      let errorMessage = 'PDF compression failed';
      
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
      setIsCompressing(false);
      if (!compressionResult && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
                  className="flex items-center text-yellow-600 hover:text-yellow-800"
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
              <h1 className="text-4xl font-bold text-yellow-600 mb-2">
                <FiMinimize2 className="inline mr-2" />
                Compress PDF
              </h1>
              <p className="text-lg text-yellow-400">
                Reduce the file size of your PDF documents
              </p>
            </div>

            {/* File Selection Section */}
            <div className="mb-6">
              <div 
                className="p-8 border-2 border-dashed border-yellow-200 rounded-xl text-center cursor-pointer hover:bg-yellow-50 transition-colors"
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
                <svg className="w-12 h-12 mx-auto text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-yellow-400 mt-2">Drag & drop PDF file here or click to browse</p>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-600 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-yellow-400 hover:text-yellow-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Compression Level Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-yellow-600 mb-3">Compression Level</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="compressionLevel"
                    value="low"
                    checked={compressionLevel === 'low'}
                    onChange={handleCompressionLevelChange}
                    className="hidden"
                  />
                  <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    compressionLevel === 'low'
                      ? 'bg-yellow-200 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    Low
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="compressionLevel"
                    value="medium"
                    checked={compressionLevel === 'medium'}
                    onChange={handleCompressionLevelChange}
                    className="hidden"
                  />
                  <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    compressionLevel === 'medium'
                      ? 'bg-yellow-200 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    Medium
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="compressionLevel"
                    value="high"
                    checked={compressionLevel === 'high'}
                    onChange={handleCompressionLevelChange}
                    className="hidden"
                  />
                  <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    compressionLevel === 'high'
                      ? 'bg-yellow-200 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    High
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="relative w-full">
                <button
                  onClick={handleCompress}
                  disabled={!file || isCompressing}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                    ${!file ? 'bg-gray-300 cursor-not-allowed' : 
                      'bg-yellow-400 hover:bg-yellow-500'}`}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-yellow-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <FiMinimize2 className="h-5 w-5" />
                    {isCompressing ? `Compressing... ${progress}%` : 'Compress PDF'}
                  </span>
                </button>
              </div>

              {/* Compression Result */}
              {compressionResult && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-medium text-yellow-700 mb-2">Compression Results</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Size:</span>
                      <span className="font-medium">{compressionResult.originalSize} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compressed Size:</span>
                      <span className="font-medium">{compressionResult.compressedSize} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reduction:</span>
                      <span className="font-medium text-yellow-700">{compressionResult.compressionRatio}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${compressionResult.compressionRatio}%` }}
                      ></div>
                    </div>
                    
                    <button
                      onClick={() => window.open(`http://localhost:8000/download?file=${encodeURIComponent(compressionResult.fullPath)}`, '_blank')}
                      className="w-full py-3 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-all shadow-md flex items-center justify-center gap-2 mt-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Compressed PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFCompressPage;