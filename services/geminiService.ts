import { Feedback, StudyPlan, TopicQA, VocabularyWord, ListeningExercise, CommonMistake, GrammarQuiz, UserProfile, LeaderboardEntry, GeminiResponse, Message, Badge, FinalAssessment, TranscriptAnalysis, PronunciationFeedback } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';


// --- User Profile & Data Management (LocalStorage) ---
// This section manages user data persistence. In a larger application,
// this would be in its own file (e.g., userService.ts).

const USER_PROFILE_KEY = 'userProfileData';
const USER_API_KEY_KEY = 'gemini_api_key';

// --- Helper function for API errors ---
const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    console.error("Gemini API Error:", error);
    // Stringify the error to safely search for keywords, regardless of its original type.
    const errorString = (typeof error === 'string' ? error : JSON.stringify(error)).toLowerCase();

    if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
        return "API Error: You have exceeded your usage quota. Please check your Google AI account or try again later.";
    }
    if (errorString.includes('api key not valid')) {
        return "API Error: Your API key is not valid. Please check the key in your profile or config file.";
    }
    if (errorString.includes('safety')) {
        return "The response was blocked due to safety settings. Please modify your prompt and try again.";
    }
    
    return defaultMessage;
};


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
 * Checks if a user has provided their own API key in local storage.
 * @returns {boolean} True if a key is set, false otherwise.
 */
export const isApiKeySet = (): boolean => {
    return !!localStorage.getItem(USER_API_KEY_KEY);
};

/**
 * Saves a user-provided API key to local storage and reloads the page.
 * Reloading ensures the Gemini client is re-initialized with the new key.
 * @param {string} key The API key to save.
 */
export const setApiKey = (key: string): void => {
    if (key.trim()) {
        localStorage.setItem(USER_API_KEY_KEY, key.trim());
    } else {
        localStorage.removeItem(USER_API_KEY_KEY);
    }
    // Reload the application to re-initialize the Gemini client with the new key.
    window.location.reload();
};


/**
 * Retrieves the Gemini API key, following a specific priority order to ensure
 * user-provided keys are always used first.
 * @returns {string} The API key.
 * @throws {Error} If no API key can be found in any of the potential locations.
 */
const getApiKey = (): string => {
    // Priority 1: User-provided key from browser's local storage.
    const userKey = localStorage.getItem(USER_API_KEY_KEY);
    if (userKey) {
        return userKey;
    }

    // Priority 2: Key from a Node.js-like environment (e.g., deployment variable).
    // This is a safer check than a try-catch block for detecting the 'process' object.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    
    // Priority 3: Key from a `config.js` file for local browser development.
    if ((window as any).process?.env?.API_KEY) {
        return (window as any).process.env.API_KEY;
    }

    // If no key is found, throw an error.
    const message = "API Key not found. Please add your key in the Profile page, or for local development, create a `config.js` file. See the README for setup instructions.";
    alert(message); // Provide a clear message to the developer in the browser.
    throw new Error(message);
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
    const userFriendlyMessage = getApiErrorMessage(error, "Sorry, I encountered an error. Could you please repeat that?");
    // Provide a graceful fallback response if the API call fails or JSON is malformed
    return {
        response: userFriendlyMessage,
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
        return getApiErrorMessage(error, "Sorry, I couldn't generate an idea right now. Please try again.");
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
            contents: `An A2 English level user gave this answer: "${userTranscript}" to the question: "${lastModelQuestion}". Carefully provide an improved, more natural, and grammatically correct version of their answer. Your goal is to help them sound more fluent, not to change their original meaning. Keep the core idea of their answer the same. Present ONLY the improved answer text, without any extra explanations like "Here is an improved version:".`,
        });
        return result.text.trim();
    } catch (error) {
        return getApiErrorMessage(error, "Sorry, I couldn't generate a suggestion right now. Please try again.");
    }
};

// --- Pronunciation Practice Service Functions ---

const pronunciationFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallFeedback: {
            type: Type.STRING,
            description: "Provide a 1-2 sentence summary of the user's pronunciation. Be encouraging and focus on A2 level."
        },
        wordAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: {
                        type: Type.STRING,
                        description: "The specific word from the original phrase."
                    },
                    isCorrect: {
                        type: Type.BOOLEAN,
                        description: "True if the user's pronunciation of this word seems correct based on the transcript, false otherwise."
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Provide a very short, specific tip if the word was likely mispronounced, or a brief 'Good!' if it was correct."
                    }
                },
                required: ["word", "isCorrect", "feedback"]
            }
        }
    },
    required: ["overallFeedback", "wordAnalysis"]
};

export const getPronunciationFeedback = async (
  targetPhrase: string,
  userTranscript: string
): Promise<PronunciationFeedback> => {
  const prompt = `You are an expert British English pronunciation coach for A2 level learners.
The user was asked to say the following target phrase:
"${targetPhrase}"

The user's speech was transcribed as:
"${userTranscript}"

Analyze the user's transcript and compare it to the target phrase. Provide feedback on their pronunciation. Your analysis should be based on the differences between the two strings, inferring likely pronunciation errors (e.g., if 'three' was transcribed as 'tree', the user likely has trouble with the 'th' sound).

You MUST respond in the specified JSON format. For the 'wordAnalysis', provide an entry for EVERY word in the original target phrase.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pronunciationFeedbackSchema,
      }
    });

    const jsonString = result.text.trim();
    const parsed = JSON.parse(jsonString) as PronunciationFeedback;

    // Basic validation
    if (!parsed.overallFeedback || !parsed.wordAnalysis) {
      throw new Error("Invalid feedback format from API.");
    }
    return parsed;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error, "Could not generate pronunciation feedback.");
    return {
      overallFeedback: errorMessage,
      wordAnalysis: targetPhrase.split(' ').map(word => ({
          word,
          isCorrect: false,
          feedback: "Analysis failed."
      }))
    };
  }
};

export const generatePracticePhrase = async (): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate one short, common English sentence that would be good for an A2-level student to practice pronunciation. The sentence should contain a mix of sounds. For example: 'I think I'll have a glass of water.' Do not include quotation marks or any other text in your response.",
        });
        return result.text.trim().replace(/"/g, ''); // Clean up any quotes
    } catch (error) {
        console.error("Failed to generate practice phrase:", error);
        return "The quick brown fox jumps over the lazy dog."; // Fallback phrase
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
        const errorMessage = getApiErrorMessage(error, "An unknown error occurred during image generation.");
        console.error(`Gemini image generation failed: ${errorMessage}. Using fallback image.`);
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

    return `You are a professional, friendly, and patient examiner for the A2 English speaking test. Your tone should be encouraging and calm, giving the user time to think without rushing them. You will conduct a complete, structured, multi-part mock test. Do NOT provide any feedback during the test. Only respond conversationally as an examiner would. Adhere strictly to the following 4-part structure. IMPORTANT: You must wait for the user to respond after you announce a transition to a new part before you ask the first question of that new part.

Part 1: Introduction.
- Start with EXACTLY: "Hello. My name is Alex. Can you please tell me your full name?".
- After the user responds, ask "And where are you from?".
- After that, ask two more simple introductory questions to get to know them. These questions should naturally follow from their previous answers. For example, you could ask about their home, family, work, or studies, but be flexible and adapt to what they say.
- To transition to Part 2, you MUST end your response with ONLY: "Thank you. Now, in the next part, we are going to look at a picture."

Part 2: Picture Description.
- After the user acknowledges the transition (e.g., they say "okay"), your next response MUST be to ask them to describe the picture. For example: "Please describe what you see in the picture."
- Listen to their description, then ask at least two relevant follow-up questions about the picture to encourage more detail (e.g., "What are the people doing?", "What is the weather like?").
- To transition to Part 3, you MUST end your response with ONLY: "Okay, thank you. Now, let's talk about ${chosenAreas[0]}."

Part 3: Topic Discussion 1.
- After the user acknowledges the transition, you will begin the conversation on the first subject area: '${chosenAreas[0]}'. Ask your first question on this topic.
- Ask at least three follow-up questions to develop a short conversation on this topic.
- To transition to Part 4, you MUST end your response with ONLY: "Thank you. Now let's talk about ${chosenAreas[1]}."

Part 4: Topic Discussion 2.
- After the user acknowledges the transition, you will begin the conversation on the second subject area: '${chosenAreas[1]}'. Ask your first question on this topic.
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
        const errorMessage = getApiErrorMessage(error, "There was an error generating the assessment.");
        const feedbackMessage = "Feedback unavailable due to an error.";
        const improvementMessage = getApiErrorMessage(error, "Please try the mock test again.");
        
        // Return a fallback assessment on error
        return {
            overallScore: 0,
            feedback: {
                grammar: feedbackMessage,
                vocabulary: feedbackMessage,
                fluency: feedbackMessage,
                pronunciation: feedbackMessage
            },
            strengths: errorMessage,
            areasForImprovement: improvementMessage
        };
    }
};

const transcriptAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        pictureDescriptionAnalysis: {
            type: Type.OBJECT,
            properties: {
                modelAnswer: {
                    type: Type.STRING,
                    description: "Provide a detailed, high-quality A2-level model answer describing the provided picture. Cover the main people, actions, and the overall scene."
                },
                userPerformanceFeedback: {
                    type: Type.STRING,
                    description: "Provide specific feedback on the user's performance during the picture description part of the test. Comment on their vocabulary, grammar, and detail."
                }
            },
            required: ["modelAnswer", "userPerformanceFeedback"]
        },
        conversationAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    userTurn: {
                        type: Type.STRING,
                        description: "The original text from the user's turn."
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Provide concise, specific feedback on this user's turn, highlighting grammar or vocabulary mistakes."
                    },
                    suggestion: {
                        type: Type.STRING,
                        description: "Provide an improved, natural-sounding version of the user's turn."
                    }
                },
                required: ["userTurn", "feedback", "suggestion"]
            }
        }
    },
    required: ["pictureDescriptionAnalysis", "conversationAnalysis"]
};


export const generateTranscriptAnalysis = async (history: Message[], imageUrl: string | null): Promise<TranscriptAnalysis> => {
    const userTurns = history.filter(m => m.role === 'user').map(m => m.text);
    const transcript = history.map(m => `${m.role}: ${m.text}`).join('\n');

    const textPrompt = `You are an expert A2 English examiner. The following is a transcript of a mock A2 speaking test. A picture was used in Part 2 and is provided as input. Your task is to provide a detailed analysis of the user's performance. You MUST respond in the specified JSON format.

1.  **Picture Description Analysis**:
    - Based on the provided picture, write a comprehensive, A2-level model answer for the picture description.
    - Provide specific feedback on the user's actual description from the transcript.

2.  **Conversation Analysis**:
    - For EVERY user turn in the transcript (excluding the picture description part, which is handled above), provide:
        a. The original user text.
        b. Specific feedback on any mistakes (grammar, vocabulary, phrasing).
        c. A suggested, improved version of their answer. Ensure this list only contains turns from the conversational parts, not the picture description.

**Transcript:**
${transcript}
`;

    try {
        const parts: any[] = [{ text: textPrompt }];
        
        if (imageUrl && imageUrl.startsWith('data:image/')) {
            const [meta, base64Data] = imageUrl.split(',');
            if (base64Data) {
                const mimeType = meta.split(':')[1].split(';')[0];
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                    },
                });
            }
        }
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                 responseMimeType: "application/json",
                 responseSchema: transcriptAnalysisSchema,
            }
        });

        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as TranscriptAnalysis;

        if (!parsed.pictureDescriptionAnalysis || !parsed.conversationAnalysis) {
             throw new Error("Invalid analysis format from API.");
        }
        return parsed;

    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate analysis.");

        return {
            pictureDescriptionAnalysis: {
                modelAnswer: errorMessage,
                userPerformanceFeedback: errorMessage
            },
            conversationAnalysis: userTurns.map(turn => ({
                userTurn: turn,
                feedback: errorMessage,
                suggestion: errorMessage
            }))
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