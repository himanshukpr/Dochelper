import React from 'react'
import Navbar from './NavbarPage.jsx'
import { useFirebase } from '../context/FirebaseContextProvider.jsx';

function home() {
  const firebase = useFirebase()

  const handleclick=()=>{
    console.log(firebase.user)
  }


  return (
    <div className='h-screen bg-mainsection w-screen '>
      <Navbar />
      <div>
        This is home page
        <button className='border-2 border-black p-2' onClick={handleclick}>User name</button>
      </div>
    </div>
  )
}

export default home