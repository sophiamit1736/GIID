# Web deployment / mobile use

LearnAble is a web application. It does not need an Android APK to be usable on a phone.

## Frontend

Deploy the `frontend` folder to Vercel (or another static React host). Set:

`VITE_API_URL=https://YOUR-PUBLIC-BACKEND/api`

Do not leave the production browser build pointed at `http://localhost:5000/api`; on a phone, localhost means the phone itself.

## Backend

Deploy the Node/Express API to a public server that can reach MongoDB and the Groq API. Configure the backend environment variables there, including `MONGO_URI`, JWT settings and `GROQ_API_KEY`. The FastAPI BKT service must also be reachable by the Node backend through `ML_SERVICE_URL`.

## Mobile interaction

The AI games are responsive. Choice, matching, memory and sequence use touch-friendly buttons. Drag-sort supports both desktop drag-and-drop and a mobile-safe fallback: tap an item, then tap its destination group. Static shape/sorting games use the same tap fallback.
