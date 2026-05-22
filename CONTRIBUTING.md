# Contributing to Work OS 🎛️

Thank you for your interest in contributing to **Work OS**! We welcome open-source contributions to make project workspaces and configuration layouts more powerful, intuitive, and secure for teams.

---

## 🛠️ Getting Started

### 1. Fork and Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/work-os.git
   cd work-os
   ```

### 2. Setup Local Environment
1. Install dependencies using `npm` or `bun`:
   ```bash
   npm install
   # or
   bun install
   ```
2. Configure your environment variables by copying `.env.example` (or creating `.env`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```

---

## 📐 Guidelines & Rules

### 1. Reactivity & State
- **useSyncExternalStore**: Work OS state management is built on top of React's native `useSyncExternalStore` hook rather than third-party state managers. Make sure to follow the pattern in `src/lib/` for adding listeners, batch updating, and caching data.
- **Dynamic Forms**: Layout widgets and schemas are generated dynamically. Ensure any fields added to the form systems correctly serialize and write to the corresponding collections.

### 2. Drag & Drop
- **HTML5 Drag and Drop API**: To keep bundles small, Work OS uses a custom dependency-free `useReorder` implementation instead of heavy libraries. Keep new drag-and-drop actions aligned with these interfaces.

### 3. Conventional Commit Messages
Please format commit messages using:
- `feat: ...` for new modules or elements.
- `fix: ...` for layout, logic, or sync issues.
- `docs: ...` for docs/guide updates.
- `style: ...` for cosmetics, styling fixes.
- `refactor: ...` for logic modifications that don't change behavior.

### 4. Code Checks
Make sure to check type compilation and project building before submitting a PR:
- Run `npx tsc --noEmit`
- Run `npm run build`
