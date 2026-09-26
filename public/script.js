// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (response.ok) {
        message.textContent = result.message;
        window.location.href = "/dashboard";
      } else {
        message.textContent = result.message;
      }
    } catch (error) {
      message.textContent = "Unable to connect to the server.";
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = result.redirect || "/dashboard";
      } else {
        message.textContent = result.message;
      }
    } catch (error) {
      message.textContent = "Unable to connect to the server.";
    }
  });
}

// LOAD DASHBOARD PROFILE
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

if (userName && userEmail) {
  fetch("/api/me")
    .then(async (response) => {
      if (!response.ok) {
        window.location.href = "/";
        return null;
      }

      return response.json();
    })
    .then((user) => {
      if (user) {
        userName.textContent = user.name;
        userEmail.textContent = user.email;
      }
    })
    .catch(() => {
      userName.textContent = "Unable to load";
      userEmail.textContent = "Unable to load";
    });
}

// LOGOUT
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST"
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = result.redirect || "/";
      } else {
        alert(result.message || "Logout failed.");
      }
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  });
}