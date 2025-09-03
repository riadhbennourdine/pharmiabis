
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

const FlashcardView: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full h-64 perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
            <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border-2 border-green-500 rounded-lg shadow-lg flex items-center justify-center p-6">
                    <p className="text-xl font-semibold text-center text-gray-800">{flashcard.question}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-green-600 rounded-lg shadow-lg flex items-center justify-center p-6 transform rotate-y-180">
                    <p className="text-lg text-center text-white">{flashcard.answer}</p>
                </div>
            </div>
        </div>
    );
};


const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === flashcards.length - 1 ? 0 : prev + 1));
  };
  
  if (!flashcards || flashcards.length === 0) {
      return <p>Pas de fiches flash disponibles.</p>;
  }


  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Fiches Flash Interactives</h3>
      <FlashcardView flashcard={flashcards[currentIndex]} />
      <div className="flex items-center justify-between mt-4">
        <button onClick={goToPrevious} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <p className="text-sm font-medium text-gray-600">
          Carte {currentIndex + 1} sur {flashcards.length}
        </p>
        <button onClick={goToNext} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
       <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-preserve-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
    </div>
  );
};

export default FlashcardDeck;