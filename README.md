# Imagen AI - Professional Text-to-Image Studio

A professional-grade, React-based image generation application powered exclusively by **Google Gemini 2.5 and 3.0 models**. This application features a modern UI, request queuing, history management, and simulated social authentication.

![Imagen AI Banner](https://via.placeholder.com/1200x600/0f172a/6366f1?text=Imagen+AI+Powered+by+Gemini)

## 🚀 Features

*   **Powered by Gemini**: Uses `gemini-2.5-flash-image` for fast generation and `gemini-3-pro-image-preview` for high-fidelity results.
*   **Modern UI/UX**: Built with React and Tailwind CSS, featuring a glassmorphic design and smooth animations.
*   **Queue System**: robust client-side queuing to manage API rate limits and multiple requests.
*   **Gallery & History**: Automatically saves your generation history locally.
*   **Authentication**: Simulated Google and LinkedIn OAuth flows (Client-side demo).

## 🛠️ Tech Stack

*   **Frontend**: React 18, Tailwind CSS, Lucide Icons
*   **Build Tool**: Vite
*   **AI Engine**: Google GenAI SDK (`@google/genai`)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/imagen-ai.git
    cd imagen-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Google Gemini API Key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment Guide

The easiest way to deploy this application is using **Vercel**.

1.  **Push to GitHub**: Make sure your code is pushed to a GitHub repository.
2.  **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and sign up.
3.  **Import Project**: Click "Add New Project" and select your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Select `Vite`.
    *   **Environment Variables**: Add a new variable named `API_KEY` and paste your Google Gemini API key as the value.
5.  **Deploy**: Click "Deploy".

Vercel will build your application and provide you with a live URL.

## 🤖 Models Used

*   **Gemini Flash (Default)**: `gemini-2.5-flash-image` - Optimized for speed and efficiency.
*   **Gemini Pro**: `gemini-3-pro-image-preview` - High-quality generation with enhanced detail.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.