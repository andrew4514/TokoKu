import "dotenv/config";
import express from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken, adminGuard } from "../middleware/authMiddleware.js";
import { upload } from '../../api/cloudinary.js';

const router = express.Router();

// Public Routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected Routes (Admin)
router.post('/', verifyToken, adminGuard, upload.single('image'), createProduct);
router.put('/:id', verifyToken, adminGuard, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, adminGuard, deleteProduct);

export default router;