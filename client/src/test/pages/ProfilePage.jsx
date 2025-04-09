import Navbar from './NavbarPage'
import { useNavigate } from 'react-router-dom'
import { useFirebase } from '../context/FirebaseContextProvider.jsx';

function Profile() {

  const firebase = useFirebase()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/'); // Redirect to home page
    firebase.logout();
    window.location.reload(false); // Toggle refresh state to trigger re-render
    setRefresh(!refresh);
  };

  return (
    <div className='flex p-0 w-screen bg-mainsection'>
      <Navbar />
      <div className='flex flex-col w-screen h-screen justify-center items-center'>
        <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4'>
          <h1 className='text-2xl font-bold mb-4'>Profile</h1>
          <p className='text-lg mb-4'>Welcome, {firebase.user.email}</p>
          <p className='text-lg mb-4'>Name: {firebase.user.displayName}</p>
          <p className='text-lg mb-4'>User ID: {firebase.user.uid}</p>
          <button className='bg-white border-2 border-black text-black px-4 py-2 rounded hover:bg-blue-600 mt-4'>Edit Profile</button>
          <button className='bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600' onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Profile