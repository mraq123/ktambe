
import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function getAll(_req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.full_name, u.username, u.email,
              u.is_active, r.id AS role_id, r.name AS role_name,
              u.created_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.id DESC`
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { full_name, username, email, password, role_id } = req.body;

    if (!full_name || !username || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
      });
    }

    const [roles] = await db.execute(
      "SELECT id FROM roles WHERE id = ?",
      [Number(role_id)]
    );

    if (!roles[0]) {
      return res.status(400).json({
        success: false,
        message: "Role tidak ditemukan",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users
       (full_name, username, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        String(full_name).trim(),
        String(username).trim(),
        String(email).trim().toLowerCase(),
        passwordHash,
        Number(role_id),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: { id: result.insertId },
    });
  } catch (error) {
    next(error);
  }
}

export async function setActive(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;

    if (!Number.isInteger(id) || typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "ID dan is_active boolean wajib diisi",
      });
    }

    if (id === req.auth.userId && !is_active) {
      return res.status(400).json({
        success: false,
        message: "Kamu tidak dapat menonaktifkan akun sendiri",
      });
    }

    const [result] = await db.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Status user berhasil diperbarui",
    });
  } catch (error) {
    next(error);
  }
}
