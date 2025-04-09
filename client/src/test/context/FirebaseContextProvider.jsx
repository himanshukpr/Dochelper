import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, inMemoryPersistence } from "firebase/auth";
import { getDatabase, set, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseApp } from './FirebaseConfig'

import { addDoc, collection, getDocs, getFirestore, deleteDoc, doc ,query, where } from "firebase/firestore";



const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const [user, setuser] = useState('')
    const FirebaseAuth = getAuth(FirebaseApp)
    const FirebaseDatabase = getDatabase(FirebaseApp)
    const db = getFirestore(FirebaseApp)

    // firebase function
    useEffect(() => {
        onAuthStateChanged(FirebaseAuth, (user) => {
            if (user) {
                setuser(user)
            }
        })
    }, [])

    const signup = (email, password) => {
        return (
            createUserWithEmailAndPassword(FirebaseAuth, email, password)
                .catch((error) => {
                    let errorMessage = error.code.split('/')[1];
                    errorMessage = errorMessage.replaceAll('-', ' ');
                    console.log(errorMessage);
                    alert(errorMessage)
                }))
    }
    const signin = (email, password) => {
        signInWithEmailAndPassword(FirebaseAuth, email, password)
            .catch((error) => {
                let errorMessage = error.code.split('/')[1];
                errorMessage = errorMessage.replaceAll('-', ' ');
                console.log(errorMessage);
                alert(errorMessage)
            })
    }
    const logout = () => {
        signOut(FirebaseAuth)
    }

    // tasklist to get and set the task in the tasklist in the realtime database
    const setTaskList = async (todoTask) => {
        console.log(`Adding task: ${todoTask}`);
        try {
            const docRef = await addDoc(collection(db, "tasklist/"), {
                task: todoTask,
                user: user.email
            });

            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const getTaskList = async () => {
        if (!user) return alert("Must create an account");
        const tasklist = []
        const querySnapshot = await getDocs(collection(db, "tasklist/"));
        querySnapshot.forEach((doc) => {
            tasklist.push([doc.data(), doc.id])
        });
        return tasklist
    }
    const deleteTaskList = async (Taskid) => {
        const ref = doc(db, "tasklist/", Taskid);
        await deleteDoc(ref)
    }

    // notes functions
    const setNotes = async (title, note) => {
        console.log(`Adding task: ${note}`);
        try {
            const docRef = await addDoc(collection(db, "Notes/"), {
                title: title,
                note: note,
                user: user.email
            });

            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const getNotes = async () =>{
        // const [notes, setnotes] = useState()
        
        const ref = collection(db, "Notes");
        const q = query(ref, where("user", "==", user.email));
        const snapshot = await getDocs(q);
        const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const n = newData;
        return n
    }

    return (
        <FirebaseContext.Provider value={{ signup, user, logout, signin, setTaskList, getTaskList, deleteTaskList,setNotes,getNotes }}>
            {props.children}
        </FirebaseContext.Provider>
    )
}
