'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SubmittedPrompt } from '@/lib/types';
import { getSubmittedPrompts } from '@/lib/supabase';
import { ArrowLeft, Calendar, User, MessageSquare, Brain, Loader2, RefreshCw } from 'lucide-react';

export default function Gallery() {
  const [prompts, setPrompts] = useState<SubmittedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SubmittedPrompt | null>(null);

  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubmittedPrompts();
      setPrompts(data);
    } catch (err) {
      setError('Failed to load prompts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Simulator</span>
            </Link>
            <button
              onClick={loadPrompts}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Prompt Gallery</h1>
            <p className="text-gray-600 mt-1">Community-shared prompts and analysis</p>
          </div>
          
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading prompts...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && prompts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prompts yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to submit a prompt to the gallery!
            </p>
            <Link 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create a Prompt
            </Link>
          </div>
        )}

        {/* Prompts Grid */}
        {!isLoading && prompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {prompt.title}
                  </h3>
                  
                  {/* Question Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm font-medium mb-1">Question:</p>
                    <p className="text-blue-700 text-sm">
                      {truncateText(prompt.question, 120)}
                    </p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-3 h-3" />
                      <span>{prompt.student_responses.length} student responses</span>
                    </div>
                    
                    {prompt.analysis_question && (
                      <div className="flex items-center space-x-2">
                        <Brain className="w-3 h-3" />
                        <span>Includes AI analysis</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>by {prompt.submitted_by || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(prompt.submitted_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prompt Detail Modal */}
        {selectedPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPrompt.title}
                </h2>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>by {selectedPrompt.submitted_by || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedPrompt.submitted_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{selectedPrompt.student_responses.length} responses</span>
                    </div>
                  </div>
                  
                  {/* Original Question */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Question</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedPrompt.question}</p>
                    </div>
                  </div>
                  
                  {/* Student Responses */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Responses</h3>
                    <div className="space-y-3">
                      {selectedPrompt.student_responses.map((response, index) => (
                        <div key={response.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                              Student {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-700">{response.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Analysis */}
                  {selectedPrompt.analysis_question && selectedPrompt.analysis_result && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h3>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-purple-800 mb-2">Analysis Question:</h4>
                        <p className="text-purple-700 italic">"{selectedPrompt.analysis_question}"</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Analysis Result:</h4>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {selectedPrompt.analysis_result.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer with Remix Button */}
              <div className="border-t bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Use this prompt as a starting point for your own exploration
                  </p>
                  <Link
                    href={`/?remix=${selectedPrompt.id}`}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Remix This Prompt</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 