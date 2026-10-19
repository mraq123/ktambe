
export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu",
      });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki akses",
      });
    }

    next();
  };
}
