# 🚀 CampusFinds — Setup Guide

## Step 1: Backend
```
cd backend
npm install
```
Edit `.env` — set your MongoDB URI:
```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/campusfinds
```
Then:
```
npm run dev
```
Backend starts at **http://localhost:5000**

---

## Step 2: Frontend (new terminal)
```
cd frontend
npm install
npm run dev
```
Frontend starts at **http://localhost:3000**

The Vite dev server proxies all `/api` calls to the backend automatically.

---

## Default Login
- **Admin:** admin@campusfinds.com / admin123
- **Student:** Register on the site

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Cannot find module '../models/LostItems'` | Already fixed — models are `LostItem.js` / `FoundItem.js` |
| `Cannot find module 'nodemon'` | Run `npm install` in backend |
| MongoDB connection error | Check MONGO_URI in .env |
| Charts not showing | Run `npm install` in frontend (installs recharts) |
| Images not displaying | Make sure backend is running — images proxy via Vite |
