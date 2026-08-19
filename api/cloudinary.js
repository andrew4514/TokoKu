import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });


const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: "toko-online-products" }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    uploadStream.end(fileBuffer);
  });
};

export {upload, uploadToCloudinary};