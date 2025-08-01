export interface StudentResponse {
  id: number;
  content: string;
}

export interface Question {
  text: string;
  numberOfResponses: number;
}

export interface Analysis {
  question: string;
  response: string;
}

export interface SavedPrompt {
  id: string;
  name: string;
  text: string;
  dateCreated: string;
}

// New types for prompt sessions
export interface PromptSession {
  id?: string;
  title: string;
  question: string;
  student_responses: StudentResponse[];
  analysis_question?: string;
  analysis_result?: string;
  submitted_by?: string;
  submitted_at?: string;
  created_at?: string;
}

export interface SubmittedPrompt {
  id: string;
  title: string;
  question: string;
  student_responses: StudentResponse[];
  analysis_question: string | null;
  analysis_result: string | null;
  submitted_by: string | null;
  submitted_at: string;
  created_at: string;
} 