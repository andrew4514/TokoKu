import { useState, useEffect } from "react";
import API from "../services/api";
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload, Package } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock);
      setImagePreview(product.imageUrl);
      setImageFile(null);
    } else {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageFile(null);
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Gunakan FormData untuk mengirim file dan teks bersamaan
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, formData);
      } else {
        await API.post("/products", formData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" /> Dashboard Produk
          </h1>
          <p className="text-xs text-gray-500 mt-1">Kelola katalog toko online Anda</p>
        </div>
        <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Tabel Produk */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data produk...</div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img src={product.imageUrl || "https://via.placeholder.com/50"} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border" />
                      <div>
                        <span className="font-semibold text-gray-800 block">{product.name}</span>
                        <span className="text-xs text-gray-400 line-clamp-1">{product.description}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-indigo-600">Rp {product.price.toLocaleString("id-ID")}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.stock} unit</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="font-bold text-gray-900">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Produk</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga (Rp)</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stok</label>
                  <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" />
                </div>
              </div>

              {/* File Upload Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gambar Produk</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed flex items-center justify-center bg-gray-50 text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-2 transition">
                    <Upload className="w-4 h-4" /> Pilih File
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50">
                  {submitting ? "Mengunggah..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
