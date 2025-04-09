import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import './note.css';

function Notestest() {
  const [cards, setCards] = useState([
    { id: 1, title: 'Drag Me!', content: 'This card can be moved anywhere', color: '#ffadad' },
    { id: 2, title: 'Move Me', content: 'Try positioning this one somewhere else', color: '#a0c4ff' },
    { id: 3, title: 'Draggable', content: 'All these cards are fully draggable', color: '#bdb2ff' },
    { id: 4, title: 'Position Freely', content: 'Place me wherever you want', color: '#caffbf' }
  ]);

  // Create refs for each card
  const nodeRefs = cards.map(() => useRef(null));

  const handleDragStop = (id, e, data) => {
    // console.log(Card ${id} moved to:, { x: data.x, y: data.y });
  };

  const arrangeNotes = () => {
    const newPositions = [
      { id: 1, position: { x: 0, y: 0 } },
      { id: 2, position: { x: 200, y: 0 } },
      { id: 3, position: { x: 0, y: 200 } },
      { id: 4, position: { x: 200, y: 200 } }
    ];

    setCards((prevCards) => 
      prevCards.map(card => {
        const newPosition = newPositions.find(pos => pos.id === card.id);
        return { ...card, position: newPosition.position };
      })
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <button onClick={arrangeNotes}>Arrange Notes</button>
        <h1>Draggable Components</h1>
        <p className="subtitle">Drag and position the cards anywhere on the board</p>
      </header>

      <div className="drag-board">
        {cards.map((card) => (
          <Draggable 
            key={card.id} 
            nodeRef={nodeRefs[card.id - 1]}
            defaultPosition={card.position}
            grid={[5, 5]} 
            onStop={(e, data) => handleDragStop(card.id, e, data)}
          >
            <div 
              ref={nodeRefs[card.id - 1]} 
              className="drag-card" 
              style={{ backgroundColor: card.color }}
            >
              <div className="drag-handle">⋮⋮⋮</div>
              <h3>{card.title}</h3>
              <p>{card.content}</p>
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}

export default Notestest;
