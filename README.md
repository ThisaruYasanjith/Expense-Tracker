# FinPulse — AI-Powered Personal Finance & Expense Intelligence System
> Full-Stack MERN (MongoDB, Express.js, React.js, Node.js) Web Application

---

## 🌟 Executive Summary
**FinPulse** is a personal finance and expense intelligence platform built with the MERN stack. Designed with a glassmorphism and modern UI design system, FinPulse transforms routine financial tracking into clear analytics, automated budget enforcement, and milestone tracking.

---

## 🚀 Key Features

### 1. 🔐 Secure Authentication & User Identity
- JWT-based authentication with stateless tokens stored securely in localStorage.
- Password hashing using `bcryptjs` with salt rounds.
- Multi-currency support (**USD**, **EUR**, **GBP**, **LKR**, **INR**, **CAD**, **AUD**, **JPY**).
- User Profile management (display name, currency preferences, password update).

### 2. 💸 Transaction Engine & Multi-Criteria Filtering
- Full CRUD for **Income** and **Expense** transactions.
- Flexible payment channels (Credit Card, Debit Card, Cash, Bank Transfer, Crypto).
- Advanced multi-filter toolbar:
  - Text search by description/notes
  - Category selector
  - Transaction type toggle (Income/Expense)
  - Date boundaries (From date / To date)
  - Amount range filters
- Real-time column sorting (Date, Amount, Description).
- Pagination for high-volume transaction histories.

### 3. 🏷️ Category Management System
- Pre-seeded system standard categories (Food & Dining, Utilities, Housing, Transportation, Freelance, Salary, Investments, etc.).
- Custom Category Builder: pick custom hex colors and choose from 30+ category icons.
- Deletion protection ensuring categories attached to active transactions are preserved.

### 4. 📊 Monthly Budgets & Early Warning Alerts
- Category-level monthly spending limits.
- Month-over-month and Year navigation.
- Real-time spend meters with color-coded alerts:
  - 🟢 **Normal / Good** (< threshold)
  - 🟡 **Warning** (reached configurable alert threshold, e.g. 80%)
  - 🔴 **Exceeded** (exceeded 100% of budget limit)
- Automatic system notifications generated when an expense triggers a budget threshold breach.

### 5. 🎯 Savings Goals & Celebration Milestones
- Set savings goals with target dates and target amounts.
- Interactive **Deposit & Withdrawal** modal.
- Real-time countdown of days remaining and percentage progress.
- Celebratory confetti animation upon achieving 100% of any savings target.

### 6. 🔁 Automated Recurring Transactions
- Recurring rules for subscriptions, bills, salaries, and regular commitments.
- Frequencies: Daily, Weekly, Bi-Weekly, Monthly, Yearly.
- Next due date tracking with Active / Paused status toggles.
- **"Process Now"** instant trigger to record scheduled rules directly into transactions.

### 7. 📈 Visual Analytics & Reports
- 6-month comparative Cash Flow area chart (Income vs Expenses).
- Spending distribution donut & category bar charts.
- Payment method breakdown.
- Custom period statement generator with one-click **PDF Statement** download and **CSV Spreadsheet** export.

### 8. 🛡️ Administrator Portal
- System-wide metrics (Total users, Total transactions, Platform monetary volume, Active budgets).
- User management directory with search, role promotion/demotion (Admin / User), account suspension toggles, and permanent cascade deletion.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Lucide Icons, Recharts, Canvas-Confetti, jsPDF, AutoTable |
| **Styling** | Modern Vanilla CSS Design Tokens, Glassmorphism, Responsive Grid |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB & Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT) & Bcrypt.js |

---

## 📂 Project Architecture

```
Expense Tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Auth, register, login, profile, password
│   │   ├── transactionController.js # CRUD, dashboard aggregation, analytics
│   │   ├── categoryController.js # Custom & default categories
│   │   ├── budgetController.js   # Monthly category budgets & limit tracking
│   │   ├── goalController.js     # Savings goals & deposits
│   │   ├── recurringController.js# Repeating schedules & execution
│   │   ├── notificationController.js # Alert triggers & notifications
│   │   ├── adminController.js    # User management & platform stats
│   │   └── reportController.js   # PDF / CSV statements
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer verification
│   │   ├── admin.js              # Admin role guard
│   │   └── error.js              # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   ├── Recurring.js
│   │   └── Notification.js
│   ├── routes/                   # Express routes
│   ├── utils/
│   │   └── seedDefaults.js       # Pre-seeds default categories
│   ├── server.js                 # Express server bootstrap
│   ├── .env                      # Local environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Glassmorphic sidebar
│   │   │   ├── Navbar.jsx        # Top bar with notifications & theme switch
│   │   │   ├── MetricCard.jsx    # Visual metric card
│   │   │   ├── TransactionModal.jsx # Add/Edit transaction modal
│   │   │   ├── BudgetModal.jsx   # Budget limit modal
│   │   │   ├── GoalModal.jsx     # Savings goal builder
│   │   │   ├── ContributionModal.jsx # Deposit modal with confetti
│   │   │   ├── RecurringModal.jsx# Recurring schedule modal
│   │   │   ├── CategoryModal.jsx # Custom category palette & icons
│   │   │   └── ConfirmDialog.jsx # Action confirmation modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Session & currency state
│   │   │   └── ThemeContext.jsx  # Dark/Light theme state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── GoalsPage.jsx
│   │   │   ├── RecurringPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Client-side API fetch client
│   │   ├── utils/
│   │   │   └── iconMap.jsx       # Icon mapper
│   │   ├── App.jsx
│   │   ├── index.css             # Design tokens & animations
│   │   └── main.jsx
│   ├── vite.config.js            # Vite proxy configuration
│   └── package.json
│
├── package.json
└── README.md
```

---

## ⚙️ Getting Started & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local `mongod` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create or verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker_db
JWT_SECRET=super_secure_jwt_secret_token_expense_intelligence_2026
JWT_EXPIRE=30d
```

Start the backend server:
```bash
npm run dev
# Backend runs at http://localhost:5000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 🔑 Initial Demo Login
When registering the very first user on a fresh database, that user is automatically designated as an **Administrator** (`admin`).

You can also use the **"Auto Fill"** demo button on the Login page to quickly test with default credentials.

---

## 📡 Key REST API Endpoints

### Authentication
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Sign in and get JWT
- `GET /api/auth/me` — Get profile info
- `PUT /api/auth/profile` — Update name & currency
- `PUT /api/auth/password` — Change password

### Transactions
- `GET /api/transactions` — Query & filter transactions
- `POST /api/transactions` — Add new transaction
- `GET /api/transactions/dashboard` — Dashboard metrics & summary
- `GET /api/transactions/analytics` — Financial charts & aggregations
- `PUT /api/transactions/:id` — Edit transaction
- `DELETE /api/transactions/:id` — Delete transaction

### Budgets & Goals
- `GET /api/budgets?month=10&year=2026` — Monthly category budgets
- `POST /api/budgets` — Create budget limit
- `GET /api/goals` — Savings goals list
- `POST /api/goals/:id/contribute` — Deposit / withdraw goal funds

### Recurring & Reports
- `GET /api/recurring` — List scheduled rules
- `POST /api/recurring/:id/process` — Trigger manual execution
- `GET /api/reports/statement` — Period summary
- `GET /api/reports/export-csv` — Download CSV

### Admin
- `GET /api/admin/stats` — Platform summary
- `GET /api/admin/users` — User directory
- `PATCH /api/admin/users/:id/status` — Toggle suspend
- `PATCH /api/admin/users/:id/role` — Toggle admin role
