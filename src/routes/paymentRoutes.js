import express from "express";
import handleNotification from "../controllers/paymentController.js";

const router = express.Router();

router.post("/notification", handleNotification);

export default router;
