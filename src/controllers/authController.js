
import db from "../config/db.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export async function login(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const identity = String(username || email || "").trim();

    if (!identity || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email dan password wajib diisi",
      });
    }

    const [rows] = await db.execute(
      `SELECT
        u.id, u.full_name, u.username, u.email,
        u.password_hash, u.is_active,
        r.id AS role_id, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [identity, identity]
    );

    const user = rows[0];

    if (
      !user ||
      !user.is_active ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Username/email atau password salah",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        token_type: "Bearer",
        expires_in: process.env.JWT_EXPIRES_IN || "1d",
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: {
            id: user.role_id,
            name: user.role_name,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.full_name, u.username, u.email,
              u.is_active, r.id AS role_id, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       LIMIT 1`,
      [req.auth.userId]
    );

    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan atau tidak aktif",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
