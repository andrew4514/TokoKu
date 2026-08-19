import { useEffect, useState } from "react";
import API from "../services/api";
import { useSnap } from "../hooks/useSnap";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { snapEmbed } = useSnap();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");
      setOrders(res.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPending = (snapToken) => {
    snapEmbed(snapToken, {
      onSuccess: () => fetchOrders(),
      onPending: () => fetchOrders(),
      onError: () => alert("Pembayaran Gagal"),
      onClose: () => fetchOrders(),
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      EXPIRED: "bg-red-100 text-red-700 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${styles[status] || styles.CANCELLED}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-12">Memuat riwayat...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Riwayat Pesanan</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <span className="text-xs text-gray-400 block">ID Order: {order.id}</span>
                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="space-y-2 mb-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.product.name} <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-800">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <div>
                <span className="text-xs text-gray-500 block">Total Pembayaran</span>
                <span className="font-bold text-indigo-600 text-base">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
              </div>

              {order.status === "PENDING" && order.payment?.snapToken && (
                <button onClick={() => handlePayPending(order.payment.snapToken)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm">
                  Bayar Sekarang
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
