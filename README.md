<div align="center">
<h1>my shoppingify</h1>
  <h3>
    <a href="https://my-shoppingify-2.netlify.app/">
      Demo
    </a>
    <span> | </span>
    <a href="https://legacy.devchallenges.io/challenges/mGd5VpbO4JnzU6I9l96x">
      Challenge
    </a>
  </h3>
    <p align="center">
    A modern, intuitive shopping list manager built with React, TypeScript, Supabase, and featuring AI-powered list
generation and stats at a glance.
    <br />
    <br />
  </p>
</div>

<div align="center">
  <a href="https://github.com/yuandere/my-shoppingify-2">
    <img src="https://github.com/user-attachments/assets/94e5f75d-1721-4729-aefe-9605951d3874" alt="screenshot">

  </a>
</div>

<!-- FEATURES -->

## Features

- **Add & Edit Items**: Seamlessly create and manage shopping lists with detailed item descriptions.
- **Completion Tracking**: Track progress with a simple toggle to mark items and lists as done.
- **AI-Powered List Generation**: Generate shopping lists using prompts, URLs, or uploaded images.
- **Stats at a Glance**: View key metrics like total items, completed tasks, and list progress on demand.
- **Responsive Design**: Built with TailwindCSS and Shadcn UI components for a clean, modern interface.

<!-- Tech Stack -->

## Tech Stack

| Technology             | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| **React**              | Frontend framework for building dynamic UI.                   |
| **Tanstack Query**     | Efficient data fetching and state management.                 |
| **Tanstack Router**    | Client-side routing for seamless navigation.                  |
| **Supabase**           | Backend database and authentication for user data.            |
| **Cloudflare Workers** | Serverless backend for API endpoints.                         |
| **Hono.js**            | Lightweight backend framework for API endpoints.              |
| **Zod**                | Schema validation for data integrity.                         |
| **Shadcn UI**          | Reusable UI components for a polished look.                   |
| **TailwindCSS**        | Utility-first CSS framework for styling.                      |
| **TypeScript**         | Static typing for robust code structure.                      |
| **Gemini 1.5 Flash**   | Low-cost multimodal LLM for simple tasks and data processing. |

## Self Hosting

### Prerequisites

- [Package Manager](https://bun.sh/)
- [Supabase Project](https://supabase.com/)
- [Cloudflare Account](https://www.cloudflare.com/)
- [Gemini API Key](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/yuandere/my-shoppingify-2.git
cd my-shoppingify-2
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file with your Supabase and Cloudflare Worker configuration. See [Cloudflare Documentation](https://developers.cloudflare.com/workers/) for more information.

```env
VITE_BACKEND_URL=your-cloudflare-worker-url
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy Cloudflare Worker Backend

1. Navigate to the backend folder:
   ```bash
   cd packages/backend
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Deploy to Cloudflare Workers via Wrangler:
   ```bash
   bunx wrangler dev
   ```

### 5. Start the Frontend (React)

```bash
bun run dev
```

## Notes

- **AI Generation**: Gemini 1.5 Flash may not generate items and lists with 100% accuracy, especially for site URLs or images.

## Contributing

Contributions are welcome. Feel free to create a pull request or issue for new features, bug fixes, or documentation.
