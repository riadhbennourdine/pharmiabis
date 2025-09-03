
import React, { useState } from 'react';
import { QuizQuestion, QuizQuestionType } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface QuizSectionProps {
  quiz: QuizQuestion[];
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };
  
  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  }

  const getScore = () => {
    return quiz.reduce((score, question, index) => {
      return score + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };
  
  if (!quiz || quiz.length === 0) {
      return <p>Pas de quiz disponible.</p>;
  }


  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Testez vos connaissances</h3>
      {submitted && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
            <p className="font-bold">Votre score : {getScore()} / {quiz.length}</p>
        </div>
      )}
      
      <div className="space-y-8">
        {quiz.map((q, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="font-semibold text-gray-800 mb-4">{index + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((option, optionIndex) => {
                const isCorrect = option === q.correctAnswer;
                const isSelected = answers[index] === option;
                
                let optionClass = "flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ";
                if(submitted) {
                    optionClass += "cursor-not-allowed ";
                    if(isCorrect) {
                        optionClass += "bg-green-100 border-green-400 text-green-800";
                    } else if (isSelected) {
                        optionClass += "bg-red-100 border-red-400 text-red-800";
                    } else {
                        optionClass += "border-gray-300";
                    }
                } else {
                   optionClass += isSelected ? "bg-green-100 border-green-500" : "bg-gray-50 hover:bg-gray-100 border-gray-300";
                }

                return (
                  <label key={optionIndex} className={optionClass}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => !submitted && handleAnswerChange(index, option)}
                      className="hidden"
                    />
                    <span>{option}</span>
                    {submitted && isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto" />}
                    {submitted && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5 text-red-600 ml-auto" />}
                  </label>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <strong>Explication :</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        {!submitted ? (
             <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.length}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Soumettre
            </button>
        ) : (
            <button
              onClick={resetQuiz}
              className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition"
            >
              Recommencer le Quiz
            </button>
        )}
      </div>
    </div>
  );
};

export default QuizSection;