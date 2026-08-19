import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Store, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ cartCount }) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Store className="w-6 h-6" />
          <span>TokoKu</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">

              {user && (
                <div className="flex items-center gap-3">
                  {/* Tombol Khusus Admin */}
                  {user.role === "ADMIN" && (
                    <Link to="/admin/products" className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard Admin
                    </Link>
                  )}

                  {/* Menu user biasa... */}
                </div>
              )}

              <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Pesanan Saya</span>
              </Link>

              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-800">{user.name}</span>
              </div>

              <button onClick={logout} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                Masuk
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
