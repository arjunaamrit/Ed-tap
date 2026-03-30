# Tapit - Reimagining Reading with Contextual AI

Tapit is an AI-powered document reader designed to eliminate the friction of learning. By providing instant, contextual definitions and explanations, Tapit helps readers maintain focus and achieve deeper understanding without ever leaving their document.

## 🚀 Features

- **Contextual Definitions:** Double-tap any word to get a precise definition based on its usage in the sentence.
- **AI Sentence Explanation:** Select any phrase or sentence to get a "big picture" explanation of complex ideas.
- **Smart Search:** Integrated AI search that summarizes web results directly within your reading view.
- **Multilingual Support:** Instant translation for words and phrases.
- **Document Support:** Upload and read PDFs, DOCX, EPUB, Markdown, and more.
- **Focus-First UI:** A clean, elegant interface designed for deep work.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **AI Engine:** Google Gemini (gemini-3.1-flash-lite-preview)
- **Backend:** Supabase (Auth & Database)
- **Animations:** Framer Motion

## 🏗️ Getting Started

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd tapit
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file with your Gemini and Supabase keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

## 🌟 Hackathon Submission

This project was built for the Google Gemini Hackathon. It leverages the power of Gemini's contextual understanding to solve the "friction of lookup" in digital reading.

**Founder:** Arjuna
**Vision:** To revolutionize how we access and internalize information online.
