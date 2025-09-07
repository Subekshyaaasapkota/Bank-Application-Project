// Change this in DevTools if you want to hit local server:
// localStorage.setItem('API_BASE', 'http://localhost:5000/api/user');

// const API_BASE =
// localStorage.getItem("API_BASE") || "http://localhost:5000/api/user";

const API_BASE =
  localStorage.getItem("API_BASE") ||
  "https://bank-backend-mgfn.onrender.com/api/user";

async function apiRequest(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // try to read json always
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = (data && (data.msg || data.message)) || "Request error";
    throw new Error(msg);
  }
  return data;
}

// Front-end password rule (kept aligned with backend)
function validPassword(pw) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(pw);
}
