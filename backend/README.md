# 💸 Expense Tracker — Backend

**Node.js + Express + MongoDB REST API**

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | required |
| `JWT_SECRET` | Secret key for JWT signing | required |
| `JWT_EXPIRE` | JWT token expiry | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/auth/signup` | Register new user | `{ name, email, password }` |
| `POST` | `/auth/login` | Login user | `{ email, password }` |

**Response (both):**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": { "id": "...", "name": "Aaryan", "email": "aaryan@mail.com" }
}
```

---

### Expenses (🔒 JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/expenses` | Add expense |
| `GET` | `/expenses` | List all expenses |
| `GET` | `/expenses?category=food&from=2024-01-01&to=2024-01-31` | Filtered expenses |
| `PUT` | `/expenses/:id` | Update expense |
| `DELETE` | `/expenses/:id` | Delete expense |

**Add/Update Expense Body:**
```json
{
  "title": "Lunch at Café Coffee Day",
  "amount": 250,
  "category": "food",
  "date": "2024-06-15",
  "notes": "Team lunch"
}
```

**Categories:** `food` | `travel` | `shopping` | `bills` | `other`

---

### Budget (🔒 JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/budget` | Set/update monthly budget |
| `GET` | `/budget/current` | Current month budget status |

**Set Budget Body:** `{ "month": "2024-06", "amount": 15000 }`

**Budget Status Response:**
```json
{
  "month": "2024-06",
  "budget": 15000,
  "spent": 12450.50,
  "remaining": 2549.50,
  "exceeded": false,
  "warning": null
}
```

---

### Summary (🔒 JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/summary/monthly` | Monthly summary report |
| `GET` | `/summary/monthly?year=2024&month=5` | Specific month summary |

**Response:**
```json
{
  "month": "2024-06",
  "total": 12450.50,
  "count": 23,
  "categoryBreakdown": {
    "food": 4200.00,
    "travel": 3500.00,
    "shopping": 2800.50,
    "bills": 1950.00,
    "other": 0
  }
}
```

---

## 🔐 Authentication

All protected routes require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt hashing)
│   │   ├── Expense.js        # Expense schema with category enum
│   │   └── Budget.js         # Budget schema (unique per user+month)
│   ├── routes/
│   │   ├── auth.js           # POST /auth/signup, /auth/login
│   │   ├── expenses.js       # CRUD + filter expenses
│   │   ├── budget.js         # Set/get budget
│   │   └── summary.js        # Monthly summary aggregation
│   └── server.js             # Express app entry point
├── .env.example
├── package.json
└── README.md
```

---

## 🛡️ Security

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- **JWT** tokens with configurable expiry
- **Access control** — users can only access their own data
- **Input validation** via express-validator on all endpoints
- **CORS** restricted to frontend origin
