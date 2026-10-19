
import db from "../config/db.js";

export async function getAll(_req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, description, created_at FROM roles ORDER BY id ASC"
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { name, description = null } = req.body;
    const roleName = String(name || "").trim().toLowerCase();

    if (!/^[a-z0-9_-]{2,50}$/.test(roleName)) {
      return res.status(400).json({
        success: false,
        message: "Nama role tidak valid",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      [roleName, description]
    );

    return res.status(201).json({
      success: true,
      message: "Role berhasil dibuat",
      data: { id: result.insertId, name: roleName },
    });
  } catch (error) {
    next(error);
  }
}
