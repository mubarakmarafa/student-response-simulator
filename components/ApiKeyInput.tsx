'use client';

import { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  currentApiKey: string | null;
  onClearApiKey: () => void;
}

export default function ApiKeyInput({ onApiKeySubmit, currentApiKey, onClearApiKey }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!currentApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      setApiKey('');
    }
  };

  const handleClear = () => {
    onClearApiKey();
    setApiKey('');
    setIsExpanded(true);
  };

  if (currentApiKey && !isExpanded) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800">OpenAI API Key Connected</h3>
              <p className="text-sm text-green-700">
                Your API key is securely stored. Real OpenAI responses enabled.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded transition-colors"
            >
              Change Key
            </button>
            <button
              onClick={handleClear}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
            >
              Clear Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-blue-900 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          OpenAI API Key Setup
        </h2>
        <p className="text-blue-700 text-sm mb-3">
          To use real OpenAI responses instead of mock data, enter your API key below. 
          Without an API key, the app will continue using realistic mock responses.
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your API key is stored temporarily in your browser session only</li>
                <li>Never share your API key or commit it to public repositories</li>
                <li>The key will be cleared when you close your browser</li>
                <li>This app runs entirely in your browser - keys are not sent to our servers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-blue-900 mb-2">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900 bg-white placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showKey ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Connect API Key
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Use Mock Data
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-blue-900 hover:text-blue-700">
            How to get an OpenAI API key? 
            <span className="text-blue-600 group-open:hidden">▼</span>
            <span className="text-blue-600 hidden group-open:inline">▲</span>
          </summary>
          <div className="mt-2 text-sm text-blue-700 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API Keys in your dashboard</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key (you won't be able to see it again)</li>
              <li>Paste it in the field above</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Tip:</strong> Set usage limits in your OpenAI dashboard to control costs.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
} 