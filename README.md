# 🚀 InternBridge — Online Internship & Project Matching Platform

A full-stack web application connecting students with organizations for internships and projects.

## 📋 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (SPA with custom router)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)

## ✨ Features

### For Students
- Browse internships, projects, freelance, research opportunities
- AI-like skill-based matching with compatibility scores
- Apply with cover letter and resume link
- Track application status in real-time
- Save/bookmark opportunities
- Profile management with skills, portfolio, education

### For Organizations
- Post opportunities (internship, project, part-time, freelance, research)
- View and manage applicants
- Update applicant status (reviewing, shortlisted, selected, rejected)
- Dashboard with analytics (views, applications, selections)

### Platform
- Smart search and multi-filter (type, domain, mode, skills)
- Role-based access control
- Responsive design (mobile-friendly)
- Real-time stats dashboard
- Pagination

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internship_platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### 3. Seed Database (Optional - Demo Data)
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
```

Open **http://localhost:5000** in your browser!

## 🔑 Demo Accounts
All passwords: `demo123`

| Role | Email |
|------|-------|
| 🎓 Student | alice@demo.com |
| 🎓 Student | bob@demo.com |
| 🎓 Student | carol@demo.com |
| 🏢 Organization | techcorp@demo.com |
| 🏢 Organization | analytics@demo.com |
| 🏢 Organization | creative@demo.com |

## 📁 Project Structure
```
internship-platform/
├── server/
│   ├── models/         # Mongoose schemas
│   │   ├── User.js
│   │   └── Opportunity.js
│   ├── controllers/    # Route handlers
│   │   ├── authController.js
│   │   └── opportunityController.js
│   ├── routes/         # Express routes
│   │   ├── auth.js
│   │   └── opportunities.js
│   ├── middleware/
│   │   └── auth.js     # JWT middleware
│   └── server.js       # Express entry point
├── public/
│   ├── css/styles.css  # Complete design system
│   ├── js/app.js       # SPA frontend
│   └── index.html
├── seed.js             # Demo data seeder
├── .env                # Environment config
└── package.json
```

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Opportunities
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/opportunities` | List with filters |
| POST | `/api/opportunities` | Create (org only) |
| GET | `/api/opportunities/matched` | Student skill matches |
| GET | `/api/opportunities/my-applications` | Student applications |
| GET | `/api/opportunities/my-posts` | Org posted jobs |
| GET | `/api/opportunities/:id` | Get single |
| POST | `/api/opportunities/:id/apply` | Apply (student) |
| POST | `/api/opportunities/:id/save` | Save/unsave |
| GET | `/api/opportunities/:id/applicants` | View applicants (org) |
| PUT | `/api/opportunities/:id/applicants/:studentId` | Update status |
