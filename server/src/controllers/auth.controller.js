const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
async function login(req, res, next) {
  try {
    const { identity, password } = req.body || {};
    if (!identity || !password) return res.status(400).json({ status: "error", message: "Username/email and password are required." });
    const result = await db.query("SELECT id, username, email, password_hash, full_name FROM administrators WHERE lower(username)=lower($1) OR lower(email)=lower($1) LIMIT 1", [String(identity).trim()]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) return res.status(401).json({ status: "error", message: "Invalid username/email or password." });
    const token = jwt.sign({ id: admin.id, username: admin.username, role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "8h" });
    res.json({ status: "success", token, admin: { id: admin.id, username: admin.username, email: admin.email, fullName: admin.full_name, role: "ADMIN" } });
  } catch (e) { next(e); }
}
async function me(req, res, next) {
  try { const r = await db.query("SELECT id, username, email, full_name FROM administrators WHERE id=$1", [req.admin.id]); if (!r.rowCount) return res.status(404).json({status:"error",message:"Administrator not found."}); const a=r.rows[0]; res.json({status:"success",data:{id:a.id,username:a.username,email:a.email,fullName:a.full_name,role:"ADMIN"}}); } catch(e){next(e);}
}
module.exports = { login, me };
