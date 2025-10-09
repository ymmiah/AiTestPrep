
# AI Language Test Prep Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-8E75B7?logo=google&logoColor=white)

A comprehensive, AI-powered web application designed to help users prepare for major English language proficiency exams through interactive simulations, skill-building modules, and gamified learning.

---

## 📜 Overview

The AI Language Test Prep Platform provides an immersive and interactive learning experience, leveraging the power of Google Gemini to deliver personalized coaching. The application is structured into distinct, self-contained modules for different exams, allowing for easy expansion and focused learning paths.

-   **UK Spouse Visa A2 English Test Prep:** The flagship module featuring a voice-to-voice chat with an AI examiner, providing instant, targeted feedback on performance.
-   **IELTS Exam Preparation:** A comprehensive suite of tools to help users prepare for all four sections of the IELTS Academic & General Training tests.
-   **Academic Learning:** An ethical AI-powered assistant designed to teach and improve academic writing skills, not just correct them.

---

## ✨ Key Features

### 🇬🇧 UK Spouse Visa A2 Test Prep

-   **AI Conversation Simulator:**
    -   **Voice-to-Voice Interaction:** Speak directly to an AI examiner and hear its spoken responses for realistic practice.
    -   **Realistic Scenarios:** Practice general Q&A, picture descriptions, and role-playing (e.g., ordering coffee, visiting a doctor).
    -   **Instant Gemini Feedback:** Receive structured feedback on Grammar, Vocabulary, Fluency, and Pronunciation after each response.
-   **Full Mock A2 Exam:**
    -   **Timed Simulation:** A full, 7-minute timed simulation of the official speaking test.
    -   **AI-Generated Imagery:** Uses `imagen-4.0-generate-001` to create a unique picture for each test's description task.
    -   **Comprehensive Assessment:** Get a final score, detailed feedback, and a transcript review with AI-powered suggestions.
-   **Skill Development Modules:**
    -   **Topic & Pronunciation Practice:** Isolate and improve specific speaking skills with targeted exercises and AI analysis.
    -   **Interactive Vocabulary Builder:** Learn new words through a story-based game that uses spaced repetition principles.
    -   **Listening & Grammar Hubs:** Complete exercises with mock audio and test your knowledge with interactive quizzes.

### 🎓 IELTS Exam Preparation

-   **Writing Practice (Task 1 & 2):**
    -   Generate unlimited, realistic prompts for both academic tasks.
    -   Receive an instant, estimated band score and detailed feedback based on official IELTS criteria.
-   **Speaking Practice (Full 3-Part Test):**
    -   Practice with an AI-generated topic cue card and guiding questions.
    -   Record your full response and get a detailed band score analysis.
-   **Listening & Reading Practice:**
    -   Tackle AI-generated exercises with a variety of audio clips, passages, and question types (MCQ, Form Completion, TFNG).

### ✍️ Academic Learning

-   **Ethical Writing Helper:** Get AI-powered feedback on academic assignments. The tool acts as a tutor, providing suggestions on structure, clarity, and academic tone, rather than simply rewriting the user's work.

### 🚀 Platform-Wide Features

-   **Unified Profile & Progress Tracking:** All stats, points, and badges from every module are tracked in a single, centralized user profile.
-   **Gamification & Motivation:**
    -   **Points System:** Earn points for completing exercises and giving high-quality answers.
    -   **Badges & Leaderboard:** Unlock achievements and see how you rank against other learners.
-   **Polished User Experience:**
    -   **Modular Design:** A central landing page to select a target exam.
    -   **Fully Responsive:** A seamless experience on desktop and mobile devices.
    -   **Customizable Themes:** Personalize your learning environment with multiple themes (Light, Dark, Oceanic).

---
## 🔄 Changelog

**October 9, 2025:**

-   **Feature:** Introduced a unified "My Profile" page to consolidate progress across all learning modules (A2, IELTS, Academic).
-   **Feature:** Implemented an enhanced theming system with a new "Oceanic" theme, managed from the profile settings.
-   **Feature:** Redesigned the Academic Writing Helper to be an ethical teaching tool, providing constructive feedback instead of rewriting text. Added AI guardrails to prevent misuse.
-   **Refactor:** Streamlined the UI by removing the header theme switcher and API key configuration for a cleaner, more secure user experience.

---

## 🛠️ Technology Stack

| Category                 | Technology / Library                                    | Description                                                                                          |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Core Frontend**        | React 19, TypeScript                                    | For a modern, type-safe, and component-based architecture.                                           |
| **AI & Language**        | `@google/genai` (Google Gemini)                         | Powers all AI logic: conversations, feedback, assessments, and content/image generation.             |
| **Browser APIs**         | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`) | Enables native speech-to-text and text-to-speech functionality directly in the browser.              |
| **Styling**              | Tailwind CSS                                            | A utility-first CSS framework for rapid and responsive UI development.                               |
| **State Management**     | React Context API                                       | Used for global state management of the notification system and theme.                               |
| **Data Persistence**     | Browser `LocalStorage`                                  | Stores the user profile, progress, and conversation history client-side for a session-like experience. |
| **Dependencies**         | `importmap` (Zero-Build)                                | Loads all dependencies (React, Gemini SDK) directly from a CDN, requiring no local `npm install`.    |

---

## 🚀 Getting Started

This project runs entirely in the browser with no build step required.

### Prerequisites

-   A modern web browser that supports the Web Speech API (e.g., Google Chrome).
-   A Google Gemini API key.

### Installation & Setup

**1. Clone the Repository**

```bash
git clone https://github.com/your-username/ai-language-test-prep.git
cd ai-language-test-prep
```

**2. Set Up Your API Key**

The application is designed to be run in an environment where the API key is securely provided as an environment variable (`process.env.API_KEY`), such as the AI Studio Builder environment.

To run the project locally, you must simulate this environment:

-   Create a new file named `config.js` in the root of the project.
-   Add the following code to `config.js`, replacing `"YOUR_GEMINI_API_KEY_HERE"` with your actual key:

    ```javascript
    // config.js
    window.process = {
      env: {
        API_KEY: "YOUR_GEMINI_API_KEY_HERE",
      }
    };
    ```

-   In `index.html`, add a script tag for this new file inside the `<head>` tag, **before** the main script (`/index.tsx`):

    ```html
    <head>
      ...
      <script src="/config.js"></script>
      <script type="importmap">
      ...
    </head>
    ```

> **Security Note:** The `config.js` file should **never** be committed to version control. Ensure your `.gitignore` file includes a line for `config.js`.

**3. Run a Local Server**

Serve the project's root directory using any static file server. A simple method is to use Python's built-in HTTP server:

```bash
# If you have Python 3 installed
python -m http.server
```

**4. Open in Browser**

Navigate to the local address provided by your server (e.g., `http://localhost:8000`).

---

## ☁️ Deployment

Deploy this application on any static hosting provider (e.g., Vercel, Netlify, GitHub Pages).

When deploying, you must set an **Environment Variable** in your hosting provider's project settings:

-   **Name:** `API_KEY`
-   **Value:** `YOUR_GEMINI_API_KEY`

The platform's build system will securely make this variable available to the application at runtime.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

1.  **Fork the repository.**
2.  **Create a new branch:** `git checkout -b feature/your-feature-name`
3.  **Make your changes.**
4.  **Commit your changes:** `git commit -m 'Add some feature'`
5.  **Push to the branch:** `git push origin feature/your-feature-name`
6.  **Open a pull request.**

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🗺️ Roadmap & Future Enhancements

-   [ ] **Complete IELTS Module:**
    -   [ ] Full Mock Test simulation.
-   [ ] **User Accounts & Database:**
    -   Implement a backend (e.g., Firebase, Supabase) for user authentication and data persistence across devices.
-   [ ] **Vocabulary SRS:**
    -   Implement a dedicated flashcard view for words learned in the Vocabulary Builder, using the Spaced Repetition System (SRS) data.
-   [ ] **Support for Other AI Providers:**
    -   Integrate models from OpenAI and Anthropic as alternative options.
