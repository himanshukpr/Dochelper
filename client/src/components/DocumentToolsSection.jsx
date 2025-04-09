import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiGitMerge,
  FiScissors,
  FiMinimize2,
  FiImage,
  FiLock,
  FiUnlock
} from 'react-icons/fi';

const DocumentToolsSection = ({ navigate }) => {
  const pdfTools = [
    { title: 'Image to Text', icon: <FiFileText />, color: 'bg-[#dbeafe] text-blue-600' },
    { title: 'PDF Merge', icon: <FiGitMerge />, color: 'bg-purple-100 text-purple-600' },
    { title: 'PDF Split', icon: <FiScissors />, color: 'bg-green-100 text-green-600' },
    { title: 'PDF Compress', icon: <FiMinimize2 />, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'PDF to Image', icon: <FiImage />, color: 'bg-red-100 text-red-600' },
    { title: 'Image to PDF', icon: <FiFileText />, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Protect PDF', icon: <FiLock />, color: 'bg-pink-100 text-pink-600' },
    { title: 'Unprotect PDF', icon: <FiUnlock />, color: 'bg-teal-100 text-teal-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 15,
        duration: 0.3
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 15,
        mass: 0.5,
        duration: 0.05
      },
    },
  };

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Document Tools</h2>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full"
        variants={containerVariants}
      >
        {pdfTools.map((tool, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`p-6 rounded-xl shadow-md border border-gray-200 cursor-pointer ${tool.color}`}
            onClick={() => {
              if (tool.title === 'Image to Text') navigate('/img-to-text');
              if (tool.title === 'PDF Merge') navigate('/merge-pdfs');
              if (tool.title === 'PDF Split') navigate('/split-pdf');
            }}
            whileHover={{
              y: -4,
              scale: 1.02,
              boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)',
              transition: { 
                type: 'spring',
                stiffness: 800,
                damping: 15,
                duration: 0.05
              }
            }}
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-lg font-medium text-center">{tool.title}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DocumentToolsSection;
