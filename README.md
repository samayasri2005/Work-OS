# Work OS 🎛️

A professional, SaaS-style workspace designed to consolidate project lifecycles, service accounts, custom command execution hubs, and dynamic data schemas. 

---

## 🚀 Key Features

*   **Integrated Project Workspace**: A single dashboard showing active project status (Idea, In progress, Completed, On hold), tech stack, git repositories, credentials, and deployment environments.
*   **Dynamic Schema Builder**: Custom-tailor database schemas on the fly. Drag, drop, toggle, and add fields (URL, Text, Textarea, Select, Multi-select, Reference, and Tags) to build input configurations.
*   **Workspace Configurator**: Adapt layouts for individual projects. Toggle visual sections (Tasks, Notes, Links, Calendar), customize columns, and reorder elements using an HTML5 drag-and-drop mechanism.
*   **Environment Variables Manager**: Track and display Dev and Prod variables with encryption and security masking.
*   **Floating Capture System**: A keyboard-accessible overlay (`⌘⇧N`) for quickly logging ideas, commands, bookmarks, or tasks.
*   **Terminal Command Center**: Store and run contextual shell scripts (`dev`, `deploy`, `db`, `test`) linked to projects.

---

## 🛠️ Technology Stack

*   **Frontend**: React 18.3, TypeScript, Vite, Tailwind CSS
*   **Reactivity System**: Custom in-memory stores using React's native `useSyncExternalStore`
*   **Utilities**: HTML5 native drag-and-drop sensor APIs
*   **Components & Icons**: Radix UI primitives, Recharts, Lucide React
*   **Database & Auth**: Firebase Auth & Cloud Firestore

---

## 🏗️ High-Level Architecture

Work OS uses a **Dynamic Configuration-Driven SPA Model** that fetches schema blueprints on login, adapting forms and views dynamically:

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT SIDE                       │
│                                                        │
│   Dynamic Schema Builder ──> Generates Schema Fields    │
│                                   │                    │
│                                   ▼                    │
│   React UI Form Parser  <──  useSyncExternalStore      │
│   (URL, Tags, Dropdowns)     (Memory State Callback)   │
│                                   │                    │
│                                   ▼                    │
│                        Asynchronous Firestore Updates  │
└───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼ (SDK Transport)
┌────────────────────────────────────────────────────────┐
│                      CLOUD BACKEND                     │
│                                                        │
│   Firestore Database:                                  │
│   - /schema (custom fields blueprints)                 │
│   - /projects (dynamic project payloads)               │
└────────────────────────────────────────────────────────┘
```

### Engineering Highlights
1.  **useSyncExternalStore Reactivity**: State management is implemented using native hooks instead of third-party libraries (Zustand/Redux). The implementation handles memory cache listeners, initializers, and batch updates.
2.  **Dependencies-Free Drag & Drop**: Layout reordering uses a custom `useReorder` hook built on HTML5 Drag and Drop events, keeping the bundle size minimal.

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js 18+ or Bun
*   Firebase project configured with Email & Google Authentication and Firestore database

### Getting Started

1.  **Clone & Install Dependencies**
    ```bash
    cd "Work OS"
    npm install
    # or using Bun
    bun install
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root of the `Work OS` directory:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

4.  **Production Build**
    ```bash
    npm run build
    npm run preview
    ```

---

## 🗺️ Project Structure

*   `src/` - Core React application
    *   `components/dashboard/` - Dynamic layout widgets (SchemaBuilder, WorkspaceConfig, OverviewCard)
    *   `components/workos/` - Provider wrappers, quick-capture triggers, command palette
    *   `components/ui/` - Atomic Radix UI components
    *   `views/` - Primary page views (Projects dashboard, Accounts registry, Calendar, etc.)
    *   `lib/` - useSyncExternalStore stores, Firestore query layers, and utility helpers
*   `public/` - Public assets, SVG icons, and fonts
