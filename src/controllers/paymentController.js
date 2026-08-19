import prisma from "../../api/db";
import crypto from "crypto";

const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // 1. Verifikasi Signature Key (Keamanan)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto.createHash("sha512").update(`${orderId}${notification.status_code}${notification.gross_amount}${serverKey}`).digest("hex");

    if (hash !== notification.signature_key) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 2. Cek apakah pembayaran berhasil
    const isSuccess = transactionStatus === "settlement" || (transactionStatus === "capture" && fraudStatus === "accept");

    if (isSuccess) {
      // Jalankan dalam Prisma Transaction agar aman
      await prisma.$transaction(async (tx) => {
        // A. Ambil data pesanan beserta itemnya
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order || order.status === "PAID") return; // Hindari eksekusi ganda

        // B. Update status pesanan menjadi PAID
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });

        // C. Kurangi stok setiap produk yang dibeli
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity, // Mengurangi stok secara otomatis
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