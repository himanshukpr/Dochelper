import React from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiCheckSquare } from 'react-icons/fi';

const ProductivityToolsSection = () => {
  const productivityTools = [
    { title: 'Manage Notes', icon: <FiBook />, color: 'bg-[#dbeafe] text-blue-600' },
    { title: 'Task List', icon: <FiCheckSquare />, color: 'bg-purple-100 text-purple-600' },
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
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Productivity Tools</h2>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full"
        variants={containerVariants}
      >
        {productivityTools.map((tool, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`p-8 rounded-xl shadow-md border border-gray-200 cursor-pointer ${tool.color}`}
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
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-center mb-2">{tool.title}</h3>
              <p className="text-gray-600 text-center">
                {tool.title === 'Manage Notes' 
                  ? 'Create and organize your notes efficiently' 
                  : 'Track and complete your daily tasks'}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProductivityToolsSection;
