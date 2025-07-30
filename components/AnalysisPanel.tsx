'use client';

import { useState } from 'react';
import { Analysis, StudentResponse } from '@/lib/types';
import { analysisPrompts } from '@/lib/demoData';
import SavedPromptsManager from './SavedPromptsManager';

interface AnalysisPanelProps {
  responses: StudentResponse[];
  originalQuestion: string;
  onAnalyze: (question: string) => Promise<Analysis>;
}

// New component to format LLM responses intelligently
function SmartResponseFormatter({ response }: { response: string }) {
  // Enhanced markdown parser for basic formatting
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let current = text;
    let key = 0;

    // Handle bold text (**text** or __text__)
    current = current.replace(/\*\*(.*?)\*\*/g, '<BOLD>$1</BOLD>');
    current = current.replace(/__(.*?)__/g, '<BOLD>$1</BOLD>');
    
    // Handle italic text (*text* or _text_)
    current = current.replace(/\*(.*?)\*/g, '<ITALIC>$1</ITALIC>');
    current = current.replace(/_(.*?)_/g, '<ITALIC>$1</ITALIC>');

    // Split by our custom tags and process
    const segments = current.split(/(<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>)/);
    
    segments.forEach((segment) => {
      if (segment.startsWith('<BOLD>')) {
        const content = segment.replace(/<\/?BOLD>/g, '');
        parts.push(<strong key={key++} className="font-semibold text-gray-900">{content}</strong>);
      } else if (segment.startsWith('<ITALIC>')) {
        const content = segment.replace(/<\/?ITALIC>/g, '');
        parts.push(<em key={key++} className="italic text-gray-800">{content}</em>);
      } else if (segment.trim()) {
        parts.push(<span key={key++}>{segment}</span>);
      }
    });

    return parts;
  };

  // Enhanced function to detect and parse different response patterns
  const parseResponse = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Enhanced student pattern detection (handles markdown formatting)
    const studentPatterns = [
      /\*\*Student\s*(\d+)\*\*:\s*(.*)/i,  // **Student X:**
      /__Student\s*(\d+)__:\s*(.*)/i,      // __Student X:__
      /Student\s*(\d+):\s*(.*)/i,          // Student X:
      /\*\*Student\s*(\d+)\s*\*\*\s*-?\s*(.*)/i,  // **Student X** - content
      /Student\s*(\d+)\s*\*\*:\s*(.*)/i,   // Student X**:
    ];
    
    // Check for student references with multiple patterns
    const hasStudentReferences = lines.some(line => 
      studentPatterns.some(pattern => pattern.test(line))
    );
    
    if (hasStudentReferences) {
      return parseStudentFeedback(text);
    }
    
    // Enhanced numbered list detection
    const numberedPatterns = [
      /^\d+\./,
      /^\d+\)\s/,
      /^\(\d+\)/,
      /^\d+\s*[-–—]\s*/,
    ];
    const hasNumberedList = lines.some(line => 
      numberedPatterns.some(pattern => pattern.test(line))
    );
    
    if (hasNumberedList) {
      return parseNumberedList(text);
    }
    
    // Enhanced bullet point detection
    const bulletPatterns = [
      /^[-*•·‣⁃]/,
      /^[→➤➢➣]/,
      /^[✓✗✓]/,
      /^[◦◦]/,
    ];
    const hasBullets = lines.some(line => 
      bulletPatterns.some(pattern => pattern.test(line))
    );
    
    if (hasBullets) {
      return parseBulletList(text);
    }
    
    // Check for structured sections (Analysis:, Question:, etc.)
    const sectionPattern = /^(Question|Analysis|Summary|Conclusion|Overview|Introduction):\s*/i;
    const hasSections = lines.some(line => sectionPattern.test(line));
    
    if (hasSections) {
      return parseStructuredSections(text);
    }
    
    // Default: Enhanced paragraph parsing
    return parseParagraphs(text);
  };

  // Enhanced student feedback parser with multiple pattern support
  const parseStudentFeedback = (text: string) => {
    const studentPatterns = [
      /(\*\*Student\s*(\d+)\*\*:\s*)(.*?)(?=\*\*Student\s*\d+\*\*:|$)/gis,
      /(__Student\s*(\d+)__:\s*)(.*?)(?=__Student\s*\d+__:|$)/gis,
      /(Student\s*(\d+):\s*)(.*?)(?=Student\s*\d+:|$)/gis,
      /(\*\*Student\s*(\d+)\s*\*\*\s*-?\s*)(.*?)(?=\*\*Student\s*\d+\s*\*\*|$)/gis,
    ];
    
    let matches: RegExpMatchArray[] = [];
    
    // Try each pattern until we find matches
    for (const pattern of studentPatterns) {
      matches = [...text.matchAll(pattern)];
      if (matches.length > 0) break;
    }
    
    if (matches.length > 0) {
      return (
        <div className="space-y-4">
          {matches.map((match, index) => {
            const studentNum = match[2];
            const feedback = match[3].trim();
            
            return (
              <div key={index} className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Student {studentNum}
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {parseMarkdown(feedback).map((part, i) => (
                    <span key={i}>{part}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Enhanced fallback - try to parse as mixed content
    return parseMixedContent(text);
  };

  // New function to handle structured sections
  const parseStructuredSections = (text: string) => {
    const sections = text.split(/(?=^(?:Question|Analysis|Summary|Conclusion|Overview|Introduction):\s*)/im)
      .filter(section => section.trim().length > 0);

    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          const lines = section.split('\n').filter(line => line.trim().length > 0);
          const firstLine = lines[0];
          const sectionMatch = firstLine.match(/^(Question|Analysis|Summary|Conclusion|Overview|Introduction):\s*(.*)/i);
          
          if (sectionMatch) {
            const [, title, content] = sectionMatch;
            const remainingContent = lines.slice(1).join('\n').trim();
            const fullContent = content.trim() + (remainingContent ? '\n' + remainingContent : '');
            
            return (
              <div key={index} className="border-l-4 border-purple-300 pl-4">
                <h4 className="font-semibold text-purple-800 mb-2 capitalize">{title}:</h4>
                <div className="text-gray-700 leading-relaxed">
                  {parseMarkdown(fullContent).map((part, i) => (
                    <span key={i}>{part}</span>
                  ))}
                </div>
              </div>
            );
          }
          
          return (
            <div key={index} className="text-gray-700 leading-relaxed">
              {parseMarkdown(section).map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Enhanced mixed content parser for complex responses
  const parseMixedContent = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          const trimmed = paragraph.trim();
          
          // Check if this paragraph contains student references
          if (/Student\s*\d+/i.test(trimmed)) {
            return (
              <div key={index} className="bg-purple-50 border-l-4 border-purple-300 p-3 rounded-r-lg">
                <div className="text-gray-700 leading-relaxed">
                  {parseMarkdown(trimmed).map((part, i) => (
                    <span key={i}>{part}</span>
                  ))}
                </div>
              </div>
            );
          }
          
          // Regular paragraph
          return (
            <div key={index} className="text-gray-700 leading-relaxed">
              {parseMarkdown(trimmed).map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Enhanced numbered list parser
  const parseNumberedList = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const listItems: string[] = [];
    let currentItem = '';
    
    const numberedPatterns = [
      /^(\d+)\.?\s*(.*)/,
      /^(\d+)\)\s*(.*)/,
      /^\((\d+)\)\s*(.*)/,
      /^(\d+)\s*[-–—]\s*(.*)/,
    ];
    
    lines.forEach(line => {
      let matched = false;
      
      for (const pattern of numberedPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (currentItem) listItems.push(currentItem.trim());
          currentItem = match[2];
          matched = true;
          break;
        }
      }
      
      if (!matched && currentItem) {
        currentItem += ' ' + line;
      }
    });
    
    if (currentItem) listItems.push(currentItem.trim());
    
    return (
      <ol className="space-y-3 list-none">
        {listItems.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div className="text-gray-700 leading-relaxed flex-1">
              {parseMarkdown(item).map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    );
  };

  // Enhanced bullet list parser
  const parseBulletList = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const listItems: string[] = [];
    let currentItem = '';
    
    const bulletPatterns = [
      /^[-*•·‣⁃]\s*(.*)/,
      /^[→➤➢➣]\s*(.*)/,
      /^[✓✗]\s*(.*)/,
      /^[◦]\s*(.*)/,
    ];
    
    lines.forEach(line => {
      let matched = false;
      
      for (const pattern of bulletPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (currentItem) listItems.push(currentItem.trim());
          currentItem = match[1];
          matched = true;
          break;
        }
      }
      
      if (!matched && currentItem) {
        currentItem += ' ' + line;
      }
    });
    
    if (currentItem) listItems.push(currentItem.trim());
    
    return (
      <ul className="space-y-3 list-none">
        {listItems.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-gray-700 leading-relaxed">
              {parseMarkdown(item).map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // Enhanced paragraph parser
  const parseParagraphs = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length <= 1) {
      return (
        <div className="text-gray-700 leading-relaxed">
          {parseMarkdown(text).map((part, i) => (
            <span key={i}>{part}</span>
          ))}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="text-gray-700 leading-relaxed">
            {parseMarkdown(paragraph.trim()).map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="prose prose-purple max-w-none">
      {parseResponse(response)}
    </div>
  );
}

export default function AnalysisPanel({ responses, originalQuestion, onAnalyze }: AnalysisPanelProps) {
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (responses.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisQuestion.trim()) return;

    setIsLoading(true);
    try {
      const result = await onAnalyze(analysisQuestion.trim());
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allSuggestedQuestions = analysisPrompts.flatMap(category => 
    category.prompts.map(prompt => prompt.text)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis & Follow-up</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="analysis-question" className="block text-sm font-medium text-gray-700 mb-2">
            Ask a follow-up question about the student responses:
          </label>
          <textarea
            id="analysis-question"
            value={analysisQuestion}
            onChange={(e) => setAnalysisQuestion(e.target.value)}
            placeholder="e.g., What misconceptions do these answers show?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900 bg-white placeholder-gray-500"
            rows={2}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !analysisQuestion.trim()}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Responses'
          )}
        </button>
      </form>

      {/* Suggested Questions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Educational Analysis Prompts:</h3>
        <div className="space-y-4">
          {analysisPrompts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.prompts.map((prompt, promptIndex) => (
                  <div key={promptIndex} className="border-l-2 border-gray-300 pl-3">
                    <button
                      onClick={() => setAnalysisQuestion(prompt.text)}
                      className="text-left w-full text-xs hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="font-medium text-gray-800 mb-1">{prompt.title}</div>
                      <div className="text-gray-600 text-xs italic mb-1">"{prompt.text}"</div>
                      <div className="text-gray-500 text-xs">Use: {prompt.description}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Random Selection */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick options:</h4>
          <div className="flex flex-wrap gap-2">
            {allSuggestedQuestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setAnalysisQuestion(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors border border-gray-200"
              >
                {suggestion.length > 40 ? suggestion.substring(0, 40) + '...' : suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Prompts Manager */}
      <SavedPromptsManager 
        currentPromptText={analysisQuestion}
        onSelectPrompt={setAnalysisQuestion}
      />

      {/* Analysis Result */}
      {analysis && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Analysis Result</h3>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
            <h4 className="font-medium text-purple-800 mb-2">Question:</h4>
            <p className="text-purple-700 mb-6 italic">"{analysis.question}"</p>
            <h4 className="font-medium text-purple-800 mb-4">Analysis:</h4>
            <SmartResponseFormatter response={analysis.response} />
          </div>
        </div>
      )}
    </div>
  );
} 