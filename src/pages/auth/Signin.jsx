import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirebase } from '../../context/FirebaseContextProvider.jsx';
import { MdEmail } from "react-icons/md";
import { TbPassword } from "react-icons/tb";

function LoginPage() {
  const firebase = useFirebase();
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  // State for dynamic balls
  const [balls, setBalls] = useState([]);

  // Generate random balls on mount
  useEffect(() => {
    const generateBalls = () => {
      const ballsArray = [];
      const count = 12; // increased number of balls
      for (let i = 0; i < count; i++) {
        const size = Math.floor(Math.random() * 120) + 100; // size between 100 and 220 px (more big)
        // Positions scattered more broadly across the screen
        const top = Math.floor(Math.random() * 90) + 5; // top between 5% and 95%
        const left = Math.floor(Math.random() * 90) + 5; // left between 5% and 95%
        const opacity = Math.random() * 0.3 + 0.3; // opacity between 0.3 and 0.6
        ballsArray.push({ size, top, left, opacity, id: i });
      }
      return ballsArray;
    };
    setBalls(generateBalls());
  }, []);

  const handleLogin = async () => {
    try {
      setErrorMessage('');
      await firebase.signin(emailValue, passwordValue);
      // If we get here, login was successful, so navigate to home
      navigate('/');
    } catch (error) {
      setErrorMessage('Login failed: ' + (error.message || 'Please check your credentials'));
    }
  };

  return (
    <div className="w-screen flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 px-4 relative overflow-hidden">
      {/* Animated background balls */}
      {balls.map((ball) => (
        <div
          key={ball.id}
          className="absolute bg-blue rounded-full animate-slow-move"
          style={{
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            top: `${ball.top}%`,
            left: `${ball.left}%`,
            opacity: ball.opacity,
          }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-3xl w-full max-w-md flex flex-col items-center relative z-10"
        style={{ boxShadow: '0 0 15px 5px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Branding */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-blue tracking-wide">DocHelper</h1>
          <p className="text-blue font-semibold">Your Document Assistant</p>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Log In</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col space-y-5 w-full"
          aria-label="Login form"
        >
          <label htmlFor="email" className="text-gray-700 font-medium flex items-center space-x-2">
            <MdEmail className="h-5 w-5 text-blue-500" />
            <span>Email</span>
          </label>
          <input
            id="email"
            type="email"
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter your email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            required
            aria-required="true"
          />

          <label htmlFor="password" className="text-gray-700 font-medium flex items-center space-x-2">
            <TbPassword className="h-5 w-5 text-blue-500" />
            <span>Password</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
              placeholder="Enter your password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12c0-1.657 3-6 9-6s9 4.343 9 6-3 6-9 6-9-4.343-9-6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M1 1l22 22"
                  />
                </svg>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-red-600 text-sm mt-1" role="alert" aria-live="assertive">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="bg-blue text-white py-3 rounded-md font-semibold hover:bg-blue transition transform hover:-translate-y-1 w-full shadow-md"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-blue cursor-pointer hover:underline"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/signup');
              }
            }}
          >
            Sign up
          </span>
        </p>
      </motion.div>

      <style>{`
        @keyframes slowMove {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, 20px);
  }
  100% {
    transform: translate(0, 0);
  }
}
.animate-slow-move {
  animation: slowMove 10s ease-in-out infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
      `}</style>
    </div>
  );
}

export default LoginPage;
