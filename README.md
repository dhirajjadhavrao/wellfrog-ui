# Wellfrog UI 🐸

Minimalist, responsive frontend for **Wellfrog** — Personal Daily Life & Activity Tracker. Built with **React 18**, **Vite**, and **Tailwind CSS**.

## ✨ Features

- **Consolidated Daily Dashboard**: Day-to-day timeline navigator with instant stats.
- **5 Core Hubs**:
  1. 💳 **Finance - Daily Spend**: Split between Online (UPI/Cards) and Offline (Cash) transactions with category breakdown.
  2. 🏦 **Loans & EMIs Tracker**: Track loan liabilities, monthly EMI due dates, and mark statuses (`PAID`, `PENDING`, `FAILED`).
  3. 🏋️‍♂️ **Workout Sessions**: Daily routine tracking, duration (minutes), notes, and completion checks.
  4. 💼 **Office Work Time & Deliverables**: Daily logged hours, task checklist with interactive checkboxes, and work notes.
  5. 🎯 **Naukri / Job Applications Pipeline**: Track applications across stages (`APPLIED`, `SHORTLISTED`, `HR_CALL`, `TECH_INTERVIEW`, `OFFER`, `REJECTED`) with recruiter updates and follow-ups.
- **Activity & Sub-Activity Manager**: Custom activity tree with nested sub-activities.
- **Multi-Tenant Authentication**: Google Identity Services integration with 1-click Dev Fast-Login for local testing.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 22+)
- Running Wellfrog Spring Boot backend (`http://localhost:8080`)

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server on http://localhost:5173
npm run dev

# Build production bundle
npm run build
```

## 🌐 API Proxy
Vite is preconfigured to proxy `/api` calls directly to `http://localhost:8080` during development.
