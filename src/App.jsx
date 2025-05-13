import React, { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Pages
// import ImgToText from './test/pages/Img-to-textPage';
// import NotesPage from './test/pages/NotesPage'; // Importing the new NotesPage
// import Home from './test/pages/homePage'
// import Profile from './test/pages/ProfilePage';
// import TasklistPage from './test/pages/TasklistPage';

// import Notestest from './test/pages/notestest';

import Dashboard from './pages/Dashboard';
import ImageToTextPage from './pages/ImageToTextPage';
import PDFSplitterPage from './pages/PDFSplitterPage';
import PDFMergePage from './pages/PDFMergePage';
import PDFCompressPage from './pages/PDFCompressPage';
import ImageToPDFPage from './pages/ImageToPDFPage';
import PDFToImagePage from './pages/PDFToImagePage';
import ProtectPDFPage from './pages/ProtectPDFPage';
import UnprotectPDFPage from './pages/UnprotectPDFPage'; // Import the new UnprotectPDFPage

import TasklistPage from './pages/TasklistPage';
import NotesPage from './pages/NotesPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
// user
import Signin from './pages/auth/Signin'
import Signup from './pages/auth/Signup';




  
function App() {

  const router = createBrowserRouter([
    {
      path: "/dashboard",
      element: <><Dashboard /></>
    },
    {
      path: "/",
      element: <><Dashboard /></>
    },
    {
      path: "/img-to-text",
      element: <><ImageToTextPage /></>
    },
    {
      path: "/merge-pdfs",
      element: <><PDFMergePage /></>
    },
    {
      path: "/split-pdf",
      element: <><PDFSplitterPage /></>
    },
    {
      path: "/compress-pdf",
      element: <><PDFCompressPage /></>
    },
    {
      path: "/image-to-pdf",
      element: <><ImageToPDFPage /></>
    },
    {
      path: "/pdf-to-image",
      element: <><PDFToImagePage /></>
    },
    {
      path: "/protect-pdf",
      element: <><ProtectPDFPage /></>
    },
    {
      path: "/unprotect-pdf",
      element: <><UnprotectPDFPage /></>
    },
    {
      path: "/tasklist",
      element: <ProtectedRoute><TasklistPage /></ProtectedRoute>
    },
  {
    path: "/signin",
    element: <GuestRoute><Signin /></GuestRoute>
  },
  {
    path: "/signup",
    element: <GuestRoute><Signup /></GuestRoute>
  },
  {
    path: "/notes",
    element: <ProtectedRoute><NotesPage /></ProtectedRoute>
  }
  ])


  return (
    <div className='flex'>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
