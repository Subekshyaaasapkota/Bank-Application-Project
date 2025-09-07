if (!localStorage.getItem("token")) window.location.href = "index.html";

const balanceCard = document.getElementById("balanceCard");
const profileBox = document.getElementById("profileBox");
const txBody = document.getElementById("txBody");

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function formatNPR(n) {
  return "रु " + Number(n || 0).toLocaleString("en-IN");
}

async function loadBalance() {
  try {
    const data = await apiRequest("/balance");
    balanceCard.textContent = "Balance: " + formatNPR(data.balance);
  } catch (_) {
    balanceCard.textContent = "Balance: —";
  }
}

async function loadProfile() {
  try {
    const p = await apiRequest("/profile");
    profileBox.innerHTML = `
      <div><strong>Name:</strong> ${p.name}</div>
      <div><strong>Phone:</strong> ${p.phone}</div>
      <div><strong>DOB:</strong> ${new Date(p.dob).toLocaleDateString()}</div>
      <div><strong>Age:</strong> ${p.age}</div>
      <div><strong>Joined:</strong> ${new Date(
        p.createdAt
      ).toLocaleDateString()}</div>
    `;
  } catch (err) {
    profileBox.textContent = err.message;
  }
}

function renderTxRow(tx) {
  const badgeClass =
    tx.type === "transfer-in"
      ? "badge in"
      : tx.type === "transfer-out" || tx.type === "withdraw"
      ? "badge out"
      : "badge other";
  const prettyType = tx.type.replace("-", " ");
  return `<tr>
    <td>${new Date(tx.date).toLocaleString()}</td>
    <td><span class="${badgeClass}">${prettyType.toUpperCase()}</span></td>
    <td>${tx.details || "-"}</td>
    <td>${formatNPR(tx.amount)}</td>
    <td>${
      typeof tx.balanceAfter === "number" ? formatNPR(tx.balanceAfter) : "-"
    }</td>
  </tr>`;
}

async function loadTransactions() {
  try {
    const list = await apiRequest("/transactions");
    if (!Array.isArray(list) || !list.length) {
      txBody.innerHTML = `<tr><td colspan="5">No transactions yet.</td></tr>`;
      return;
    }
    txBody.innerHTML = list.map(renderTxRow).join("");
  } catch (err) {
    txBody.innerHTML = `<tr><td colspan="5" class="error">${err.message}</td></tr>`;
  }
}

/** Actions */

// Deposit
async function depositMoney() {
  const amount = parseFloat(document.getElementById("depositAmount").value);
  const msg = document.getElementById("depositMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (isNaN(amount) || amount < 10 || amount > 50000) {
    msg.textContent = "Deposit must be between ₹10–50,000";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/deposit", "POST", { amount });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("depositAmount").value = "";
    await loadBalance();
    await loadTransactions();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

// Withdraw
async function withdrawMoney() {
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const pin = document.getElementById("withdrawPin").value;
  const msg = document.getElementById("withdrawMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (isNaN(amount) || amount < 10 || amount > 25000) {
    msg.textContent = "Withdraw must be between ₹10–25,000";
    msg.classList.add("error");
    return;
  }
  if (!/^\d{4}$/.test(pin)) {
    msg.textContent = "PIN must be 4 digits";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/withdraw", "POST", { amount, pin });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("withdrawPin").value = "";
    await loadBalance();
    await loadTransactions();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

// Transfer
async function transferMoney() {
  const phone = document.getElementById("transferPhone").value.trim();
  const amount = parseFloat(document.getElementById("transferAmount").value);
  const pin = document.getElementById("transferPin").value;
  const bankType = document.getElementById("bankType").value;
  const msg = document.getElementById("transferMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (!/^\d{10}$/.test(phone)) {
    msg.textContent = "Recipient phone must be 10 digits";
    msg.classList.add("error");
    return;
  }
  if (isNaN(amount) || amount < 10 || amount > 25000) {
    msg.textContent = "Amount must be ₹10–25,000";
    msg.classList.add("error");
    return;
  }
  if (!/^\d{4}$/.test(pin)) {
    msg.textContent = "PIN must be 4 digits";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/transfer", "POST", {
      phone,
      amount,
      pin,
      bankType,
    });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("transferPhone").value = "";
    document.getElementById("transferAmount").value = "";
    document.getElementById("transferPin").value = "";
    await loadBalance();
    await loadTransactions();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

// Top-up
async function topupMobile() {
  const phone = document.getElementById("topupPhone").value.trim();
  const amount = parseFloat(document.getElementById("topupAmount").value);
  const pin = document.getElementById("topupPin").value;
  const msg = document.getElementById("topupMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (!/^\d{10}$/.test(phone)) {
    msg.textContent = "Enter a valid 10-digit phone";
    msg.classList.add("error");
    return;
  }
  if (isNaN(amount) || amount < 10) {
    msg.textContent = "Minimum top-up is ₹10";
    msg.classList.add("error");
    return;
  }
  if (!/^\d{4}$/.test(pin)) {
    msg.textContent = "PIN must be 4 digits";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/topup", "POST", { phone, amount, pin });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("topupPhone").value = "";
    document.getElementById("topupAmount").value = "";
    document.getElementById("topupPin").value = "";
    await loadBalance();
    await loadTransactions();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

// eSewa
async function loadEsewa() {
  const id = document.getElementById("esewaId").value.trim();
  const amount = parseFloat(document.getElementById("esewaAmount").value);
  const pin = document.getElementById("esewaPin").value;
  const msg = document.getElementById("esewaMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (!id) {
    msg.textContent = "Enter eSewa ID";
    msg.classList.add("error");
    return;
  }
  if (isNaN(amount) || amount < 10) {
    msg.textContent = "Minimum load is ₹10";
    msg.classList.add("error");
    return;
  }
  if (!/^\d{4}$/.test(pin)) {
    msg.textContent = "PIN must be 4 digits";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/esewa", "POST", { id, amount, pin });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("esewaId").value = "";
    document.getElementById("esewaAmount").value = "";
    document.getElementById("esewaPin").value = "";
    await loadBalance();
    await loadTransactions();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

// Change password
async function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const msg = document.getElementById("changePassMsg");
  msg.textContent = "";
  msg.className = "msg";
  if (!validPassword(newPassword)) {
    msg.textContent =
      "New password must be 8+ chars, include uppercase, number & symbol.";
    msg.classList.add("error");
    return;
  }
  try {
    const data = await apiRequest("/change-password", "POST", {
      oldPassword,
      newPassword,
    });
    msg.textContent = data.msg;
    msg.classList.add("success");
    document.getElementById("oldPassword").value = "";
    document.getElementById("newPassword").value = "";
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
}

(async function init() {
  await loadBalance();
  await loadProfile();
  await loadTransactions();
})();
