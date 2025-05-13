import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogIn, FiUserPlus, FiLogOut } from 'react-icons/fi';
import DocumentToolsSection from '../components/DocumentToolsSection';
import ProductivityToolsSection from '../components/ProductivityToolsSection';
import { useFirebase } from '../context/FirebaseContextProvider';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useFirebase();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    //refresh the page
    window.location.reload();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] w-full">
      <div className="px-6 py-8 w-full max-w-none relative">
        {/* Top right buttons and hamburger */}
        <div className="absolute top-4 right-4 z-50">
          {/* Hamburger icon - visible on small screens */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Buttons - hidden on small screens, visible on md and up */}
          <div className="hidden md:flex space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-black text-black rounded-3xl hover:bg-blue-700 transition"
                >
                  <FiLogIn className="mr-2" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-blue bg-blue text-white rounded-3xl hover:bg-blue-700 transition"
                >
                  <FiUserPlus className="mr-2" />
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 transition"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            )}
          </div>

          {/* Dropdown menu - visible on small screens when menuOpen */}
          {menuOpen && (
            <div className="md:hidden mt-2 flex flex-col space-y-2 bg-white border border-gray-300 rounded-lg p-2 shadow-lg items-start absolute right-0 top-10 z-50 min-w-[140px]">
              {!user ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/signin');
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-start whitespace-nowrap w-full px-4 py-2 bg-blue-600 border border-black text-black rounded-3xl hover:bg-blue-700 transition"
                  >
                    <FiLogIn className="mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-start whitespace-nowrap w-full px-4 py-2 bg-blue-600 border border-blue bg-blue text-white rounded-3xl hover:bg-blue-700 transition"
                  >
                    <FiUserPlus className="mr-2" />
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-start whitespace-nowrap w-full px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 transition"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>

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
