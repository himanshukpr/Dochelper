import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiImage } from 'react-icons/fi';

const PDFToImagePage = () => {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState(null);
  const [imageFormat, setImageFormat] = useState('png');
  const [imageQuality, setImageQuality] = useState('medium');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setConversionResult(null); // Reset previous results
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
      setConversionResult(null); // Reset previous results
    } else if (droppedFile) {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setIsConverting(true);
    setProgress(0);
    
    try {
      // First check if backend is reachable
      await axios.get('http://localhost:8000/health', {
        timeout: 2000
      });

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('imageFormat', imageFormat);
      formData.append('imageQuality', imageQuality);
      
      const response = await axios.post('http://localhost:8000/api/pdf-to-image', formData, {
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
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      let errorMessage = 'PDF to Image conversion failed';
      
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
      if (!conversionResult && fileInputRef.current) {
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
            <motion.button 
                  onClick={() => window.history.back()}
                  className="flex items-center text-red-600 hover:text-red-800"
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
            <div className="mb-8 text-center relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                
              </div>
              <h1 className="text-4xl font-bold text-red-600 mb-2">
                <FiImage className="inline mr-2" />
                PDF to Image
              </h1>
              <p className="text-lg text-red-400">
                Convert your PDF documents to image files
              </p>
            </div>

            {/* File Selection Section */}
            <div className="mb-6">
              <div 
                className="p-8 border-2 border-dashed border-red-200 rounded-xl text-center cursor-pointer hover:bg-red-50 transition-colors"
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
                <svg className="w-12 h-12 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-red-400 mt-2">Drag & drop PDF file here or click to browse</p>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-600 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Conversion Settings */}
            {file && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-red-600 mb-3">Conversion Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Format
                    </label>
                    <select 
                      value={imageFormat}
                      onChange={(e) => setImageFormat(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                    >
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpg">JPG (Smaller files)</option>
                      <option value="webp">WEBP (Modern format)</option>
                    </select>
                  </div>
                  
                  {/* Image Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Quality
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="imageQuality"
                          value="low"
                          checked={imageQuality === 'low'}
                          onChange={() => setImageQuality('low')}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          imageQuality === 'low'
                            ? 'bg-red-200 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          Low
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="imageQuality"
                          value="medium"
                          checked={imageQuality === 'medium'}
                          onChange={() => setImageQuality('medium')}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          imageQuality === 'medium'
                            ? 'bg-red-200 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          Medium
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="imageQuality"
                          value="high"
                          checked={imageQuality === 'high'}
                          onChange={() => setImageQuality('high')}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          imageQuality === 'high'
                            ? 'bg-red-200 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          High
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
                  disabled={!file || isConverting}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                    ${!file ? 'bg-gray-300 cursor-not-allowed' : 
                      'bg-red-500 hover:bg-red-600'}`}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <FiImage className="h-5 w-5" />
                    {isConverting ? `Converting... ${progress}%` : 'Convert to Images'}
                  </span>
                </button>
              </div>

              {/* Conversion Result */}
              {conversionResult && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-lg font-medium text-red-700 mb-2">Conversion Complete!</h3>
                  <p className="text-gray-600 mb-4">{conversionResult.message}</p>
                  
                  {/* Images Preview */}
                  {conversionResult.images && conversionResult.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        Generated Images ({conversionResult.images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {conversionResult.images.slice(0, 8).map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={`http://localhost:8000${image.url}`}
                              alt={`Page ${image.pageNumber}`}
                              className="h-24 w-full object-cover rounded border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a 
                                href={`http://localhost:8000/download?file=${encodeURIComponent(image.fullPath)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-white text-sm font-medium"
                              >
                                Download
                              </a>
                            </div>
                            <p className="text-xs text-center mt-1">Page {image.pageNumber}</p>
                          </div>
                        ))}
                        {conversionResult.images.length > 8 && (
                          <div className="h-24 flex items-center justify-center bg-red-100 rounded">
                            <p className="text-red-600 text-sm">+{conversionResult.images.length - 8} more</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Download All Button */}
                  {conversionResult.zipUrl && (
                    <button
                      onClick={() => window.open(`http://localhost:8000${conversionResult.zipUrl}`, '_blank')}
                      className="w-full py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2 mt-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download All Images (ZIP)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFToImagePage;