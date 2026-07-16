# 🏗️ System Architecture & Data Flow Engineering

This document provides a comprehensive technical breakdown of the full-stack architecture, asynchronous data pipelines, and state management lifecycles that power the Personal Web Platform and Admin Engine.

---

## 🌐 High-Level System Architecture

The platform follows a clean two-tier decoupled architecture:
1. **Frontend Tier (Client)**: A React 19 Single Page Application (SPA) bundled with Vite 6 and styled using Tailwind CSS v4 and Framer Motion.
2. **Backend Tier (API Server)**: An asynchronous FastAPI service running on Python 3.11+, using the `motor` asynchronous MongoDB driver for non-blocking I/O.

```mermaid
graph TB
    subgraph Client ["🖥️ Frontend Tier (React 19 SPA)"]
        UI["React Router v7 + Pages"]
        UseCrud["useCrud Hook (Abstraction)"]
        AuthCtx["AuthProvider (JWT Context)"]
        Axios["Axios API Client (Interceptors)"]
        UI --> UseCrud
        UI --> AuthCtx
        UseCrud --> Axios
        AuthCtx --> Axios
    end

    subgraph Security ["🛡️ Security & Middleware Layer"]
        CORS["CORS & Secure Headers"]
        Limiter["SlowAPI Rate Limiter"]
        JWTGuard["JWT Bearer Guard (OAuth2)"]
        Axios --> CORS
        CORS --> Limiter
        Limiter --> JWTGuard
    end

    subgraph Server ["⚙️ Backend Tier (FastAPI Async)"]
        APIRouter["FastAPI APIRouter (/api/v1)"]
        Pydantic["Pydantic v2 Validation"]
        Motor["Motor Async Mongo Driver"]
        JWTGuard --> APIRouter
        APIRouter --> Pydantic
        Pydantic --> Motor
    end

    subgraph Database ["🗄️ Database Tier (NoSQL)"]
        Atlas["MongoDB Atlas Cluster"]
        Motor --> Atlas
    end
```

---

## ⚡ Asynchronous Request Lifecycle

Every HTTP request traverses a strict validation and security pipeline before reaching the database. Below is the sequence flow for both public queries and protected admin mutations:

```mermaid
sequenceDiagram
    autonumber
    actor User as Public/Admin Client
    participant React as React 19 SPA (Axios)
    participant FastAPI as FastAPI Middleware & Limiter
    participant Pydantic as Pydantic Model Validator
    participant Route as APIRouter Handler (async)
    participant Mongo as Motor Async Driver / MongoDB

    User->>React: Trigger Action (Fetch/Create Item)
    React->>FastAPI: HTTP Request (GET / POST with Bearer Token)
    
    note over FastAPI: Enforce Security Headers & Rate Limit Check
    FastAPI->>FastAPI: Verify JWT Token (if protected route)
    
    FastAPI->>Pydantic: Parse & Validate JSON Body
    alt Validation Failed
        Pydantic-->>FastAPI: 422 Unprocessable Entity
        FastAPI-->>React: Error Details (Missing/Invalid Fields)
    else Validation Passed
        Pydantic->>Route: Validated Data Schema Object
        Route->>Mongo: async motor.db.collection.insert_one() / find()
        Mongo-->>Route: MongoDB Document(_id, data...)
        Route->>Pydantic: Serialize to Response Schema
        Route-->>React: 200 OK / 201 Created JSON Response
        React-->>User: Trigger Framer Motion UI Update & Hot Toast
    end
```

---

## 🧩 Frontend Component Hierarchy & State Layer

To keep page components lightweight and maintain strict separation of concerns, global state and data manipulation are separated into dedicated layers:

```mermaid
classDiagram
    class App {
        +BrowserRouter
        +AuthProvider
        +MainLayout
    }
    class AuthContext {
        +user: AdminUser | null
        +token: string | null
        +login(credentials)
        +logout()
        +checkSession()
    }
    class useCrud {
        +data: T[]
        +showForm: boolean
        +formData: T
        +handleChange()
        +handleSubmit()
        +handleDelete()
        +handleDragEnd(arrayMove)
        +toggleVisibility()
    }
    class AdminDashboard {
        +ProjectManagementPage
        +PublicationManagementPage
        +SkillManagementPage
    }
    class UIComponents {
        +IconPicker (Dropdown with click-outside)
        +Button / IconButton
        +FramerMotion Cards
    }

    App *-- AuthContext
    App *-- AdminDashboard
    AdminDashboard ..> useCrud : uses
    AdminDashboard *-- UIComponents
```

---

## 🔐 Authentication & Session Security Flow

The administrative dashboard (`/secure-control`) enforces strict authentication guards:
1. **Login Handshake**: Admin submits credentials to `/api/auth/login`. Password is verified against `Bcrypt` hashed strings stored in MongoDB (`users` collection).
2. **Token Generation**: Upon verification, a signed JSON Web Token (`JWT`) is issued with an expiration window and custom claims.
3. **Route Guarding**: The frontend `ProtectedRoute` wrapper verifies the token signature via `/api/auth/me` on reload and redirects unauthenticated requests immediately to `/login`.
4. **Inactivity Timeout**: Client-side activity listeners monitor mouse and keyboard interaction; extended idle windows trigger an automated logout and token purge.

---

## 🏃 Dual-Server Orchestration (`run.py`)

For local development and testing across environments, the platform includes a Python orchestration runner (`run.py`) that synchronizes the startup, process monitoring, and graceful termination of both frontend and backend services via `subprocess.Popen` chaining:
- Automatically activates `venv` and starts `uvicorn app.main:app --reload` for the API.
- Spawns `npm run dev -- --host` for the Vite development server.
- Captures termination signals (`SIGINT` / `KeyboardInterrupt`) to cleanly shut down all child worker processes without port zombie hanging.
