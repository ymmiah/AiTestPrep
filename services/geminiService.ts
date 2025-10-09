import { Feedback, StudyPlan, TopicQA, VocabularyWord, ListeningExercise, CommonMistake, GrammarQuiz, UserProfile, LeaderboardEntry, GeminiResponse, Message, Badge, FinalAssessment, TranscriptAnalysis, PronunciationFeedback, VocabularyStory, IELTSWritingFeedback, IELTSListeningExercise, IELTSReadingExercise, IELTSSpeakingScript, IELTSSpeakingFeedback, AnswerAnalysis, AcademicFeedback, WritingSuggestion, Theme } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';


// --- User Profile & Data Management (LocalStorage) ---
// This section manages user data persistence. In a larger application,
// this would be in its own file (e.g., userService.ts).

const USER_PROFILE_KEY = 'userProfileData';

// --- Helper function for API errors ---
const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    console.error("Gemini API Error:", error);

    let errorString: string;
    
    // Check if it's an Error object and get its message.
    // The Gemini SDK often throws an error where the message contains the JSON response from the server.
    if (error instanceof Error) {
        errorString = error.message;
    } 
    // Otherwise, handle other types (plain objects, strings, etc.)
    else {
        try {
            errorString = JSON.stringify(error);
        } catch {
            errorString = String(error);
        }
    }

    const lowerCaseErrorString = errorString.toLowerCase();

    if (lowerCaseErrorString.includes('quota') || lowerCaseErrorString.includes('resource_exhausted')) {
        return "API Quota Exceeded: You've made too many requests recently. Please wait a moment and try again. Using fallback content for now.";
    }
    if (lowerCaseErrorString.includes('api key not valid')) {
        return "API Error: Your API key is not valid. Please check the key in your profile or config file.";
    }
    if (lowerCaseErrorString.includes('safety')) {
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
  name: '',
  points: 0,
  badges: [],
  referenceNumber: null,
  theme: 'light',
  progress: {
    a2: {
      sessionsCompleted: 0,
      avgPronunciationScore: 0,
      listeningScore: 0,
    },
    ielts: {
      writingTasksCompleted: 0,
      avgWritingBand: 0,
      listeningExercisesCompleted: 0,
      avgListeningScore: 0,
      readingExercisesCompleted: 0,
      avgReadingScore: 0,
      speakingSessionsCompleted: 0,
      avgSpeakingBand: 0,
    },
    academic: {
      assignmentsChecked: 0,
    }
  },
  conversationHistory: {},
  vocabularyProgress: {},
  isDeveloperMode: false,
});

export const getUserProfile = async (): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          const defaultProfile = getDefaultProfile();
          
          // Migration logic from old `progressStats` to new `progress.a2`
          if (parsed.progressStats && !parsed.progress) {
              parsed.progress = defaultProfile.progress; // Initialize new structure
              parsed.progress.a2 = parsed.progressStats; // Move old data
              delete parsed.progressStats; // Delete old key
          }

          // Deep merge to ensure all new properties (ielts, academic, theme) exist on older profiles
          const migratedProfile: UserProfile = {
              ...defaultProfile,
              ...parsed,
              theme: parsed.theme || defaultProfile.theme,
              progress: {
                  ...defaultProfile.progress,
                  ...(parsed.progress || {}),
                  a2: { ...defaultProfile.progress.a2, ...(parsed.progress?.a2 || {}) },
                  ielts: { ...defaultProfile.progress.ielts, ...(parsed.progress?.ielts || {}) },
                  academic: { ...defaultProfile.progress.academic, ...(parsed.progress?.academic || {}) },
              },
              conversationHistory: parsed.conversationHistory || {},
              badges: parsed.badges || [],
              vocabularyProgress: parsed.vocabularyProgress || {}
          };
          
          // Resave the potentially migrated profile to ensure data structure is current
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(migratedProfile));
          
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

export const updateUserTheme = async (theme: Theme): Promise<UserProfile> => {
    return updateUserProfile(profile => {
        profile.theme = theme;
        return profile;
    });
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


// --- API Configuration Management ---

/**
 * Retrieves the Gemini API key. This app is architected for Gemini, so this
 * function specifically looks for the Gemini key.
 * @returns {string} The Gemini API key.
 * @throws {Error} If no Gemini API key can be found.
 */
const getApiKey = (): string => {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }

    // If no key is found, throw an error.
    const message = "Gemini API Key not found in environment variables. Please ensure process.env.API_KEY is set. See the README for setup instructions.";
    alert(message);
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
    picture: "You are a friendly A2 English test examiner. You are having a conversation about a picture of a busy outdoor market. The user will describe it. Your goal is to ask follow-up questions about the people, the setting, and what's happening. After each user response, you MUST provide a response and structured feedback in the specified JSON format.",
    directions: "You are a helpful local person on a street in the UK. The user is a tourist asking for directions. Your goal is to have a natural, role-playing conversation to help them. Give simple, clear, A2-level directions. You can use landmarks like 'the post office' or 'the big clock tower'. Ask clarifying questions. After each user response, you MUST provide a response and structured feedback in the specified JSON format."
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
        rawJson: jsonString,
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
            contents: `An A2 English level user gave this answer: "${userTranscript}" to the question: "${lastModelQuestion}". Your task is to act as an expert English tutor. If the user's answer contains grammatical errors or unnatural phrasing, provide a corrected and more natural-sounding version. If the user's answer is already perfect, provide a slightly different, high-quality alternative way they could have answered. Your goal is to always provide a helpful, improved example. Keep the core idea of their answer the same. Present ONLY the improved answer text, without any extra explanations like "Here is an improved version:".`,
        });
        return result.text.trim();
    } catch (error) {
        return getApiErrorMessage(error, "Sorry, I couldn't generate a suggestion right now. Please try again.");
    }
};

// --- Topic Practice Service ---
const answerAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        feedback: {
            type: Type.STRING,
            description: "Provide 1-2 concise, helpful feedback points on the user's answer, comparing it to the example. Focus on grammar and key vocabulary mistakes. Be encouraging."
        },
        suggestion: {
            type: Type.STRING,
            description: "Provide a corrected and improved version of the user's answer, aligning its quality and style with the provided example answer. If the user's answer was good, provide a slightly different but equally good alternative."
        }
    },
    required: ["feedback", "suggestion"]
};

export const analyzeUserAnswer = async (
  question: string,
  userAnswer: string,
  exampleAnswer: string
): Promise<AnswerAnalysis> => {
    const prompt = `You are an expert A2 English tutor. A student is practicing speaking on a specific topic.
- The question asked was: "${question}"
- A good example answer is: "${exampleAnswer}"
- The student's spoken answer was: "${userAnswer}"

Your task is to analyze the student's answer. Compare it to the example answer for context and quality. Provide constructive feedback and a suggested improvement. You MUST respond in the specified JSON format.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: answerAnalysisSchema,
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as AnswerAnalysis;
        if (!parsed.feedback || !parsed.suggestion) {
            throw new Error("Invalid analysis format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate analysis for your answer.");
        return {
            feedback: errorMessage,
            suggestion: "Could not generate a suggestion. Please try again."
        };
    }
};

const topicQaSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "A relevant question an examiner might ask." },
            answer: { type: Type.STRING, description: "A simple, high-quality, A2-level example answer to the question." }
        },
        required: ["question", "answer"]
    }
};

export const generatePersonalizedTopicQa = async (topic: string, userInput: string): Promise<TopicQA[]> => {
    const prompt = `You are an expert A2 English test content creator. A user wants to practice the topic: "${topic}". Their specific subject is: "${userInput}".
Generate a list of 2 relevant questions an examiner might ask about this. For each question, also provide a simple, high-quality, A2-level example answer.
You MUST respond in a JSON format as an array of objects, where each object has a "question" and an "answer" key.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: topicQaSchema,
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as TopicQA[];
        if (!parsed || parsed.length === 0) {
            throw new Error("Invalid Q&A format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate personalized questions.");
        // Fallback
        return [
            { question: `Could you tell me more about ${userInput}?`, answer: errorMessage }
        ];
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
              aspectRatio: '4:3',
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
    // The topic for part 3 is now fixed to set up the directions task in part 4.
    const chosenTopic = "your home or neighbourhood";

    // The old system prompt for the mock test was too rigid and didn't adapt to the user's context for the directions part.
    // This new prompt redesigns Part 3 and 4 to create a more natural and logical flow, directly addressing the user's request.
    // Part 3 now focuses on the user's neighbourhood, which naturally leads to Part 4 asking for directions to a place the user themselves mentioned.
    // This makes the test more personal, interactive, and a better assessment of the user's ability to give directions in a real-world context.
    return `You are a professional, friendly, and patient examiner for the A2 English speaking test. Your tone should be encouraging and calm. You will conduct a complete, structured, multi-part mock test.
CRITICAL INSTRUCTIONS:
- You MUST ask questions ONE AT A TIME and always wait for the user to respond before continuing.
- Do NOT provide any feedback during the test. Only respond as an examiner.
- When transitioning between parts, you MUST use the exact transition phrases provided and nothing else.
- You MUST wait for the user to acknowledge a transition (e.g., they say "okay") before asking the first question of the new part.

Follow this 4-part structure STRICTLY:

Part 1: Introduction.
1.  Start with EXACTLY: "Hello. My name is Alex. Can you please tell me your full name?". Wait for the user's response.
2.  Next, ask "And where are you from?". Wait for the user's response.
3.  Next, ask ONE more simple introductory question (e.g., "What is the weather like in your city?" or "Do you work or are you a student?"). Wait for the user's response.
4.  After the user answers the third question, your NEXT response must ONLY be the transition phrase: "Thank you. Now, in the next part, we are going to look at a picture."

Part 2: Picture Description.
1.  After the user acknowledges the transition, your next response MUST be to ask them to describe the picture, for example: "Please describe what you see in the picture." Wait for their main description.
2.  After their main description, you will ask exactly three follow-up questions. Ask them ONE BY ONE.
3.  First Question: Ask ONE relevant follow-up question about the picture. Wait for their response.
4.  Second Question: After they answer, ask a SECOND, DIFFERENT follow-up question. Wait for their response.
5.  Third Question: After they answer, ask a THIRD and final imaginative question about the picture. Wait for their response.
6.  After their response to the third question, your NEXT response must ONLY be the transition phrase: "Okay, thank you. Now, let's talk about ${chosenTopic}."

Part 3: Topic Discussion about Home/Neighbourhood.
1.  After the user acknowledges the transition, begin the conversation on '${chosenTopic}'. Your first question MUST be "What is it like where you live?". Wait for their response.
2.  After they answer, your second question MUST be: "What is an interesting place near your home?". Wait for their response. THIS IS THE PLACE YOU WILL ASK FOR DIRECTIONS TO IN PART 4.
3.  After they answer, ask a third and final follow-up question about that place (e.g., "What can you do there?"). Wait for their response.
4.  After their final response in this part, your NEXT response must ONLY be the transition phrase: "Thank you. For the final part of the test, I'm going to ask you for some directions."

Part 4: Directions Task.
1.  After the user acknowledges the transition, you MUST ask for directions to the interesting place they mentioned in Part 3. Your question must be something like: "That place sounds interesting. Can you tell me how to get there from your home?". Wait for their response.
2.  After the user gives directions, ask ONE simple clarifying question (e.g., "Is it far from here?" or "What will I see when I am near there?"). Wait for their response.
3.  After their final answer, your NEXT response MUST ONLY be the end-of-test phrase: "That is the end of the test. Thank you." Do not add any other words.`;
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
                        description: "Provide a corrected and improved, natural-sounding version of the user's turn. If the original was incorrect, focus on fixing the errors. If it was correct, provide a slightly more fluent or alternative phrasing."
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

// --- Academic Writing Service ---

const academicPromptsSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
};

export const generateAcademicPrompts = async (topic: string): Promise<string[]> => {
    const prompt = `You are an academic content creator. A university student has selected the topic: "${topic}". Generate a list of 3 distinct and specific academic essay prompts or questions suitable for a university-level assignment on this topic. You MUST respond in a JSON format as an array of strings.`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: academicPromptsSchema,
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as string[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("Invalid prompts format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate prompts.");
        return [errorMessage];
    }
};

export const generateStarterSentence = async (prompt: string): Promise<string> => {
    const apiPrompt = `You are an expert academic writer. A student needs help starting their essay for the following prompt: "${prompt}". Generate a single, strong, academic-style opening sentence that directly addresses the prompt. This sentence should set a clear direction for the essay. Respond with ONLY the sentence text, without any extra explanations or quotation marks.`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: apiPrompt,
        });
        return result.text.trim();
    } catch (error) {
        return getApiErrorMessage(error, "Could not generate a starter sentence.");
    }
};

const writingSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        original_excerpt: { type: Type.STRING, description: 'A short, specific excerpt from the user\'s original text that needs improvement.' },
        suggestion_for_improvement: { type: Type.STRING, description: 'A clear explanation of HOW to improve the excerpt. Provide a corrected example within the explanation.' }
    },
    required: ['original_excerpt', 'suggestion_for_improvement']
};

const academicFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overall_assessment: { type: Type.STRING, description: 'A 1-2 paragraph summary of the text\'s strengths and main areas for improvement.' },
        structural_feedback: { type: Type.STRING, description: 'A bulleted list of feedback on the text\'s structure, paragraphing, and logical flow. Use a newline character (\'\\n\') to separate each bullet point.' },
        clarity_and_style_feedback: { type: Type.STRING, description: 'A bulleted list of feedback on sentence structure, word choice, and academic tone. Use a newline character (\'\\n\') to separate each bullet point.' },
        improvement_suggestions: { type: Type.ARRAY, items: writingSuggestionSchema },
        corrections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    original_us: { type: Type.STRING, description: 'The original American English word or phrase.' },
                    corrected_uk: { type: Type.STRING, description: 'The corrected British English equivalent.' },
                    explanation: { type: Type.STRING, description: 'A brief explanation of the US vs UK difference.' }
                },
                required: ['original_us', 'corrected_uk', 'explanation']
            },
            description: 'A list of all American English to British English corrections made.'
        }
    },
    required: ['overall_assessment', 'structural_feedback', 'clarity_and_style_feedback', 'improvement_suggestions', 'corrections']
};

export const getAcademicWritingFeedback = async (topic: string, text: string): Promise<AcademicFeedback> => {
    const prompt = `You are an expert academic tutor specializing in British English. Your purpose is to TEACH users how to improve their academic writing, NOT to rewrite their work for them.

GUARDRAIL: If the user's text is extremely short (less than 20 words), is just a list of keywords, or directly asks you to write the assignment, you MUST refuse. In your refusal, you must set 'overall_assessment' to 'I cannot write your assignment for you. My purpose is to help you improve your own work. Please provide a draft of your writing, and I will give you constructive feedback.' and leave all other fields as empty strings or arrays.

For a valid user submission, your task is to analyze their text and provide comprehensive, constructive feedback.

CRITICAL INSTRUCTIONS:
1.  **Analyze, Don't Rewrite:** Do not provide a fully rewritten version of the text. Instead, provide feedback and suggestions.
2.  **British English ONLY:** All your feedback and corrections must adhere strictly to British English spelling, grammar, and vocabulary.
3.  **Provide Structured Feedback:** Fill out the JSON schema with detailed feedback covering the overall piece, its structure, and its style.
4.  **Give Specific Examples:** Use the 'improvement_suggestions' array to pull specific sentences from the user's text and explain how they could be improved.
5.  **Identify Corrections:** List all American to British English changes in the 'corrections' array.
6.  **JSON Output:** You MUST respond in the specified JSON format.

**Assignment Topic:**
${topic}

**User's Text:**
${text}`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: academicFeedbackSchema,
            }
        });

        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as AcademicFeedback;
        if (!parsed.overall_assessment) {
            throw new Error("Invalid feedback format from API.");
        }
        return parsed;

    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate academic feedback.");
        return {
            overall_assessment: errorMessage,
            structural_feedback: "Error generating feedback.",
            clarity_and_style_feedback: "Error generating feedback.",
            improvement_suggestions: [],
            corrections: []
        };
    }
};


// --- IELTS Service Functions ---

export const generateIELTSWritingPrompt = async (task: 'Task 1' | 'Task 2'): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an IELTS test content creator. Generate a single, realistic IELTS Academic Writing ${task} prompt. For Task 1, this should be a description of a chart, graph, table, or diagram. For Task 2, it should be an essay question on a common topic. Respond with ONLY the prompt text, without any additional explanations or formatting like "Here is the prompt:".`,
        });
        return result.text.trim();
    } catch (error) {
        console.error(`Failed to generate IELTS ${task} prompt:`, error);
        if (task === 'Task 1') {
            return "The chart below shows the changes in the share of the population in cities in different continents. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
        }
        return "Some people think that technology has made our lives more complex, while others believe it has simplified them. Discuss both views and give your own opinion."; // Fallback prompt
    }
};

const ieltsWritingFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallBand: { type: Type.NUMBER, description: "The overall band score from 1-9, as an average of the four criteria, rounded to the nearest 0.5." },
        taskAchievement: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Task Achievement (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on how well the response addresses the task requirements." }
            },
            required: ["score", "feedback"]
        },
        coherenceAndCohesion: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Coherence and Cohesion (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the organization of ideas, paragraphing, and use of cohesive devices." }
            },
            required: ["score", "feedback"]
        },
        lexicalResource: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Lexical Resource (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the range of vocabulary, accuracy, and appropriate use of words." }
            },
            required: ["score", "feedback"]
        },
        grammaticalRangeAndAccuracy: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Grammatical Range and Accuracy (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the range and accuracy of grammatical structures and sentence types." }
            },
            required: ["score", "feedback"]
        },
        suggestedImprovements: {
            type: Type.STRING,
            description: "A concise, bulleted list of the top 2-3 most important suggestions for improvement. Use newline characters ('\n') to separate bullet points."
        }
    },
    required: ["overallBand", "taskAchievement", "coherenceAndCohesion", "lexicalResource", "grammaticalRangeAndAccuracy", "suggestedImprovements"]
};


export const getIELTSWritingFeedback = async (prompt: string, essay: string, task: 'Task 1' | 'Task 2'): Promise<IELTSWritingFeedback> => {
    const apiPrompt = `You are an expert IELTS examiner. Analyze the user's essay for the given prompt based on the official IELTS Writing scoring criteria. The essay is for ${task}.
Provide a detailed assessment in a structured JSON format.

**Essay Prompt:**
${prompt}

**User's Essay:**
${essay}

You MUST respond with a JSON object that adheres to the schema. For each criterion, provide a band score from 1-9 and specific, constructive feedback explaining why you gave that score. The overall band score should be a calculated average of the four criteria, rounded to the nearest 0.5. The suggested improvements should be a bulleted list of the most important things the user can do to improve.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: apiPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ieltsWritingFeedbackSchema,
            }
        });

        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as IELTSWritingFeedback;
        if (!parsed.overallBand) {
            throw new Error("Invalid feedback format from API.");
        }
        return parsed;

    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate writing feedback.");
        return {
            overallBand: 0,
            taskAchievement: { score: 0, feedback: errorMessage },
            coherenceAndCohesion: { score: 0, feedback: errorMessage },
            lexicalResource: { score: 0, feedback: errorMessage },
            grammaticalRangeAndAccuracy: { score: 0, feedback: errorMessage },
            suggestedImprovements: "There was an error generating suggestions. Please try again."
        };
    }
};

export const generateIELTSModelAnswer = async (prompt: string, task: 'Task 1' | 'Task 2'): Promise<string> => {
    const apiPrompt = `You are an expert IELTS teacher. A student has been given the following IELTS Writing ${task} prompt. Your task is to write a clear, high-quality, Band 8+ model answer for them to study. The response should be well-structured, use a wide range of vocabulary and grammatical structures, and directly address all parts of the prompt.

**Essay Prompt:**
${prompt}

Respond with ONLY the model answer text, without any additional explanations, introductions, or formatting like "Here is a model answer:".`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: apiPrompt,
        });
        return result.text.trim();
    } catch (error) {
        return getApiErrorMessage(error, "Sorry, I couldn't generate a model answer at this time. Please try again later.");
    }
};

const ieltsListeningExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A realistic title for an IELTS Listening Section 1 exercise." },
        audioDuration: { type: Type.INTEGER, description: "An estimated duration of the audio script in seconds. Average speaking rate is 150 words per minute." },
        script: { type: Type.STRING, description: "A full conversation script between two speakers for an IELTS Listening Section 1 scenario (e.g., booking a service, asking for information). Format it like 'Speaker 1: ...', 'Speaker 2: ...'." },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionType: { type: Type.STRING, description: "The type of question, either 'FORM' for fill-in-the-blank or 'MCQ' for multiple choice." },
                    questionNumber: { type: Type.INTEGER },
                    questionText: { type: Type.STRING, description: "The text for the question. For 'FORM' type, use '_____' to indicate a blank." },
                    options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "An array of 3 string options. This field should ONLY be present for 'MCQ' type questions."
                    },
                    correctAnswer: { type: Type.STRING, description: "The correct answer. For 'FORM', it's the text for the blank. For 'MCQ', it's the exact text of the correct option." }
                },
                required: ["questionType", "questionNumber", "questionText", "correctAnswer"]
            }
        }
    },
    required: ["title", "audioDuration", "script", "questions"]
};

export const generateIELTSListeningExercise = async (): Promise<IELTSListeningExercise> => {
    const prompt = `You are an expert IELTS test creator. Generate a complete, unique IELTS Listening Section 1 exercise.
The exercise must contain a mix of question types based on a single conversation script.
You must provide the following in a single JSON object:
1.  A realistic title for the exercise (e.g., "Library Registration Form", "Event Booking Details").
2.  A full conversation script between two speakers on an everyday social topic. The script should be between 250 and 350 words.
3.  An estimated duration in seconds for the audio, assuming a speaking rate of 150 words per minute.
4.  A set of exactly 5 questions based on the script:
    - 3 questions of type 'FORM' (form completion). The questionText should include '_____' for the blank.
    - 2 questions of type 'MCQ' (multiple choice). These must have an 'options' array with 3 choices. The 'correctAnswer' must be the exact text of one of the options.
You MUST respond with a JSON object that strictly adheres to the provided schema.`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ieltsListeningExerciseSchema,
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as IELTSListeningExercise;
        if (!parsed.title || !parsed.questions || parsed.questions.length === 0) {
            throw new Error("Invalid listening exercise format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate a listening exercise.");
        console.error("Listening exercise generation failed:", errorMessage);
        // Fallback data
        return {
            title: "Community Centre Evening Classes",
            audioDuration: 120,
            script: "Receptionist: Good evening, community centre, how can I help you? \nCaller: Oh, hello. I was calling to ask about your evening classes. \nReceptionist: Certainly. We have a few options. What are you interested in? \nCaller: I saw a poster for a pottery class. Is that still available? \nReceptionist: Ah yes, the pottery class with Mrs. Davis. That's on Wednesday evenings. \nCaller: Wednesday, okay. And what time does it start? \nReceptionist: It starts at 7:30 PM and runs for two hours. \nCaller: Perfect. And where is the class held? \nReceptionist: It's in the main building, in the art studio on the second floor. That's room 201. \nCaller: Room 201, got it. And what's the cost? \nReceptionist: The course costs eighty-five pounds for six weeks. But there is a discount for new members. \nCaller: Oh really? What is the discount? \nReceptionist: New members get 10% off the total price. \nCaller: That's great! Can I book a place over the phone? \nReceptionist: Of course. I'll just need your name. \nCaller: It's Peterson. Anna Peterson. \nReceptionist: Okay, Anna, you're all booked in. We look forward to seeing you.",
            questions: [
                { questionType: 'FORM', questionNumber: 1, questionText: "Type of class: _____", correctAnswer: "pottery" },
                { questionType: 'FORM', questionNumber: 2, questionText: "Starts at: _____", correctAnswer: "7:30 PM" },
                { questionType: 'FORM', questionNumber: 3, questionText: "Location: Room _____", correctAnswer: "201" },
                { questionType: 'MCQ', questionNumber: 4, questionText: "How much does the course cost for six weeks?", options: ["£85", "£95", "10%"], correctAnswer: "£85" },
                { questionType: 'MCQ', questionNumber: 5, questionText: "What special offer is available?", options: ["A free first class", "10% off for new members", "A discount on materials"], correctAnswer: "10% off for new members" }
            ]
        };
    }
};

// FIX: Add missing function 'generateIELTSReadingExercise' to resolve import error.
const ieltsReadingExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A realistic title for an IELTS Academic Reading passage." },
        passage: { type: Type.STRING, description: "A full academic-style reading passage of about 300-400 words on a common topic like science, history, or social studies." },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionType: { type: Type.STRING, description: "The type of question, either 'MCQ' (multiple choice) or 'TFNG' (True/False/Not Given)." },
                    questionText: { type: Type.STRING, description: "The text for the MCQ question." },
                    statement: { type: Type.STRING, description: "The statement for the TFNG question." },
                    options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "An array of 4 string options for MCQ questions."
                    },
                    correctAnswer: { type: Type.STRING, description: "The correct answer. For 'MCQ', it's the text of the correct option. For 'TFNG', it's 'TRUE', 'FALSE', or 'NOT GIVEN'." }
                },
                required: ["questionType", "correctAnswer"]
            }
        }
    },
    required: ["title", "passage", "questions"]
};

export const generateIELTSReadingExercise = async (): Promise<IELTSReadingExercise> => {
    const prompt = `You are an expert IELTS test creator. Generate a complete, unique IELTS Academic Reading exercise.
The exercise must contain a mix of question types based on a single reading passage.
You must provide the following in a single JSON object:
1.  A realistic title for the passage.
2.  A full academic-style reading passage between 300 and 400 words.
3.  A set of exactly 5 questions based on the passage:
    - 2 questions of type 'MCQ' (multiple choice). These must have a 'questionText' and an 'options' array with 4 choices.
    - 3 questions of type 'TFNG' (True/False/Not Given). These must have a 'statement'.
You MUST respond with a JSON object that strictly adheres to the provided schema. For MCQs, provide 'questionText' and 'options'. For TFNGs, provide 'statement'.`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ieltsReadingExerciseSchema,
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as IELTSReadingExercise;
        if (!parsed.title || !parsed.questions || parsed.questions.length === 0) {
            throw new Error("Invalid reading exercise format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate a reading exercise.");
        console.error("Reading exercise generation failed:", errorMessage);
        // Fallback data
        return {
            title: "The Rise of Artificial Intelligence",
            passage: "Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines. It has become an essential part of the technology industry. Research in AI is highly technical and specialized. The core problems of artificial intelligence include programming computers for certain traits such as: Knowledge, Reasoning, Problem solving, Perception, Learning, Planning, Ability to manipulate and move objects. AI is a broad field, and its applications are numerous. One of the key applications is in the development of self-driving cars. These cars use a combination of sensors, cameras, and AI algorithms to navigate roads without human intervention. Another significant application is in the field of medicine, where AI is used to diagnose diseases more accurately and to develop personalized treatment plans. Despite its potential, AI also raises ethical concerns. Issues such as job displacement due to automation, the potential for biased algorithms, and the misuse of AI in surveillance are topics of ongoing debate among experts and policymakers.",
            questions: [
                { questionType: 'MCQ', questionText: "What is the main purpose of AI?", options: ["To create video games", "To create intelligent machines", "To build faster computers", "To design websites"], correctAnswer: "To create intelligent machines" },
                { questionType: 'MCQ', questionText: "Which of the following is NOT listed as a core problem of AI?", options: ["Learning", "Reasoning", "Data storage", "Perception"], correctAnswer: "Data storage" },
                { questionType: 'TFNG', statement: "Self-driving cars rely solely on cameras to navigate.", correctAnswer: 'FALSE' },
                { questionType: 'TFNG', statement: "AI is used in medicine for disease diagnosis.", correctAnswer: 'TRUE' },
                { questionType: 'TFNG', statement: "The passage states that AI has no ethical concerns.", correctAnswer: 'FALSE' },
            ]
        };
    }
};

// FIX: Add missing function 'generateIELTSSpeakingScript' to resolve import error.
const ieltsSpeakingScriptSchema = {
    type: Type.OBJECT,
    properties: {
        part1Questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 4-5 introductory questions on a common topic like hometown, work, or studies."
        },
        part2CueCard: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING, description: "The main topic for the cue card, e.g., 'Describe a memorable holiday you have had.'" },
                points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 3-4 bullet points the user should talk about, e.g., 'You should say: where you went, who you were with, what you did'."
                }
            },
            required: ["topic", "points"]
        },
        part3Questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 4-5 follow-up discussion questions related to the topic in Part 2."
        }
    },
    required: ["part1Questions", "part2CueCard", "part3Questions"]
};

export const generateIELTSSpeakingScript = async (): Promise<IELTSSpeakingScript> => {
    const prompt = `You are an IELTS test content creator. Generate a complete, unique script for an IELTS Speaking test, covering all three parts. You MUST respond with a JSON object that strictly adheres to the provided schema. The topics should be common and suitable for a general audience.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ieltsSpeakingScriptSchema
            }
        });
        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as IELTSSpeakingScript;
        if (!parsed.part1Questions || !parsed.part2CueCard || !parsed.part3Questions) {
            throw new Error("Invalid speaking script format from API.");
        }
        return parsed;
    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate a speaking script.");
        console.error("Speaking script generation failed:", errorMessage);
        return {
            part1Questions: ["Let's talk about your hometown. Where is it?", "What's the most interesting part of your town?", "What kind of jobs do people do there?", "Do you think it's a good place to live?"],
            part2CueCard: {
                topic: "Describe a website you use often.",
                points: ["You should say:", "what the website is", "how you found out about it", "what you use it for", "and explain why you use it so often."]
            },
            part3Questions: ["What are some of the advantages and disadvantages of the internet?", "Do you think older people and younger people use the internet for different things?", "How has the internet changed social interaction?", "Do you think the internet is a safe place for children?"]
        };
    }
};

// FIX: Add missing function 'getIELTSSpeakingFeedback' to resolve import error.
const ieltsSpeakingFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallBand: { type: Type.NUMBER, description: "The overall band score from 1-9, as an average of the four criteria, rounded to the nearest 0.5." },
        fluencyAndCoherence: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Fluency and Coherence (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on fluency, use of cohesive devices, and logical flow of ideas." }
            },
            required: ["score", "feedback"]
        },
        lexicalResource: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Lexical Resource (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the range of vocabulary, accuracy, and appropriate use of words." }
            },
            required: ["score", "feedback"]
        },
        grammaticalRangeAndAccuracy: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Grammatical Range and Accuracy (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the range and accuracy of grammatical structures." }
            },
            required: ["score", "feedback"]
        },
        pronunciation: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Band score for Pronunciation (1-9)." },
                feedback: { type: Type.STRING, description: "Detailed feedback on pronunciation features like intonation, stress, and individual sounds." }
            },
            required: ["score", "feedback"]
        },
        suggestedImprovements: {
            type: Type.STRING,
            description: "A concise, bulleted list of the top 2-3 most important suggestions for improvement. Use newline characters ('\n') to separate bullet points."
        }
    },
    required: ["overallBand", "fluencyAndCoherence", "lexicalResource", "grammaticalRangeAndAccuracy", "pronunciation", "suggestedImprovements"]
};

export const getIELTSSpeakingFeedback = async (transcript: string, script: IELTSSpeakingScript): Promise<IELTSSpeakingFeedback> => {
    const apiPrompt = `You are an expert IELTS examiner. Analyze the user's spoken transcript in response to the provided IELTS Speaking test script.
Provide a detailed assessment based on the official IELTS Speaking scoring criteria in a structured JSON format.

**Speaking Test Script:**
Part 1: ${script.part1Questions.join(' ')}
Part 2: ${script.part2CueCard.topic} - ${script.part2CueCard.points.join(' ')}
Part 3: ${script.part3Questions.join(' ')}

**User's Full Transcript:**
${transcript}

You MUST respond with a JSON object that adheres to the schema. For each criterion, provide a band score from 1-9 and specific, constructive feedback. The overall band score should be an average of the four criteria, rounded to the nearest 0.5. The suggested improvements should be a bulleted list.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: apiPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ieltsSpeakingFeedbackSchema,
            }
        });

        const jsonString = result.text.trim();
        const parsed = JSON.parse(jsonString) as IELTSSpeakingFeedback;
        if (!parsed.overallBand) {
            throw new Error("Invalid feedback format from API.");
        }
        return parsed;

    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Could not generate speaking feedback.");
        return {
            overallBand: 0,
            fluencyAndCoherence: { score: 0, feedback: errorMessage },
            lexicalResource: { score: 0, feedback: errorMessage },
            grammaticalRangeAndAccuracy: { score: 0, feedback: errorMessage },
            pronunciation: { score: 0, feedback: errorMessage },
            suggestedImprovements: "There was an error generating suggestions. Please try again."
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

const vocabularyChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        word: { type: Type.STRING, description: 'The vocabulary word.' },
        definition: { type: Type.STRING, description: 'A simple, A2-level definition of the word.' },
        type: { type: Type.STRING, description: 'The grammatical type of the word (e.g., "noun", "verb", "adjective").' },
        pronunciation: { type: Type.STRING, description: 'A simplified phonetic pronunciation guide (e.g., "di-li-shuhs").' },
        distractors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 incorrect but plausible alternative words for a multiple-choice question.'
        },
    },
    required: ["word", "definition", "type", "pronunciation", "distractors"]
};

const storyChunkSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "A chunk of the story text. Can be a full sentence or a fragment leading up to a challenge." },
        challenge: { ...vocabularyChallengeSchema, description: "An optional vocabulary challenge. When provided, the 'word' from this challenge is meant to follow the 'text' string." },
    },
    required: ["text"]
};

const vocabularyStorySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, engaging title for the story." },
        chunks: {
            type: Type.ARRAY,
            items: storyChunkSchema,
            description: "The story, broken into text chunks. Some chunks will have a vocabulary challenge associated with them."
        }
    },
    required: ["title", "chunks"]
};

// Fallback data in case the API fails
const fallbackStory: VocabularyStory = {
    title: "A Day at the Market",
    chunks: [
        // FIX: Changed object with 'text' property to a simple string to match the StoryChunk type.
        "Maria wanted to bake a cake for her friend's birthday. She needed to buy some fresh ingredients, so she decided to visit the local ",
        {
            challenge: {
                word: "market",
                definition: "A place where people buy and sell goods, especially food.",
                type: "noun",
                pronunciation: "mar-ket",
                distractors: ["library", "office", "cinema"]
            }
        },
        // FIX: Changed object with 'text' property to a simple string to match the StoryChunk type.
        ". The market was very busy and colourful. She saw a stall selling ",
        {
            challenge: {
                word: "delicious",
                definition: "Having a very pleasant taste or smell.",
                type: "adjective",
                pronunciation: "di-li-shuhs",
                distractors: ["difficult", "tall", "angry"]
            }
        },
        // FIX: Changed object with 'text' property to a simple string to match the StoryChunk type.
        " strawberries. 'I'll take one box, please!' she said to the seller. Next, she needed to find some flour and sugar. She had to stand in a long ",
        {
            challenge: {
                word: "queue",
                definition: "A line of people waiting for something.",
                type: "noun",
                pronunciation: "kyoo",
                distractors: ["circle", "chair", "song"]
            }
        },
        // FIX: Changed object with 'text' property to a simple string to match the StoryChunk type.
        " at the bakery stall, but the baker was very friendly. Finally, with her basket full, she started her ",
        {
            challenge: {
                word: "journey",
                definition: "The act of travelling from one place to another.",
                type: "noun",
                pronunciation: "jur-nee",
                distractors: ["story", "picture", "sleep"]
            }
        },
        // FIX: Changed object with 'text' property to a simple string to match the StoryChunk type.
        " home, excited to start baking."
    ]
};


export const generateVocabularyStory = async (): Promise<[VocabularyStory, string | null]> => {
    const prompt = `Create a short, simple story for an A2-level English learner. The story should be about a common daily activity in the UK. The total story should contain exactly 4 key vocabulary words suitable for this level. Structure the entire response as a single JSON object that strictly follows this schema. The story should be broken into chunks. A chunk can be a piece of text, or a piece of text followed by a vocabulary challenge. The 'word' in the challenge should logically follow the 'text' in its chunk. Provide 3 plausible but incorrect distractors for each challenge word.

Here is an example of a single chunk with a challenge:
{
  "text": "It was a sunny day, so I decided to go for a walk in the ",
  "challenge": {
    "word": "park",
    "definition": "A large public garden in a town, used for recreation.",
    "type": "noun",
    "pronunciation": "pahrk",
    "distractors": ["school", "bank", "airport"]
  }
}
And a chunk without a challenge:
{
  "text": ". I saw many people enjoying the weather."
}
`;
    
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: vocabularyStorySchema,
            }
        });

        const jsonString = result.text.trim();
        let parsed = JSON.parse(jsonString) as { title: string, chunks: { text: string, challenge?: any }[] };
        
        // Post-process the response to fit the StoryChunk union type
        const processedStory: VocabularyStory = {
            title: parsed.title,
            chunks: []
        };
        
        parsed.chunks.forEach(chunk => {
            processedStory.chunks.push(chunk.text);
            if (chunk.challenge) {
                processedStory.chunks.push({ challenge: chunk.challenge });
            }
        });

        if (!processedStory.title || processedStory.chunks.length === 0) {
            console.warn("Gemini returned an invalid story structure, using fallback.");
            const errorMessage = "The AI couldn't create a story, so we've loaded a default one for you.";
            return [fallbackStory, errorMessage];
        }

        return [processedStory, null];

    } catch (error) {
        const errorMessage = getApiErrorMessage(error, "An AI error occurred, so we've loaded a default story for you to practice with.");
        console.error("Failed to generate vocabulary story from Gemini:", errorMessage);
        return [fallbackStory, errorMessage];
    }
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