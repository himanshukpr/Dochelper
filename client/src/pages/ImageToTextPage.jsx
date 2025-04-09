import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FiImage, FiCopy, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ImageToTextPage = () => {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setText('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleConvert = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', image);

      // First check if backend URL is reachable
      try {
        await axios.get('http://localhost:8000/health', {
          timeout: 2000
        });
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          setError('Backend is not responding. Please check if the server is running.');
        } else {
          setError(`
            Backend server is not available. Please:
            1. Open terminal in server/ directory
            2. Run: node server.js
            3. Try again
          `);
        }
        setIsLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data && response.data.text) {
        setText(response.data.text);
        setPreviewURL(null);
        setImage(null);
      } else {
        setError('No text found in the image');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response) {
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Could not connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

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
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <motion.button 
                  onClick={() => window.history.back()}
                  className="flex items-center text-blue-600 hover:text-blue-800"
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
              <div className="flex justify-center items-center">
                <FiImage className="text-4xl text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold text-blue-600">Image to Text</h1>
              </div>
              <p className="text-lg text-blue-500 mt-2">Upload an image to extract text</p>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed border-blue-200 rounded-xl text-center cursor-pointer hover:bg-blue-50 transition-colors ${
                  isDragActive ? 'border-blue-500' : 'border-blue-200'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <FiImage className="text-4xl mb-3 text-blue-600" />
                  <p className="text-lg text-gray-600">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: JPEG, JPG, PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Image Info and Error */}
            {image && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600">
                  Selected: {image.name} ({Math.round(image.size / 1024)} KB)
                </p>
              </div>
            )}
            {error && <p className="mb-4 text-center text-red-500">{error}</p>}

            {previewURL && (
              <div className="flex justify-center mb-4">
                <img 
                  src={previewURL}
                  alt="Preview"
                  className="max-w-[200px] max-h-[200px] rounded-lg shadow-sm border border-gray-200 object-contain"
                />
              </div>
            )}

            {/* Convert Button */}
            <div className="flex justify-center mb-6">
              <div className="relative w-full">
                  <button
                    onClick={handleConvert}
                    disabled={isLoading || !image}
                    className={`w-full py-3 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                      ${isLoading || !image
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-gray-700 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <FiUpload className="h-5 w-5" />
                      {isLoading ? `Processing... ${progress}%` : 'Convert'}
                    </span>
                  </button>
              </div>
            </div>

            {/* Result Section */}
            {text && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Extracted Text</h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiCopy className="mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {text}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageToTextPage;
