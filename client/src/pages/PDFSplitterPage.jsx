import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiScissors, FiDownload, FiArrowLeft } from 'react-icons/fi';

const PDFSplitterPage = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [splitPages, setSplitPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setPdfFile(file);
      setSplitPages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleSplitPDF = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSplitPages([]);

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        throw new Error('Request timed out after 30 seconds');
      }, 30000);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      let response;
      try {
        response = await fetch('http://localhost:8000/api/split-pdf', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeout);
        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to split PDF');
        }
      } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        } else if (err.message.includes('Failed to fetch')) {
          throw new Error('Could not connect to server. Please make sure the server is running.');
        }
        throw err;
      }

      const result = await response.json();
      setSplitPages(result.pages.map(page => ({
        pageNumber: page.pageNumber,
        downloadUrl: page.url,
        filename: page.filename,
        fullPath: page.fullPath
      })));
    } catch (err) {
      setError(err.message || 'Failed to split PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPage = async (pageNumber) => {
    const page = splitPages.find(p => p.pageNumber === pageNumber);
    if (!page || !page.fullPath) {
      setError('Invalid page reference');
      return;
    }

    try {
      const downloadUrl = `http://localhost:8000/download?file=${encodeURIComponent(page.fullPath)}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = page.filename || `page-${pageNumber}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
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
            {/* Header with back button */}
            <div className="mb-8 text-center relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center text-green-600 hover:text-green-800"
                >
                  <FiArrowLeft className="h-6 w-6 mr-1" />
                  <span>Dashboard</span>
                </button>
              </div>
              <div className="flex justify-center items-center">
                <FiScissors className="text-4xl text-green-600 mr-3" />
                <h1 className="text-4xl font-bold text-green-600">PDF Splitter</h1>
              </div>
              <p className="text-lg text-green-400 mt-2">
                Upload a PDF to split into individual pages
              </p>
            </div>

            {/* PDF Upload Section */}
            <div className="mb-6">
              <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed border-green-200 rounded-xl text-center cursor-pointer hover:bg-green-50 transition-colors ${
                  isDragActive ? 'border-green-500' : 'border-green-200'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <FiScissors className="text-4xl mb-3 text-green-400" />
                  <p className="text-green-400">
                    {isDragActive
                      ? 'Drop the PDF here'
                      : 'Drag & drop a PDF here, or click to select'}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    Supported format: PDF
                  </p>
                </div>
              </div>
            </div>

            {/* File Info */}
            {pdfFile && (
              <div className="mb-4 text-center">
                <p className="text-sm font-medium text-gray-600 truncate max-w-xs mx-auto">
                  {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
                </p>
              </div>
            )}
            {error && <p className="mb-4 text-center text-red-500">{error}</p>}

            {/* Split Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSplitPDF}
                disabled={isLoading || !pdfFile}
                className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden
                  ${isLoading || !pdfFile
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <FiScissors className="h-5 w-5" />
                  {isLoading ? `Splitting... ${progress}%` : 'Split PDF'}
                </span>
              </button>
            </div>

            {/* Results Section */}
            {splitPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Split Pages</h2>
                <div className="space-y-3">
                  {splitPages.map((page) => (
                    <motion.div
                      key={page.pageNumber}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-4"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Page {page.pageNumber}</span>
                          <span className="text-xs text-gray-500">
                            {page.filename || `page-${page.pageNumber}.pdf`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadPage(page.pageNumber)}
                        className="flex items-center text-green-600 hover:text-green-800"
                      >
                        <FiDownload className="mr-1" />
                        Download
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFSplitterPage;
