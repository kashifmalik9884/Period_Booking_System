# Period_Booking_System

A full-stack web application for managing school AV room period bookings.

## Overview

This project is designed for schools that need a simple system to manage AV room bookings across the working week. Users can view available slots and create bookings, while admins can log in to manage bookings, edit records, delete bookings, and review booking history.

The system supports:
- 2 AV rooms
- 7 periods per day
- 6 working days per week
- PostgreSQL-based booking persistence
- Booking history tracking
- JWT-based admin authentication
- Role-based protected admin actions

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT authentication
- Role-based access control

### Database
- PostgreSQL

### Deployment
- Frontend: Netlify
- Backend: Render
- Database: Neon PostgreSQL

## Project Structure

```text
Period-Booking-System/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── sql/
    └── schema.sql
```

## Features

### User Features
- View booking table for upcoming school dates
- See available and booked slots
- Book one slot at a time
- Prevent same-day and past-date booking

### Admin Features
- Secure admin login
- View active bookings
- Edit future bookings
- Delete bookings
- View complete booking history
- Access protected admin-only routes

### Booking Rules
- Only future school dates are allowed
- Sunday is excluded
- Each room-period-date combination can only be booked once
- Booked slots show as unavailable in the booking table
- Booking changes are tracked in history

## Database Tables

The application uses the following PostgreSQL tables:

- `admins`
- `bookings`
- `booking_history`

## Environment Variables

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

For production:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

### Server (`server/.env`)

```env
PORT=5000
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Period-Booking-System
```

### 2. Install client dependencies

```bash
cd client
npm install
```

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Create PostgreSQL database

Create a PostgreSQL database named:

```text
period_booking
```

### 5. Run SQL schema

Execute the SQL schema from:

```text
sql/schema.sql
```

### 6. Configure environment files

Create `.env` files in both `client` and `server` folders using the examples above.

### 7. Start backend

```bash
cd server
npm start
```

### 8. Start frontend

```bash
cd client
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deployment Guide

### Frontend on Netlify
- Deploy the `client` folder
- Build command: `npm run build`
- Publish directory: `dist`
- Add `VITE_API_BASE_URL` in Netlify environment variables
- Add SPA fallback file: `public/_redirects`

```text
/* /index.html 200
```

### Backend on Render
- Deploy the `server` folder as a Web Service
- Add environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
- Make sure CORS includes the Netlify frontend domain

### Database on Neon
- Create a Neon PostgreSQL project
- Copy the connection string
- Use it as `DATABASE_URL` in the backend

## Admin Authentication

Admin login uses JWT. Only admins can:
- edit bookings
- delete bookings
- view booking history
- access protected admin pages

To add an admin manually, insert a bcrypt-hashed password into the `admins` table.

## UI Notes

The project includes a modern responsive admin UI with:
- card-based layouts
- animated interactive states
- improved booking cards
- booking table status styling
- responsive forms and pages

## Future Improvements

- Date grouping on active bookings page
- Search and filter on history page
- Export booking history
- Multi-admin management
- Better dashboard analytics

## License

This project is for educational and internal school management use.
