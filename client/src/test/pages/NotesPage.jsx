import React, { useEffect, useRef, useState } from "react";
import Navbar from "./NavbarPage";
import Draggable from 'react-draggable';
import { useFirebase } from "../context/FirebaseContextProvider";

function NotesPage() {
  const firebase = useFirebase();
  const [cards, setCards] = useState([]);

  const setNotes = () => {
    firebase.setNotes("this is the title", "hello this is a note");
    getNotes();
  };

  const getNotes = async () => {
    const data = await firebase.getNotes();
    // setCards(data.map((card, index) => ({
    //   ...card,
    //   position: { x: 20 + index * 50, y: 20 + index * 50 }, // Initial positions
    //   width: 150, // Default width of card
    //   height: 100 // Default height of card
    // })));
    setCards(data)
    console.log(data);
  };

  // Using refs to manage draggable elements
  // const nodeRefs = useRef([]);

  // // Auto arrange cards into a grid layout
  // const autoArrange = () => {
  //   const containerWidth = document.querySelector('.drag-board').offsetWidth; // Dynamically get container width
  //   const cardWidth = cards[0].width + 10; // Width + margin
  //   const cardHeight = cards[0].height + 10; // Height + margin
  //   const cardsPerRow = Math.floor(containerWidth / cardWidth); // Calculate how many cards fit in a row

  //   const newPositions = cards.map((card, index) => ({
  //     ...card,
  //     position: {
  //       x: (index % cardsPerRow) * cardWidth,
  //       y: Math.floor(index / cardsPerRow) * cardHeight
  //     }
  //   }));

  //   setCards(newPositions); // Update card positions based on grid layout
  // };

  // Handle drag stop event
  // const handleDragStop = (id, e, data) => {
  //   setCards((prevCards) =>
  //     prevCards.map((card) =>
  //       card.id === id
  //         ? { ...card, position: { x: data.x, y: data.y } }
  //         : card
  //     )
  //   );
  //   console.log(`Card ${id} moved to:`, { x: data.x, y: data.y });
  // };

  // Ensure refs are updated correctly when cards change
  // useEffect(() => {
  //   nodeRefs.current = nodeRefs.current.slice(0, cards.length);
  // }, [cards]);

  useEffect(() => {
    getNotes(); // Fetch the notes when the component mounts
    console.log(cards)
  }, []);

  return (
    <div className="flex p-0 w-screen bg-mainsection">
      <Navbar />
      <div className="flex flex-col w-screen h-screen justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 w-3/4 border-b border-gray-400 pb-2 text-center justify-center">
          Notes
        </h1>
        <button onClick={() => setNotes()} className="mb-2 bg-blue-500 text-black p-2 rounded">
          Add Note
        </button>
        <button onClick={() => getNotes()} className="mb-4 bg-green-500 text-white p-2 rounded">
          Refresh Notes
        </button>

        
        <div>
          {cards.map(ele=>{
            return <div className="">
              <p>{ele.title}</p>
              <p>{ele.note}</p>
            </div>
          })}
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
