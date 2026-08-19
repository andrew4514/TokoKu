import prisma from "../../api/db.js";
import snap from "../../api/midtrans.js";

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item pesanan tidak boleh kosong.",
      });
    }

    const productIds = items.map((item) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData = [];
    const itemDetailForMidtrans = [];

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.productId} tidak ditemukan.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok untuk produk ${product.name} tidak mencukupi (Tersisa: ${product.stock})`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      itemDetailForMidtrans.push({
        id: product.id,
        price: product.price,
        quantity: item.quantity,
        name: product.name.substring(0, 50),
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          orderItems: {
            create: orderItemsData,
          },
        },
      });

      const midtransParameter = {
        transaction_details: {
          order_id: newOrder.id,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: user.name,
          email: user.email,
        },
        items_details: itemDetailForMidtrans,
      };

      const snapResponse = await snap.createTransaction(midtransParameter);

      await tx.payment.create({
        data: {
            orderId: newOrder.id,
            snapToken: snapResponse.token,
        },
      });

      return {
       order: newOrder,
       snapToken: snapResponse.token,
       redirectUrl: snapResponse.redirect_url, 
      };
    });

    return res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat.',
        data: result,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
        success: false,
        message: 'Gagal membuat pesanan.',
        error: error.message,
    });
  }
};


const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                orderItems: {
                    include: {product: true},
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('Get My Orders Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pesanan.',
            error: error.message,
        });
    }
};

export {createOrder, getMyOrders};