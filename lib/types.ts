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