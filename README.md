# Team Management System with Roles & Permissions (RBAC)

A full-stack MERN application that manages teams, users, roles, and permissions,
and dynamically resolves what a user can see/do based on their role **within a
specific team**.

## Architecture / Data Model

```
User           Team           Permission
 _id            _id            _id
 name           name           key (CREATE_TASK, EDIT_TASK, DELETE_TASK, VIEW_ONLY)
 email(unique)  description    description
 password(hash, optional)

Role
 _id
 name (Admin / Manager / Viewer ...) - reusable across users
 permissions: [Permission._id]        - many-to-many

Membership   <-- the join entity that maps User -> Team -> Role
 _id
 user: User._id
 team: Team._id
 role: Role._id
 (unique index on user+team -> one role per user per team,
  but a user can have a DIFFERENT membership/role per team)
```

This avoids the common anti-patterns the assignment calls out:
- **No role stored directly on the User** — roles are resolved per team via `Membership`.
- **No hardcoded permissions** — permissions and roles are stored in MongoDB and created
  through the API (a `seed.js` script is provided only as an optional convenience to
  pre-populate sample data, it's not required).
- **Permission resolution** always goes `User -> Membership(team) -> Role -> Permissions`.
  If no `Membership` exists for a (user, team) pair, the user has **no permissions** there.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcrypt — all using ES `import` syntax, logic kept in `routes/` + `models/` only (no extra controller layer).
- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS. JWT token is stored in `sessionStorage`.

## Project Structure

```
mern-rbac/
  backend/
    config/db.js
    models/{User,Team,Role,Permission,Membership}.js
    middleware/auth.js
    routes/{authRoutes,userRoutes,teamRoutes,roleRoutes,permissionRoutes,membershipRoutes}.js
    server.js
    seed.js
    .env.example
  frontend/
    src/
      api/axios.js
      context/AuthContext.jsx
      components/{Navbar,PrivateRoute,PermissionCard}.jsx
      pages/{Login,Register,Dashboard,Users,Teams,Roles,Permissions,Memberships}.jsx
      App.jsx, main.jsx, index.css
    .env.example
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env -> set MONGO_URI to your MongoDB connection string and a JWT_SECRET
npm run dev          # starts on http://localhost:5000

# optional: pre-populate default permissions (CREATE_TASK, EDIT_TASK, DELETE_TASK,
# VIEW_ONLY) and roles (Admin, Manager, Viewer)
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend is not on http://localhost:5000/api
npm run dev           # starts on http://localhost:5173
```

### 3. Using the app

1. Go to `http://localhost:5173/register` and create an account (this is your logged-in
   user, stored with a hashed password — JWT token + user are saved in `sessionStorage`).
2. Go to **Users** to create more user records (name + unique email — no password needed
   for users that are just being "managed", not logging in themselves).
3. Go to **Teams** to create teams (e.g. "Team Alpha", "Team Beta").
4. Go to **Permissions** to create permissions (or run `npm run seed` in the backend to
   auto-create `CREATE_TASK`, `EDIT_TASK`, `DELETE_TASK`, `VIEW_ONLY`).
5. Go to **Roles** to create roles (e.g. Admin, Manager, Viewer) and check the
   permissions each role should have.
6. Go to **Assign Roles** to put a user into a team with a role — e.g. User A = Admin
   in Team Alpha, then again User A = Viewer in Team Beta.
7. Go to **Dashboard**, search/select a user, select a team, and watch the permission
   cards update dynamically based on that user's role in that specific team.

## API Reference

| Method | Endpoint                                              | Description                              |
|--------|--------------------------------------------------------|-------------------------------------------|
| POST   | `/api/auth/register`                                   | Register + login (returns JWT)            |
| POST   | `/api/auth/login`                                      | Login (returns JWT)                       |
| GET    | `/api/auth/me`                                          | Get current logged-in user                |
| POST   | `/api/users`                                            | Create a user                             |
| GET    | `/api/users?search=term`                                | List/search/filter users by name or email |
| POST   | `/api/teams`                                            | Create a team                             |
| GET    | `/api/teams`                                            | List teams                                |
| POST   | `/api/permissions`                                      | Create a permission                       |
| GET    | `/api/permissions`                                      | List permissions                          |
| POST   | `/api/roles`                                            | Create a role (optionally with permissions)|
| PUT    | `/api/roles/:id/permissions`                            | Assign/replace a role's permissions       |
| GET    | `/api/roles`                                            | List roles (with populated permissions)   |
| POST   | `/api/memberships`                                      | Add user to team with a role (upsert)     |
| PUT    | `/api/memberships/:id`                                  | Update a role assignment                  |
| DELETE | `/api/memberships/:id`                                  | Remove user from team                     |
| GET    | `/api/memberships`                                      | List all memberships                      |
| GET    | `/api/memberships/permissions/:userId/:teamId`          | **Resolve permissions** for a user in a team |

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.
