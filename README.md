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
