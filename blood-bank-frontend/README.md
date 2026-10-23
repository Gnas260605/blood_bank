# Blood Bank — Frontend

React 19 + Vite client for the Blood Bank System. See the [main README](../README.md) for the full project.

## Pages

| Route        | Description                          |
|--------------|--------------------------------------|
| `/register`  | Registration form with validation    |
| `/success`   | Registration success, check your email |
| `/verify`    | Email verification result            |
| `/login`     | Login                                |
| `/dashboard` | User dashboard (after login)         |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Set `VITE_API_BASE_URL` to change the backend URL (default `http://localhost:8080/api`).
