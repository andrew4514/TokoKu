import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useSnap } from "../hooks/useSnap";
import { Trash2, Plus, Minus, CreditCard } from "lucide-react";

export default function Cart({ cart, updateQuantity, removeFromCart, clearCart }) {
  const navigate = useNavigate();
  const { snapEmbed } = useSnap();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const res = await API.post("/orders", { items });
      const { snapToken } = res.data.data;

      snapEmbed(snapToken, {
        onSuccess: () => {
          clearCart();
          navigate("/orders");
        },
        onPending: () => {
          clearCart();
          navigate("/orders");
        },
        onError: () => alert("Pembayaran gagal!"),
        onClose: () => alert("Anda belum menyelesaikan pembayaran."),
      });
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memproses pesanan.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center">
        <p className="text-gray-500 mb-4">Keranjang belanja masih kosong.</p>
        <button onClick={() => navigate("/")} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <img src={item.imageUrl || "https://via.placeholder.com/80"} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-50" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-indigo-600 font-bold text-sm mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
              </div>

              {/* Quantity Adjuster */}
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-600 hover:bg-gray-100">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-600 hover:bg-gray-100">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Belanja</h2>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600 text-sm">Total Harga</span>
            <span className="font-bold text-lg text-indigo-600">Rp {totalAmount.toLocaleString("id-ID")}</span>
          </div>
          <button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition">
            <CreditCard className="w-5 h-5" />
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
