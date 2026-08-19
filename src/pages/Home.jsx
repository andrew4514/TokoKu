import { useState, useEffect } from "react";
import API from "../services/api";
import { Search, ShoppingBag, Check } from "lucide-react";

export default function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await API.get(`/products?search=${search}`);

      const resultData = res.data?.data || res.data;
      setProducts(Array.isArray(resultData) ? resultData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Products */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat produk...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Tidak ada produk ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <img src={product.imageUrl || "https://via.placeholder.com/300x200?text=Produk"} alt={product.name} className="w-full h-48 object-cover bg-gray-50" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Harga</span>
                    <span className="font-bold text-indigo-600">Rp {product.price.toLocaleString("id-ID")}</span>
                  </div>

                  <button
                    disabled={product.stock <= 0}
                    onClick={() => handleAddToCart(product)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      addedId === product.id ? "bg-green-600 text-white" : product.stock > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check className="w-4 h-4" /> Tersimpan
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        {product.stock > 0 ? "Beli" : "Habis"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
