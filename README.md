# Blood Bank System

A web application for a blood bank, built with **Spring Boot** and **React**. This repository contains the **Authentication module**: account registration, email verification and login.

![Java](https://img.shields.io/badge/Java-21-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F) ![React](https://img.shields.io/badge/React-19-61DAFB) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1)

## Features

- **Registration** with server-side validation (full name, email, phone format, password strength: at least 8 characters, one uppercase letter and one digit).
- **Password hashing** with BCrypt. Plain-text passwords are never stored.
- **Email verification**: a one-time token valid for 24 hours is emailed to the user. Accounts stay `PENDING` until verified.
- **Resend verification** for users whose link expired.
- **Login** that blocks unverified (`PENDING`) and `BANNED` accounts and returns the same error for wrong email or wrong password.
- **Notification log**: every email attempt is recorded as `SENT` or `FAILED` with the error message.

## Tech Stack

| Layer    | Technology                                         |
|----------|----------------------------------------------------|
| Backend  | Java 21, Spring Boot, Spring Data JPA, Bean Validation, JavaMailSender |
| Database | MySQL 8                                            |
| Frontend | React 19, Vite, React Router, Axios                |

## Architecture

The backend follows a layered architecture:

```
Controller (REST)  →  Service (business rules)  →  Repository (Spring Data JPA)  →  MySQL
                              │
                              └→  Notification service  →  SMTP (JavaMailSender)
```

```
blood_bank/
├── blood-bank-backend/
│   ├── schema.sql                     # Database schema
│   └── src/main/java/com/bloodbank/app/
│       ├── controller/                # REST endpoints
│       ├── service/                   # Business logic (users, notifications)
│       ├── repository/                # Spring Data JPA repositories
│       ├── entity/                    # User, VerifyToken, NotificationLog
│       ├── dto/                       # Request/response objects with validation
│       └── config/                    # CORS configuration
├── blood-bank-frontend/               # React + Vite client
└── docs/                              # Architecture and design reports (Vietnamese)
```

Detailed design documents (module view, data flow, data model) are in [`docs/`](docs/).

## API

Base URL: `http://localhost:8080/api/auth`

| Method | Endpoint                | Description                              |
|--------|-------------------------|------------------------------------------|
| POST   | `/register`             | Create an account and send verification email |
| GET    | `/verify?token=...`     | Activate the account                     |
| POST   | `/resend-verification`  | Send a new verification email (`{ "email": "..." }`) |
| POST   | `/login`                | Log in with email and password           |

## Getting Started

### Prerequisites

- Java 21, Maven
- Node.js 20+
- MySQL 8

### 1. Database

```bash
mysql -u root -p < blood-bank-backend/schema.sql
```

### 2. Backend

Configuration is read from environment variables (defaults in brackets):

| Variable        | Purpose                                   | Default |
|-----------------|-------------------------------------------|---------|
| `DB_URL`        | JDBC URL                                  | `jdbc:mysql://localhost:3306/blood_bank...` |
| `DB_USERNAME`   | Database user                             | `root` |
| `DB_PASSWORD`   | Database password                         | empty |
| `MAIL_USERNAME` | SMTP account (e.g. Gmail address)         | empty |
| `MAIL_PASSWORD` | SMTP password / Gmail app password        | empty |
| `FRONTEND_URL`  | Allowed CORS origin and base of verification links | `http://localhost:5173` |

```bash
cd blood-bank-backend
export DB_PASSWORD=your_password
mvn spring-boot:run
```

Without SMTP credentials the email will not be delivered, but the verification link is always printed to the console, so the flow can be tested locally.

### 3. Frontend

```bash
cd blood-bank-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. To point it at another backend, set `VITE_API_BASE_URL` (default `http://localhost:8080/api`).

## Roadmap

- [x] Registration, email verification, login
- [ ] JWT-based session and protected routes
- [ ] Donor profiles and donation history
- [ ] Blood inventory by blood group
- [ ] Blood request management for hospitals

## Author

**Huynh Thanh Sang** — [github.com/Gnas260605](https://github.com/Gnas260605)
