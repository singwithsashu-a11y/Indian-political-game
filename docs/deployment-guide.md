# Production Deployment & Operations Guide

## 1. Environment Variables (`.env.example`)
```dotenv
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="https://your-production-domain.com"
PORT=3000
NODE_ENV="production"
```
Firebase configuration is stored in `firebase-applet-config.json` and Firestore Security Rules in `firestore.rules`.

## 2. Build & Start Commands
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Audit Firestore Security Rules**:
   ```bash
   npx eslint firestore.rules
   ```
3. **Compile Frontend & Typecheck**:
   ```bash
   npm run build
   npm run lint
   ```
4. **Start Full-Stack Production Server (Express + WebSocket + Static SPA on Port 3000)**:
   ```bash
   npm start
   ```

## 3. Hosting & WebSocket Considerations
- **Cloud Run / Render / Railway / Fly.io (Recommended)**: Supports persistent HTTP → WebSocket upgrade (`ws://` / `wss://`) on port 3000 out of the box. Enable session affinity if scaling horizontally across multiple instances.
- **Shared cPanel Warning**: Standard shared cPanel hosting often blocks persistent WebSocket upgrade headers unless Phusion Passenger Node.js selector with WebSocket proxy is explicitly enabled.
