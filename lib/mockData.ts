import { StudentResponse, Analysis } from './types';

// Mock student responses for different question types
const mockResponseTemplates = {
  strong: [
    "This is a well-structured answer that demonstrates deep understanding of the concept. The student shows clear reasoning and provides relevant examples to support their explanation.",
    "The response shows excellent comprehension with detailed analysis. The student connects multiple concepts and demonstrates critical thinking skills.",
    "This answer reflects thorough understanding and ability to apply knowledge. The explanation is clear, logical, and shows good grasp of underlying principles."
  ],
  average: [
    "This answer shows basic understanding but lacks depth. The explanation covers the main points but could benefit from more detail and examples.",
    "The response demonstrates adequate knowledge but misses some key connections. The reasoning is generally sound but somewhat superficial.",
    "This shows reasonable comprehension with some gaps. The student understands the basics but struggles with more complex aspects."
  ],
  weak: [
    "This response shows limited understanding with several misconceptions. The explanation is unclear and contains factual errors.",
    "The answer demonstrates confusion about key concepts. There are significant gaps in knowledge and reasoning.",
    "This shows minimal comprehension with major misunderstandings. The response lacks coherent structure and contains inaccuracies."
  ]
};

const analysisTemplates = [
  "Based on these responses, I can identify several patterns: The stronger answers demonstrate clear understanding while weaker responses show common misconceptions about...",
  "These student responses reveal varying levels of comprehension. Key areas for improvement include...",
  "The responses indicate that students generally understand the basic concepts, but struggle with..."
];

export function generateMockStudentResponses(question: string, count: number): StudentResponse[] {
  const responses: StudentResponse[] = [];
  const qualities: ('strong' | 'average' | 'weak')[] = ['strong', 'average', 'weak'];
  
  for (let i = 0; i < count; i++) {
    // Distribute quality levels: roughly 30% strong, 40% average, 30% weak
    let quality: 'strong' | 'average' | 'weak';
    if (i < Math.floor(count * 0.3)) {
      quality = 'strong';
    } else if (i < Math.floor(count * 0.7)) {
      quality = 'average';
    } else {
      quality = 'weak';
    }
    
    const templates = mockResponseTemplates[quality];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Customize the response based on the question
    let content = template;
    if (question.toLowerCase().includes('math') || question.toLowerCase().includes('equation')) {
      content += " " + (quality === 'strong' ? "The mathematical reasoning is sound." : 
                       quality === 'average' ? "The math is mostly correct but needs refinement." : 
                       "There are calculation errors present.");
    }
    
    responses.push({
      id: i + 1,
      content,
      quality
    });
  }
  
  // Shuffle the responses so quality levels are mixed
  return responses.sort(() => Math.random() - 0.5);
}

export async function generateMockAnalysis(
  originalQuestion: string, 
  responses: StudentResponse[], 
  analysisQuestion: string
): Promise<Analysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const template = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
  
  let response = template;
  
  // Customize analysis based on the question type
  if (analysisQuestion.toLowerCase().includes('misconception')) {
    response += " Common misconceptions include oversimplification of complex concepts and difficulty connecting theoretical knowledge to practical applications.";
  } else if (analysisQuestion.toLowerCase().includes('improve')) {
    response += " Students would benefit from more concrete examples, guided practice, and scaffolded learning approaches.";
  } else if (analysisQuestion.toLowerCase().includes('pattern')) {
    response += " The response patterns suggest varying levels of prior knowledge and different learning styles among students.";
  }
  
  return {
    question: analysisQuestion,
    response
  };
} 