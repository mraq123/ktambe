
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "ktam-api",
      audience: "ktam-client",
    });

    req.auth = {
      userId: Number(decoded.sub),
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa",
    });
  }
}
