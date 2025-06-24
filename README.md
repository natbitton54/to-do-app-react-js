Here’s a polished and complete version of your `README.md` with a clean app description and clear setup instructions for anyone who wants to fork and deploy your **to-do-app-react-js** project:

---

# 📝 To-Do App (React + Firebase)

## ✅ App Description

**TaskManager** is a modern, responsive web application built with **React** and **Firebase**. It helps users organize their tasks with ease and efficiency. Key features include:

* ✅ **Secure Authentication** using email/password and Google login via Firebase.
* 🗂️ **Custom Task Categories** with color tags for easy organization.
* ⏰ **Due Date & Time Support** for better task scheduling.
* ✔️ **Mark, Edit, and Delete Tasks**, with confirmation prompts.
* 🔍 **Filter Tasks** by All, Done, or Not Done.
* 🌗 **Light/Dark Mode** support based on user system preferences.
* 🔐 **Private User Data**, stored securely in **Firebase Firestore**.

> Fully deployable on **Vercel** with live Firebase backend integration.

---

## 🚀 Getting Started

### 1. **Fork & Clone the Repository**

```bash
git clone https://github.com/YOUR_USERNAME/to-do-app-react-js.git
cd to-do-app-react-js
```

---

### 2. **Install Dependencies**

```bash
npm install
```

---

### 3. **Firebase Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project.
3. Enable **Authentication**:

   * Go to **Authentication > Sign-in method**
   * Enable **Email/Password** and optionally **Google** login
4. Set up **Firestore Database**:

   * Go to **Firestore Database** and click “Create Database”
   * Start in test mode (optional: secure rules later)
5. Go to **Project Settings > General**:

   * Under "Your apps", click **\</>** to add a web app
   * Copy the Firebase config

---

### 4. **Add Firebase Config**

Create a file:

```bash
/src/firebase/config.js
```

Paste your Firebase config like this:

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### 5. **Run the App Locally**

```bash
npm start
```

Your app should now be running at `http://localhost:3000`.

---

Copyright © 2025 Nathaniel David Bitton

All rights reserved.

This code is proprietary and confidential. No part of this codebase may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.

Unauthorized use, reproduction, or distribution is strictly prohibited.
