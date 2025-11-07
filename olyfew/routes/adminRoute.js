// GET all users
router.get("/users", auth, async (req, res) => {
  const admin = await User.findById(req.user.id);
  if (!admin || !admin.isAdmin) return res.status(401).json({ msg: "Unauthorized" });

  const users = await User.find({}, "name phone balance createdAt");
  res.json(users);
});

// GET all transactions
router.get("/transactions", auth, async (req, res) => {
  const admin = await User.findById(req.user.id);
  if (!admin || !admin.isAdmin) return res.status(401).json({ msg: "Unauthorized" });

  const allUsers = await User.find().select("name transactions");
  const transactions = allUsers.flatMap(u =>
    u.transactions.map(tx => ({
      userName: u.name,
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
    }))
  );
  res.json(transactions);
});
