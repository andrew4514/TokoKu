import prisma from "../../api/db.js";
import crypto from "crypto";

const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const transactionId = notification.transaction_id;
    const paymentType = notification.payment_type;

    
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto.createHash("sha512").update(`${orderId}${notification.status_code}${notification.gross_amount}${serverKey}`).digest("hex");

    if (hash !== notification.signature_key) {
      return res.status(400).json({ message: "Invalid signature" });
    }

   
    const isSuccess = transactionStatus === "settlement" || (transactionStatus === "capture" && fraudStatus === "accept");

    if (isSuccess) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (!order || order.status === "PAID") return; 

        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });

        await tx.payment.update({
          where: { orderId: orderId},
          data: {
            transactionId: transactionId,
            paymentType: paymentType
          }
        });

        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity, 
              },
            },
          });
        }
      });
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    }

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Error Webhook Midtrans:", error);
    return res.status(500).json({ message: error.message });
  }
};

export default handleNotification;