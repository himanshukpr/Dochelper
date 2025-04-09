import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavbarPage.jsx'
import { useFirebase } from '../context/FirebaseContextProvider.jsx';

function LoginPage() {


    const firebase = useFirebase();
    const [emailValue, setEmailValue] = useState('himanshu@gmail.com');
    const [passwordValue, setPasswordValue] = useState('123456');
    const navigator = useNavigate();

    const signupbutton = () => {
        console.log(firebase.signin(emailValue, passwordValue))
        navigator('/')

    };

    return (
        <div className='flex bg-mainsection w-screen'>
            <Navbar />
            <div className='flex justify-center items-center w-screen  '>
                <div className='flex flex-col bg-white p-5  w-80 border rounded-3xl shadow-xl'>
                    <h2 className='text-2xl font-bold mb-4'>LogIn</h2>
                    <input
                        type="email"
                        className='border-2 border-black p-2 mb-4 w-full  rounded-md'
                        placeholder='Email'
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                    />
                    <input
                        type="password"
                        className='border-2 border-black p-2 mb-4 w-full rounded-md'
                        placeholder='Password'
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                    />
                    <button className='transition-all 
        p-2 w-full  max-w-xs bg-darkBlue font-medium  text-white rounded-md hover:bg-slate-400 hover:text-darkBlue hover:underline
        hover:-translate-y-0.5'
                        onClick={signupbutton}>LogIn</button>

                    <p className='mt-4'>
                        Don't have an account? <span onClick={() => navigator('/register')} className='cursor-pointer text-blue-500'>Register</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage