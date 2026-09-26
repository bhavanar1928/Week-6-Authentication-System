const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Local development only
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    }
  })
);

// Serve public files
app.use(express.static(path.join(__dirname, "public")));

// Check server and database status
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend server is running!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    req.session.userId = user._id.toString();

    res.status(201).json({
      message: "Account created successfully!"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    console.error("Signup error:", error.message);
    res.status(500).json({
      message: "Unable to create account. Please try again."
    });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // Prevent session fixation
    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          message: "Unable to log in. Please try again."
        });
      }

      req.session.userId = user._id.toString();

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            message: "Unable to save your session."
          });
        }

        res.json({
          message: "Login successful!",
          redirect: "/dashboard"
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Unable to log in. Please try again."
    });
  }
});

// Check whether a user is logged in
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  next();
}

// Protected dashboard page
app.get("/dashboard", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// Dashboard user details
app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select(
      "name email createdAt"
    );

    if (!user) {
      return req.session.destroy(() => {
        res.status(401).json({
          message: "Please log in again."
        });
      });
    }

    res.json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({
      message: "Unable to load profile."
    });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Unable to log out."
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      message: "Logged out successfully!",
      redirect: "/"
    });
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
      throw new Error("Missing MONGODB_URI or SESSION_SECRET in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();