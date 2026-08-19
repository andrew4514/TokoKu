import express from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

export default router;