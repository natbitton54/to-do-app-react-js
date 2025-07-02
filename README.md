
# 📝 Task Manager – React + Firebase + Vercel

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![Platform](https://img.shields.io/badge/platform-Web%2C%20iOS%2C%20Android-green)]()
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase)](https://firebase.google.com/)

A full-stack **to-do / task planner** that runs everywhere:

- 🌐 **Web PWA** – installable on desktop & mobile  
- 📱 **Mobile apps** – via Capacitor (iOS & Android)  
- ☁️ **Serverless backend** – Firebase Auth + Firestore + Cloud Messaging  
- 🔔 **Smart reminders** – push and local notifications with [Cron Job Org Console](https://console.cron-job.org/)

---

## ✨ Features

| Category           | Details |
|--------------------|---------|
| 🔐 **Auth**        | Email/password & Google login (Firebase Authentication) |
| 🗂 **Categories**  | Unlimited user-defined categories with color tags |
| ⏰ **Due Date & Time** | Native pickers & readable formatting (e.g. Jul 4, 2025, 6:30 PM) |
| ⏳ **Smart Reminders** | <ul><li>📱 Local notifications via Capacitor</li><li>💻 Push via Firebase Cloud Messaging + cron job</li></ul> |
| 🔔 **Cron Job**    | `/api/sendReminders` runs every 15 min (Pro tier), marking tasks as `reminderSent=true` |
| ✔️ **Task Actions** | Add • Edit • Toggle Done • Delete (with confirmation) |
| 🔍 **Filters**     | All • Done • Not Done |
| 🌗 **Dark Mode**   | Follows system preference; toggle with <kbd>⌥ + D</kbd> |
| 📱 **Installable** | Full PWA with manifest, favicon, and offline support |
| 🔒 **Per-user Data** | Firestore security rules restrict access to each user’s data |

---

## 🧩 Project Structure

### 🖥 Frontend – React + Capacitor

- **React** with Create React App
- **PWA ready** (service worker + manifest)
- **Capacitor shell** for iOS/Android builds
- **Notification logic** (push & local)
- **Dark/light theme** based on user system

### ☁️ Backend – Firebase + Vercel Serverless

- **Firebase Auth** for secure login
- **Firestore** for task storage
- **Cloud Messaging** for web push
- **Vercel serverless API** (`/api/sendReminders`) triggered by cron job org console

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/<your-user>/to-do-app-react-js.git
cd to-do-app-react-js
npm install
````

### 2. Firebase Console

1. Create project → "Task Manager"
2. Enable Auth → Email/Password + (optional) Google
3. Create Firestore → Start in test mode (lock down later)
4. Register web app → copy config into `.env.local`
5. Generate VAPID key → Cloud Messaging → Web Push

### 3. Environment Variables

Create:

```
.env.local   # frontend
.env         # serverless backend (never commit this)
```

<details><summary>Example contents</summary>

```env
# .env.local
REACT_APP_VAPID_PUBLIC_KEY=BNxyz...

# .env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n"
CRON_SECRET=your-secret-token
```

</details>

> 🔑 Get service account JSON:
> Firebase → IAM → Service Accounts → Generate new key

---

## 🧪 Local Development

```bash
npm run build         # Prepares /build for Capacitor & Vercel
npm start             # CRA dev server
npx vercel dev        # Local test of serverless API
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🌩 Deploy to Vercel

1. `vercel login`
2. `vercel` → Choose framework: **Create-React-App**
3. In dashboard → Environment Variables:

   * `REACT_APP_VAPID_PUBLIC_KEY`
   * Firebase service account keys
   * `CRON_SECRET`
4. Add `vercel.json`:

```jsonc
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "crons": [
    { "path": "/api/sendReminders", "schedule": "*/15 * * * *" }
  ]
}
```

5. Deploy:

```bash
vercel --prod
```

---

## 📱 Build Native (Optional)

```bash
npm run build
npx cap sync

# Android
npm i @capacitor/android
npx cap add android
npx cap open android

# iOS (macOS required)
npm i @capacitor/ios
npx cap add ios
npx cap open ios
```

➡ Push to Play Store or TestFlight as needed.
🛎 Local notifications supported via `@capacitor/local-notifications`.

---

## 🛠 Scripts

| Command          | Description                             |
| ---------------- | --------------------------------------- |
| `npm start`      | CRA dev server                          |
| `npm run build`  | Production build for Vercel + Capacitor |
| `npx vercel dev` | Local test of frontend + serverless     |
| `npm run lint`   | Lint code using Google config           |
| `npx cap sync`   | Sync React build to native platforms    |

---

## 📜 License & Usage

© 2025 **Nathaniel David Bitton**
**For personal and educational use only.**
Commercial use requires permission.

📧 [nathanielbitton18@gmail.com](mailto:nathanielbitton18@gmail.com)

---



