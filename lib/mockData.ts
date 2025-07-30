import { StudentResponse, Analysis } from './types';

// Mock student responses for different question types
const mockResponseTemplates = [
  "This is a well-structured answer that demonstrates deep understanding of the concept. The student shows clear reasoning and provides relevant examples to support their explanation.",
  "The response shows excellent comprehension with detailed analysis. The student connects multiple concepts and demonstrates critical thinking skills.",
  "This answer reflects thorough understanding and ability to apply knowledge. The explanation is clear, logical, and shows good grasp of underlying principles.",
  "This answer shows basic understanding but lacks depth. The explanation covers the main points but could benefit from more detail and examples.",
  "The response demonstrates adequate knowledge but misses some key connections. The reasoning is generally sound but somewhat superficial.",
  "This shows reasonable comprehension with some gaps. The student understands the basics but struggles with more complex aspects.",
  "This response shows limited understanding with several misconceptions. The explanation is unclear and contains factual errors.",
  "The answer demonstrates confusion about key concepts. There are significant gaps in knowledge and reasoning.",
  "This shows minimal comprehension with major misunderstandings. The response lacks coherent structure and contains inaccuracies."
];

const analysisTemplates = [
  "Based on these responses, I can identify several patterns: The stronger answers demonstrate clear understanding while weaker responses show common misconceptions about...",
  "These student responses reveal varying levels of comprehension. Key areas for improvement include...",
  "The responses indicate that students generally understand the basic concepts, but struggle with..."
];

export function generateMockStudentResponses(question: string, count: number): StudentResponse[] {
  const responses: StudentResponse[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = mockResponseTemplates[Math.floor(Math.random() * mockResponseTemplates.length)];
    
    // Customize the response based on the question
    let content = template;
    if (question.toLowerCase().includes('math') || question.toLowerCase().includes('equation')) {
      content += " The mathematical reasoning demonstrates various levels of understanding.";
    }
    
    responses.push({
      id: i + 1,
      content
    });
  }
  
  // Shuffle the responses for variety
  return responses.sort(() => Math.random() - 0.5);
}

export async function generateMockAnalysis(
  originalQuestion: string, 
  responses: StudentResponse[], 
  analysisQuestion: string
): Promise<Analysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if the question suggests dynamic UI would be helpful
  const question = analysisQuestion.toLowerCase();
  
  // If asking for charts or visualization
  if (question.includes('chart') || question.includes('visualization') || question.includes('distribution')) {
    const chartResponse = `
Here's a visual breakdown of the student responses:

\`\`\`json
{
  "type": "CHART_DATA",
  "chartType": "pie",
  "title": "Understanding Level Distribution",
  "data": [
    {"label": "Strong Understanding", "value": ${Math.floor(responses.length * 0.3)}, "description": "Students with comprehensive grasp"},
    {"label": "Developing Understanding", "value": ${Math.floor(responses.length * 0.5)}, "description": "Students with basic concepts but missing details"},
    {"label": "Needs Support", "value": ${Math.ceil(responses.length * 0.2)}, "description": "Students requiring additional instruction"}
  ],
  "insights": "Most students demonstrate developing understanding, with opportunities for targeted support in specific areas."
}
\`\`\`
    `;
    
    return {
      question: analysisQuestion,
      response: chartResponse
    };
  }
  
  // If asking for dashboard
  if (question.includes('dashboard') || question.includes('comprehensive') || question.includes('overview')) {
    const dashboardResponse = `
\`\`\`json
{
  "type": "DASHBOARD",
  "title": "Student Response Analysis Dashboard",
  "components": [
    {
      "type": "summary",
      "title": "Overall Assessment",
      "content": "Analysis of ${responses.length} student responses reveals varied understanding levels with clear patterns in misconceptions and strengths."
    },
    {
      "type": "chart",
      "chartType": "bar",
      "title": "Common Themes",
      "data": [
        {"label": "Correct Core Concepts", "value": ${Math.floor(responses.length * 0.7)}},
        {"label": "Partial Understanding", "value": ${Math.floor(responses.length * 0.4)}},
        {"label": "Misconceptions Present", "value": ${Math.floor(responses.length * 0.3)}}
      ]
    },
    {
      "type": "insights",
      "title": "Key Learning Insights",
      "items": [
        "Students grasp fundamental concepts but struggle with applications",
        "Common vocabulary gaps observed across multiple responses",
        "Evidence-based reasoning needs development in most responses"
      ]
    },
    {
      "type": "recommendations",
      "title": "Teaching Recommendations",
      "items": [
        "Implement guided practice sessions for application skills",
        "Create vocabulary scaffolding activities",
        "Design think-aloud sessions to model reasoning processes",
        "Provide multiple examples connecting theory to practice"
      ]
    }
  ]
}
\`\`\`
    `;
    
    return {
      question: analysisQuestion,
      response: dashboardResponse
    };
  }
  
  // If asking for individual feedback
  if (question.includes('individual') || question.includes('each student') || question.includes('student feedback')) {
    let feedbackResponse = "Here's individual feedback for each student:\n\n";
    
    responses.forEach((response, index) => {
      const feedbackTypes = [
        "demonstrates solid understanding with clear explanations",
        "shows basic grasp but could benefit from more specific examples", 
        "displays creative thinking with some misconceptions to address",
        "exhibits good foundational knowledge with room for deeper analysis",
        "presents interesting perspective that needs factual refinement"
      ];
      
      const feedback = feedbackTypes[index % feedbackTypes.length];
      feedbackResponse += `**Student ${response.id}**: This response ${feedback}. Consider encouraging more detailed explanations and connections to broader concepts.\n\n`;
    });
    
    return {
      question: analysisQuestion,
      response: feedbackResponse
    };
  }
  
  // Default text analysis
  const template = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
  let response = template;
  
  // Customize analysis based on the question type
  if (question.includes('misconception')) {
    response += " Common misconceptions include oversimplification of complex concepts and difficulty connecting theoretical knowledge to practical applications.";
  } else if (question.includes('improve')) {
    response += " Students would benefit from more concrete examples, guided practice, and scaffolded learning approaches.";
  } else if (question.includes('pattern')) {
    response += " The response patterns suggest varying levels of prior knowledge and different learning styles among students.";
  }
  
  return {
    question: analysisQuestion,
    response
  };
} 