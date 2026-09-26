# Week 6 - Authentication System

## Project Overview
A secure user authentication system developed using
Node.js, Express.js, MongoDB, and bcryptjs.

## Features
- User Signup
- User Login and Logout
- Password Hashing using bcryptjs
- MongoDB Database Integration
- Session-Based Authentication
- Protected User Dashboard
- User Profile Details

## Technologies Used
- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- express-session

## Installation and Setup

1. Clone this repository.
2. Install dependencies:

   npm install

3. Create a `.env` file in the project root.

4. Add your MongoDB connection string and session secret:

   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret

5. Start the server:

   node server.js

6. Open http://localhost:3000 in your browser.

## Security
- Passwords are hashed before being stored.
- Session-based authentication protects the dashboard.
- Environment variables are excluded from GitHub.

## Author
Bhavana
