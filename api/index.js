import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/authRoutes.js";
import productRoutes from "../src/routes/productRoutes.js";
import orderRoutes from '../src/routes/orderRoutes.js';
import paymentRoutes from '../src/routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "success" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

export default app;
