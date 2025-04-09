import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DocumentToolsSection from '../components/DocumentToolsSection';
import ProductivityToolsSection from '../components/ProductivityToolsSection';

const Dashboard = () => {
  const navigate = useNavigate();

  // Animation variants
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] w-full">
      <div className="px-6 py-8 w-full max-w-none">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all your document and productivity tools in one place
            </p>
          </div>


          {/* Productivity Tools Section */}
          <ProductivityToolsSection />
          
          {/* Document Tools Section */}
          <DocumentToolsSection navigate={navigate} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
