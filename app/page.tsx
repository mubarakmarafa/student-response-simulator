'use client';

import { useState, useEffect } from 'react';
import QuestionInput from '@/components/QuestionInput';
import StudentResponsesList from '@/components/StudentResponsesList';
import AnalysisPanel from '@/components/AnalysisPanel';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Question, StudentResponse, Analysis } from '@/lib/types';
import { generateMockStudentResponses, generateMockAnalysis } from '@/lib/mockData';
import { 
  generateStudentResponses, 
  generateAnalysisResponse, 
  storeApiKey, 
  getStoredApiKey, 
  clearStoredApiKey,
  isValidApiKeyFormat 
} from '@/lib/openaiApi';
import { getDemoResponsesForQuestion } from '@/lib/demoData';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [studentResponses, setStudentResponses] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load API key from sessionStorage on component mount
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey && isValidApiKeyFormat(storedKey)) {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    if (!isValidApiKeyFormat(newApiKey)) {
      setError('Invalid API key format. OpenAI API keys should start with "sk-" followed by alphanumeric characters.');
      return;
    }
    
    setApiKey(newApiKey);
    storeApiKey(newApiKey);
    setError(null);
  };

  const handleClearApiKey = () => {
    setApiKey(null);
    clearStoredApiKey();
    setError(null);
  };

  const handleQuestionSubmit = async (question: Question) => {
    setIsLoading(true);
    setCurrentQuestion(question.text);
    setError(null);
    
    try {
      let responses: StudentResponse[];
      
      // Check if we have pre-made demo responses for this exact question
      const demoResponses = getDemoResponsesForQuestion(question.text);
      
      if (demoResponses) {
        // Use demo responses with simulated delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // If requesting more responses than available, supplement with mock data
        if (question.numberOfResponses > demoResponses.length) {
          const additionalNeeded = question.numberOfResponses - demoResponses.length;
          const additionalResponses = generateMockStudentResponses(question.text, additionalNeeded)
            .map((response, index) => ({
              ...response,
              id: demoResponses.length + index + 1
            }));
          responses = [...demoResponses, ...additionalResponses];
        } else {
          responses = demoResponses.slice(0, question.numberOfResponses);
        }
      } else if (apiKey) {
        // Use real OpenAI API
        try {
          responses = await generateStudentResponses(question.text, question.numberOfResponses, apiKey);
        } catch (apiError) {
          console.error('OpenAI API error:', apiError);
          setError(apiError instanceof Error ? apiError.message : 'Failed to connect to OpenAI API');
          // Fall back to mock data
          responses = generateMockStudentResponses(question.text, question.numberOfResponses);
        }
      } else {
        // Use mock data with simulated delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        responses = generateMockStudentResponses(question.text, question.numberOfResponses);
      }
      
      setStudentResponses(responses);
    } catch (error) {
      console.error('Failed to generate responses:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async (analysisQuestion: string): Promise<Analysis> => {
    if (apiKey) {
      try {
        return await generateAnalysisResponse(currentQuestion, studentResponses, analysisQuestion, apiKey);
      } catch (apiError) {
        console.error('OpenAI API error during analysis:', apiError);
        // Fall back to mock analysis
        return await generateMockAnalysis(currentQuestion, studentResponses, analysisQuestion);
      }
    } else {
      return await generateMockAnalysis(currentQuestion, studentResponses, analysisQuestion);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Response Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate realistic student responses to your questions and analyze them for patterns, 
            misconceptions, and learning opportunities.
          </p>
          {apiKey && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✅ Connected to OpenAI API - Real responses enabled
            </div>
          )}
          
          {/* Quick Demo Button */}
          {!currentQuestion && (
            <div className="mt-4">
              <button
                onClick={() => handleQuestionSubmit({ 
                  text: "What is photosynthesis and why is it important for life on Earth?", 
                  numberOfResponses: 5 
                })}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                🚀 Try Live Demo
              </button>
              <p className="text-sm text-gray-500 mt-2">
                See instant results with pre-made responses and try the analysis tools
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Key Input */}
        <ApiKeyInput 
          onApiKeySubmit={handleApiKeySubmit}
          currentApiKey={apiKey}
          onClearApiKey={handleClearApiKey}
        />

        {/* Question Input */}
        <QuestionInput onSubmit={handleQuestionSubmit} isLoading={isLoading} />

        {/* Student Responses */}
        <StudentResponsesList 
          responses={studentResponses} 
          originalQuestion={currentQuestion}
        />

        {/* Analysis Panel */}
        <AnalysisPanel 
          responses={studentResponses}
          originalQuestion={currentQuestion}
          onAnalyze={handleAnalysis}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            {apiKey ? (
              <>
                Connected to OpenAI API for real AI responses. 
                <span className="text-blue-600"> Fallback to mock data if API calls fail.</span>
              </>
            ) : (
              <>
                Currently using sophisticated mock data that simulates real AI responses. 
                <span className="text-blue-600"> Add your OpenAI API key above for real AI responses.</span>
              </>
            )}
          </p>
          <p className="mt-2 text-xs">
            Your API key is stored securely in your browser session and never sent to our servers.
          </p>
        </footer>
      </div>
    </main>
  );
} 