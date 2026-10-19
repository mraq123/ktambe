
import db from "../config/db.js";

const allowedFields = [
  "card_number",
  "nik",
  "full_name",
  "gender",
  "birth_place",
  "birth_date",
  "death_date",
  "death_place",
  "cause",
  "reporter_name",
  "status",
];

function pickFields(body) {
  const data = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field] === "" ? null : body[field];
    }
  }

  return data;
}

export async function getDeathRecords(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(
        "(card_number LIKE ? OR nik LIKE ? OR full_name LIKE ? OR reporter_name LIKE ?)"
      );

      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM death_records ${where}`,
      params
    );

    const [rows] = await db.execute(
      `SELECT id, card_number, nik, full_name, gender,
              birth_place, birth_date, death_date, death_place,
              cause, reporter_name, status, created_at, updated_at
       FROM death_records ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = Number(countRows[0].total);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeathRecordById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const [rows] = await db.execute(
      "SELECT * FROM death_records WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function createDeathRecord(req, res, next) {
  try {
    const data = pickFields(req.body);

    if (!data.card_number || !data.nik || !data.full_name) {
      return res.status(400).json({
        success: false,
        message: "card_number, nik, dan full_name wajib diisi",
      });
    }

    const fields = Object.keys(data);
    const values = fields.map((field) => data[field]);
    const placeholders = fields.map(() => "?").join(", ");

    const [result] = await db.execute(
      `INSERT INTO death_records (${fields.join(", ")})
       VALUES (${placeholders})`,
      values
    );

    const [rows] = await db.execute(
      "SELECT * FROM death_records WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Data berhasil ditambahkan",
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDeathRecord(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const data = pickFields(req.body);
    const fields = Object.keys(data);

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diperbarui",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM death_records WHERE id = ?",
      [id]
    );

    if (!existing[0]) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    const setQuery = fields.map((field) => `${field} = ?`).join(", ");

    await db.execute(
      `UPDATE death_records SET ${setQuery} WHERE id = ?`,
      [...fields.map((field) => data[field]), id]
    );

    const [rows] = await db.execute(
      "SELECT * FROM death_records WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Data berhasil diperbarui",
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDeathRecord(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM death_records WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
}
