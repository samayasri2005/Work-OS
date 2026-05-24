# Work OS Quick Capture Extension 🧩

This is the official companion Chrome Extension for **Work OS**. It provides an instant quick-capture tool directly inside your browser so you can save active URLs to your workspace without breaking your workflow.

Because Work OS utilizes real-time Firestore listeners, any link you capture via this extension will instantaneously appear in your Work OS Command Palette (`⌘K`) and your Quick Capture streams.

---

## ✨ Features

- **Isolated Build:** Lightweight React & Vite architecture independent of the main app.
- **Manifest V3:** Fully compliant with Chrome Web Store modern standards.
- **Privacy-first Permissions:** Uses the `activeTab` permission. It only accesses the specific tab you are viewing *when you click the extension icon*, guaranteeing privacy.
- **Native Authentication:** Integrates directly with your Work OS Firebase project so all captures are securely scoped to your specific `uid`.

---

## 🛠️ Installation & Setup (Developer Mode)

### 1. Build the Extension
Ensure you are in the `extension` directory, install the dependencies, and build the distribution folder:

```bash
cd extension
npm install
npm run build
```

*(Note: The `vite.config.ts` is specifically configured to build without filename hashing, which is required for Chrome Extensions).*

### 2. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **"Developer mode"** in the top right corner.
3. Click the **"Load unpacked"** button in the top left.
4. Select the `dist` folder located at `Work OS/extension/dist`.
5. The extension will now appear in your browser! Pin it to your toolbar for easy access.

---

## 🚀 Usage

1. Navigate to an interesting repository, API document, or reference link.
2. Click the **Work OS Capture** extension icon in your toolbar.
3. The extension will request the current authentication state from the open Work OS web app. Ensure you are signed in there; if not, the extension will open the Work OS login page.
4. Click **"Save to Work OS"**.
5. Your link is now instantly saved into your Work OS backend!

---

## 🧑‍💻 Development

If you want to modify the extension (e.g., adding tags, custom notes, or idea tracking):

```bash
npm run dev
```

Remember to run `npm run build` again and click the "Refresh" icon on the extension page in Chrome (`chrome://extensions/`) to load your new changes.
