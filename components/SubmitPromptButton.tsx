'use client';

import { useState } from 'react';
import { Upload, Check, X } from 'lucide-react';
import { PromptSession, StudentResponse, Analysis } from '@/lib/types';
import { submitPromptSession } from '@/lib/supabase';

interface SubmitPromptButtonProps {
  question: string;
  responses: StudentResponse[];
  analysis?: Analysis | null;
}

export default function SubmitPromptButton({ question, responses, analysis }: SubmitPromptButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Don't show the button if there's no content to submit
  if (!question || responses.length === 0) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title for this prompt');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const session: PromptSession = {
      title: title.trim(),
      question,
      student_responses: responses,
      analysis_question: analysis?.question,
      analysis_result: analysis?.response,
      submitted_by: submitterName.trim() || 'Anonymous'
    };

    const result = await submitPromptSession(session);

    if (result) {
      setIsSubmitted(true);
      setShowDialog(false);
      // Reset form
      setTitle('');
      setSubmitterName('');
      
      // Show success state for 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } else {
      setError('Failed to submit prompt. Please try again.');
    }

    setIsSubmitting(false);
  };

  const openDialog = () => {
    setShowDialog(true);
    setError(null);
    // Auto-generate a title based on the question
    const truncatedQuestion = question.length > 50 
      ? question.substring(0, 50) + '...' 
      : question;
    setTitle(truncatedQuestion);
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800">
        <Check className="w-5 h-5" />
        <span className="font-medium">Prompt submitted to gallery!</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
      >
        <Upload className="w-5 h-5" />
        <span>Submit to Prompt Gallery</span>
      </button>

      {/* Submit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Submit to Prompt Gallery
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this prompt a descriptive title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 !text-gray-900 bg-white placeholder-gray-500"
                  style={{ color: '#111827' }}
                  required
                />
              </div>

              <div>
                <label htmlFor="submitter" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (optional)
                </label>
                <input
                  id="submitter"
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 !text-gray-900 bg-white placeholder-gray-500"
                  style={{ color: '#111827' }}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">What will be submitted:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Original question</li>
                  <li>• {responses.length} student responses</li>
                  {analysis && <li>• Analysis question and results</li>}
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 