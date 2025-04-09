import React, { useState, useEffect,useRef } from 'react';
import Navbar from './NavbarPage';
import axios from 'axios';
const port = 8000;

function ImgToText() {
  const [file, setFile] = useState(null); // takes the file path
  const [textdata, setTextdata] = useState({}); // the response we get from the server
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(''); // add a state variable for file name
  const convertbutton = useRef('CONVERT')


  // handle the change of the file and put the path of the file in the 'file' variable
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name); // set the file name
    console.log(selectedFile.name);
  };

  // will send the file to the server
  const handleClick = async () => {
    if (!file) return; // check for the file is selected or not

    convertbutton.current.value = "CONVERT...";

    const formData = new FormData();
    formData.append('file', file); // will set the file path here for upload

    try {
      setLoading(true);
      // send the file at the server and take the results
      const res = await axios.post(`http://localhost:${port}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.data);
      setTextdata(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
    convertbutton.current.value = "CONVERT";
  };

  return (
    <div className=' bg-mainsection h-screen '>
      <Navbar />
      <div className='flex flex-col items-center justify-center p-10  w-screen '>
        {/* file to select */}
        <div className='bg-white p-8 border rounded-3xl shadow-lg'>
          <div className='bg border-4 border-dashed border-borderBlue cursor-pointer flex justify-center'>
            <p className='flex flex-col cursor-pointer absolute items-center'>
              <svg
                width='80'
                height='80'
                viewBox='0 0 165 164'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M133.739 61.7596C126.631 33.6163 97.9161 16.5288 69.6013 23.5934C47.4739 29.1145 31.4069 48.1229 29.7515 70.7386C14.0401 73.3139 3.4038 88.0607 5.99478 103.677C8.29804 117.56 20.4009 127.727 34.5568 127.671H58.5835V118.119H34.5568C23.9412 118.119 15.3355 109.565 15.3355 99.0138C15.3355 88.4625 23.9412 79.9089 34.5568 79.9089C37.2109 79.9089 39.3622 77.7707 39.3622 75.1327C39.3381 51.3922 58.6817 32.1274 82.567 32.1038C103.243 32.0832 121.042 46.6118 125.041 66.7743C125.436 68.7875 127.08 70.3254 129.126 70.5953C142.263 72.4547 151.396 84.5472 149.525 97.6045C147.846 109.33 137.774 118.06 125.858 118.119H106.637V127.671H125.858C144.436 127.615 159.45 112.601 159.394 94.1364C159.347 78.7659 148.762 65.4071 133.739 61.7596Z'
                  fill='black'></path>
                <path
                  d='M79.1984 81.2943L59.9771 100.399L66.7526 107.134L77.8049 96.1961V142H87.4156V96.1961L98.4198 107.134L105.195 100.399L85.974 81.2943C84.0996 79.4424 81.0728 79.4424 79.1984 81.2943Z'
                  fill='black'></path>
              </svg>
              Click to select Photo
            </p>
            <input
              type='file'
              accept='.png, .jpeg'
              className='w-96 h-28 opacity-0 cursor-pointer'
              onChange={handleFileChange}
            />
          </div>
        </div>
        {fileName && <p>Selected File: {fileName}</p>} {/* display the file name */}

        <button
          className='px-6 m-4 w-auto h-12 uppercase font-semibold tracking-wider border-2 border-black text-black'
          onClick={handleClick}
          ref={convertbutton}>
          {loading?"CONVERTING...":"CONVERT"}
          
        </button>

        
          {loading
            ? ''
            : textdata.text
            ? <div className='relative align-middle outline-none m-12 0 p-10 rounded-lg bg-white shadow-xl'>
            <button className='border border-black px-2 rounded-sm absolute right-2 top-2 bg-blue-500 text-black hover:bg-blue-700' onClick={()=>{navigator.clipboard.writeText(textdata.text);}}>Copy</button>
            <p>{textdata.text}</p></div>
            : ''}
            
      </div>
    </div>
  )}
  
  export default ImgToText