## re-imagined.me

re-imagined.me is a personal profile web application that showcases skills, featured projects, and social links in a modern, responsive layout. Built with Vite and React, it demonstrates how to compose reusable UI components while integrating Tailwind CSS for styling.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- npm (comes bundled with Node.js)

### Installation and Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser to view the app. Hot module reloading will reflect changes automatically.

### Production Build Preview

To generate an optimized build and preview it locally:

```bash
npm run build
npm run preview
```

Then visit the preview URL output in the terminal.

### Environment Variables

Create a `.env` file in the project root (or update your existing one) with the following values so the assessment flow can talk to the required services:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

`VITE_OPENAI_API_KEY` powers the AI-generated career snapshot by calling the low-cost `gpt-4o-mini` ChatGPT model after an assessment is submitted.
