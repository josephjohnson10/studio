# Mallu Slangify

This is a NextJS starter in Firebase Studio that translates Manglish into various Malayalam dialects.

## Easy Deployable
## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Local Development Setup

To run this project locally, you will need a Gemini API key from Google AI Studio. This single key enables all AI-powered features, including dialect translation and Text-to-Speech (TTS).

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create and copy your API key.

2.  **Set Environment Variable**: Create or open the `.env` file in the root of the project and add your API key like this:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

3.  **Install Dependencies and Run**:
    ```bash
    npm install
    npm run dev
    ```

The application will now run on `http://localhost:9002`.

## Feature Architecture

### Text-to-Speech (TTS) Audio Generation

The audio pronunciation feature is built on three core components working together:

1.  **Backend AI Flow (`src/ai/flows/text-to-speech.ts`):** A server-side Genkit flow that calls the Google AI TTS model (`gemini-2.5-flash-preview-tts`) to convert a given text string into `MP3` audio format. It returns a ready-to-play base64 data URI.

2.  **Server Action (`src/app/actions.ts`):** The `textToSpeechApi` function acts as a secure bridge between the frontend and the backend AI flow. It ensures that the API key and backend logic are never exposed to the client browser.

3.  **Frontend Component (`src/components/dialect-translator.tsx`):** The UI includes a "Listen" button on each translation card. When clicked, this button calls the server action, receives the MP3 data, and plays it using a browser `<audio>` element.
