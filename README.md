# UK Spouse Visa A2 English Test Prep

## 1. Project Overview

The UK Spouse Visa A2 English Test Prep is an advanced, AI-powered web application designed to help users prepare for the A2 English language test required for the UK Spouse Visa. It provides an immersive, gamified, and interactive learning experience by simulating the conversational part of the exam.

The application's core is a voice-to-voice chat where users speak with an AI examiner. The AI, powered by Google Gemini, listens to the user's response, replies with a natural-sounding voice, and provides instant, targeted feedback on their performance. This creates a realistic and effective practice environment to build speaking confidence and proficiency.

## 2. Core Features

The application is a comprehensive toolkit with modules targeting every aspect of the A2 test.

### AI Conversation Simulator (The Core Experience)

*   **Voice-to-Voice Interaction:** Users engage in a full conversational experience by speaking to the AI and listening to its spoken responses, creating a true-to-life practice session.
*   **Realistic Scenarios:** Practice across a variety of contexts, including:
    *   General Q&A (the standard exam format).
    *   Picture Description.
    *   Role-playing (e.g., Ordering at a Coffee Shop, Visiting a Doctor's Office).
*   **Instant, Detailed Feedback:** After each user response, Google Gemini provides structured feedback on four key areas: **Grammar**, **Vocabulary**, **Fluency**, and **Pronunciation**.
*   **Intelligent UI:** The microphone button dynamically changes its state to guide the user, indicating when it's listening, when the AI is processing, and when the AI is speaking.
*   **Conversation Helpers:** Users can get an "Idea" for how to answer a question or an "Improved" version of their last answer, powered by Gemini.

### Full Mock A2 Exam

*   **Timed Simulation:** A full, 7-minute timed simulation of the official speaking test.
*   **Structured Format:** Follows the official 3-part structure: Introduction, Picture Description, and Conversation.
*   **AI-Generated Imagery:** Uses the Gemini Image Generation API to create a unique, random picture for the description task in each test.
*   **Final Assessment:** At the end of the test, Gemini provides a comprehensive final assessment, including an overall score, detailed feedback, strengths, and areas for improvement.
*   **Transcript Review:** Users can review the full transcript of their mock test, with the option to get AI-powered improvements for each of their answers.

### Comprehensive Skill Development Modules

*   **Vocabulary Builder:** An interactive flashcard system using a Spaced Repetition System (SRS) to help users learn and memorize new English words efficiently.
*   **Listening Practice:** Dedicated exercises with mock audio recordings and multiple-choice comprehension questions to sharpen listening skills.
*   **Grammar Hub:** A two-part module featuring:
    *   **Common Mistakes:** A list of frequent grammatical errors with correct examples and clear explanations.
    *   **Grammar Quiz:** An interactive quiz to test and reinforce grammatical knowledge.

### Personalized AI-Powered Tools

*   **Study Planner:** Generates a personalized, week-by-week study schedule based on the user's upcoming test date and weekly availability.
*   **Topic Generator:** Creates common exam questions and provides high-quality example answers for various topics like "Family," "Hobbies," and "Food."

### Gamification and Motivation

*   **Points System:** Users earn points for high-quality conversational responses and for completing quizzes, encouraging consistent practice.
*   **Badges & Achievements:** Milestones are recognized with unlockable badges (e.g., "Grammar Guru" for a perfect quiz score), which are displayed on the user's profile.
*   **Leaderboard:** A competitive leaderboard ranks users based on points earned, fostering a motivating learning community.
*   **User Profile:** A personal space to track progress, view total points, see collected badges, and manage personal information.

### Polished User Experience

*   **Fully Responsive Design:** The application provides a seamless experience on both desktop and mobile devices, with a dedicated sidebar for large screens and a bottom navigation bar for smaller screens.
*   **Dark/Light Mode:** A theme switcher allows users to choose their preferred visual mode for comfortable viewing.
*   **Toast Notifications:** A non-intrusive notification system provides elegant alerts for rewards, points earned, and achievements unlocked.

## 3. Technology Stack & Architecture

*   **Frontend Framework:** **React (v19)** with **TypeScript** for a modern, type-safe, and component-based architecture.
*   **AI & Language Processing:**
    *   **Core AI Logic:** **Google Gemini API (`@google/genai`)** is used for generating conversational responses, structured feedback, mock exam assessments, image generation, and powering all AI-driven tools.
    *   **Speech-to-Text:** The browser's native **Web Speech API (`SpeechRecognition`)** is leveraged for transcribing user voice input.
    *   **Text-to-Speech:** The browser's native **Web Speech API (`SpeechSynthesis`)** provides the AI's spoken responses in a natural British English voice.
*   **Styling:** **Tailwind CSS** for a utility-first, responsive, and easily maintainable design system.
*   **Architecture:**
    *   **Component-Based:** The UI is broken down into reusable components (e.g., `ConversationSimulator`, `FeedbackCard`, `MessageBubble`, `MockTest`).
    *   **Custom Hooks:** Complex browser APIs are encapsulated in custom hooks (`useSpeechRecognition`, `useTextToSpeech`) to keep component logic clean and manageable.
    *   **Service Layer:** All AI interactions and user data management are abstracted into a dedicated service file (`geminiService.ts`), separating business logic from the UI.
    *   **Context API:** React's Context API (`NotificationContext`) is used for global state management of the notification system.
    *   **Data Persistence:** User profile data, progress, and conversation history are persisted in the browser's **LocalStorage**.
*   **Build & Dependencies:** A **zero-build setup**. All dependencies (React, @google/genai) are loaded efficiently from a CDN using an `importmap` in `index.html`.

## 4. Key Implementation Highlights

*   **Structured JSON from Gemini:** The application extensively uses a `responseSchema` in its API calls to Gemini. This instructs the model to return a well-defined JSON object containing conversational replies, feedback, points, and full test assessments. This approach dramatically improves reliability, eliminates the need for string parsing, and ensures a consistent data structure for the UI.
*   **Lifecycle Management in Hooks:** The custom hooks `useSpeechRecognition` and `useTextToSpeech` properly manage the lifecycle of the Web Speech APIs, including starting, stopping, handling errors (like microphone permissions), and cleaning up resources on component unmount.
*   **Stateful UI for Guided Interaction:** The UI in the `ConversationSimulator` and `MockTest` is carefully managed to guide the user. The microphone button is disabled when the AI is thinking or speaking, preventing interruptions and reinforcing a natural turn-based conversational flow.
*   **Centralized User Data Service:** All reads and writes to the user's profile in LocalStorage go through the `geminiService.ts`. The `updateUserProfile` function ensures atomic updates by reading the latest state, applying changes, and then writing it back, preventing race conditions.

## 5. Project Setup

The application is a single-page application contained within a set of static files. To run it, simply serve the `index.html` file using any static file server.

**Example using a simple Python server:**
```bash
# If you have Python 3 installed
python -m http.server
```
Then, open your web browser and navigate to `http://localhost:8000`.

No build process or `npm install` is required. You will, however, need to configure your Gemini API key for the application to function correctly. **Please see the section below on "Configuring Your Google Gemini API Key" for the crucial next step.**

## 6. Version Control

If you plan to modify or extend this project, it's highly recommended to use a version control system like Git.

1.  **Initialize a Repository:** `git init`
2.  **Commit the Initial Files:** `git add .` and `git commit -m "Initial commit"`
3.  **Create a `.gitignore` file:** To prevent committing sensitive files or unnecessary folders, create a `.gitignore` file. For this project, a good starting point would be to add `config.js` to it, to ensure you don't accidentally share your API key.

## 7. Extending and Deploying the Application

This guide is for developers and users who want to deploy their own version of this application, connect it to a database, or customize its AI models.

### A. Configuring Your Google Gemini API Key

**IMPORTANT:** This application requires a Google Gemini API key to function. The application is designed to securely access this key. You should never write your API key directly into the application's source code files like `geminiService.ts`.

**1. Get Your API Key:**
*   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your free API key.

**2. Making the Key Available for Local Development:**
To run the app on your local machine, you need to provide the API key. We've made this easy with a special configuration file.

**Step 1: Create a `config.js` file**
In the same root directory as `index.html`, create a new file named `config.js`.

**Step 2: Add your API key**
Add the following content to the `config.js` file, replacing `"YOUR_API_KEY_HERE"` with your actual Gemini API key:
```javascript
window.process = {
  env: {
    API_KEY: "YOUR_API_KEY_HERE",
  }
};
```
**Security Note:** Do not commit this `config.js` file to public version control (e.g., GitHub). If you are using Git, add `config.js` to your `.gitignore` file.

That's it! When you run your local server, the application will automatically detect and use this key. If the key is missing, you will see an alert in the browser.

*   **For Deployment (e.g., on Vercel, Netlify):**
    When you deploy this application to a modern hosting platform, you can set "Environment Variables" in the project settings.
    1.  Go to your project's dashboard on the hosting provider.
    2.  Find the "Environment Variables" section.
    3.  Create a new variable with the name `API_KEY` and paste your Gemini API key as the value.
    The hosting platform's build system will automatically and securely make this variable available so the application can use it without exposing it in the public code.

### B. Adding a Backend and Database

Currently, this application stores all user data (profile, progress, conversation history) in the browser's `localStorage`. This is simple and works for a single user on a single device, but the data will be lost if the user clears their browser cache. For a more robust application with user accounts that sync across devices, you'll need a backend server and a database.

**Conceptual Steps for Beginners:**

1.  **Choose a Backend Technology:**
    *   **Node.js with Express:** A very popular choice for JavaScript developers. You can write your server logic in the same language as the frontend.
    *   **Python with Flask or Django:** Great options if you are comfortable with Python.
    *   **Backend-as-a-Service (BaaS):** Platforms like **Firebase** or **Supabase** are excellent for beginners. They provide a database, user authentication, and APIs out of the box, which can significantly speed up development.

2.  **Design Your Database:**
    You need to decide what data to store. Based on this app, you would create tables (or "collections" in NoSQL databases like Firebase) for:
    *   `Users`: To store user information like `name`, `email` (for login), `points`, `referenceNumber`.
    *   `Badges`: To store which badges each user has earned.
    *   `ConversationHistory`: To link conversation transcripts to a user.
    *   `VocabularyProgress`: To store the SRS progress for each word for each user.

3.  **Create API Endpoints:**
    Your backend server will have several API "endpoints" (URLs) that the frontend application will call. For example:
    *   `POST /api/register`: To create a new user account.
    *   `POST /api/login`: To log a user in.
    *   `GET /api/profile`: To fetch the logged-in user's profile data.
    *   `PUT /api/profile`: To update the user's name or points.
    *   `POST /api/history`: To save a new conversation.

4.  **Update the Frontend Code:**
    You would then modify the `services/geminiService.ts` file. Instead of calling `localStorage.getItem` and `localStorage.setItem`, you would use the `fetch` API to call your backend endpoints.

    **Example (Conceptual Change):**

    *   **Current Code (using localStorage):**
        ```typescript
        export const getUserProfile = async (): Promise<UserProfile> => {
          const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
          // ... parsing logic
          return JSON.parse(storedProfile);
        };
        ```

    *   **New Code (with a backend):**
        ```typescript
        export const getUserProfile = async (): Promise<UserProfile> => {
          // Assume user is logged in and you have an auth token
          const response = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer YOUR_AUTH_TOKEN_HERE`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          const profileData = await response.json();
          return profileData;
        };
        ```

### C. Using Different AI Language Models

This application is built using the Google Gemini API, which supports several models. You can easily experiment with different models by changing the model name in the code.

**Where to Change the Model:**

The model names are specified as strings within the `services/geminiService.ts` file. Look for lines like:

*   `model: 'gemini-2.5-flash'`
*   `model: 'imagen-4.0-generate-001'`

**How to Change the Model:**

1.  **Find the API Call:** Locate the function in `services/geminiService.ts` that you want to change. For example, to change the main conversation model, find the `getGeminiResponse` function.
2.  **Identify the Model Name:** Inside the `ai.chats.create` or `ai.models.generateContent` call, you will see a `model` property.
3.  **Replace the Value:** Change the string value to another supported Gemini model. For example, if a new, more powerful conversational model is released, you might change `'gemini-2.5-flash'` to `'new-gemini-model-name'`.

**Important Considerations:**
*   **Model Capabilities:** Different models are optimized for different tasks (text, images, video). Make sure you are using a model that supports the feature you are using (e.g., use an `imagen` model for image generation).
*   **API Response Structure:** While Gemini models aim for consistency, a different model might have slightly different response patterns or capabilities. If you change a model used with a specific `responseSchema` (like in `getGeminiResponse`), you should test thoroughly to ensure the new model still provides the JSON structure you expect.
*   **Cost and Quotas:** Different models may have different pricing and usage limits. Always check the [Google Gemini pricing page](https://ai.google.dev/pricing) before switching models in a production application.
