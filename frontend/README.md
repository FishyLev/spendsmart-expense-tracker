# 💸 SpendSmart — Frontend

**React 18 + Recharts expense tracking SPA**

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Set API URL (optional — defaults to http://localhost:5000)
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# 3. Start development server
npm start

# 4. Build for production
npm run build
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx       # Sidebar + header shell
│   ├── context/
│   │   └── AuthContext.js       # JWT auth state (login/signup/logout)
│   ├── pages/
│   │   ├── LoginPage.jsx        # Login form
│   │   ├── SignupPage.jsx       # Registration form
│   │   ├── DashboardPage.jsx    # Overview — KPIs, budget progress, pie chart
│   │   ├── ExpenseListPage.jsx  # Filterable expense table
│   │   ├── ExpenseFormPage.jsx  # Add / Edit expense form
│   │   └── BudgetPage.jsx       # Set budget + Recharts bar charts
│   ├── styles/
│   │   └── globals.css          # Design system + component styles
│   ├── utils/
│   │   └── api.js               # Axios instance + all API calls
│   ├── App.js                   # Router + protected route logic
│   └── index.js                 # React 18 root
└── package.json
```

---

## 🖥️ Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | JWT login form |
| `/signup` | Sign Up | Registration form |
| `/dashboard` | Dashboard | KPIs, budget progress, category pie chart |
| `/expenses` | Expense List | Filterable list with edit/delete |
| `/expenses/new` | Add Expense | New expense form |
| `/expenses/edit/:id` | Edit Expense | Pre-filled edit form |
| `/budget` | Budget | Set budget, bar charts, category breakdown |

---

## ⚙️ Key Libraries

| Library | Use |
|---|---|
| `react-router-dom` v6 | Client-side routing |
| `axios` | API calls with JWT interceptor |
| `recharts` | Pie chart (dashboard) + bar charts (budget) |
| `react-datepicker` | Date range filters + expense date picker |
| `date-fns` | Date formatting |

---

## 🔐 Auth Flow

1. User logs in → backend returns JWT
2. Token stored in `window.__authToken` (in-memory, no localStorage)
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. 401 responses → automatic redirect to `/login`
5. Protected routes wrapped in `<ProtectedRoute>` component
