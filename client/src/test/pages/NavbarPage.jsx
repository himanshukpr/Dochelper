// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useFirebase } from '../context/FirebaseContextProvider.jsx';


// function Navbar() {
//     const firebase = useFirebase();
//     const [user, setUser] = useState(null);
//     const [refresh, setRefresh] = useState(false); // New state for refreshing

//     useEffect(() => {
//         setUser(firebase.user !== ''); // Update user state based on firebase user
//     }, [firebase.user, refresh]); // Add refresh to the effect dependencies

//     const styleli = 'w-full hover:font-bold text-blue hover:text-darkBlue transition-all cursor-pointer hover:underline hover:bg-slate-400 indent-5 hover:indent-6 p-2 ';

//     return (
//         <div className='min-w-64 h-screen bg-darkBlue p-0 m-0 relative'>
//             <h1 className='font-bold text-3xl text-center m-1 text-blue'>DocHelper</h1>
//             <ol className='flex p-0 flex-col my-4'>
//                 <Link to="/" className={styleli}>HOME</Link>
//                 <Link to="/img-to-text" className={styleli}>IMAGE TO TEXT</Link>
//                 <Link to="/task" className={styleli}>TASK LIST</Link>
//                 <Link to="/notes" className={styleli}>NOTES</Link>
//             </ol>
//             <div className=' h-auto absolute bottom-5 w-full  flex items-center justify-center gap-3'>
//                 {!user ?
//                     <>
//                         <Link to="/login" className='text-blue p-2'>Login</Link>
//                         <Link to="/register" className='bg-blue text-darkBlue p-2 border-2 border-blue rounded-md' >Register</Link>
//                     </>
//                     : <Link className='bg-blue text-darkBlue p-2 border-2 border-blue rounded-md' to="/profile">PROFILE</Link>}

//             </div>
//         </div>
//     );
// }

// export default Navbar;



import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContextProvider.jsx';

function Navbar() {
    const firebase = useFirebase();
    const [user, setUser] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setUser(firebase.user !== '');
    }, [firebase.user, refresh]);

    const styleLink = 'hover:font-bold text-blue hover:text-darkBlue transition-all cursor-pointer hover:underline p-2';
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className='bg-darkBlue w-full p-4 shadow-md'>
            <div className='container mx-auto flex flex-wrap items-center justify-between'>
                {/* Logo/Brand */}
                <div className='flex items-center'>
                    <h1 className='font-bold text-2xl text-blue'>DocHelper</h1>
                </div>

                {/* Mobile menu button */}
                <div className='block md:hidden'>
                    <button 
                        onClick={toggleMenu}
                        className='text-blue hover:text-white focus:outline-none'
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMenuOpen ? 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> :
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            }
                        </svg>
                    </button>
                </div>

                {/* Navigation Links - hidden on mobile unless menu is open */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:items-center md:w-auto md:block`}>
                    <div className='md:flex-grow md:flex md:justify-center'>
                        <Link to="/" className={styleLink}>HOME</Link>
                        <Link to="/img-to-text" className={styleLink}>IMAGE TO TEXT</Link>
                        <Link to="/task" className={styleLink}>TASK LIST</Link>
                        <Link to="/notes" className={styleLink}>NOTES</Link>
                    </div>
                </div>

                {/* Auth Buttons */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
                    {!user ?
                        <div className='flex gap-3 justify-center md:justify-end'>
                            <Link to="/login" className='text-blue p-2'>Login</Link>
                            <Link to="/register" className='bg-blue text-darkBlue p-2 border-2 border-blue rounded-md'>Register</Link>
                        </div>
                        : 
                        <Link className='bg-blue text-darkBlue p-2 border-2 border-blue rounded-md' to="/profile">PROFILE</Link>
                    }
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
