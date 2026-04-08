# 🔍 CampusFinds — Campus Lost & Found Platform

**A full-stack React Vite + Node.js platform for Chandigarh University students to report, browse, and claim lost & found items.**

---

## 📁 Project Structure

```
campusfinds/
├── frontend/     ← React 18 + Vite 5
│   ├── src/
│   │   ├── api/         API client (axios + JWT interceptor)
│   │   ├── components/  Shared UI (Header, Toast, ItemCard…)
│   │   ├── pages/
│   │   │   ├── admin/   Dashboard, Items, Claims, Users, Feedback, Analytics, QR Labels, Settings
│   │   │   ├── user/    Home, Lost/Found Items, Report, Contact+Complaints
│   │   │   └── landing/ Public landing page
│   │   └── styles/      Global CSS design system
│   ├── index.html
│   └── vite.config.js   (proxies /api → localhost:5000)
│
└── backend/      ← Node.js + Express + MongoDB
    ├── models/    LostItem, FoundItem, Claim, Contact, User
    ├── routes/    users, admin, lostItems, foundItems, claims, contact, analytics, qrcode
    ├── middleware/ auth.js (JWT verify)
    ├── utils/     email.js (Nodemailer)
    └── server.js
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
# Edit .env — add MongoDB URI and SMTP credentials
npm run dev       # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```

### .env (backend)
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `SMTP_HOST` | SMTP server (e.g. smtp.gmail.com) |
| `SMTP_USER` | Gmail address for sending emails |
| `SMTP_PASS` | Gmail app password |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Secure login for students and admin |
| 📊 Analytics Dashboard | Charts: weekly activity, categories, claim status |
| 🤖 AI Item Matching | Text similarity to match lost ↔ found items |
| 📧 Email Notifications | Auto-email when claim approved/rejected |
| 🏷️ QR Code Labels | Printable QR stickers for found items |
| 📱 PWA | Installable app with offline support |
| 🌙 Dark Mode | Persisted theme preference |
| 📋 My Complaints | Students can track complaint status |
| ✅ Feedback Resolve | Admin can resolve and reply to feedback |
| 🖼️ Item Images | Full image preview in admin detail modals |

---

**Change in `backend/.env` before deployment.**
