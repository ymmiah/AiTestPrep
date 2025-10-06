# AI Language Test Prep Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B7?logo=google&logoColor=white)

A comprehensive, AI-powered web application designed to help users prepare for major English language proficiency exams through interactive simulations, skill-building modules, and gamified learning.

---

## Table of Contents

- [Overview](#-overview)
- [✨ Core Features](#-core-features)
  - [🇬🇧 UK Spouse Visa A2 Test Prep](#-uk-spouse-visa-a2-test-prep)
  - [🎓 IELTS Exam Preparation](#-ielts-exam-preparation)
  - [ platform-wide-features Platform-Wide Features](#-platform-wide-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
- [🔑 API Key Configuration](#-api-key-configuration)
- [☁️ Deployment](#️-deployment)
- [🗺️ Roadmap & Future Enhancements](#️-roadmap--future-enhancements)

---

## 📜 Overview

The AI Language Test Prep Platform provides an immersive and interactive learning experience. The application is structured into distinct modules for different exams, allowing for easy expansion.

-   **UK Spouse Visa A2 English Test Prep:** The core module featuring a voice-to-voice chat with an AI examiner powered by Google Gemini, providing instant, targeted feedback on performance.
-   **IELTS Exam Preparation:** A comprehensive suite of tools to help users prepare for all four sections of the IELTS Academic & General Training tests.

---

## ✨ Core Features

### 🇬🇧 UK Spouse Visa A2 Test Prep

-   **AI Conversation Simulator:**
    -   **Voice-to-Voice Interaction:** Speak directly to the AI and hear its spoken responses.
    -   **Realistic Scenarios:** Practice general Q&A, picture descriptions, and role-playing (e.g., ordering coffee, visiting a doctor).
    -   **Instant Gemini Feedback:** Get structured feedback on Grammar, Vocabulary, Fluency, and Pronunciation after each response.
-   **Full Mock A2 Exam:**
    -   **Timed Simulation:** A full, 7-minute timed simulation of the official speaking test.
    -   **AI-Generated Imagery:** Uses `imagen-4.0-generate-001` to create a unique picture for each test's description task.
    -   **Comprehensive Assessment:** Receive a final score, detailed feedback, strengths, and areas for improvement from Gemini.
    -   **Transcript Review:** Go through your test transcript with AI-powered suggestions for every answer.
-   **Skill Development Modules:**
    -   **Pronunciation Practice:** Get word-by-word feedback on your pronunciation of common English phrases.
    -   **Vocabulary Builder:** An interactive story-based game to learn and memorize new words.
    -   **Listening Practice:** Exercises with mock audio and comprehension questions.
    -   **Grammar Hub:** Learn from common mistakes and test your knowledge with interactive quizzes.
-   **Personalized AI Tools:**
    -   **Study Planner:** Generates a custom study schedule based on your test date and availability.
    -   **Topic Generator:** Creates common exam questions with high-quality example answers.

### 🎓 IELTS Exam Preparation

-   **Writing Practice:**
    -   AI-generated prompts for both **Task 1** (reports) and **Task 2** (essays).
    -   Instant, detailed analysis from Gemini, including an estimated band score and feedback on the four official criteria.
-   **Listening Practice:**
    -   AI-generated exercises with a variety of audio clips and question types (MCQ, Form Completion).
-   **Coming Soon:**
    -   Reading Practice
    -   Speaking Practice
    -   Full Mock Test

###  plataforma-wide-features Platform-Wide Features

-   **Gamification & Motivation:**
    -   **Points System:** Earn points for completing exercises and giving high-quality answers.
    -   **Badges & Achievements:** Unlock badges for milestones, displayed on your profile.
    -   **Leaderboard:** See how you rank against other learners.
-   **Polished User Experience:**
    -   **Modular Design:** A central landing page to select your target exam.
    -   **Fully Responsive:** Seamless experience on desktop and mobile.
    -   **Dark/Light Mode:** A theme switcher for comfortable viewing.
    -   **Toast Notifications:** Non-intrusive alerts for points, rewards, and achievements.

---

## 🛠️ Technology Stack

| Category                  | Technology / Library                                       | Description                                                                                             |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Frontend**              | React 19, TypeScript                                       | For a modern, type-safe, and component-based architecture.                                              |
| **AI & Language**         | `@google/genai` (Google Gemini)                            | Powers all AI logic: conversations, feedback, assessments, image generation, and content creation.      |
| **Speech APIs**           | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`)    | Browser-native APIs for speech-to-text and text-to-speech functionality.                                |
| **Styling**               | Tailwind CSS                                               | A utility-first CSS framework for rapid and responsive UI development.                                  |
| **State Management**      | React Context API                                          | Used for global state management of the notification system.                                            |
| **Data Persistence**      | Browser LocalStorage                                       | Stores user profile data, progress, and conversation history on the client-side.                        |
| **Build & Dependencies**  | Zero-build setup via `importmap`                           | Loads all dependencies (React, Gemini SDK) directly from a CDN, requiring no local `npm install`.       |

---

## 🚀 Getting Started

This project is a single-page application that runs entirely in the browser with no build step required.

**Prerequisites:**
*   A modern web browser that supports the Web Speech API (Google Chrome is recommended).
*   A simple local web server to serve the `index.html` file.

**Steps:**

1.  **Clone or Download the Code:**
    ```bash
    git clone [repository-url]
    cd [repository-folder]
    ```

2.  **Configure Your API Key:**
    The application requires a Google Gemini API key to function. Please follow the detailed instructions in the [API Key Configuration](#-api-key-configuration) section below.

3.  **Run a Local Server:**
    Serve the project's root directory using any static file server.
    
    **Example using Python:**
    ```bash
    # If you have Python 3 installed
    python -m http.server
    ```
    
    **Example using Node.js (`serve` package):**
    ```bash
    # Install serve globally if you haven't already
    npm install -g serve
    # Run the server
    serve
    ```
4.  **Open in Browser:**
    Navigate to the local address provided by your server (e.g., `http://localhost:8000`).

---

## 🔑 API Key Configuration

**IMPORTANT:** This application will not work without a Google Gemini API key.

*   **Get Your Key:** Visit [**Google AI Studio**](https://aistudio.google.com/app/apikey) to create your free API key.

You can provide your key in two ways:

### Method 1: Via the Application UI (Recommended)

This is the easiest method. The key is stored securely in your browser's local storage.

1.  Launch the application and select the **A2 Test Prep** module.
2.  Navigate to the **My Profile** page from the sidebar or bottom navigation.
3.  Scroll down to the **AI Model Configuration** section.
4.  Paste your API key into the input field and click **Save & Reload**.

### Method 2: Local Development File (For Developers)

This method is useful for local development but will be **overridden** by any key set via the UI.

1.  **Create `config.js`:** In the project's root directory (same folder as `index.html`), create a new file named `config.js`.
2.  **Add Your Key:** Paste the following code into `config.js`, replacing `"YOUR_API_KEY_HERE"` with your actual key:
    ```javascript
    window.process = {
      env: {
        API_KEY: "YOUR_API_KEY_HERE",
      }
    };
    ```
3.  **Import in `index.html`:** Add the following line in `index.html` inside the `<head>` tag, **before** the main script (`/index.tsx`):
    ```html
    <script src="/config.js"></script>
    ```

> **Security Note:** Do **not** commit `config.js` to version control. If you are using Git, add `config.js` to your `.gitignore` file.

---

## ☁️ Deployment

Deploy this application on any static hosting provider like Vercel, Netlify, or GitHub Pages.

When deploying, set an **Environment Variable** in your hosting provider's project settings:
*   **Name:** `API_KEY`
*   **Value:** `YOUR_GEMINI_API_KEY`

The platform's build system will securely make this variable available to the application.

---

## 🗺️ Roadmap & Future Enhancements

-   [ ] **Complete IELTS Module:**
    -   [ ] Reading Practice
    -   [ ] Speaking Practice
    -   [ ] Full Mock Test
-   [ ] **User Accounts & Database:**
    -   Implement a backend (e.g., Firebase, Supabase) for user authentication and data persistence across devices.
-   [ ] **Support for Other AI Providers:**
    -   Integrate models from OpenAI and Anthropic as alternative options.
-   [ ] **Vocabulary SRS:**
    -   Implement a dedicated flashcard view for words learned in the Vocabulary Builder, using the Spaced Repetition System (SRS) data.