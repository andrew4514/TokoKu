import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak ditemukan.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa.",
    });
  }
};

const adminGuard = (req, res, next) => {
    if(!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Tidak dapat diakses'
        });
    }
    next();
}

export {verifyToken, adminGuard};
