# NeuralFit

A Progressive Web App that performs real-time AI-powered bodyweight exercise
analysis using MediaPipe in the browser.

https://github.com/user-attachments/assets/04d9b526-04d2-442b-8bc3-ac4fae3aaf05

## Stack

**Frontend:** React, Vite, Tailwind CSS, shadcn/ui, @mediapipe/tasks-vision  
**Backend:** Node.js, Express, MongoDB (Mongoose), Passport (Google OAuth)  
**Auth:** JWT (httpOnly cookies) + Argon2id password hashing  
**PWA:** vite-plugin-pwa (Workbox)

## Getting Started

### Prerequisites
- Node.js 20.6+
- pnpm (`npm install -g pnpm`)
- MongoDB running locally on port 27017 (or update MONGO_URI in server/.env)

### 0 — Monorepo

```bash      
pnpm install
# Fill in the .env in both client and server 
pnpm dev                   
```

### 1 — Backend

```bash
cd server
cp .env.example .env        
pnpm install
pnpm dev                   
```

### 2 — Frontend

```bash
cd client
cp .env.example .env 
pnpm install
pnpm dev                    
```

### Environment variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | Express port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLIENT_URL` | Frontend URL (http://localhost:5173 in dev) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

## PWA Installation

Visit the app in Chrome or Edge. An install prompt will appear in the
address bar once the service worker is registered (after first load).
On iOS Safari, use Share → Add to Home Screen.
