import "dotenv/config";
import prisma from "../../api/db.js";
import { uploadToCloudinary } from "../../api/cloudinary.js";

// Get All Products & search
const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data produk.",
      error: error.message,
    });
  }
};

// Get Product By ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail produk",
      error: error.message,
    });
  }
};

// Untuk role Admin

// Create Product
const createProduct = async (req, res) => {
  console.log("=== CHECK REQ.BODY ===", req.body);
  console.log("=== CHECK REQ.FILE ===", req.file);
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nama, deskripsi, harga, dan stok wajib diisi.",
      });
    }

    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan produk",
      error: error.message,
    });
  }
};

// Update Produk
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description: description || existingProduct.description,
        price: price !== undefined ? Number(price) : existingProduct.price,
        stock: stock !== undefined ? Number(stock) : existingProduct.stock,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui produk.",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
      });
    }

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus produk",
      error: error.message,
    });
  }
};

export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
