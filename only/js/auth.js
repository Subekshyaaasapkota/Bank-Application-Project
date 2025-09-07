function toggleRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}
function toggleLogin() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");
  error.textContent = "";

  try {
    const data = await apiRequest("/login", "POST", { phone, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("phone", data.phone);
    window.location.href = "landing.html";
  } catch (err) {
    error.textContent = err.message;
  }
});

// Register
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const dob = document.getElementById("regDob").value;
    const password = document.getElementById("regPassword").value.trim();
    const pin = document.getElementById("regPin").value.trim();
    const error = document.getElementById("registerError");
    error.textContent = "";

    // simple validations
    if (!/^\d{10}$/.test(phone)) {
      error.textContent = "Phone must be 10 digits";
      return;
    }
    if (!validPassword(password)) {
      error.textContent =
        "Password must be 8+ chars, include uppercase, number and symbol";
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      error.textContent = "PIN must be 4 digits";
      return;
    }

    // age check
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 18) {
      error.textContent = "Must be 18+ to register";
      return;
    }

    try {
      await apiRequest("/register", "POST", {
        name,
        phone,
        dob,
        password,
        pin,
      });
      alert("Registration successful. Please login.");
      toggleLogin();
    } catch (err) {
      error.textContent = err.message;
    }
  });
