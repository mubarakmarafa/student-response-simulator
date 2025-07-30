'use client';

import { StudentResponse } from '@/lib/types';

interface StudentResponsesListProps {
  responses: StudentResponse[];
  originalQuestion: string;
}

export default function StudentResponsesList({ responses, originalQuestion }: StudentResponsesListProps) {
  if (responses.length === 0) {
    return null;
  }

  const getQualityColor = (quality: StudentResponse['quality']) => {
    switch (quality) {
      case 'strong':
        return 'border-l-green-500 bg-green-50';
      case 'average':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'weak':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getQualityIcon = (quality: StudentResponse['quality']) => {
    switch (quality) {
      case 'strong':
        return '🟢';
      case 'average':
        return '🟡';
      case 'weak':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Responses</h2>
        <p className="text-gray-600 italic">Question: "{originalQuestion}"</p>
      </div>
      
      <div className="space-y-4">
        {responses.map((response) => (
          <div
            key={response.id}
            className={`border-l-4 p-4 rounded-r-lg ${getQualityColor(response.quality)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Student {response.id}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {response.quality}
                </span>
                <span>{getQualityIcon(response.quality)}</span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{response.content}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Response Summary</h3>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <span>🟢</span>
            <span>Strong: {responses.filter(r => r.quality === 'strong').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟡</span>
            <span>Average: {responses.filter(r => r.quality === 'average').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🔴</span>
            <span>Weak: {responses.filter(r => r.quality === 'weak').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 