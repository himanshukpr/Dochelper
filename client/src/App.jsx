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
// user
import LoginPage from './test/pages/LoginPage'
import RegisterPage from './test/pages/RegisterPage';


  
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
    // {
    //   path: "/profile",
    //   element: <><Profile /></>
    // },
    // {
    //   path: "/login",
    //   element: <><LoginPage /></>
    // },
    // {
    //   path: "/register",
    //   element: <><RegisterPage /></>
    // },
    // {
    //   path: "/task",
    //   element: <><TasklistPage /></>
    // },
    // { 
    //   path: "/notes", // Adding route for NotesPage
    //   element: <><NotesPage /></>
    // },
    // { 
    //   path: "/test", // Adding route for NotesPage
    //   element: <><Notestest /></>
    // }

  ])


  return (
    <div className='flex'>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
