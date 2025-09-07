// transactions.js
async function loadTransactions(phone) {
  const res = await fetch(
    `http://localhost:5000/api/user/transactions/${phone}`
  );
  const data = await res.json();
  const list = document.getElementById("transactions");
  list.innerHTML = data
    .map(
      (tx) =>
        `<li><strong>${tx.type.toUpperCase()}</strong> - ₹${tx.amount} 
      (${tx.details}) on ${new Date(tx.date).toLocaleString()}</li>`
    )
    .join("");
}
