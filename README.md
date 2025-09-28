
# Cine-Spot: Your Personal Film & TV Experience Tracker

Cine-Spot is a modern, feature-rich web application designed for movie and TV show enthusiasts. It provides a personalized platform to track what you're watching, discover new titles through AI-powered recommendations, and organize your media into custom collections. Built with Next.js, Firebase, and Google's Generative AI, Cine-Spot offers a seamless and engaging user experience.

This application is built as a showcase for Firebase Studio, demonstrating the integration of modern web technologies with powerful backend and AI services.

## ✨ Features

- **Authentication**: Secure user sign-up and login with email/password and Google Sign-In, powered by Firebase Authentication. Includes a password reset flow.
- **Personal Library**: Add movies and TV shows to a personal library. Track watch status (`Plan to Watch`, `Watching`, `Completed`, `On Hold`, `Dropped`) and give personal ratings.
- **AI-Powered Recommendations (Spotlight)**: A personalized "Spotlight" page that suggests new titles based on your viewing history, ratings, and library additions.
- **Custom Collections**: Organize your library into personalized collections (e.g., "All-Time Favorites," "Horror Marathon").
- **Detailed Title Information**: View comprehensive details for any movie or TV show, including cast, crew, media galleries, trailers, and more, fetched from The Movie Database (TMDB).
- **TV Show Episode Tracking**: Keep track of watched episodes for TV shows with season-by-season progress bars.
- **Public Sharing**: Share read-only versions of your collections with friends or on social media via a public link.
- **Theme Customization**: Personalize the app's appearance with light/dark modes and a selection of accent colors.
- **Data Management**: Export your entire library and collections to a JSON backup file and import it back into the app.
- **Progressive Web App (PWA)**: Installable on mobile and desktop devices for an app-like experience with offline access potential.
- **AI Prompt Personalizer**: An experimental feature that uses generative AI to craft unique image generation prompts based on the visual style of your favorite movies.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) for component primitives.
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Generative AI**: [Genkit (Firebase GenAI)](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **External API**: [The Movie Database (TMDB)](https://www.themoviedb.org/) for all movie and TV show data.
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## 🏁 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### 2. Clone the Repository

```bash
git clone https://github.com/geoffreymagana/CineSpot.git
cd cinespot
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

You will need to populate this file with API keys from Firebase and TMDB.

#### Firebase Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project or select an existing one.
3.  Go to **Project Settings** (click the gear icon) > **General**.
4.  Under "Your apps", create a new **Web app**.
5.  After creating the app, you will be given a `firebaseConfig` object. Copy these values into your `.env` file.

```dotenv
# .env

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ... other variables
```

#### TMDB API Key

1.  Create an account on [The Movie Database (TMDB)](https://www.themoviedb.org/signup).
2.  Go to your account **Settings** > **API**.
3.  Request an API key and copy the "API Key (v3 auth)" value.

```dotenv
# .env

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# ... other variables
```

#### Gemini API Key (for AI features)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key**.
3. Create an API key in a new or existing project.

```dotenv
# .env

# Google AI
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:9002`.

## ⚙️ Available Scripts

- `pnpm dev`: Starts the Next.js development server with Turbopack.
- `pnpm build`: Creates a production build of the application.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `pnpm genkit:dev`: Starts the Genkit development server for testing AI flows.

## 📁 Folder Structure

```
cinespot/
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components (UI, layout, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core logic, contexts, providers, and utilities
│   │   ├── contexts/       # React Context providers (Auth, Movies, etc.)
│   │   ├── services/       # API service functions (e.g., tmdb.ts)
│   │   └── utils.ts        # Utility functions
│   └── public/             # Static assets (icons, manifest.json)
├── tailwind.config.ts      # Tailwind CSS configuration
├── next.config.ts          # Next.js configuration (including PWA setup)
└── package.json
```

## 📱 Progressive Web App (PWA)

Cine-Spot is configured as a PWA, allowing it to be installed on desktop and mobile devices.

- **Manifest**: The web app manifest is located at `public/manifest.json`. It defines the app's name, icons, and display properties.
- **Service Worker**: `next-pwa` automatically generates a service worker in production builds to handle caching and offline capabilities.
- **Icons**: App icons for various device sizes are located in `public/icons/`.

## 🤖 AI Integration with Genkit

The recommendation engine ("Spotlight") is powered by Google's Gemini models via the Genkit framework.

- **Flows**: The core AI logic is defined in "flows" located in `src/ai/flows/`.
  - `spotlight-recommendations.ts`: Generates personalized movie carousels.
  - `get-season-details-flow.ts`: Fetches detailed episode lists for TV shows.
  - `personalized-canvas.ts`: Creates AI art prompts based on user tastes.
- **Configuration**: The global Genkit client is configured in `src/ai/genkit.ts`.

To test AI flows locally, you can run the Genkit development server:

```bash
pnpm genkit:dev
```

## 🧠 ML fallbacks (local TF-IDF & expand API)

To ensure the Spotlight recommendations stay useful even when external generative models are unavailable, Cine-Spot implements a small, deterministic local fallback using TF-IDF and a nearest-neighbour expansion API.

- `src/lib/embeddings/tfidf.ts` — a tiny TF-IDF vectorizer and cosine similarity helper. It's designed for short-text similarity (movie titles, short phrases) and is intentionally lightweight so it can run in-browser or in a Node server without heavy dependencies.
- `POST /api/local/expand` (`src/app/api/local/expand/route.ts`) — a tiny API that accepts a `corpus` (array of strings) and a `query` string and returns the top-K most similar corpus items. This is used as an intermediate fallback when Genkit and the OpenAI fallback do not produce valid suggestions.

How it works

1. The recommendation pipeline first attempts a deterministic, privacy-conscious LLM path (currently OpenAI fallback) for title suggestions.
2. Genkit (Google Gemini) was previously part of the pipeline but may be disabled or unavailable in some deployments; the application no longer relies on Genkit at runtime by default. If Genkit is enabled in your environment, it can be re-introduced via configuration.
3. If the generative fallbacks (OpenAI and/or Genkit when enabled) fail or return empty results, the pipeline uses the local TF-IDF expansion:
  - It builds a `corpus` from available TMDB lists such as Trending, Top Rated, and Upcoming titles.
  - It selects a `seed` query from the user's recently watched/liked titles.
  - It POSTs `{ corpus, query, topK }` to `/api/local/expand` and receives similar titles.
  - The pipeline then resolves those titles using TMDB search, filters out items already in the user's library, scores and ranks them, and inserts them into the top picks and carousel candidates.

Why TF-IDF

- Extremely small and fast, suitable as a safety net.
- No external dependencies or API keys required.
- Works best for short text (titles) and when you have a reasonable corpus of candidate titles.

Extending this

If you need stronger semantic matching consider:

- Sentence-transformer style embeddings (create offline/precomputed vectors for the movie catalog and do nearest-neighbor search with Faiss or an in-memory HNSW index).
- Lightweight vector databases (e.g., Milvus, Weaviate) or hosted services if you need scale.

Running tests

We added small tests to validate the TF-IDF helper and the local expand API. Install dev deps and run:

```bash
pnpm install
pnpm test
```

Notes for ML engineers

- The TF-IDF implementation in `src/lib/embeddings/tfidf.ts` is intentionally simple. It's a good starting point for debugging and offline experiments, but for production-quality semantic search use embeddings + ANN index.
- The local expand API accepts untrusted input; if you choose to expose it publicly, add rate-limiting and input validation.


This will launch a local UI where you can invoke and inspect the inputs and outputs of your AI flows.

Recent changes and improvements
-------------------------------

- Pipeline simplification: The recommendation flow prioritizes the OpenAI fallback endpoint and uses the local TF-IDF expansion as a deterministic safety net. Genkit integration was disabled by default to avoid runtime issues with model availability; the codebase retains the Genkit flows for optional use but the runtime pipeline will not call them unless explicitly re-enabled.

- Robust Firestore writes: `updateUserData` now sanitizes payloads to remove `undefined` values before calling `setDoc`. This prevents runtime Firebase errors when callers include optional fields like `lastFeedback.reason` that may be undefined.

- Thumb/feedback persistence: Thumbs-up (positive) and thumbs-down (negative) feedback are persisted to the user's data and also stored in a separate `feedback` collection for auditing and analytics. Thumbs-up does not automatically remove items from carousels; thumbs-down is recorded as a strong negative signal and reduces the chance of re-recommendation.

- Deterministic image fallbacks: All Dicebear image fallbacks now request PNG variants instead of SVG to avoid CSP/CSP-driven browser blocking when `dangerouslyAllowSVG` is disabled (this quiets the console warnings and prevents blocked image loads in strict environments).

- Special carousels & refill behavior: The Spotlight page includes deterministic special carousels ("Because you liked ...", "Because you added ...", "Finished Watching ...") and carousel refill/deduplication behavior so Spotlight features remain useful even if generative models do not return results.

Known issues and notes
----------------------

- Genkit model availability: There have been runtime failures when Genkit was invoked without an available model or with mismatched model identifiers (e.g., 404s or "Must supply a `model` to `generate()` calls"). To avoid user-impacting failures, the pipeline has been simplified to prefer the OpenAI fallback and the TF-IDF expansion. If you want to re-enable Genkit, ensure you have a supported model identifier and compatible Genkit configuration in `src/ai/genkit.ts`.

- Opentelemetry / dependency warnings: You may see a serverExternalPackages warning about `require-in-the-middle` resolving to different versions between the app and an instrumentation subdependency. This is typically a benign resolution mismatch but can be silenced by aligning versions across the top-level `package.json` and the subdependency or by pinning peer dependencies.

- Placeholder image / icon 404s: Some PWA icons may be missing in `public/icons/` (for example `icon-192x192.png`). If you see 404s in the console for icons, add the missing sizes to `public/icons/` or update `public/manifest.json` to match the available images.

If you're maintaining or deploying Cine-Spot
----------------------------------------

- Re-enable Genkit (optional): If you want to re-enable Genkit in the pipeline, update `src/lib/contexts/RecommendationContext.tsx` to call `spotlightRecommendations` again and verify your Genkit/GenAI credentials and model IDs are valid. Test with `pnpm genkit:dev` and the Genkit UI.

- Testing & CI: Run the TF-IDF unit tests (`pnpm test`) and the `pnpm run typecheck` to ensure code health before deploying.

These updates make the recommendation pipeline more reliable and friendly for local development and small-scale deployments while retaining the ability to integrate richer generative models if you choose to do so later.

## 🚧 Known Issues & Future Work

This application is a feature-rich prototype, but some functionality is intentionally left incomplete or simplified for demonstration purposes.

- **Disabled "Danger Zone" Features**: The "Delete Account" button in Settings is disabled. Implementing this would require a secure, multi-step confirmation process and cascading deletes in Firestore, which is beyond the scope of this prototype.
- **Disabled Profile/Settings Actions**: The "Change Password" and "Change Avatar" buttons are placeholders and not currently functional.
- **Simple Data Import**: The "Import from Backup" feature is a basic implementation that overwrites existing data. It does not handle complex merging or conflict resolution.
- **Public URL Structure**: The public sharing URLs currently include the user's unique ID (`uid`). While this does not expose sensitive information, a future improvement would be to use a separate, non-guessable ID for shared collections to further anonymize the link.

---

Thank you for exploring Cine-Spot!
