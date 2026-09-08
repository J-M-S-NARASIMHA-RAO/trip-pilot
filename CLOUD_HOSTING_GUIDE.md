# ☁️ Trip Pilot: Cloud Hosting & Multi-Device Access Guide

This guide provides instructions to access **Trip Pilot** from any smartphone, tablet, or external computer—either immediately via tunneling/local network or permanently via 24/7 free cloud platforms.

---

## 📱 Method 1: Instant Access from Phone (Right Now - Same Wi-Fi / Hotspot)

Both the frontend and backend servers are already configured to listen on all interfaces (`0.0.0.0`).

1. Ensure your smartphone is connected to the same Wi-Fi network or mobile hotspot as this PC.
2. Open the browser on your smartphone (Safari, Chrome, etc.).
3. Enter your PC's local network URL:
   ```text
   http://172.20.10.2:5173
   ```
4. Trip Pilot will load instantly in mobile view with full GPS, fare checking, and maps!

---

## 🌐 Method 2: Instant Worldwide Public HTTPS Access (Anywhere, Any Device)

If you or anyone else wants to open Trip Pilot from another cellular network or from a remote city:

1. Double-click the included batch launcher:
   ```text
   start-public-tunnel.bat
   ```
   *(Or run `npx localtunnel --port 5173` in terminal)*
2. It generates an instant, secure public HTTPS URL (e.g., `https://cold-foxes-jump.loca.lt`).
3. Open this link on **any smartphone, iPhone, Android, tablet, or PC** anywhere in the world!

---

## 🚀 Method 3: 24/7 Permanent Free Cloud Deployment (Render.com)

**Render.com** provides free cloud hosting for both Dockerized Spring Boot services and static Vite React frontends.

### Step 1: Push Project to GitHub
1. Create a repository on GitHub (e.g. `trip-pilot`).
2. In your terminal at `D:\SMART INDIA HACKATHON\SIH\TRIP PILOT`:
   ```bash
   git init
   git add .
   git commit -m "Trip Pilot Cloud Deployment Release"
   git remote add origin https://github.com/<YOUR_USERNAME>/trip-pilot.git
   git push -u origin main
   ```

### Step 2: 1-Click Deploy with Render Blueprint
1. Go to [https://render.com](https://render.com) and log in (free account).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your `trip-pilot` GitHub repository.
4. Render will automatically detect the included [`render.yaml`](./render.yaml) file:
   - It deploys **`trip-pilot-backend`** using `backend/Dockerfile` (Spring Boot 3.2.5 on Java 17).
   - It deploys **`trip-pilot-frontend`** using Vite build with automatic backend routing.
5. Click **Apply**.
6. Within 2–3 minutes, your application is live on a public URL like `https://trip-pilot.onrender.com`!

---

## ⚡ Method 4: Deploy Frontend to Vercel + Backend to Railway / Render

If you prefer deploying the frontend on **Vercel**'s ultra-fast edge CDN:

### Backend (Railway or Render):
1. Deploy `backend` to [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Note your backend URL (e.g. `https://trippilot-api.railway.app`).

### Frontend (Vercel):
1. Go to [https://vercel.com](https://vercel.com) and import the `frontend` folder.
2. Under **Environment Variables**, add:
   ```env
   VITE_API_URL = https://trippilot-api.railway.app
   VITE_GOOGLE_MAPS_API_KEY = AIzaSyCmIe_ONslfuDJDxmJo5DFX9GgudM3Doqs
   ```
3. Deploy! Vercel will host your mobile cockpit on `https://your-project.vercel.app`.

---

## 🐳 Method 5: Self-Hosted Docker / VPS (DigitalOcean, AWS EC2, GCP)

If running on a VPS or cloud server with Docker installed:

```bash
# Build and launch both backend and frontend containers
docker compose up -d --build
```
- Frontend will be accessible on port `80` / `3000`.
- Backend will be accessible on port `8080`.
