import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminProducts from "./pages/AdminProducts";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
            <Route path="/orders" element={<Orders />} />
            {/* Admin Route */}
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
