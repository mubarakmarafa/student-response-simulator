import { StudentResponse, SavedPrompt } from './types';

export const demoQuestions = [
  "What is photosynthesis and why is it important for life on Earth?",
  "Explain the water cycle in your own words.",
  "What causes the seasons on Earth?",
  "How does gravity work and why don't we float away?",
  "What is the difference between weather and climate?",
  "Explain how plants get their energy to grow.",
  "Why do we have day and night?",
  "What happens to water when it evaporates?"
];

export const demoStudentResponses: { [key: string]: StudentResponse[] } = {
  "What is photosynthesis and why is it important for life on Earth?": [
    {
      id: 1,
      content: "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to make their own food (glucose) and release oxygen as a byproduct. This is crucial for life because it provides oxygen for animals to breathe and forms the base of food chains. Plants convert light energy into chemical energy, which sustains most ecosystems on Earth.",
      quality: 'strong'
    },
    {
      id: 2,
      content: "Photosynthesis is when plants make food using sunlight. They take in CO2 and water and make sugar and oxygen. It's important because animals need the oxygen to breathe and we eat plants for energy.",
      quality: 'average'
    },
    {
      id: 3,
      content: "Plants do photosynthesis to make food from the sun. They breathe in oxygen and breathe out carbon dioxide, kind of like the opposite of humans. It's important because plants give us food.",
      quality: 'weak'
    },
    {
      id: 4,
      content: "Photosynthesis occurs in chloroplasts using chlorophyll to capture light energy. The process involves light-dependent and light-independent reactions, ultimately converting CO2 and H2O into glucose while releasing O2. This process is fundamental to life as it produces virtually all atmospheric oxygen and forms the foundation of food webs through primary production.",
      quality: 'strong'
    },
    {
      id: 5,
      content: "Plants use photosynthesis to get energy from sunlight. They need water and carbon dioxide too. The oxygen they make is good for us to breathe. Without plants doing this, we wouldn't have enough oxygen.",
      quality: 'average'
    },
    {
      id: 6,
      content: "I think photosynthesis is how plants eat sunlight? Like they absorb it through their leaves and then they can grow. It's important because plants make oxygen and we need oxygen to live. Without plants we would all die.",
      quality: 'weak'
    },
    {
      id: 7,
      content: "Photosynthesis is a biochemical process that occurs in the chloroplasts of plant cells, where chlorophyll captures photons and converts them into chemical energy. This process not only produces glucose for plant metabolism but also releases oxygen as a waste product, which has fundamentally shaped Earth's atmosphere and enabled aerobic life to evolve.",
      quality: 'strong'
    },
    {
      id: 8,
      content: "Plants do photosynthesis to make their food. They use sun, water, and air to do this. The oxygen they make helps animals breathe. It's really important for all living things.",
      quality: 'average'
    },
    {
      id: 9,
      content: "Photosynthesis is when plants turn sunlight into sugar. I think it happens in the green parts of plants. Plants are important because they clean the air and give us oxygen to breathe.",
      quality: 'average'
    },
    {
      id: 10,
      content: "Plants eat sunlight and water and make oxygen. That's photosynthesis. It's important because animals need oxygen and plants need to eat too. I don't really know much more about it.",
      quality: 'weak'
    },
    {
      id: 11,
      content: "Photosynthesis is the fundamental process by which autotrophic organisms convert inorganic compounds into organic matter using light energy. This process involves two main stages: the light reactions and the Calvin cycle, resulting in the production of glucose and the release of oxygen, which is essential for maintaining atmospheric balance.",
      quality: 'strong'
    },
    {
      id: 12,
      content: "Plants need sunlight to make their own food through photosynthesis. They also need carbon dioxide and water. When they do this, they release oxygen which is what we breathe. So photosynthesis is really important for keeping us alive.",
      quality: 'average'
    },
    {
      id: 13,
      content: "I'm not really sure how photosynthesis works but I know plants need sunlight. Maybe they absorb it somehow? It's important because plants give us food and oxygen I think.",
      quality: 'weak'
    },
    {
      id: 14,
      content: "Photosynthesis allows plants to synthesize organic compounds from carbon dioxide and water using light energy, typically from the sun. This process occurs primarily in the leaves and involves chlorophyll molecules that absorb light. The oxygen produced is essential for respiration in most living organisms.",
      quality: 'strong'
    },
    {
      id: 15,
      content: "Photosynthesis is how plants make food from sunlight. They take in carbon dioxide from the air and water from their roots. The energy from sunlight helps them combine these to make sugar for food. As a bonus, they release oxygen that animals need to breathe.",
      quality: 'average'
    }
  ]
};

export const analysisPrompts = [
  // Insight & Summary Prompts
  {
    category: "🔍 Insight & Summary",
    prompts: [
      {
        title: "Summarize Student Understanding",
        text: "Summarize the overall understanding students demonstrated in their responses. Highlight common correct ideas and misconceptions.",
        description: "Quickly gauge class-wide comprehension"
      },
      {
        title: "Identify Misconceptions", 
        text: "What are the most common misconceptions or errors found in the student responses?",
        description: "Prioritize reteaching or targeted intervention"
      },
      {
        title: "Group by Understanding Level",
        text: "Cluster student responses into groups: correct understanding, partial understanding, and incorrect or confused responses.",
        description: "Tailor feedback and group instruction"
      }
    ]
  },
  // Feedback & Grading Prompts  
  {
    category: "🎯 Feedback & Grading",
    prompts: [
      {
        title: "Suggest Rubric Scores",
        text: "Assign a rubric score (0–3) to each student response and explain the reasoning.",
        description: "Speed up grading or double-check manual scores"
      },
      {
        title: "Generate Individual Feedback",
        text: "Generate brief, personalized feedback for each student based on their response.",
        description: "Automate quality formative feedback"
      },
      {
        title: "Highlight Exemplars",
        text: "Which student responses best exemplify a strong answer? What makes them strong?",
        description: "Share exemplar work with the class"
      }
    ]
  },
  // Extension & Strategy Prompts
  {
    category: "🚀 Extension & Strategy", 
    prompts: [
      {
        title: "Suggest Follow-Up Questions",
        text: "Based on the student responses, what are good follow-up questions or extension tasks to deepen their thinking?",
        description: "Extend learning with minimal prep"
      },
      {
        title: "Surface Meta-Cognitive Patterns",
        text: "What do student responses suggest about how they are thinking about the problem (e.g., strategies, confidence, confusion points)?",
        description: "Understand student problem-solving approaches"
      }
    ]
  },
  // Technical Analysis Prompts
  {
    category: "🧰 Technical Analysis",
    prompts: [
      {
        title: "Analyze Word Usage",
        text: "What are the most frequently used words or phrases across all student answers? What do these suggest about their understanding?",
        description: "Spot patterns in language tied to concepts"
      },
      {
        title: "Compare to Model Answer",
        text: "Compare each student response to the model answer. Identify which key components are missing or misapplied.",
        description: "Target gaps explicitly"
      }
    ]
  }
];

export const getRandomDemoQuestion = (): string => {
  return demoQuestions[Math.floor(Math.random() * demoQuestions.length)];
};

export const getDemoResponsesForQuestion = (question: string): StudentResponse[] | null => {
  return demoStudentResponses[question] || null;
};

// Saved Prompts Management
const SAVED_PROMPTS_KEY = 'student-response-simulator-saved-prompts';

export const getSavedPrompts = (): SavedPrompt[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SAVED_PROMPTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading saved prompts:', error);
    return [];
  }
};

export const savePrompt = (name: string, text: string): SavedPrompt => {
  const prompt: SavedPrompt = {
    id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    text: text.trim(),
    dateCreated: new Date().toISOString()
  };
  
  const existingPrompts = getSavedPrompts();
  const updatedPrompts = [...existingPrompts, prompt];
  
  try {
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updatedPrompts));
    return prompt;
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw new Error('Failed to save prompt');
  }
};

export const deleteSavedPrompt = (id: string): void => {
  const existingPrompts = getSavedPrompts();
  const updatedPrompts = existingPrompts.filter(prompt => prompt.id !== id);
  
  try {
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updatedPrompts));
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw new Error('Failed to delete prompt');
  }
};

export const updateSavedPrompt = (id: string, name: string, text: string): SavedPrompt => {
  const existingPrompts = getSavedPrompts();
  const promptIndex = existingPrompts.findIndex(prompt => prompt.id === id);
  
  if (promptIndex === -1) {
    throw new Error('Prompt not found');
  }
  
  const updatedPrompt: SavedPrompt = {
    ...existingPrompts[promptIndex],
    name: name.trim(),
    text: text.trim()
  };
  
  const updatedPrompts = [...existingPrompts];
  updatedPrompts[promptIndex] = updatedPrompt;
  
  try {
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updatedPrompts));
    return updatedPrompt;
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw new Error('Failed to update prompt');
  }
}; 