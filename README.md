# PhysicsIQ — JEE Main PYQ App

## What this is
A web app for JEE Main Physics previous year questions with AI explanations, progress tracking, and Firebase integration.

---

## How to deploy on Vercel (step by step, no coding needed)

### STEP 1 — Set up Firebase Firestore
1. Go to https://console.firebase.google.com
2. Click your project: **jee-mock-app-bced4**
3. In the left menu, click **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** → click Next → click Enable
6. Click **Rules** tab and paste this, then click **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### STEP 2 — Create a GitHub account (free)
1. Go to https://github.com
2. Click **Sign up** → fill in your details → verify email
3. You now have a GitHub account

### STEP 3 — Upload this project to GitHub
1. Go to https://github.com/new
2. Name it: `physicsiq` → click **Create repository**
3. On the next page, click **uploading an existing file**
4. Drag and drop ALL files from this folder into the browser window
   - Make sure to include: src/, public/, index.html, package.json, vite.config.js, .gitignore
5. Click **Commit changes**

### STEP 4 — Deploy on Vercel (free)
1. Go to https://vercel.com
2. Click **Sign up** → choose **Continue with GitHub** → allow access
3. Click **Add New Project**
4. Find **physicsiq** in the list → click **Import**
5. Vercel will auto-detect it as a Vite project
6. Click **Deploy**
7. Wait 2-3 minutes ⏳
8. You'll see a green screen with your live URL like: `physicsiq.vercel.app`

### STEP 5 — First time opening the app
1. Open your live URL in any browser
2. The app will automatically upload all 75 questions to Firestore (takes ~5 seconds)
3. You'll see a green dot saying "FIREBASE CONNECTED"
4. The app is now live and working!

---

## How to add new questions to Firestore (no code needed)

1. Go to https://console.firebase.google.com → your project → Firestore
2. Navigate to: **pyq** → **2026** → **months** → **April 2nd** → **shifts** → **S1** → **questions**
3. Click **Add document**
4. Set the document ID to the next question number (e.g., "26")
5. Add these fields:
   - `id` (number): 26
   - `type` (string): "mcq" or "num"
   - `topic` (string): e.g., "Kinematics"
   - `question` (string): the question text
   - `options` (array): ["option A", "option B", "option C", "option D"]
   - `correct` (number): 0, 1, 2, or 3 (index of correct answer)
   - `solution` (string): the solution explanation
6. Click **Save**
7. The website automatically shows the new question — no redeployment needed!

---

## Project structure (what each file does)
```
physicsiq/
├── src/
│   ├── App.jsx        ← The entire app UI and logic
│   ├── firebase.js    ← Firebase connection setup
│   └── main.jsx       ← Starts the React app
├── public/
│   └── favicon.svg    ← The app icon
├── index.html         ← The webpage shell
├── package.json       ← Lists all libraries needed
├── vite.config.js     ← Build tool configuration
└── .gitignore         ← Files Git should ignore
```
