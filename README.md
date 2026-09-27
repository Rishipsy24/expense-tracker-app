# Personal Expense Tracker

A modern, production-ready full-stack personal finance application.

## 🚀 Features

- **Authentication:** Secure JWT-based email/password authentication
- **Dashboard:** Analytics, income vs. expense trends, category breakdowns, and recent transactions
- **Transactions:** Full CRUD operations for income and expenses with search, filtering, and pagination
- **Budgets:** Monthly category-based budget tracking with progress indicators
- **Categories:** Customizable income/expense categories

## 🛠 Technology Stack

- **Frontend:** React.js, Vite, React Router, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, bcrypt, jsonwebtoken
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel (Frontend), Render (Backend)

## 📁 Folder Structure

```
expense-tracker/
├── frontend-expense/       # React Frontend (Vite)
├── backend-expense/        # Node.js Express Backend
├── supabase/               # Database Schema SQL
└── README.md
```

## 🗄️ Database Schema & RLS

The schema consists of 4 main tables in Supabase:
- `users`: Managed entirely by the backend via JWT (UUID, name, email, hashed password)
- `categories`: `id`, `user_id` (FK), `name`, `type`, `icon`
- `transactions`: `id`, `user_id` (FK), `category_id` (FK), `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`
- `budgets`: `id`, `user_id` (FK), `category_id` (FK), `amount`, `month`, `year`

**Security (RLS):**
Row Level Security (RLS) is enabled on all tables. Since the Express backend communicates with Supabase using the `SUPABASE_SERVICE_ROLE_KEY`, it bypasses RLS to perform operations on behalf of the authenticated JWT user. Direct public API access to Supabase is explicitly denied by policies.

## ⚙️ Environment Variables

### Backend (`backend-expense/.env`)

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend-expense/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## 💻 Running Locally

You will need two terminal windows.

**1. Backend:**
```bash
cd backend-expense
npm install
npm run dev
```

**2. Frontend:**
```bash
cd frontend-expense
npm install
npm run dev
```

The frontend will start on [http://localhost:5173](http://localhost:5173) (Vite default) or [http://localhost:3000](http://localhost:3000). The backend will run on `http://localhost:5000`.

## 🌐 Production Deployment Sequence

Since Render's backend URL and Vercel's frontend URL do not exist until deployment, follow this strict sequence:

1. **Supabase Configuration:** Ensure your tables are created using `supabase/schema.sql`.
2. **Local Integration:** Test your local frontend with your local backend using the real database.
3. **GitHub Push:** Push this repository to GitHub. Ensure `.env` and `node_modules` are ignored.
4. **Render Backend Deployment:** 
   - Connect GitHub to Render and create a new Web Service.
   - **Root Directory:** `backend-expense`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `NODE_ENV=production`. (Leave `FRONTEND_URL` temporarily blank or set to `*`).
5. **Test Render:** Verify your backend is running by visiting `https://YOUR-RENDER-URL/api/health`.
6. **Set Vercel URL:** Deploy the frontend to Vercel.
   - **Root Directory:** `frontend-expense`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** Set `VITE_API_URL` to your Render URL (`https://YOUR-RENDER-URL/api`).
7. **Lock CORS:** Once Vercel provides a frontend URL, go back to Render, set `FRONTEND_URL=https://YOUR-VERCEL-URL`, and restart the backend.
8. **Final Test:** Test production authentication and transaction CRUD.

### SPA Routing on Vercel
The frontend contains a `vercel.json` file ensuring React Router works correctly on refresh without returning a 404 error.

## 🛡️ Security Considerations
- Passwords are encrypted using `bcrypt` before reaching the database.
- Every API endpoint (except `/register`, `/login`, `/health`) is protected by JWT verification.
- Users can never access, update, or delete data belonging to another `user_id`.
- The `SUPABASE_SERVICE_ROLE_KEY` remains strictly in the backend environment.
- The frontend `VITE_API_URL` does NOT contain a trailing slash to prevent duplicate `/api/api` paths.
