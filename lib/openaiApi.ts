import { StudentResponse, Analysis } from './types';

// OpenAI API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  apiKey: string,
  maxTokens: number = 150
): Promise<string> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error('Invalid request. Please check your input.');
      } else {
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to OpenAI API');
  }
}

export async function generateStudentResponses(
  question: string,
  count: number,
  apiKey: string
): Promise<StudentResponse[]> {
  try {
    const userPrompt = `You are simulating students answering the following question:

"${question}"

Generate ${count} diverse and realistic student answers. Include strong, average, and weak answers. Vary tone, language, and correctness slightly to simulate real student variety.

Format your response as a numbered list where each answer is on its own line, like:
1. [First student answer]
2. [Second student answer]
3. [Third student answer]
...

Make sure each answer feels authentic to how real students would respond, with natural variation in writing style, depth of understanding, and accuracy.`;

    const messages: OpenAIMessage[] = [
      { 
        role: 'system', 
        content: 'You are an educational expert who specializes in simulating realistic student responses. Generate varied answers that reflect the natural diversity found in real classrooms, including different levels of understanding, writing abilities, and engagement with the material.' 
      },
      { role: 'user', content: userPrompt }
    ];

    const response = await callOpenAI(messages, apiKey, Math.min(count * 60, 1500));
    
    // Parse the response to extract individual answers
    const answers = parseStudentAnswers(response, count);
    
    // Assign quality levels based on content analysis
    return answers.map((content, index) => ({
      id: index + 1,
      content: content.trim(),
      quality: assessAnswerQuality(content, question)
    }));

  } catch (error) {
    console.error('Failed to generate student responses:', error);
    throw error;
  }
}

export async function generateAnalysisResponse(
  originalQuestion: string,
  responses: StudentResponse[],
  analysisQuestion: string,
  apiKey: string
): Promise<Analysis> {
  // Format student answers as a simple list
  const studentAnswersList = responses.map((r) => 
    `Student ${r.id}: ${r.content}`
  ).join('\n\n');

  const userPrompt = `You are an education expert. A teacher asked students the following question:

"${originalQuestion}"

The students responded with:

${studentAnswersList}

Now answer this follow-up question:  
"${analysisQuestion}"

IMPORTANT: If your analysis involves individual student feedback, you MUST provide feedback for ALL ${responses.length} students (Student 1 through Student ${responses.length}). Do not skip any students.

FORMATTING INSTRUCTIONS:
- Use clear, structured formatting to make your response easy to read
- For individual student feedback, use exactly this format: "**Student X**:" followed by the feedback
- For numbered points, use "1." "2." etc. at the start of lines
- For bullet points, use "-" at the start of lines  
- Use **bold text** for emphasis on key terms or concepts
- Use *italic text* for secondary emphasis
- Separate different sections with blank lines
- If providing an overall analysis, you may start with "Analysis:" as a section header
- Keep paragraphs focused and well-spaced for readability

Structure your response logically and use the formatting above to enhance clarity.`;

  try {
    const messages: OpenAIMessage[] = [
      { 
        role: 'system', 
        content: 'You are an educational expert who provides clear, well-structured analysis. Always format your responses for maximum readability using markdown-style formatting. When giving individual student feedback, use "**Student X**:" format. Use numbered lists (1., 2., 3.) for sequential points and bullet points (-) for lists. Use **bold** for key terms and *italics* for emphasis. Separate sections with blank lines and use clear section headers when appropriate.' 
      },
      { role: 'user', content: userPrompt }
    ];

    const response = await callOpenAI(messages, apiKey, 600);
    
    // Debug logging to understand what the AI is returning
    console.log('=== ANALYSIS DEBUG ===');
    console.log('Total students sent to AI:', responses.length);
    console.log('Student IDs sent:', responses.map(r => r.id));
    console.log('Raw AI response:', response);
    console.log('=== END DEBUG ===');

    return {
      question: analysisQuestion,
      response
    };
  } catch (error) {
    console.error('Failed to generate analysis:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse numbered list of student answers from AI response
function parseStudentAnswers(response: string, expectedCount: number): string[] {
  const answers: string[] = [];
  
  // Try to match numbered list format first
  const numberedMatches = response.match(/^\d+\.\s*(.+)$/gm);
  
  if (numberedMatches && numberedMatches.length > 0) {
    // Extract content after the number and period
    numberedMatches.forEach(match => {
      const content = match.replace(/^\d+\.\s*/, '').trim();
      if (content) {
        answers.push(content);
      }
    });
  } else {
    // Fallback: split by line breaks and filter out empty lines
    const lines = response.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.\s*$/));
    
    answers.push(...lines);
  }
  
  // Ensure we have the expected number of answers
  while (answers.length < expectedCount) {
    answers.push(`Student response ${answers.length + 1}: [Unable to parse from AI response]`);
  }
  
  // Trim to expected count if we got too many
  return answers.slice(0, expectedCount);
}

// Assess the quality of a student answer based on content analysis
function assessAnswerQuality(answer: string, question: string): 'strong' | 'average' | 'weak' {
  const answerLower = answer.toLowerCase();
  const questionLower = question.toLowerCase();
  
  // Simple heuristics for quality assessment
  let score = 0;
  
  // Length and detail (longer answers often show more thought)
  if (answer.length > 100) score += 2;
  else if (answer.length > 50) score += 1;
  
  // Use of proper terminology and concepts
  if (answerLower.includes('because') || answerLower.includes('therefore') || answerLower.includes('however')) score += 1;
  if (answerLower.includes('for example') || answerLower.includes('such as')) score += 1;
  
  // Signs of deeper thinking
  if (answerLower.includes('first') && answerLower.includes('second')) score += 1;
  if (answerLower.includes('in conclusion') || answerLower.includes('overall')) score += 1;
  
  // Presence of questioning or uncertainty (often indicates weaker understanding)
  if (answerLower.includes('i think maybe') || answerLower.includes('not sure') || answerLower.includes('i guess')) score -= 1;
  if (answerLower.includes('idk') || answerLower.includes("don't know")) score -= 2;
  
  // Very short or dismissive answers
  if (answer.length < 20) score -= 2;
  if (answerLower.includes('boring') || answerLower.includes('stupid') || answerLower.includes('dumb')) score -= 1;
  
  // Classify based on score
  if (score >= 3) return 'strong';
  if (score <= 0) return 'weak';
  return 'average';
}

// Utility function to validate API key format
export function isValidApiKeyFormat(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' followed by various characters including hyphens and underscores
  // Modern OpenAI keys can have different lengths and formats
  return /^sk-[a-zA-Z0-9_-]{20,}$/.test(apiKey.trim());
}

// Utility function to securely store API key
export function storeApiKey(apiKey: string): void {
  try {
    // Store in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('openai_api_key', apiKey);
  } catch (error) {
    console.warn('Failed to store API key:', error);
  }
}

// Utility function to retrieve API key
export function getStoredApiKey(): string | null {
  try {
    return sessionStorage.getItem('openai_api_key');
  } catch (error) {
    console.warn('Failed to retrieve API key:', error);
    return null;
  }
}

// Utility function to clear stored API key
export function clearStoredApiKey(): void {
  try {
    sessionStorage.removeItem('openai_api_key');
  } catch (error) {
    console.warn('Failed to clear API key:', error);
  }
} 