import React, { useState, useEffect, useRef } from 'react'
import Navbar from './NavbarPage'
import { useFirebase } from '../../context/FirebaseContextProvider'
import { FaSync } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function TasklistPage() {
  const firebase = useFirebase();
  const [displayTask, setdisplayTask] = useState([])
  const task = useRef(null)
  const navigate = useNavigate()

  const getdata = async () => {
    if (!firebase.user) return navigate('/')
    try {
      setdisplayTask([]); // Clear the task list initially
      const result = await firebase.getTaskList();
      // Temporary array to store unique tasks
      const taskSet = new Set();
      const uniqueTasks = [];
      result.forEach((element) => {
        if (element[0].user === firebase.user.email) {
          const taskKey = element[1]; // Assuming `task` is the identifier of each task
          if (!taskSet.has(taskKey)) {
            taskSet.add(taskKey);
            uniqueTasks.push(element);
          }
        }
      });

      setdisplayTask(uniqueTasks); // Update state with unique tasks
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const setdata = async () => {
    try {
      const value = task.current.value.trim();
      if (value) {
        await firebase.setTaskList(value);
        getdata();
      } else {
        alert("Task cannot be empty!");
      }
      task.current.value = null;
      task.current.focus()
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleTasklistDelete = async(taskid)=>{
    await firebase.deleteTaskList(taskid)
    await getdata();
    console.log("task is deleted");
  }

  useEffect(() => {
    getdata()
  }, [])

  useEffect(() => {
    console.log(displayTask)
  }, [displayTask])

  return (
    <div className=' p-0 w-screen bg-mainsection'>
      <Navbar />
      <div className='flex flex-col w-screen h-screen justify-center items-center'>
        <h1 className="text-3xl font-bold mb-4 w-3/4 border-b border-gray-400 pb-2 text-center justify-center">Task List</h1>

        <div className="flex  gap-3 items-center justify-center">
          <input type="text" ref={task} className='border-2 border-gray-300 p-2 rounded  w-96' />
          <button onClick={setdata} className='bg-darkBlue font-medium  text-white rounded hover:bg-slate-400 hover:text-darkBlue hover:underline
            hover:-translate-y-0.5 bg-sync-button  py-2 px-4 uppercase hover:bg-sync-button-hover'>Add</button>
          <button onClick={getdata} className='uppercase text-2xl text-black bg-sync-button' title="Sync"><FaSync /></button>
        </div>

        <div className='mt-5 '>
          {displayTask.map((el, index) => {
            return (
              <tr key={index}>
                <td className="border-b w-80 border-gray-500 px-4 py-2">{el[0].task}</td>
                <td className="border-b w-44 border-gray-500 px-4 py-2"><button onClick={()=>handleTasklistDelete(el[1])}>Delete</button></td>
              </tr>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TasklistPage
