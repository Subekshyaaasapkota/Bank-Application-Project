const jwt = require("jsonwebtoken");
const User = require("../models/User");

export async function checkPermission(req, res, next) {
  const tokenHeader = req.header("Authorization");
  if (!tokenHeader)
    return res.status(401).json({ msg: "No token, access denied." });

  try {
    const token = tokenHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
        const user = await User.findOne({ decoded });
        if (!user) {
          return res.status(400).json({ msg: "User does not exist" });
        }
    const isAdmin = user.isAdmin
    if (isAdmin){
        next()
    } else { 
        return res .status (401).json({err:"unauthorized"})
    }
   
  } catch {
    res.status(400).json({ msg: "Invalid token." });
  }
}

module.exports = auth;
