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
            className="border-l-4 border-l-blue-500 bg-blue-50 p-4 rounded-r-lg"
          >
            <div className="mb-2">
              <h3 className="font-semibold text-gray-800">Student {response.id}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{response.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 