
import jwt from "jsonwebtoken";

function generateToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET harus minimal 32 karakter");
  }

  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role_name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: "ktam-api",
      audience: "ktam-client",
    }
  );
}

export default generateToken;
