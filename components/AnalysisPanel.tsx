'use client';

import { useState, useEffect } from 'react';
import { Analysis, StudentResponse } from '@/lib/types';
import { analysisPrompts } from '@/lib/demoData';
import SavedPromptsManager from './SavedPromptsManager';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, Lightbulb, BarChart3, PieChart as PieChartIcon, Activity, CheckCircle, AlertCircle, Brain } from 'lucide-react';

interface AnalysisPanelProps {
  responses: StudentResponse[];
  originalQuestion: string;
  onAnalyze: (question: string) => Promise<Analysis>;
  initialAnalysisQuestion?: string;
}

// Dynamic UI Component Renderer
function DynamicAnalysisRenderer({ response }: { response: string }) {
  // Try to parse structured data from the response
  const parseStructuredData = (text: string) => {
    // Look for JSON blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        return { hasStructuredData: true, data, remainingText: text.replace(jsonMatch[0], '').trim() };
      } catch (e) {
        console.log('Failed to parse JSON:', e);
      }
    }
    return { hasStructuredData: false, data: null, remainingText: text };
  };

  const { hasStructuredData, data, remainingText } = parseStructuredData(response);

  if (hasStructuredData && data) {
    if (data.type === 'CHART_DATA') {
      return <ChartRenderer chartData={data} additionalText={remainingText} />;
    }
    if (data.type === 'DASHBOARD') {
      return <DashboardRenderer dashboardData={data} additionalText={remainingText} />;
    }
  }

  // Fallback to smart text formatting
  return <SmartResponseFormatter response={response} />;
}

// Chart Renderer Component
function ChartRenderer({ chartData, additionalText }: { chartData: any, additionalText: string }) {
  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  const renderChart = () => {
    switch (chartData.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }: any) => `${label} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-gray-500 italic">Chart type not supported</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">{chartData.title}</h3>
        </div>
        {renderChart()}
        {chartData.insights && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Key Insights:</h4>
            <p className="text-purple-700">{chartData.insights}</p>
          </div>
        )}
      </div>
      {additionalText && (
        <SmartResponseFormatter response={additionalText} />
      )}
    </div>
  );
}

// Dashboard Renderer Component
function DashboardRenderer({ dashboardData, additionalText }: { dashboardData: any, additionalText: string }) {
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'summary': return <Users className="w-5 h-5" />;
      case 'chart': return <BarChart3 className="w-5 h-5" />;
      case 'insights': return <Lightbulb className="w-5 h-5" />;
      case 'recommendations': return <Target className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const renderComponent = (component: any, index: number) => {
    switch (component.type) {
      case 'summary':
        return (
          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">{component.title}</h3>
            </div>
            <p className="text-blue-700">{component.content}</p>
          </div>
        );
      
      case 'chart':
        return (
          <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">{component.title}</h3>
            </div>
            <ChartRenderer chartData={component} additionalText="" />
          </div>
        );
      
      case 'insights':
        return (
          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">{component.title}</h3>
            </div>
            <ul className="space-y-2">
              {component.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'recommendations':
        return (
          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">{component.title}</h3>
            </div>
            <ul className="space-y-2">
              {component.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      default:
        return (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              {getComponentIcon(component.type)}
              <h3 className="font-semibold text-gray-800">{component.title}</h3>
            </div>
            <div className="text-gray-700">{component.content || JSON.stringify(component)}</div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-bold">{dashboardData.title}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardData.components.map((component: any, index: number) => 
          renderComponent(component, index)
        )}
      </div>
      
      {additionalText && (
        <SmartResponseFormatter response={additionalText} />
      )}
    </div>
  );
}

// Enhanced text formatter (keeping the existing one but simplified)
function SmartResponseFormatter({ response }: { response: string }) {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let current = text;
    let key = 0;

    // Handle bold text
    current = current.replace(/\*\*(.*?)\*\*/g, '<BOLD>$1</BOLD>');
    current = current.replace(/__(.*?)__/g, '<BOLD>$1</BOLD>');
    
    // Handle italic text
    current = current.replace(/\*(.*?)\*/g, '<ITALIC>$1</ITALIC>');
    current = current.replace(/_(.*?)_/g, '<ITALIC>$1</ITALIC>');

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

  // Enhanced student feedback parser
  const parseStudentFeedback = (text: string) => {
    const studentPattern = /\*\*Student\s*(\d+)\*\*:\s*(.*?)(?=\*\*Student\s*\d+\*\*:|$)/gis;
    const matches = [...text.matchAll(studentPattern)];
    
    if (matches.length > 0) {
      return (
        <div className="space-y-4">
          {matches.map((match, index) => {
            const studentNum = match[1];
            const feedback = match[2].trim();
            
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
    
    return parseParagraphs(text);
  };

  const parseParagraphs = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
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

  // Check for student references
  if (/\*\*Student\s*\d+\*\*:/i.test(response)) {
    return parseStudentFeedback(response);
  }

  return (
    <div className="prose prose-purple max-w-none">
      {parseParagraphs(response)}
    </div>
  );
}

export default function AnalysisPanel({ responses, originalQuestion, onAnalyze, initialAnalysisQuestion = '' }: AnalysisPanelProps) {
  const [analysisQuestion, setAnalysisQuestion] = useState(initialAnalysisQuestion);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update analysis question when initialAnalysisQuestion prop changes (for remix functionality)
  useEffect(() => {
    setAnalysisQuestion(initialAnalysisQuestion);
  }, [initialAnalysisQuestion]);

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

  // Enhanced suggested questions that would benefit from dynamic UI
  const enhancedQuestions = [
    "Show me the distribution of understanding levels with a chart",
    "Create a dashboard analyzing student misconceptions and recommendations",
    "What are the most common themes in responses? Show this as a visualization",
    "Provide individual feedback for each student",
    "Compare student responses in a visual format",
    "Generate a teaching strategy dashboard based on these responses"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">AI-Powered Analysis</h2>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-purple-800 mb-2">🚀 Dynamic UI Generation</h3>
        <p className="text-sm text-purple-700">
          The AI will automatically choose the best way to present your analysis - whether it's text, charts, 
          dashboards, or interactive components based on your question!
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="analysis-question" className="block text-sm font-medium text-gray-700 mb-2">
            Ask anything about the student responses:
          </label>
          <textarea
            id="analysis-question"
            value={analysisQuestion}
            onChange={(e) => setAnalysisQuestion(e.target.value)}
            placeholder="e.g., Show me the distribution of understanding levels with a chart"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900 bg-white placeholder-gray-500"
            rows={2}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !analysisQuestion.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Dynamic Analysis...
            </span>
          ) : (
            '🎯 Generate Smart Analysis'
          )}
        </button>
      </form>

      {/* Quick Smart Questions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">✨ Try Dynamic Analysis:</h3>
        <div className="space-y-2">
          {enhancedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setAnalysisQuestion(question)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-all text-sm"
            >
              <div className="flex items-center space-x-2">
                {index === 0 && <BarChart3 className="w-4 h-4 text-purple-600" />}
                {index === 1 && <Activity className="w-4 h-4 text-blue-600" />}
                {index === 2 && <PieChartIcon className="w-4 h-4 text-green-600" />}
                {index === 3 && <Users className="w-4 h-4 text-yellow-600" />}
                {index === 4 && <TrendingUp className="w-4 h-4 text-red-600" />}
                {index === 5 && <Target className="w-4 h-4 text-indigo-600" />}
                <span className="text-gray-700">{question}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Traditional Analysis Prompts (Collapsed) */}
      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-purple-600">
          📚 Traditional Analysis Prompts
        </summary>
        <div className="mt-3 space-y-4">
          {analysisPrompts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.prompts.map((prompt, promptIndex) => (
                  <button
                    key={promptIndex}
                    onClick={() => setAnalysisQuestion(prompt.text)}
                    className="text-left w-full text-xs hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-1">{prompt.title}</div>
                    <div className="text-gray-600 text-xs italic">{prompt.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Saved Prompts Manager */}
      <SavedPromptsManager 
        currentPromptText={analysisQuestion}
        onSelectPrompt={setAnalysisQuestion}
      />

      {/* Analysis Result with Dynamic UI */}
      {analysis && (
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Smart Analysis Result</h3>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Question:</h4>
            <p className="text-gray-700 italic">"{analysis.question}"</p>
          </div>
          
          <DynamicAnalysisRenderer response={analysis.response} />
        </div>
      )}
    </div>
  );
} 