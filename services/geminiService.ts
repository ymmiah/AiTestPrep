import { Feedback, StudyPlan, TopicQA, VocabularyWord, ListeningExercise, CommonMistake, GrammarQuiz, UserProfile, LeaderboardEntry, GeminiResponse, Message, Badge, FinalAssessment } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';


// --- User Profile & Data Management (LocalStorage) ---
// This section manages user data persistence. In a larger application,
// this would be in its own file (e.g., userService.ts).

const USER_PROFILE_KEY = 'userProfileData';

// Define unlockable badges
export const BADGES: { [key: string]: Badge } = {
  GRAMMAR_GURU: {
    id: 'grammar_guru_1',
    name: 'Grammar Guru',
    description: 'Achieved a perfect score on a grammar quiz.',
    icon: 'AcademicCapIcon'
  },
};

const generateReferenceNumber = (): string => {
  const prefix = 'UKV';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomLetters = '';
  for (let i = 0; i < 3; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomLetters}-${randomNumbers}`;
};

const getDefaultProfile = (): UserProfile => ({
  name: '', // Start with an empty name to prompt user input
  points: 0,
  badges: [],
  referenceNumber: null,
  progressStats: {
    sessionsCompleted: 0,
    avgPronunciationScore: 0,
    listeningScore: 0,
  },
  conversationHistory: {},
  vocabularyProgress: {},
});

export const getUserProfile = async (): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          const defaultProfile = getDefaultProfile();
          
          // Force a deep merge to ensure all nested properties exist and handle migration
          const migratedProfile = {
              ...defaultProfile,
              ...parsed,
              progressStats: {
                  ...defaultProfile.progressStats,
                  ...parsed.progressStats
              },
              conversationHistory: parsed.conversationHistory || {},
              badges: parsed.badges || [],
              vocabularyProgress: parsed.vocabularyProgress || {} // Add this field if missing
          };

          // Clean up the old, deprecated property
          if (migratedProfile.progressStats.hasOwnProperty('vocabularyLearned')) {
              delete migratedProfile.progressStats.vocabularyLearned;
              // Resave the cleaned profile to complete the migration
              localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(migratedProfile));
          }
          
          resolve(migratedProfile);
        } else {
          const defaultProfile = getDefaultProfile();
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
          resolve(defaultProfile);
        }
      } catch (error) {
        console.error("Failed to read user profile from localStorage:", error);
        const defaultProfile = getDefaultProfile();
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
        resolve(defaultProfile);
      }
    }, 300);
  });
};

/**
 * The single, reliable function for updating any part of the user's profile.
 * It fetches the latest profile, applies the updates via a callback, and saves it.
 * This prevents race conditions and ensures data is never stale.
 * @param updater A function that receives the current profile and returns the modified profile.
 * @returns The updated user profile.
 */
export const updateUserProfile = async (
  updater: (profile: UserProfile) => UserProfile
): Promise<UserProfile> => {
  const currentProfile = await getUserProfile();
  const updatedProfile = updater(currentProfile);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
  return updatedProfile;
};


export const updateUserName = async (name: string): Promise<UserProfile> => {
    const sanitizedName = name.trim();
    const profile = await getUserProfile();

    if (!sanitizedName) {
        return profile;
    }
    
    profile.name = sanitizedName;
    if (!profile.referenceNumber) {
        profile.referenceNumber = generateReferenceNumber();
    }

    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    return profile;
};

export const saveConversationHistory = async (scenario: string, messages: Message[]): Promise<void> => {
    await updateUserProfile(profile => {
        if (!profile.conversationHistory) {
            profile.conversationHistory = {};
        }
        profile.conversationHistory[scenario] = messages;
        return profile;
    });
};

export const clearConversationHistory = async (scenario: string): Promise<void> => {
    await updateUserProfile(profile => {
        if (profile.conversationHistory && profile.conversationHistory[scenario]) {
            delete profile.conversationHistory[scenario];
        }
        return profile;
    });
};


// --- Gemini API Integration for Conversational AI ---

/**
 * Retrieves the Gemini API key.
 * It first checks for a build-time environment variable (`process.env.API_KEY`),
 * then falls back to a runtime configuration via a `config.js` file (`window.process.env.API_KEY`).
 * This provides flexibility for both deployment and easy local development.
 * @returns {string} The API key.
 * @throws {Error} If the API key is not found in either location.
 */
const getApiKey = (): string => {
    let key: string | undefined;

    // This construct is used to safely check for `process.env` without causing a ReferenceError
    // in a pure browser environment.
    try {
        if (process.env.API_KEY) {
            key = process.env.API_KEY;
        }
    } catch (e) {
        // `process` is not defined, which is expected in a browser-only context.
    }

    // Fallback for local development using a `config.js` file.
    if (!key && (window as any).process?.env?.API_KEY) {
        key = (window as any).process.env.API_KEY;
    }

    if (!key) {
        const message = "API Key not found. For local development, please create a `config.js` file in the root directory with your key. See the README.md for setup instructions.";
        alert(message); // Provide a clear message to the developer in the browser.
        throw new Error(message);
    }

    return key;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Module-level state to hold the chat session
let chat: Chat | null = null;
let currentScenario = '';


// Define the JSON schema for the AI's response to ensure consistent, structured output
const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        grammar: {
            type: Type.STRING,
            description: "Provide 1-2 concise, helpful, and encouraging A2-level grammar feedback points. Use a newline character ('\n') to separate each point."
        },
        vocabulary: {
            type: Type.STRING,
            description: "Provide 1-2 concise A2-level vocabulary feedback points. Suggest alternative words if applicable. Use a newline character ('\n') to separate each point."
        },
        fluency: {
            type: Type.STRING,
            description: "Provide encouraging feedback on the user's fluency and pace. Focus on A2 level English."
        },
        pronunciation: {
            type: Type.STRING,
            description: "Provide an estimated pronunciation score out of 100 and a brief, helpful comment. E.g., '85/100. Good clarity.'"
        }
    },
    required: ["grammar", "vocabulary", "fluency", "pronunciation"]
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "A natural, conversational response to the user that is context-aware. Ask a relevant follow-up question to keep the conversation going. Act as a friendly A2 English test examiner."
        },
        feedback: feedbackSchema,
        pointsAwarded: {
            type: Type.INTEGER,
            description: "Award between 5 and 25 points based on the quality of the user's response. Be fair and consistent."
        }
    },
    required: ["response", "feedback", "pointsAwarded"]
};

// System instructions to define the AI's persona and task for each scenario
const systemInstructions: { [key: string]: string } = {
    default: "You are a friendly and patient AI examiner for the A2 English language test. Your goal is to have a natural conversation with the user to assess their speaking ability. Keep your responses short, clear, and encouraging. Always ask a follow-up question to keep the conversation flowing. After each user response, you MUST provide a response and structured feedback in the specified JSON format.",
    coffee: "You are a friendly barista in a coffee shop in London. The user is a customer. Your goal is to have a natural, role-playing conversation to take their order. Ask follow-up questions about size, milk, sugar, etc. After each user response, you MUST provide a response and structured feedback in the specified JSON format.",
    doctor: "You are a kind and professional doctor (Dr. Smith) in the UK. The user is your patient. Your goal is to have a natural, role-playing conversation to understand their health problem. Ask follow-up questions about their symptoms. After each user response, you MUST provide a response and structured feedback in the specified JSON format.",
    picture: "You are a friendly A2 English test examiner. You are having a conversation about a picture of a busy outdoor market. The user will describe it. Your goal is to ask follow-up questions about the people, the setting, and what's happening. After each user response, you MUST provide a response and structured feedback in the specified JSON format."
};

/**
 * Replaces the mock service with a live Gemini API call.
 * Manages a conversational chat session that persists until the scenario is changed.
 */
export const getGeminiResponse = async (
  userTranscript: string,
  scenario: string = 'default'
): Promise<GeminiResponse> => {
  // If the scenario changes or if the chat is not initialized, start a new chat session.
  if (scenario !== currentScenario || !chat) {
    console.log(`Initializing new chat for scenario: ${scenario}`);
    currentScenario = scenario;
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstructions[scenario],
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
  }

  try {
    const result = await chat.sendMessage({ message: userTranscript });
    const jsonString = result.text.trim();
    
    // Attempt to parse the JSON response from the model
    const parsedResponse = JSON.parse(jsonString) as Partial<GeminiResponse>;
    
    // Sanitize and validate the parsed response to prevent errors and ensure a good user experience
    const sanitizedResponse: GeminiResponse = {
        response: parsedResponse.response || "That's interesting. Can you tell me more?",
        feedback: {
            grammar: parsedResponse.feedback?.grammar || "Good grammar.",
            vocabulary: parsedResponse.feedback?.vocabulary || "Good vocabulary choice.",
            fluency: parsedResponse.feedback?.fluency || "You spoke clearly.",
            pronunciation: parsedResponse.feedback?.pronunciation || "Good pronunciation."
        },
        pointsAwarded: parsedResponse.pointsAwarded && typeof parsedResponse.pointsAwarded === 'number' ? parsedResponse.pointsAwarded : 10,
    };

    return sanitizedResponse;

  } catch (error) {
    console.error("Error processing Gemini response:", error);
    // Provide a graceful fallback response if the API call fails or JSON is malformed
    return {
        response: "Sorry, I encountered an error. Could you please repeat that?",
        feedback: {
            grammar: "Error processing feedback.",
            vocabulary: "Error processing feedback.",
            fluency: "Error processing feedback.",
            pronunciation: "Error processing feedback."
        },
        pointsAwarded: 0,
    };
  }
};


/**
 * Generates an idea for how to answer a question.
 */
export const generateAnswerIdea = async (
  lastModelQuestion: string
): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user needs a simple idea to answer the following question from an A2 English test examiner: "${lastModelQuestion}". Provide a short, one-sentence idea or a starting phrase for them. For example, if the question is "What do you do in your free time?", a good idea would be "You could talk about reading books or watching movies."`,
        });
        return result.text.trim();
    } catch (error) {
        console.error("Error generating answer idea:", error);
        return "Sorry, I couldn't generate an idea right now. Please try again.";
    }
};

/**
 * Generates an improved version of the user's answer.
 */
export const getImprovedAnswer = async (
  userTranscript: string,
  lastModelQuestion: string
): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `An A2 English level user gave this answer: "${userTranscript}" to the question: "${lastModelQuestion}". Provide an improved, more natural, and grammatically correct version of their answer. Keep the core idea of their answer the same. Present only the improved answer text, without any extra explanations like "Here is an improved version:".`,
        });
        return result.text.trim();
    } catch (error) {
        console.error("Error generating improved answer:", error);
        return "Sorry, I couldn't generate a suggestion right now. Please try again.";
    }
};

// --- Mock Test Service Functions ---

const imagePrompts = [
    'A high-quality, photorealistic photograph of a family having a picnic in a sunny park.',
    'A clear, photorealistic image of a busy outdoor fruit and vegetable market on a weekend.',
    'A photorealistic picture of two friends laughing while having coffee at an outdoor cafe in a city.',
    'A photorealistic image of a person buying a ticket at a train station counter.',
    'A clear photograph of children playing football in a field on a sunny day.',
    'A photorealistic image of a street musician playing a guitar in a city square with a small crowd.',
    'A family cooking a meal together in a modern, bright kitchen.',
    'A photorealistic picture of people waiting at a bus stop on a rainy day, holding umbrellas.',
    'A beautiful, quiet beach with blue water and a few people relaxing on sun loungers.',
    'A classroom scene with a teacher writing on a whiteboard and young students at their desks.',
    'A person walking their dog in a park during autumn, with colorful leaves on the ground.',
    'A photorealistic image of a postman delivering letters to a house on a suburban street.',
    'A lively birthday party scene with a group of people around a cake with lit candles.',
    'A quiet public library with shelves full of books and people reading at tables.',
    'A farmer driving a red tractor in a green field under a clear blue sky.',
    'A snowy city street scene at dusk, with streetlights on and people in warm coats.',
    'A family watching a movie at home on a sofa, eating popcorn from a large bowl.',
    'A friendly doctor in a white coat talking to an elderly patient in a clinic room.',
    'People shopping for clothes in a brightly lit department store.',
    'A construction worker wearing a hard hat and high-visibility jacket on a building site.',
    'A young couple having a romantic dinner at a restaurant with candle light.',
    'A group of tourists taking photos with their phones in front of a famous landmark like the Eiffel Tower.',
    'An elderly woman gardening in her sunny backyard, watering colorful flowers.',
    'A team of firefighters in uniform working to put out a fire on a building.',
    'A clear, photorealistic photograph of a view from an airplane window, showing white clouds and a blue sky.'
];

export const generateTestImage = async (): Promise<string> => {
    try {
        const randomPrompt = imagePrompts[Math.floor(Math.random() * imagePrompts.length)];
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: randomPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image && response.generatedImages[0].image.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        
        console.warn("generateTestImage response was successful but contained no images.", response);
        throw new Error("API returned no images.");

    } catch (error) {
        console.error("Error generating test image with Gemini:", error);
        // Fallback to a static image URL if generation fails
        return "https://images.unsplash.com/photo-1528740561666-dc2479703592?q=80&w=1470&auto=format&fit=crop";
    }
};

let mockTestChat: Chat | null = null;

const getMockTestSystemInstruction = (): string => {
    const conversationAreas = [
        "Your daily routine", "Your favourite food", "Festivals in your country", "Public transport", "Watching films or TV", 
        "Your favourite music", "A recent personal experience", "Shopping for clothes", "Holidays and travel", 
        "The weather", "Your hometown or city", "Your job or studies", "Your friends", "Weekends"
    ];
    // Choose two distinct topics for the conversation phase.
    const chosenAreas = conversationAreas.sort(() => 0.5 - Math.random()).slice(0, 2);

    return `You are a professional, friendly, and patient examiner for the A2 English speaking test. You will conduct a complete, structured, multi-part mock test. Do NOT provide any feedback during the test. Only respond conversationally as an examiner would. Adhere strictly to the following 4-part structure, using the exact transition phrases.

Part 1: Introduction.
- Start with EXACTLY: "Hello. My name is Alex. Can you please tell me your full name?".
- After the user responds, ask "And where are you from?".
- After that, ask two more simple introductory questions about their work/studies or their home.
- Then, you MUST signal the next part by saying EXACTLY: "Thank you. Now, in the next part, we are going to look at a picture."

Part 2: Picture Description.
- Prompt the user by saying EXACTLY: "Please describe what you see in the picture."
- Listen to their description, then ask at least two relevant follow-up questions about the picture to encourage more detail (e.g., "What are the people doing?", "What is the weather like?").
- Then, you MUST transition to the next part by saying EXACTLY: "Okay, thank you. Now, let's talk about something else."

Part 3: Topic Discussion 1.
- You will now start a conversation on the first subject area. You MUST use the topic: '${chosenAreas[0]}'.
- Start with an opening question about '${chosenAreas[0]}'.
- Ask at least three follow-up questions to develop a short conversation on this topic.
- After the conversation, you MUST transition to the next part by saying EXACTLY: "Thank you. Now let's talk about '${chosenAreas[1]}'."

Part 4: Topic Discussion 2.
- You will now start a conversation on the second subject area: '${chosenAreas[1]}'.
- Start with an opening question about this topic.
- Ask at least three follow-up questions to develop the conversation.
- After their final answer in this part, you MUST end the test by saying ONLY: "That is the end of the test. Thank you." Do not add any other words or pleasantries.`;
};


export const startMockTestSession = (): Chat => {
    const systemInstruction = getMockTestSystemInstruction();
    mockTestChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return mockTestChat;
};

export const endMockTestSession = () => {
    mockTestChat = null;
};

const finalAssessmentSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "Provide an overall score out of 100 for the user's performance across the entire test."
        },
        feedback: feedbackSchema,
        strengths: {
            type: Type.STRING,
            description: "Provide a 1-2 sentence summary of the user's main strengths during the test. Be encouraging."
        },
        areasForImprovement: {
            type: Type.STRING,
            description: "Provide a 1-2 sentence summary of the key areas the user should focus on for improvement. Be constructive and specific."
        }
    },
    required: ["overallScore", "feedback", "strengths", "areasForImprovement"]
};

export const generateFinalAssessment = async (history: Message[]): Promise<FinalAssessment> => {
    const transcript = history.map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `You are an expert A2 English examiner. The following is a transcript of a mock 4-part A2 speaking test. Please provide a final, comprehensive assessment of the user's performance based on the entire conversation.
In your feedback, consider their performance across all four parts: Introduction, Picture Description, Topic Discussion 1, and Topic Discussion 2.
You MUST respond in the specified JSON format.

Transcript:
${transcript}`;
    
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: finalAssessmentSchema,
            }
        });

        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as FinalAssessment;

        // Basic validation
        if (typeof parsed.overallScore !== 'number' || !parsed.feedback) {
            throw new Error("Invalid assessment format from API.");
        }
        return parsed;

    } catch (error) {
        console.error("Error generating final assessment:", error);
        // Return a fallback assessment on error
        return {
            overallScore: 0,
            feedback: {
                grammar: "Could not generate feedback.",
                vocabulary: "Could not generate feedback.",
                fluency: "Could not generate feedback.",
                pronunciation: "Could not generate feedback."
            },
            strengths: "There was an error generating the assessment.",
            areasForImprovement: "Please try the mock test again."
        };
    }
};



// --- Other Mock Service Functions ---

export const generateStudyPlan = async (
  testDate: string,
  availability: string
): Promise<StudyPlan> => {
  console.log(`Generating study plan for test on ${testDate} with ${availability} hours/week.`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPlan: StudyPlan = {
        week1: {
          title: 'Week 1: Foundations & Common Topics',
          tasks: [
            'Monday: Practice introducing yourself (name, home country, job). Focus on simple present tense.',
            'Tuesday: Listening practice - listen to a short dialogue about daily routines.',
            'Wednesday: Vocabulary building - learn 10 new words related to family.',
            'Thursday: Picture description - describe a picture of a family eating dinner.',
            'Friday: Mock interview practice - answer 3 basic questions with the AI simulator.',
            'Weekend: Review week 1 vocabulary and grammar points.',
          ],
        },
        week2: {
          title: 'Week 2: Expanding Vocabulary & Asking Questions',
          tasks: [
            'Monday: Practice talking about hobbies and interests.',
            'Tuesday: Learn how to form simple questions (What, Where, Who, When).',
            'Wednesday: Listening task - listen to an announcement at a train station.',
            'Thursday: Role-play - practice asking for directions.',
            'Friday: Ask Back Training - during AI conversation, remember to ask one question back.',
            'Weekend: Watch a short English cartoon or video clip and summarize it.',
          ],
        },
        week3: {
          title: 'Week 3: Fluency and Exam Practice',
          tasks: [
            'Monday: Picture description - describe a sequence of actions in 3 pictures.',
            'Tuesday: Full mock interview simulation (7 minutes).',
            'Wednesday: Vocabulary building - learn 15 new words related to shopping and food.',
            'Thursday: Listening quiz based on a phone conversation.',
            'Friday: Review feedback from all mock interviews and focus on weak areas.',
            'Weekend: Relax and do a light review. No heavy studying.',
          ],
        },
      };
      resolve(mockPlan);
    }, 2000); // Simulate API latency
  });
};

const mockTopicQAs: { [key: string]: TopicQA[] } = {
  "family": [
    { question: "Can you tell me about your family?", answer: "Yes, of course. I have a small family. It is just my husband and me. We live together in a flat. My parents live in another city, but we visit them often." },
    { question: "Do you have any brothers or sisters?", answer: "Yes, I have one older brother. His name is John, and he is a doctor. He is married and has two children." },
    { question: "What do you like to do with your family?", answer: "I like to cook with my husband on the weekends. We also enjoy watching movies together. When we visit my parents, we often go for a walk in the park." }
  ],
  "hobbies": [
    { question: "What do you do in your free time?", answer: "In my free time, I enjoy reading books and listening to music. I find it very relaxing. Sometimes, I also go for a walk in the park near my house." },
    { question: "Do you play any sports?", answer: "I don't play any sports regularly, but I like to swim in the summer. There is a public swimming pool not far from my home that I like to visit." },
    { question: "What kind of music do you like?", answer: "I like listening to pop music. It makes me feel happy. My favorite singer is Adele. I think she has a beautiful voice." }
  ],
  "default": [
      { question: "Can you describe your hometown?", answer: "My hometown is a small town in the countryside. It is very quiet and beautiful. There is a river, and many green fields. The people there are very friendly." },
      { question: "What is your favorite food?", answer: "My favorite food is pasta. I especially like it with a tomato and basil sauce. I learned how to cook it from my mother, and I often make it for dinner." },
  ]
};


export const generateTopicsAndQuestions = async (topic: string): Promise<TopicQA[]> => {
  console.log(`Generating Q&A for topic: ${topic}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = topic.toLowerCase().trim();
      const result = mockTopicQAs[key] || mockTopicQAs.default;
      resolve(result);
    }, 1500);
  });
};

export const getVocabularyWords = async (): Promise<VocabularyWord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { word: 'Delicious', definition: 'Having a very pleasant taste or smell.', example: 'The cake you baked was absolutely delicious.' },
        { word: 'Appointment', definition: 'An arrangement to meet someone at a particular time and place.', example: 'I have a doctor\'s appointment at 3 PM.' },
        { word: 'Queue', definition: 'A line of people or vehicles waiting their turn for something.', example: 'We had to wait in a long queue to buy the tickets.' },
        { word: 'Recipe', definition: 'A set of instructions for preparing a particular dish.', example: 'My grandmother gave me her recipe for apple pie.' },
        { word: 'Journey', definition: 'An act of travelling from one place to another.', example: 'The journey to the coast takes about two hours by car.' },
      ]);
    }, 500);
  });
};

export const getListeningExercise = async (): Promise<ListeningExercise> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                title: 'Train Station Announcement',
                audioSrc: '/mock-audio.mp3', // This is a placeholder
                questions: [
                    {
                        question: 'What time is the train to Manchester?',
                        options: ['10:15 AM', '10:50 AM', '11:15 AM'],
                        correctAnswerIndex: 1,
                    },
                    {
                        question: 'Which platform does the train leave from?',
                        options: ['Platform 2', 'Platform 5', 'Platform 7'],
                        correctAnswerIndex: 2,
                    },
                    {
                        question: 'What should passengers with large bags do?',
                        options: ['Go to the front of the train', 'Leave them on the platform', 'Put them in the luggage rack'],
                        correctAnswerIndex: 0,
                    },
                ],
            });
        }, 800);
    });
};

export const getCommonMistakes = async (): Promise<CommonMistake[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { incorrect: 'I am living here since three months.', correct: 'I have been living here for three months.', explanation: 'Use "for" to talk about a duration of time (e.g., for three months, for two years). Use "since" to talk about a specific point in time when something started (e.g., since 2021, since last Tuesday).' },
                { incorrect: 'He don\'t like coffee.', correct: 'He doesn\'t like coffee.', explanation: 'For third-person singular subjects (he, she, it), use "doesn\'t" (does not) in the present tense negative. "Don\'t" (do not) is used for I, you, we, and they.' },
                { incorrect: 'I am agree with you.', correct: 'I agree with you.', explanation: '"Agree" is a verb, so you do not need the verb "to be" (am, is, are) before it. For example, you say "I run," not "I am run." The same applies to "I agree."' },
                { incorrect: 'We discussed about the plan.', correct: 'We discussed the plan.', explanation: 'The verb "discuss" is transitive, meaning it is immediately followed by an object without a preposition. Other examples include "enter the room" (not "enter into the room") and "call the doctor" (not "call to the doctor").' },
            ]);
        }, 400);
    });
};

export const getGrammarQuiz = async (): Promise<GrammarQuiz> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                title: "Prepositions of Time: 'in', 'on', 'at'",
                questions: [
                    {
                        question: "My birthday is ___ January.",
                        options: ["in", "on", "at"],
                        correctAnswerIndex: 0,
                        explanation: "Correct! Use 'in' for longer periods of time with no specific dates, such as months, years, and seasons. Example: 'in summer', 'in 2023'."
                    },
                    {
                        question: "The meeting is ___ Monday.",
                        options: ["in", "on", "at"],
                        correctAnswerIndex: 1,
                        explanation: "Correct! Use 'on' for specific days and dates. Example: 'on Friday', 'on the 15th of May'."
                    },
                    {
                        question: "I will see you ___ 3 PM.",
                        options: ["in", "on", "at"],
                        correctAnswerIndex: 2,
                        explanation: "Correct! Use 'at' for specific times of the day. Example: 'at noon', 'at 10:30 AM'."
                    },
                    {
                        question: "She started working here ___ 2020.",
                        options: ["in", "on", "at"],
                        correctAnswerIndex: 0,
                        explanation: "Correct! Use 'in' for years. We also use 'in' for large areas like cities and countries, e.g., 'She lives in London'."
                    }
                ]
            });
        }, 700);
    });
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const profile = await getUserProfile();
    const otherUsers = [
        { name: 'Maria', points: 2100 },
        { name: 'Chen', points: 1850 },
        { name: 'Fatima', points: 980 },
        { name: 'David', points: 720 },
    ];

    // Avoid duplicating the current user if their name matches a mock user
    const filteredUsers = otherUsers.filter(u => profile.name && u.name.toLowerCase() !== profile.name.toLowerCase());

    const allUsers = [...filteredUsers];
    // Only add the current user to the leaderboard if they have set a name.
    if (profile.name) {
        allUsers.push({ name: profile.name, points: profile.points });
    }

    const sortedLeaderboard = allUsers
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
            rank: index + 1,
            name: user.name,
            points: user.points,
            isCurrentUser: profile.name ? user.name === profile.name : false,
        }));

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(sortedLeaderboard);
        }, 900);
    });
};