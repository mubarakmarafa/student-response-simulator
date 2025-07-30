'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { demoQuestions, getRandomDemoQuestion } from '@/lib/demoData';

interface QuestionInputProps {
  onSubmit: (question: Question) => void;
  isLoading: boolean;
}

export default function QuestionInput({ onSubmit, isLoading }: QuestionInputProps) {
  const [questionText, setQuestionText] = useState('');
  const [numberOfResponses, setNumberOfResponses] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim()) {
      onSubmit({
        text: questionText.trim(),
        numberOfResponses
      });
    }
  };

  const handleDemoQuestion = (question: string) => {
    setQuestionText(question);
  };

  const handleRandomDemo = () => {
    const randomQuestion = getRandomDemoQuestion();
    setQuestionText(randomQuestion);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Input</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your question:
          </label>
          <textarea
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g., What is photosynthesis and why is it important?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white placeholder-gray-500"
            rows={3}
            required
          />
          
          {/* Demo Questions */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Try these examples:</span>
              <button
                type="button"
                onClick={handleRandomDemo}
                className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
              >
                🎲 Random
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoQuestions.slice(0, 4).map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDemoQuestion(question)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-left transition-colors border border-gray-200 truncate"
                  title={question}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="responses" className="block text-sm font-medium text-gray-700 mb-2">
            Number of student responses: 
            <span className="font-bold text-blue-600 text-lg ml-2">{numberOfResponses}</span>
          </label>
          
          {/* Slider */}
          <div className="mb-3">
            <input
              id="responses"
              type="range"
              min="1"
              max="20"
              value={numberOfResponses}
              onChange={(e) => setNumberOfResponses(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((numberOfResponses - 1) / 19) * 100}%, #e5e7eb ${((numberOfResponses - 1) / 19) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 response</span>
              <span className="text-center">Class size</span>
              <span>20 responses</span>
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs text-gray-600 self-center mr-2">Quick select:</span>
            {[3, 5, 8, 10, 15, 20].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setNumberOfResponses(count)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  numberOfResponses === count
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {/* Manual Input Option */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Or enter manually:</span>
                         <input
               type="number"
               min="1"
               max="50"
               value={numberOfResponses}
               onChange={(e) => {
                 const value = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                 setNumberOfResponses(value);
               }}
               className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             />
            <span className="text-xs text-gray-500">(max 50)</span>
          </div>

          {/* Response Time Estimate */}
          <div className="mt-2 text-xs text-gray-500">
            {numberOfResponses <= 5 && "⚡ Very fast generation"}
            {numberOfResponses > 5 && numberOfResponses <= 10 && "🚀 Fast generation"}
            {numberOfResponses > 10 && numberOfResponses <= 15 && "⏱️ Moderate generation time"}
            {numberOfResponses > 15 && "⏳ Longer generation time (worth the wait!)"}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !questionText.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Responses...
            </span>
          ) : (
            'Generate Student Responses'
          )}
        </button>
      </form>
    </div>
  );
} 