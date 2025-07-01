Below is an **updated, production-ready `README.md`** that reflects **every new feature we implemented**— smart reminders (local + push), the Vercel cron job, Capacitor mobile builds, dark-mode, etc.

Feel free to copy-paste over your existing file.

---

````markdown
# 📝 Task Manager – React + Firebase + Vercel

A full-stack **to-do / task-planner** that runs everywhere:

* **Web (PWA)** – Installable on desktop & mobile  
* **iOS / Android** – via Capacitor native shells  
* **Serverless backend** – Firebase Auth + Firestore + Cloud Messaging  
* **Automatic reminders** – smart “2/3-time” rule with push/local notifications

---

## ✨ Features

| Category | Details |
|----------|---------|
| 🔐 **Auth** | Email / password **and** Google OAuth (Firebase Authentication) |
| 🗂 **Categories** | Unlimited user-defined categories with color dots |
| ⏰ **Due Date & Time** | Native date/time pickers; pretty “Jul 4 2025 6 : 30 PM” rendering |
| ⏳ **Smart Reminders** | <ul><li>📱 **Mobile** (Capacitor): scheduled **local** notification at <code>max(⅔ remaining, 5 min before)</code></li><li>💻 **Web / PWA**: registers an FCM push token so the server can ping you</li></ul> |
| 🔔 **Cron Job** | `/api/sendReminders` runs **every 15 min** on Vercel (Pro) & marks <code>reminderSent=true</code> |
| ✔️ **Task Actions** | Add / edit / toggle done / delete with confirmation |
| 🔍 **Filters** | All • Done • Not Done |
| 🌗 **Dark Mode** | Respects OS preference; switch with <kbd>⌥ + D</kbd> |
| 📱 **Installable** | PWA manifest, favicon set, offline service-worker |
| 🔒 **Per-user data** | Firestore rules – only read/write your own docs |

---

## 🛠 Quick Start

> **Clone your fork**

```bash
git clone https://github.com/<your-user>/to-do-app-react-js.git
cd to-do-app-react-js
npm install
````

---

### 1. Firebase Console

1. **Create project** → “Task Manager”
2. **Enable Auth** → *Email/Password* + (optionally) *Google*
3. **Create Firestore** → *Start in test mode* (lock down later)
4. **Generate Web App** → copy the config object
5. **Generate VAPID key** (⚙  Project Settings → Cloud Messaging → Web Push)

---

### 2. Local secret files

```
.env.local               # React (frontend)
.env                     # Next.js / Vercel serverless API
```

<details><summary>Click to see template contents</summary>

```bash
# ----- .env.local -----
REACT_APP_VAPID_PUBLIC_KEY=BNxyz...

# ----- .env (never commit) -----
# Firebase Admin service-account (JSON → env form)
FIREBASE_PROJECT_ID=todo-app-react-js-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-123@todo-app-react-js-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqh...\n-----END PRIVATE KEY-----\n"

# Secret used by Vercel Cron requests
CRON_SECRET=f93a1c1d7e...
```

</details>

> **Create service-account JSON**
> *IAM & Admin ▸ Service Accounts ▸ “Generate new key”* and copy the three values above.

---

### 3. Run it

```bash
npm run build         # generates /build for Capacitor & Vercel
npm start             # or: npx vercel dev  (to test the API route locally)
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌩 Deploy to Vercel (web + cron job)

1. `vercel login`
2. `vercel` → follow prompts, **Framework = Create-React-App**
3. **Add Environment Variables** in the dashboard (`REACT_APP_*`, service-account keys, `CRON_SECRET`)
4. Create `vercel.json`:

```jsonc
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "crons": [
    { "path": "/api/sendReminders", "schedule": "*/15 * * * *" } // Pro plan
  ]
}
```

5. `vercel --prod`

---

## 📲 Build native apps (optional)

```bash
npm run build                 # fresh web build
npx cap sync                  # copies to native
# Android
npm i @capacitor/android
npx cap add android
npx cap open android          # Android Studio
# iOS  (requires macOS + Xcode)
npm i @capacitor/ios
npx cap add ios
npx cap open ios
```

Push to Play Store / TestFlight as usual.
**Local notifications** already work via `@capacitor/local-notifications`.

---

## 👨‍💻 Scripts

| Command          | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `npm start`      | CRA dev-server                                  |
| `npm run build`  | Production build (served by Vercel & Capacitor) |
| `npx vercel dev` | Test serverless API + React locally             |
| `npm run lint`   | ESLint (Google style)                           |
| `npx cap sync`   | Copy web → native platforms                     |

---

## 📜 License & Usage

Copyright © 2025 **Nathaniel David Bitton**

**Personal / educational use only** – commercial or public redistribution requires written permission.
Email : **[nathanielbitton18@gmail.com](mailto:nathanielbitton18@gmail.com)**

---

```

---

### 🔑 What changed?

* Added **Smart Reminder algorithm** description
* Documented **`.env` variables** (service account + VAPID + cron secret)
* Added **Vercel cron job** section
* Included **Capacitor** build steps
* Updated feature table and quick-start commands

Now your README matches your codebase. Happy shipping!
```
