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
    
    // Return without quality assessment
    return answers.map((content, index) => ({
      id: index + 1,
      content: content.trim()
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

  const userPrompt = `You are an expert education analyst. A teacher asked students: "${originalQuestion}"

The students responded with:
${studentAnswersList}

The teacher now asks: "${analysisQuestion}"

RESPONSE FORMAT INSTRUCTIONS:
You can return your analysis in different formats depending on what would be most helpful. Choose the best format:

1. **TEXT_RESPONSE**: For general analysis, insights, or explanations
2. **STUDENT_BREAKDOWN**: For individual student feedback (use exactly this format: "**Student X**: feedback")
3. **CHART_DATA**: For data that would benefit from visualization
4. **DASHBOARD**: For comprehensive analysis with multiple components

If returning CHART_DATA, structure it like this:
\`\`\`json
{
  "type": "CHART_DATA",
  "chartType": "bar|pie|line|comparison",
  "title": "Chart Title",
  "data": [
    {"label": "Category", "value": 10, "description": "Optional description"},
    {"label": "Another", "value": 15, "description": "Optional description"}
  ],
  "insights": "Key insights about the data"
}
\`\`\`

If returning DASHBOARD, structure it like this:
\`\`\`json
{
  "type": "DASHBOARD",
  "title": "Analysis Dashboard",
  "components": [
    {
      "type": "summary",
      "title": "Overview",
      "content": "Summary text"
    },
    {
      "type": "chart",
      "chartType": "bar|pie|line",
      "title": "Chart Title",
      "data": [{"label": "Item", "value": 5}]
    },
    {
      "type": "insights",
      "title": "Key Insights",
      "items": ["Insight 1", "Insight 2"]
    },
    {
      "type": "recommendations",
      "title": "Teaching Recommendations",
      "items": ["Recommendation 1", "Recommendation 2"]
    }
  ]
}
\`\`\`

IMPORTANT: 
- Always provide feedback for ALL ${responses.length} students when doing individual analysis
- Use clear, educational language
- Focus on actionable insights for teachers
- Choose the format that best serves the specific question asked

Your response:`;

  try {
    const messages: OpenAIMessage[] = [
      { 
        role: 'system', 
        content: 'You are an expert educational analyst who provides clear, actionable insights. You can return responses in different formats: plain text, structured student feedback, chart data, or dashboard components. Choose the format that best answers the specific question. When providing individual feedback, always cover all students. Use educational terminology and focus on practical teaching applications.' 
      },
      { role: 'user', content: userPrompt }
    ];

    const response = await callOpenAI(messages, apiKey, 800);
    
    console.log('=== ANALYSIS DEBUG ===');
    console.log('Total students sent to AI:', responses.length);
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
  
  // Debug logging
  console.log('=== PARSING DEBUG ===');
  console.log('Raw AI response:', response);
  
  // Try multiple parsing strategies
  
  // Strategy 1: Match numbered list format (1. 2. 3. etc.)
  const numberedPattern = /^(\d+)\.?\s*(.+)$/gm;
  const numberedMatches = [...response.matchAll(numberedPattern)];
  
  if (numberedMatches && numberedMatches.length > 0) {
    console.log('Found numbered matches:', numberedMatches.length);
    numberedMatches.forEach(match => {
      const content = match[2]?.trim();
      if (content && content.length > 0) {
        answers.push(content);
      }
    });
  }
  
  // Strategy 2: If numbered parsing didn't work well, try line-by-line approach
  if (answers.length < expectedCount) {
    console.log('Trying line-by-line parsing...');
    const lines = response.split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines and lines that are just numbers
        return line.length > 0 && 
               !line.match(/^\d+\.?\s*$/) && 
               !line.match(/^Here are.*/i) &&
               !line.match(/^Student responses?:?/i);
      });
    
    // Clear previous attempts and use line approach
    answers.length = 0;
    
    lines.forEach(line => {
      // Remove leading numbers and periods if present
      const cleanLine = line.replace(/^\d+\.?\s*/, '').trim();
      if (cleanLine.length > 10) { // Minimum length for a meaningful response
        answers.push(cleanLine);
      }
    });
  }
  
  // Strategy 3: Split by double newlines and process blocks
  if (answers.length < expectedCount) {
    console.log('Trying paragraph-based parsing...');
    const paragraphs = response.split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 10);
    
    answers.length = 0;
    paragraphs.forEach(paragraph => {
      const cleanParagraph = paragraph.replace(/^\d+\.?\s*/, '').trim();
      if (cleanParagraph.length > 10) {
        answers.push(cleanParagraph);
      }
    });
  }
  
  console.log('Parsed answers:', answers.length);
  console.log('Expected count:', expectedCount);
  console.log('=== END PARSING DEBUG ===');
  
  // Ensure we have the expected number of answers
  while (answers.length < expectedCount) {
    answers.push(`I'm not sure about this question. Could you provide more guidance?`);
  }
  
  // Trim to expected count if we got too many
  return answers.slice(0, expectedCount);
}

// Remove the assessAnswerQuality function since we're not using quality ratings anymore

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